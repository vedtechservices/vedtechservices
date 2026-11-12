// Isolated PostgreSQL WASM. This script reads no environment files and makes no remote calls.
import { PGlite } from '../.tmp-support-db/node_modules/@electric-sql/pglite/dist/index.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const db = new PGlite();
const sql = (p) => fs.readFileSync(p, 'utf8');
try {
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
  await db.exec(
    sql('supabase/migrations/00004_add_admin_and_team_management.sql').split('-- Add more fields')[0],
  );
  await db.exec(
    sql('supabase/migrations/00005_add_activity_logging_and_auth_v2.sql').split(
      '-- Policy for super_admin',
    )[0],
  );
  for (const file of [
    '00036_create_chat_sessions_and_offices.sql',
    '00043_audited_admin_role_assignment.sql',
    '00044_live_support.sql',
    '00046_support_ticket_submission.sql',
  ])
    await db.exec(sql('supabase/migrations/' + file));
  const first = randomUUID(),
    second = randomUUID(),
    actor = randomUUID(),
    other = randomUUID(),
    generic = randomUUID();
  await db.query(
    "INSERT INTO chat_sessions(id,session_token,owner_hash) VALUES ($1,gen_random_uuid(),'owner-a'),($2,gen_random_uuid(),'owner-b')",
    [first, second],
  );
  await db.query(
    "INSERT INTO admin_users(id,email,password_hash,full_name,role) VALUES ($1,'agent@example.invalid','test','Agent','support_admin'),($2,'other@example.invalid','test','Other','super_admin'),($3,'generic@example.invalid','test','Generic','admin')",
    [actor, other, generic],
  );
  const key = randomUUID();
  const submit = (
    id = first,
    owner = 'owner-a',
    request = key,
    category = 'software',
    description = 'Website booking issue',
    name = 'Customer',
    email = 'CUSTOMER@example.invalid',
  ) =>
    db
      .query('SELECT support_submit_ticket($1,$2,$3,$4,$5,$6,$7) result', [
        id,
        owner,
        request,
        category,
        description,
        name,
        email,
      ])
      .then((r) => r.rows[0].result);
  for (const args of [
    [first, 'owner-b'],
    [first, null],
    [first, 'owner-a', null],
    [first, 'owner-a', randomUUID(), 'unknown'],
    [first, 'owner-a', randomUUID(), 'software', 'short'],
    [first, 'owner-a', randomUUID(), 'software', 'A valid issue description', '', 'bad'],
  ])
    await assert.rejects(submit(...args));
  assert.equal((await db.query('SELECT count(*)::int n FROM support_messages')).rows[0].n, 0);
  const [a, b] = await Promise.all([submit(), submit()]);
  assert.equal(a.ticket_number, b.ticket_number);
  assert.equal(a.id, b.id);
  assert.equal(a.status, 'pending');
  assert.match(a.ticket_number, /^VTS-\d{4}-\d{6,}$/);
  assert.equal((await db.query('SELECT count(*)::int n FROM support_messages')).rows[0].n, 2);
  await assert.rejects(submit(first, 'owner-a', key, 'hardware'));
  await assert.rejects(submit(second, 'owner-b', key));
  const more = await Promise.all(Array.from({ length: 25 }, () => submit(first, 'owner-a', randomUUID())));
  assert.equal(new Set(more.map((t) => t.ticket_number)).size, 25);
  assert.equal(new Set(more.map((t) => t.id)).size, 25);
  assert.equal((await db.query('SELECT count(*)::int n FROM support_inbox')).rows[0].n, 26);
  const saved = (await db.query('SELECT * FROM support_inbox WHERE ticket_number=$1', [a.ticket_number]))
    .rows[0];
  assert.equal(saved.ticket_category, 'software');
  assert.equal(saved.ticket_priority, 'medium');
  assert.equal(saved.customer_email, 'customer@example.invalid');
  assert.ok(saved.ticket_created_at);
  // Cookie-scoped lookups cannot reveal another owner even with a valid ticket/session/submission key.
  assert.equal(
    (await db.query('SELECT id FROM chat_sessions WHERE id=$1 AND owner_hash=$2', [a.id, 'owner-b'])).rows
      .length,
    0,
  );
  const mutate = (who, action, id = a.id) =>
    db.query('SELECT support_mutate($1,NULL,$2,$3,$4) result', [id, who, action, randomUUID()]);
  await assert.rejects(mutate(generic, 'accept'));
  await mutate(actor, 'accept');
  assert.equal(
    (await db.query('SELECT assigned_to FROM support_inbox WHERE id=$1', [a.id])).rows[0].assigned_to,
    actor,
  );
  await assert.rejects(mutate(other, 'accept'));
  await mutate(actor, 'resolve');
  await mutate(other, 'reopen');
  assert.equal(
    (
      await db.query(
        "SELECT count(*)::int n FROM activity_logs WHERE target_id=$1 AND action IN ('SUPPORT_ACCEPT','SUPPORT_RESOLVE','SUPPORT_REOPEN')",
        [a.id],
      )
    ).rows[0].n,
    3,
  );
  assert.equal((await submit()).status, 'pending'); // Retry returns durable current status, without adding messages.
  // Force an insert failure after numbering; the ticket/session/messages must all roll back.
  await db.exec(
    "CREATE FUNCTION test_ticket_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture failure'; END $$; CREATE TRIGGER ticket_failure BEFORE INSERT ON support_messages FOR EACH ROW EXECUTE FUNCTION test_ticket_failure();",
  );
  const count = async () => Number((await db.query('SELECT count(*)::int n FROM chat_sessions')).rows[0].n);
  const before = await count();
  const failureKey = randomUUID();
  await assert.rejects(submit(first, 'owner-a', failureKey));
  assert.equal(await count(), before);
  await db.exec('DROP TRIGGER ticket_failure ON support_messages; DROP FUNCTION test_ticket_failure();');
  const recovered = await submit(first, 'owner-a', failureKey);
  assert.ok(recovered.ticket_number);
  // A forced unique-number collision fails atomically; retry advances the non-cycling sequence.
  const suffix = Number(recovered.ticket_number.split('-').at(-1));
  await db.query("SELECT setval('support_ticket_number_seq',$1,false)", [suffix]);
  const collisionKey = randomUUID();
  await assert.rejects(submit(first, 'owner-a', collisionKey));
  const retry = await submit(first, 'owner-a', collisionKey);
  assert.notEqual(retry.ticket_number, recovered.ticket_number);
  const y1 = (await db.query("SELECT support_next_ticket_number('2026-12-31T18:29:59Z') n")).rows[0].n,
    y2 = (await db.query("SELECT support_next_ticket_number('2026-12-31T18:30:00Z') n")).rows[0].n;
  assert.match(y1, /VTS-2026-/);
  assert.match(y2, /VTS-2027-/);
  await db.exec("SELECT setval('support_ticket_number_seq',1000000,false)");
  assert.match((await db.query('SELECT support_next_ticket_number() n')).rows[0].n, /-1000000$/);
  for (let i = 0; i < 2; i++)
    assert.equal((await db.query("SELECT support_rate('ticket-test',2) ok")).rows[0].ok, true);
  assert.equal((await db.query("SELECT support_rate('ticket-test',2) ok")).rows[0].ok, false);
  for (const role of ['anon', 'authenticated']) {
    await db.exec('SET ROLE ' + role);
    for (const q of [
      'SELECT * FROM support_inbox',
      'SELECT * FROM support_messages',
      'SELECT * FROM chat_sessions',
      'SELECT support_next_ticket_number()',
      `SELECT support_submit_ticket('${first}','owner-a','${randomUUID()}','general','Some valid issue','Person','x@example.invalid')`,
    ])
      await assert.rejects(db.query(q));
    await db.exec('RESET ROLE');
  }
  console.log(
    'PASS: ticket SQL validation, 25 queued concurrent submissions, idempotent retries, multiple owned requests, collision/transaction recovery, India year rollover, long numbers, inbox visibility, assignment/status/audit, ownership isolation, rates and public-role denial. PGlite serializes commands; cross-connection lock contention is not simulated.',
  );
} finally {
  await db.close();
}

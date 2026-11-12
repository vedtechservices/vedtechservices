// Disposable PostgreSQL only; no environment files or remote connections.
import { PGlite } from '../.tmp-support-db/node_modules/@electric-sql/pglite/dist/index.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const db = new PGlite();
try {
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
 CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY, raw_user_meta_data jsonb);
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;
 CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS $$ SELECT '{}'::jsonb $$;
 CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean);
 CREATE TABLE storage.objects(id uuid PRIMARY KEY,bucket_id text,name text);
 ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
 CREATE PUBLICATION supabase_realtime;`);
 for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort()) {
  try { await db.exec(fs.readFileSync(`supabase/migrations/${file}`,'utf8')); console.log(`PASS ${file}`); }
  catch(error) { console.error(`FAIL ${file}: ${error.code || 'unknown'} ${error.message}`); process.exitCode=1; break; }
 }
 if (!process.exitCode) {
  await db.exec(fs.readFileSync('tests/inquiry-db.sql','utf8').replace(/^\\set.*$/mg,''));
  console.log('PASS inquiry persistence, retries, quota, rollback and privilege assertions on complete migration chain');
  await db.exec('BEGIN');
  const actor='10000000-0000-4000-8000-000000000001', target='10000000-0000-4000-8000-000000000002';
  const conversation='20000000-0000-4000-8000-000000000001', request='30000000-0000-4000-8000-000000000001';
  await db.query("INSERT INTO admin_users(id,email,password_hash,full_name,role) VALUES ($1,'operator@example.invalid','test-only','Operator','super_admin'),($2,'target@example.invalid','test-only','Target','admin')",[actor,target]);
  await db.query('INSERT INTO chat_sessions(id,session_token,owner_hash) VALUES ($1,gen_random_uuid(),$2)',[conversation,'isolated-owner']);
  const mutate=(action,who=null,owner='isolated-owner',text='Test message',rid=request,contact={})=>db.query('SELECT support_mutate($1,$2,$3,$4,$5,$6,$7)',[conversation,owner,who,action,rid,text,contact]);
  await mutate('message');await mutate('message');await mutate('ai_finish',null,'isolated-owner','Approved reply');
  await mutate('handoff',null,'isolated-owner','Test issue',request,{name:'Test visitor',email:'visitor@example.invalid'});
  await mutate('accept',actor);await mutate('message',actor,null,'Agent reply','30000000-0000-4000-8000-000000000002');
  assert.equal((await db.query("SELECT count(*)::int AS n FROM support_messages WHERE conversation_id=$1 AND sender='user'",[conversation])).rows[0].n,1);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM support_messages WHERE conversation_id=$1 AND sender='agent'",[conversation])).rows[0].n,1);
  await db.query("SELECT assign_admin_role($1,$2,'{\"role\":\"full_access_admin\"}')",[actor,target]);
  assert.equal((await db.query('SELECT role FROM admin_users WHERE id=$1',[target])).rows[0].role,'full_access_admin');
  const emailHash='a'.repeat(64), ipHash='b'.repeat(64), codeHash='c'.repeat(64), passwordHash='scrypt$'+'d'.repeat(32)+'$'+'e'.repeat(128);
  assert.equal((await db.query("SELECT has_table_privilege('anon','public.admin_password_reset_requests','SELECT') AS allowed")).rows[0].allowed,false);
  assert.equal((await db.query("SELECT has_function_privilege('anon','public.verify_admin_password_reset(text,text)','EXECUTE') AS allowed")).rows[0].allowed,false);
  assert.equal((await db.query("SELECT has_function_privilege('service_role','public.verify_admin_password_reset(text,text)','EXECUTE') AS allowed")).rows[0].allowed,true);
  assert.equal((await db.query('SELECT issue_admin_password_reset($1,$2,$3,$4) AS allowed',[emailHash,ipHash,target,codeHash])).rows[0].allowed,true);
  assert.equal((await db.query('SELECT verify_admin_password_reset($1,$2) AS valid',[emailHash,'f'.repeat(64)])).rows[0].valid,false);
  assert.equal((await db.query('SELECT verify_admin_password_reset($1,$2) AS valid',[emailHash,codeHash])).rows[0].valid,true);
  assert.equal((await db.query('SELECT complete_admin_password_reset($1,$2,$3) AS changed',[emailHash,codeHash,passwordHash])).rows[0].changed,true);
  const resetAdmin=(await db.query('SELECT password_hash,auth_version FROM admin_users WHERE id=$1',[target])).rows[0];
  assert.equal(resetAdmin.password_hash,passwordHash);
  assert.ok(resetAdmin.auth_version);
  const resetVersion=resetAdmin.auth_version;
  await db.query("UPDATE admin_users SET password_hash=$1 WHERE id=$2",['scrypt$'+'1'.repeat(32)+'$'+'2'.repeat(128),target]);
  assert.notEqual((await db.query('SELECT auth_version FROM admin_users WHERE id=$1',[target])).rows[0].auth_version,resetVersion);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM activity_logs WHERE user_id=$1 AND action='ADMIN_PASSWORD_RESET'",[target])).rows[0].n,1);
  assert.equal((await db.query('SELECT complete_admin_password_reset($1,$2,$3) AS changed',[emailHash,codeHash,passwordHash])).rows[0].changed,false);
  const rateEmail='9'.repeat(64);
  assert.equal((await db.query('SELECT issue_admin_password_reset($1,NULL,NULL,NULL) AS allowed',[rateEmail])).rows[0].allowed,true);
  assert.equal((await db.query('SELECT issue_admin_password_reset($1,NULL,NULL,NULL) AS allowed',[rateEmail])).rows[0].allowed,true);
  assert.equal((await db.query('SELECT issue_admin_password_reset($1,NULL,NULL,NULL) AS allowed',[rateEmail])).rows[0].allowed,true);
  assert.equal((await db.query('SELECT issue_admin_password_reset($1,NULL,NULL,NULL) AS allowed',[rateEmail])).rows[0].allowed,false);
  const rateIp='8'.repeat(64);
  for(let i=0;i<10;i++) assert.equal((await db.query('SELECT issue_admin_password_reset($1,$2,NULL,NULL) AS allowed',[String(i).padStart(64,'0'),rateIp])).rows[0].allowed,true);
  assert.equal((await db.query('SELECT issue_admin_password_reset($1,$2,NULL,NULL) AS allowed',['f'.repeat(64),rateIp])).rows[0].allowed,false);
  const bruteEmail='7'.repeat(64), bruteCode='6'.repeat(64);
  await db.query('SELECT issue_admin_password_reset($1,NULL,$2,$3)',[bruteEmail,target,bruteCode]);
  for(let i=0;i<5;i++) assert.equal((await db.query('SELECT verify_admin_password_reset($1,$2) AS valid',[bruteEmail,'5'.repeat(64)])).rows[0].valid,false);
  assert.equal((await db.query('SELECT verify_admin_password_reset($1,$2) AS valid',[bruteEmail,bruteCode])).rows[0].valid,false);
  await db.exec('ROLLBACK');
  console.log('PASS full-chain support persistence, role assignment, and atomic admin email password recovery, attempt limits, audit and session revocation');

 }
} finally { await db.close(); }

// Disposable PostgreSQL only; no environment files or remote connections.
import { PGlite } from '../.tmp-support-db/node_modules/@electric-sql/pglite/dist/index.js';
import fs from 'node:fs';
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
 }
} finally { await db.close(); }

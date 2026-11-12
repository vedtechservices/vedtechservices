import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';

function compile(path, deps, globals = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText,
    { exports, require: name => {
      if (!(name in deps)) throw Error(`Unexpected import ${name}`);
      return deps[name];
    }, Buffer, Request, Response, Headers, URL, AbortSignal, console, ...globals },
  );
  return exports;
}

function fixture({ admin = { id: 'admin-id', email: 'admin@example.invalid', is_active: true }, rpc = {}, fetchImpl = async () => ({ ok: true }) } = {}) {
  const calls = [];
  const mails = [];
  const db = {
    from(table) {
      assert.equal(table, 'admin_users');
      const query = {
        select() { return this; },
        ilike(column, value) { calls.push(['ilike', column, value]); return this; },
        maybeSingle: async () => ({ data: admin, error: null }),
      };
      return query;
    },
    async rpc(name, args) {
      calls.push(['rpc', name, args]);
      return { data: rpc[name] ?? true, error: null };
    },
  };
  const route = compile(
    'app/api/admin/password-reset/route.ts',
    {
      'node:crypto': crypto,
      'next/server': { NextResponse: { json: (body, init = {}) => ({ body, status: init.status || 200, headers: init.headers }) } },
      '@/lib/reviewServer': { reviewDb: () => db },
    },
    {
      process: { env: { ADMIN_PASSWORD_RESET_SECRET: 'test-reset-secret-that-is-long-enough-123', RESEND_API_KEY: 'test-resend-key', SUPPORT_TRUST_PROXY: 'true' } },
      fetch: async (...args) => { mails.push(args); return fetchImpl(...args); },
    },
  );
  return { calls, mails, route, post: body => route.POST(new Request('https://example.invalid/api/admin/password-reset', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://example.invalid' },
    body: JSON.stringify(body),
  })) };
}

test('reset request sends a random verification code only to an active admin email', async () => {
  const f = fixture();
  const response = await f.post({ action: 'request', email: 'ADMIN@example.invalid' });
  assert.equal(response.status, 200);
  assert.match(response.body.message, /If an active admin account matches/);
  assert.equal(f.mails.length, 1);
  const mail = JSON.parse(f.mails[0][1].body);
  const code = mail.text.match(/\b\d{6}\b/)[0];
  assert.equal(mail.to[0], 'admin@example.invalid');
  assert.equal(f.calls.find(([kind, name]) => kind === 'rpc' && name === 'issue_admin_password_reset')[2].p_code_hash.length, 64);
  assert.equal(mail.text.includes('ADMIN@example.invalid'), false);
  assert.match(code, /^\d{6}$/);
});

test('unknown and disabled admin addresses receive the same generic response without email', async () => {
  const f = fixture({ admin: null });
  const response = await f.post({ action: 'request', email: 'not-admin@example.invalid' });
  assert.equal(response.status, 200);
  assert.match(response.body.message, /If an active admin account matches/);
  assert.equal(f.mails.length, 0);
  const issue = f.calls.find(([kind, name]) => kind === 'rpc' && name === 'issue_admin_password_reset')[2];
  assert.equal(issue.p_admin_id, null);
  assert.equal(issue.p_code_hash, null);
});

test('reset validates the OTP before computing and storing a scrypt password hash', async () => {
  const f = fixture({ rpc: { verify_admin_password_reset: true, complete_admin_password_reset: true } });
  const response = await f.post({
    action: 'reset',
    email: 'admin@example.invalid',
    code: '123456',
    newPassword: 'a-new-secret-passphrase',
  });
  assert.equal(response.status, 200);
  assert.match(response.body.message, /Password updated/);
  const verify = f.calls.find(([kind, name]) => kind === 'rpc' && name === 'verify_admin_password_reset');
  const complete = f.calls.find(([kind, name]) => kind === 'rpc' && name === 'complete_admin_password_reset');
  assert.equal(verify[2].p_code_hash.length, 64);
  assert.match(complete[2].p_password_hash, /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
  assert.equal(complete[2].p_code_hash, verify[2].p_code_hash);
});

test('invalid OTPs are rejected without password hashing or password update', async () => {
  const f = fixture({ rpc: { verify_admin_password_reset: false } });
  const response = await f.post({
    action: 'reset',
    email: 'admin@example.invalid',
    code: '000000',
    newPassword: 'a-new-secret-passphrase',
  });
  assert.equal(response.status, 400);
  assert.equal(f.calls.some(([kind, name]) => kind === 'rpc' && name === 'complete_admin_password_reset'), false);
});

test('reset rejects weak passwords and cross-origin requests', async () => {
  const f = fixture();
  assert.equal((await f.post({
    action: 'reset', email: 'admin@example.invalid', code: '123456', newPassword: 'short',
  })).status, 400);
  const crossOrigin = await f.route.POST(new Request('https://example.invalid/api/admin/password-reset', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://attacker.invalid' },
    body: JSON.stringify({ action: 'request', email: 'admin@example.invalid' }),
  }));
  assert.equal(crossOrigin.status, 400);
  assert.equal(f.mails.length, 0);
});

test('admin login page uses the server recovery API and no longer exposes demo credentials', () => {
  const login = fs.readFileSync('src/views/AdminLogin.tsx', 'utf8');
  assert.match(login, /\/api\/admin\/password-reset/);
  assert.doesNotMatch(login, /Chandanyajee|send-reset-code/);
});

test('password-version changes invalidate previously signed admin sessions', async () => {
  const tokenRow = { id: 'admin-id', email: 'admin@example.invalid', full_name: 'Admin', role: 'admin', is_active: true, auth_version: 'version-after-reset' };
  let token = '';
  const session = compile(
    'src/lib/reviewServer.ts',
    {
      'server-only': {},
      'node:crypto': crypto,
      '@supabase/supabase-js': { createClient: () => ({ from: () => ({
        select() { return this; },
        eq() { return this; },
        maybeSingle: async () => ({ data: tokenRow, error: null }),
      }) }) },
      'next/headers': { cookies: async () => ({ get: () => ({ value: token }) }) },
    },
    { process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://db.example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-key', ADMIN_SESSION_SECRET: 'test-session-signing-secret-that-is-long-enough' } } },
  );
  token = session.createAdminToken({ id: 'admin-id', role: 'admin', authVersion: 'version-before-reset' });
  assert.equal(await session.currentAdmin(), null);
});

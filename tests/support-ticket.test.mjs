import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { randomUUID } from 'node:crypto';
function compile(path, deps = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
        jsx: ts.JsxEmit.React,
      },
    }).outputText,
    { exports, require: (n) => deps[n], URL, Buffer, Date, crypto: { randomUUID }, ...globals },
  );
  return exports;
}
const validation = compile('src/lib/supportTicket.ts');
const draft = {
  category: 'software',
  description: 'Website booking does not work',
  name: ' Customer ',
  email: ' CUSTOMER@example.invalid ',
};
const saved = {
  id: randomUUID(),
  ticket_number: 'VTS-2026-000001',
  status: 'pending',
  category: 'software',
  created_at: new Date().toISOString(),
};
test('ticket validation rejects malformed and excessive input; normalization excludes extra client fields', () => {
  assert.equal(validation.ticketValidation(draft), '');
  for (const patch of [
    { category: 'x' },
    { description: 'short' },
    { description: 'x'.repeat(2001) },
    { name: '' },
    { name: 'x'.repeat(101) },
    { email: 'not email' },
    { email: null },
    { category: null },
  ])
    assert.ok(validation.ticketValidation({ ...draft, ...patch }));
  const result = validation.ticketPayload({
    ...draft,
    status: 'resolved',
    role: 'super_admin',
    transcript: 'do not trust',
  });
  assert.equal(result.email, 'customer@example.invalid');
  assert.equal(Object.keys(result).length, 4);
});
test('unconfirmed/malformed server responses never become success cards', () => {
  assert.equal(validation.confirmedTicket(saved), true);
  for (const patch of [
    { ticket_number: 'local brief' },
    { status: 'invented' },
    { category: 'other' },
    { id: 'other' },
    { created_at: 'bad' },
  ])
    assert.equal(validation.confirmedTicket({ ...saved, ...patch }), false);
  assert.equal(validation.confirmedTicket(null), false);
});
class SupportError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
function visitorFixture({ hash = 'owner-a', found = true, failure = false, rateFailure = false } = {}) {
  const calls = [];
  const live = {
    SupportError,
    isUUID: (v) => typeof v === 'string' && /^[a-f0-9-]{36}$/i.test(v),
    owner: async () => hash,
    reviewDb: () => ({}),
    input: async (r) => JSON.parse(await r.text()),
    rate: async () => {
      if (rateFailure) throw new SupportError(429, 'Wait');
    },
    conversation: async (...args) => {
      calls.push(['ownership', ...args]);
      return found ? { id: 'cookie-owned', status: 'ai' } : null;
    },
    submitTicket: async (...args) => {
      calls.push(['submit', ...args]);
      if (failure) throw Error('secret backend diagnostic');
      return saved;
    },
    state: async (...args) => {
      calls.push(['state', ...args]);
      return { conversation: saved, messages: [] };
    },
  };
  const route = compile('app/api/chat/session/route.ts', {
    '@/lib/supportTicket': validation,
    '@/lib/liveSupport': live,
    'node:crypto': { randomUUID },
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options.status }) } },
  });
  return {
    calls,
    route,
    post: (body) =>
      route.POST(
        new Request('https://site.invalid/api/chat/session', { method: 'POST', body: JSON.stringify(body) }),
      ),
  };
}
const submission = {
  ...draft,
  action: 'ticket',
  confirmed: true,
  request_id: randomUUID(),
  id: randomUUID(),
  owner: 'forged',
  status: 'resolved',
  role: 'super_admin',
  transcript: 'forged history',
};
test('server ticket submission is owned by cookie and ignores forged IDs, roles, status and transcript', async () => {
  const f = visitorFixture();
  const result = await f.post(submission);
  assert.equal(result.status, 201);
  const args = f.calls.find((c) => c[0] === 'submit');
  assert.equal(args[2], 'cookie-owned');
  assert.equal(args[3], 'owner-a');
  assert.equal(args[4], submission.request_id);
  assert.equal(Object.keys(args[5]).length, 4);
  assert.equal(result.body.ticket.ticket_number, saved.ticket_number);
});
test('confirmation, validation, ownership and rate failures never submit', async () => {
  for (const body of [
    { ...submission, confirmed: false },
    { ...submission, request_id: 'bad' },
    { ...submission, description: 'x' },
  ]) {
    const f = visitorFixture();
    assert.equal((await f.post(body)).status, 400);
    assert.equal(f.calls.filter((c) => c[0] === 'submit').length, 0);
  }
  for (const [options, status] of [
    [{ hash: null }, 401],
    [{ found: false }, 404],
    [{ rateFailure: true }, 429],
  ]) {
    const f = visitorFixture(options);
    assert.equal((await f.post(submission)).status, status);
    assert.equal(f.calls.filter((c) => c[0] === 'submit').length, 0);
  }
});
test('database failure does not return a ticket number or leak errors', async () => {
  const f = visitorFixture({ failure: true });
  const result = await f.post(submission);
  assert.equal(result.status, 503);
  assert.equal(result.body.ticket, undefined);
  assert.doesNotMatch(JSON.stringify(result.body), /secret/);
});
test('ticket enumeration and status reads always go through cookie-scoped ownership first', async () => {
  for (const url of [
    `https://site.invalid/api/chat/session?ticket=${saved.ticket_number}`,
    `https://site.invalid/api/chat/session?id=${saved.id}`,
    `https://site.invalid/api/chat/session?request_id=${submission.request_id}`,
  ]) {
    const denied = visitorFixture({ hash: null });
    assert.equal((await denied.route.GET(new Request(url))).status, 401);
    assert.equal(denied.calls.length, 0);
    const absent = visitorFixture({ found: false });
    assert.equal((await absent.route.GET(new Request(url))).status, 404);
    assert.equal(absent.calls.filter((c) => c[0] === 'state').length, 0);
  }
  const f = visitorFixture();
  await f.route.GET(new Request(`https://site.invalid/api/chat/session?ticket=${saved.ticket_number}`));
  assert.equal(f.calls[0][2], 'owner-a');
  assert.equal(f.calls[0][5], saved.ticket_number);
});
// Component event harness tests form transitions without a browser or network. Effects are tested
// separately through endpoint/initialization tests; this is not keyboard/layout browser coverage.
function formFixture() {
  let slots = [],
    cursor = 0,
    fail = false,
    closed = 0;
  const calls = [];
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState: (initial) => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
      return [
        slots[i],
        (v) => {
          slots[i] = typeof v === 'function' ? v(slots[i]) : v;
        },
      ];
    },
    useRef: (initial) => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: initial };
      return slots[i];
    },
    useEffect: () => {},
  };
  const ui = compile('src/components/common/SupportTicketForm.tsx', {
    react: { __esModule: true, default: react, ...react },
    '@/components/ui/button': { Button: 'button' },
    '@/lib/supportTicket': validation,
    './SupportConversation': {
      initializeSupport: async () => {
        calls.push({ action: 'start' });
      },
      supportRequest: async (url, body) => {
        calls.push(body || { url });
        if (fail) throw Error('Connection lost');
        return { ticket: saved };
      },
    },
  });
  let tree;
  const render = (visible = true) => {
    cursor = 0;
    tree = ui.default({ visible, onClose: () => closed++ });
    return tree;
  };
  const nodes = (node = tree) =>
    node && typeof node === 'object'
      ? [node, ...(node.children || []).flat(Infinity).flatMap((v) => nodes(v))]
      : [];
  const content = (node) =>
    (node.children || [])
      .flat(Infinity)
      .map((v) => (typeof v === 'string' ? v : v && typeof v === 'object' ? content(v) : ''))
      .join('');
  const click = async (label) => {
    const button = nodes().find((n) => n.type === 'button' && content(n) === label);
    assert.ok(button, 'Missing button ' + label);
    await button.props.onClick();
    render();
  };
  const submit = async () => {
    const f = nodes().find((n) => n.type === 'form');
    await f.props.onSubmit({ preventDefault() {} });
    await new Promise((resolve) => setTimeout(resolve, 0));
    render();
  };
  const fill = () => {
    for (const [tag, value] of [
      ['select', draft.category],
      ['textarea', draft.description],
      ['input', draft.name],
      ['input', draft.email],
    ]) {
      const all = nodes().filter((n) => n.type === tag && n.props.required !== false);
      const target =
        tag === 'input'
          ? all.find(
              (n) => n.props.required && n.props.type === (value === draft.email ? 'email' : undefined),
            )
          : all[0];
      target.props.onChange({ target: { value } });
      render();
    }
  };
  render();
  return {
    calls,
    render,
    nodes,
    click,
    submit,
    fill,
    content: () => content(tree),
    setFail: (v) => (fail = v),
    consent: () => {
      nodes()
        .find((n) => n.type === 'input' && n.props.type === 'checkbox')
        .props.onChange({ target: { checked: true } });
      render();
    },
    closed: () => closed,
  };
}
test('support form requires review and consent, permits corrections/cancel and sends nothing before confirmation', async () => {
  const f = formFixture();
  f.fill();
  await f.submit();
  assert.match(f.content(), /Nothing has been submitted/);
  assert.equal(f.calls.length, 0);
  await f.submit();
  assert.equal(f.calls.length, 0);
  await f.click('Edit details');
  await f.submit();
  await f.click('Cancel draft');
  assert.equal(f.calls.length, 0);
  assert.equal(f.closed(), 1);
  assert.equal(f.nodes().find((n) => n.type === 'textarea').props.value, '');
});
test('failed submissions keep a stable key, prevent double submits, survive hiding and confirm only durable success', async () => {
  const f = formFixture();
  f.fill();
  await f.submit();
  f.consent();
  f.setFail(true);
  await f.submit();
  const key = f.calls.find((c) => c.action === 'ticket').request_id;
  assert.match(f.content(), /Retry same submission/);
  assert.ok(!f.nodes().some((n) => n.type === 'textarea'));
  f.render(false);
  f.render(true);
  f.setFail(false);
  await Promise.all([f.submit(), f.submit()]);
  const posts = f.calls.filter((c) => c.action === 'ticket');
  assert.equal(posts.length, 2);
  assert.ok(posts.every((p) => p.request_id === key));
  assert.match(f.content(), /VTS-2026-000001/);
  assert.match(f.content(), /pending/);
  assert.ok(posts.every((p) => !('transcript' in p) && p.confirmed === true));
});
function adminFixture(role = 'support_admin') {
  const calls = [];
  const query = {
    select() {
      return this;
    },
    order() {
      return this;
    },
    limit() {
      return this;
    },
    eq(...args) {
      calls.push(['eq', ...args]);
      return this;
    },
    ilike(...args) {
      calls.push(['ilike', ...args]);
      return this;
    },
    is(...args) {
      calls.push(['is', ...args]);
      return this;
    },
    then(resolve) {
      return Promise.resolve({ data: [{ ...saved, ticket_category: 'software' }], error: null }).then(
        resolve,
      );
    },
  };
  const route = compile('app/api/admin/support/route.ts', {
    'node:crypto': { randomUUID },
    'next/server': { NextResponse: { json: (body, init) => ({ body, status: init.status }) } },
    '@/lib/liveSupport': {
      SupportError,
      supportAgent: async () => {
        if (!['support_admin', 'super_admin'].includes(role))
          throw new SupportError(role ? 403 : 401, 'denied');
        return { id: 'verified-agent' };
      },
      reviewDb: () => ({
        from: (name) => {
          calls.push(['from', name]);
          return query;
        },
      }),
      rate: async () => {},
      isUUID: () => true,
    },
  });
  return { route, calls };
}
test('admin ticket search and filters use authorized inbox query; role boundaries are unchanged', async () => {
  for (const role of ['support_admin', 'super_admin']) {
    const f = adminFixture(role);
    const response = await f.route.GET(
      new Request(
        'https://site.invalid/api/admin/support?ticket=VTS-2026&status=pending&category=software&priority=medium&assignment=mine',
      ),
    );
    assert.equal(response.status, 200);
    assert.ok(f.calls.some((c) => c[0] === 'ilike' && c[1] === 'ticket_number' && c[2] === 'VTS-2026%'));
    assert.ok(f.calls.some((c) => c[1] === 'assigned_to' && c[2] === 'verified-agent'));
    assert.equal(response.body.conversations[0].ticket_number, saved.ticket_number);
  }
  for (const role of [null, 'admin', 'billing_admin', 'full_access_admin']) {
    const f = adminFixture(role);
    assert.equal(
      (await f.route.GET(new Request('https://site.invalid/api/admin/support'))).status,
      role ? 403 : 401,
    );
    assert.equal(f.calls.length, 0);
  }
  for (const suffix of ['ticket=VTS%25', 'status=secret', 'category=invalid', 'assignment=other']) {
    const f = adminFixture();
    assert.equal(
      (await f.route.GET(new Request('https://site.invalid/api/admin/support?' + suffix))).status,
      400,
    );
  }
});
test('customer history selects explicit public message fields and safe rendering never uses raw HTML', () => {
  const live = fs.readFileSync('src/lib/liveSupport.ts', 'utf8');
  assert.match(live, /select\('seq,id,sender,body,created_at'\)/);
  for (const p of [
    'src/components/common/SupportTicketForm.tsx',
    'src/components/common/SupportConversation.tsx',
    'src/views/SupportInbox.tsx',
  ])
    assert.doesNotMatch(fs.readFileSync(p, 'utf8'), /dangerouslySetInnerHTML|localStorage|sessionStorage/);
});

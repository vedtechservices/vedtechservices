import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SupportMessages,
  supportRequest,
  useSupportConversation,
} from '@/components/common/SupportConversation';
type InboxRow = {id:string;status:string;customer_name:string|null;issue:string|null;assigned_to:string|null;updated_at:string;unread:boolean;ticket_number?:string|null;ticket_category?:string|null;ticket_priority?:string|null};
const endpoint = '/api/admin/support';
export default function SupportInbox() {
  const [ticketSearch, setTicketSearch] = useState(''),
    [statusFilter, setStatusFilter] = useState(''),
    [categoryFilter, setCategoryFilter] = useState(''),
    [priorityFilter, setPriorityFilter] = useState(''),
    [assignmentFilter, setAssignmentFilter] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [actor, setActor] = useState('');
  const [rows, setRows] = useState<InboxRow[]>([]);
  const [selected, setSelected] = useState('');
  const [next, setNext] = useState<string | null>(null);
  const [available, setAvailable] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [operationError, setOperationError] = useState('');
  const lock = useRef(false);
  const retry = useRef<{ text: string; id: string } | null>(null);
  const {
    messages,
    conversation: c,
    error,
    refresh,
  } = useSupportConversation(authorized && selected ? `${endpoint}?id=${selected}` : null);
  const listVersion = useRef(0);
  const load = useCallback(
    async (before?: string) => {
      const version = ++listVersion.current;
      try {
        const params = new URLSearchParams({
          ticket: ticketSearch,
          status: statusFilter,
          category: categoryFilter,
          priority: priorityFilter,
          assignment: assignmentFilter,
        });
        if (before) params.set('before', before);
        const data = await supportRequest(endpoint + '?' + params.toString());
        if (version !== listVersion.current) return;
        setRows((old) =>
          before
            ? [...old, ...data.conversations.filter((r: InboxRow) => !old.some((v) => v.id === r.id))]
            : data.conversations,
        );
        setNext(data.next);
      } catch (err) {
        if (version === listVersion.current)
          setOperationError(err instanceof Error ? err.message : 'Inbox unavailable.');
      }
    },
    [ticketSearch, statusFilter, categoryFilter, priorityFilter, assignmentFilter],
  );
  useEffect(() => {
    let active = true;
    supportRequest('/api/admin/session')
      .then((session) => {
        if (!active) return;
        if (!['super_admin', 'support_admin'].includes(session.admin?.role)) {
          setOperationError('Support administrator access required.');
          return;
        }
        setActor(session.admin.id);
        setAuthorized(true);
        const id = new URLSearchParams(window.location.search).get('conversation');
        if (id && /^[a-f0-9-]{36}$/i.test(id)) setSelected(id);
      })
      .catch(() => {
        if (active) setOperationError('Sign in with an authorized support account.');
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!authorized) return;
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 8000);
    return () => clearInterval(timer);
  }, [authorized, load]);
  useEffect(() => {
    if (!authorized || !available) return;
    const heartbeat = () =>
      supportRequest(endpoint, { action: 'presence', available: true }).catch(() =>
        setOperationError('Agent availability could not be updated.'),
      );
    void heartbeat();
    const timer = setInterval(() => void heartbeat(), 15000);
    return () => {
      clearInterval(timer);
      void supportRequest(endpoint, { action: 'presence', available: false }).catch(() => {});
    };
  }, [authorized, available]);
  useEffect(() => {
    if (selected && messages.length)
      void supportRequest(endpoint, { id: selected, action: 'seen', seen: messages.at(-1)?.seq }).catch(
        () => {},
      );
  }, [selected, messages]);
  const action = async (name: string) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setOperationError('');
    try {
      await supportRequest(endpoint, { id: selected, action: name });
      await refresh();
      await load();
    } catch (err) {
      setOperationError(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lock.current || !text.trim()) return;
    lock.current = true;
    setBusy(true);
    setOperationError('');
    const body = text.trim();
    if (!retry.current || retry.current.text !== body)
      retry.current = { text: body, id: crypto.randomUUID() };
    try {
      await supportRequest(endpoint, {
        id: selected,
        action: 'message',
        text: body,
        request_id: retry.current.id,
      });
      setText('');
      retry.current = null;
      await refresh();
    } catch (err) {
      setOperationError(err instanceof Error ? err.message : 'Message not sent. Retry.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <main className="container py-8">
      <a className="underline text-sm" href="/admin/dashboard">
        Back to dashboard
      </a>
      <div className="flex flex-wrap gap-4 justify-between items-center my-4">
        <h1 className="text-2xl font-bold">Support Inbox</h1>
        {authorized && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
            Available for live chat
          </label>
        )}
      </div>
      {(operationError || error) && (
        <p role="alert" className="p-3 bg-red-50 text-red-700">
          {operationError || error}
        </p>
      )}
      {authorized && (
        <div className="border rounded-lg p-3 flex flex-wrap gap-3 mb-4">
          <label className="text-xs">
            Ticket number
            <Input
              aria-label="Search ticket number"
              maxLength={40}
              placeholder="VTS-2026-000001"
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value.toUpperCase())}
            />
          </label>
          <label className="text-xs">
            Status
            <select
              aria-label="Filter status"
              className="block border rounded p-2 bg-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              {['pending', 'active', 'resolved'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Category
            <select
              aria-label="Filter category"
              className="block border rounded p-2 bg-background"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All</option>
              {['software', 'hardware', 'network', 'maintenance', 'general'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Priority
            <select
              aria-label="Filter priority"
              className="block border rounded p-2 bg-background"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All</option>
              {['low', 'medium', 'high'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Assignment
            <select
              aria-label="Filter assignment"
              className="block border rounded p-2 bg-background"
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="mine">Assigned to me</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </label>
        </div>
      )}
      {authorized && (
        <div className="grid md:grid-cols-[280px_1fr] gap-4">
          <aside
            aria-label="Support conversations"
            className="border rounded-lg p-2 max-h-[65vh] overflow-y-auto"
          >
            <Button variant="outline" onClick={() => void load()}>
              Refresh inbox
            </Button>
            {rows.length === 0 && <p className="p-2 text-sm">No support conversations.</p>}
            {rows.map((row) => (
              <button
                key={row.id}
                onClick={() => {
                  setSelected(row.id);
                  setText('');
                  retry.current = null;
                }}
                aria-pressed={selected === row.id}
                className={`w-full text-left border-b p-3 ${selected === row.id ? 'bg-muted' : ''}`}
              >
                <span className="block font-mono text-xs">{row.ticket_number || 'Legacy conversation'}</span>
                <strong>
                  {row.customer_name || 'Visitor'}
                  {row.unread ? ' · Unread' : ''}
                </strong>
                <p className="text-sm truncate">{row.issue}</p>
                <p className="text-xs">
                  {row.ticket_category || 'general'} ? {row.ticket_priority || 'medium'}
                </p>
                <p className="text-xs">
                  {row.status} · {row.assigned_to ? 'Assigned' : 'Unassigned'}
                </p>
                <time className="text-xs" dateTime={row.updated_at}>
                  {new Date(row.updated_at).toLocaleString()}
                </time>
              </button>
            ))}
            {next && (
              <Button variant="outline" onClick={() => void load(next)}>
                Older conversations
              </Button>
            )}
          </aside>
          <section className="border rounded-lg flex flex-col min-h-[420px] max-h-[75vh]">
            {!c ? (
              <p className="p-4">Select a conversation.</p>
            ) : (
              <>
                <header className="p-3 border-b">
                  <strong className="block">{c.ticket_number || 'Legacy conversation'}</strong>
                  <strong>{c.customer_name}</strong>
                  <p className="text-xs">
                    Category: {c.ticket_category || 'general'} ? Priority: {c.ticket_priority || 'medium'}
                  </p>
                  <p className="text-xs break-all">Assigned agent: {c.assigned_to || 'Unassigned'}</p>
                  <p className="text-xs">
                    Created: {new Date(c.ticket_created_at || c.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm">{c.customer_email} · Visitor-supplied contact</p>
                  <p className="text-sm">{c.status} · Email notifications disabled</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {c.status === 'pending' && (
                      <Button disabled={busy} onClick={() => void action('accept')}>
                        Accept / assign to me
                      </Button>
                    )}
                    {c.status !== 'resolved' && (
                      <Button variant="outline" disabled={busy} onClick={() => void action('resolve')}>
                        Resolve
                      </Button>
                    )}
                    {c.status === 'active' && (
                      <Button variant="outline" disabled={busy} onClick={() => void action('release')}>
                        Release assignment
                      </Button>
                    )}
                    {c.status === 'resolved' && (
                      <Button disabled={busy} onClick={() => void action('reopen')}>
                        Reopen
                      </Button>
                    )}
                  </div>
                </header>
                <div className="flex-1 overflow-y-auto min-h-0">
                  <SupportMessages messages={messages} />
                </div>
                <form onSubmit={send} className="p-3 flex gap-2 border-t">
                  <Input
                    aria-label="Reply to customer"
                    maxLength={4000}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Human agent reply"
                    disabled={c.status !== 'active' || c.assigned_to !== actor}
                  />
                  <Button
                    type="submit"
                    disabled={busy || !text.trim() || c.status !== 'active' || c.assigned_to !== actor}
                  >
                    {busy ? 'Sending…' : 'Send'}
                  </Button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

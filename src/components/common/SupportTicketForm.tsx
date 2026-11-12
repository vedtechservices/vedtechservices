'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supportRequest, initializeSupport } from './SupportConversation';
import {
  confirmedTicket,
  ticketCategories,
  ticketPayload,
  ticketValidation,
  type ConfirmedTicket,
  type TicketDraft,
} from '@/lib/supportTicket';
const endpoint = '/api/chat/session';
const empty: TicketDraft = { category: 'general', description: '', name: '', email: '' };
export default function SupportTicketForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [draft, setDraft] = useState<TicketDraft>(empty),
    [phase, setPhase] = useState<'edit' | 'review' | 'sending' | 'uncertain' | 'success'>('edit');
  const [ticket, setTicket] = useState<ConfirmedTicket | null>(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [consent, setConsent] = useState(false),
    [checking, setChecking] = useState(false);
  const [lookupNumber, setLookupNumber] = useState('');
  const lock = useRef(false),
    attempt = useRef<{ id: string; details: TicketDraft } | null>(null),
    loaded = useRef(false);
  // Checking ownership sends only the existing HttpOnly cookie, never the FAQ transcript or draft.
  useEffect(() => {
    if (!visible || loaded.current || attempt.current) return;
    loaded.current = true;
    let active = true;
    setChecking(true);
    supportRequest(endpoint)
      .then((data) => {
        if (!active) return;
        const c = data.conversation;
        const saved = {
          id: c?.id,
          ticket_number: c?.ticket_number,
          status: c?.status,
          category: c?.ticket_category,
          created_at: c?.ticket_created_at,
        };
        if (confirmedTicket(saved)) {
          setTicket(saved);
          setPhase('success');
        }
      })
      .catch(() => {
        if (active)
          setNotice(
            'If an earlier submission was interrupted, use Check saved request before creating another. A saved request can only be recovered with this browser’s ownership cookie.',
          );
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
      loaded.current = false;
    };
  }, [visible]);
  async function checkSaved() {
    if (lock.current) return;
    lock.current = true;
    setChecking(true);
    setError('');
    try {
      const data = await supportRequest(
        endpoint +
          (attempt.current
            ? `?request_id=${encodeURIComponent(attempt.current.id)}`
            : lookupNumber.trim()
              ? `?ticket=${encodeURIComponent(lookupNumber.trim().toUpperCase())}`
              : ticket
                ? `?id=${encodeURIComponent(ticket.id)}`
                : ''),
      );
      const c = data.conversation;
      const result = {
        id: c?.id,
        ticket_number: c?.ticket_number,
        status: c?.status,
        category: c?.ticket_category,
        created_at: c?.ticket_created_at,
      };
      if (!confirmedTicket(result)) throw Error('No saved ticket was found in this support session.');
      setTicket(result);
      setPhase('success');
      setDraft(empty);
      setConsent(false);
      attempt.current = null;
      setNotice('Status retrieved using this browser’s ownership cookie.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status unavailable. Retry.');
    } finally {
      lock.current = false;
      setChecking(false);
    }
  }
  async function submit() {
    if (lock.current || !consent || !['review', 'uncertain'].includes(phase)) return;
    const invalid = ticketValidation(draft);
    if (invalid) {
      setError(invalid);
      return;
    }
    lock.current = true;
    setPhase('sending');
    setError('');
    if (!attempt.current) attempt.current = { id: crypto.randomUUID(), details: ticketPayload(draft) };
    try {
      await initializeSupport(endpoint);
      const data = await supportRequest(endpoint, {
        action: 'ticket',
        confirmed: true,
        request_id: attempt.current.id,
        ...attempt.current.details,
      });
      if (!confirmedTicket(data.ticket))
        throw Error('No durable ticket confirmation was received. Retry the same submission.');
      setTicket(data.ticket);
      setPhase('success');
      setDraft(empty);
      setConsent(false);
      attempt.current = null;
      setNotice(
        'Your request is saved in the Support Inbox. No agent connection or response time is promised.',
      );
    } catch (err) {
      setPhase('uncertain');
      setError(
        (err instanceof Error ? err.message : 'Submission could not be confirmed.') +
          ' Retry uses the same submission key. Do not start a new request if the result is uncertain.',
      );
    } finally {
      lock.current = false;
    }
  }
  if (!visible) return null;
  const busy = phase === 'sending' || checking;
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-2"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          if (!busy) onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-ticket-title"
        className="bg-background border rounded-xl shadow-2xl w-full max-w-lg max-h-[90dvh] overflow-y-auto p-5 space-y-4"
        onKeyDown={(e) => {
          if (e.key !== 'Tab') return;
          const elements = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>(
              'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]',
            ),
          );
          const first = elements[0],
            last = elements.at(-1);
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="support-ticket-title" className="text-lg font-semibold">
            {phase === 'success' ? 'Saved support request' : 'Create a support request'}
          </h2>
          <Button autoFocus variant="ghost" disabled={busy} onClick={onClose}>
            Close
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          This form uses the website backend. Only the details you confirm are submitted; your local FAQ chat
          and project brief are excluded. Contact name and email follow the existing support policy. Email is
          visitor-supplied, not verified. No email notification is sent.
        </p>
        {!['sending', 'uncertain'].includes(phase) && (
          <label className="block text-xs">
            Saved ticket number (optional; leave blank for latest)
            <input
              className="block w-full rounded border p-2 bg-background"
              maxLength={40}
              value={lookupNumber}
              onChange={(e) => setLookupNumber(e.target.value)}
            />
            <button className="underline mt-1" disabled={busy} onClick={() => void checkSaved()}>
              Check saved request
            </button>
          </label>
        )}
        {checking && <p role="status">Checking saved request…</p>}
        {error && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 rounded p-3">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm">
            {notice}
          </p>
        )}
        {phase === 'success' && ticket ? (
          <div className="border border-primary/30 bg-primary/5 rounded-lg p-4 space-y-3">
            <strong className="block select-all">{ticket.ticket_number}</strong>
            <p>
              Status: {ticket.status} · Category: {ticket.category}
            </p>
            <time dateTime={ticket.created_at}>{new Date(ticket.created_at).toLocaleString()}</time>
            <p className="text-sm">
              Keep this number. Status access also requires this browser’s ownership cookie, which expires
              after 30 days. It is not proof that a human is online. Closing or resetting FAQ chat does not
              delete a saved request.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(ticket.ticket_number);
                    setNotice('Ticket number copied.');
                  } catch {
                    setNotice('Copy unavailable. Select and copy the ticket number manually.');
                  }
                }}
              >
                Copy number
              </Button>
              <Button variant="outline" disabled={busy} onClick={() => void checkSaved()}>
                Refresh status
              </Button>
              <Button
                disabled={busy}
                onClick={() => {
                  setTicket(null);
                  setPhase('edit');
                  setNotice('You are creating a separate new request. Do not resubmit the same issue.');
                  setError('');
                }}
              >
                New request
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (phase === 'edit') {
                const invalid = ticketValidation(draft);
                setError(invalid);
                if (!invalid) {
                  setPhase('review');
                  setNotice('Review your details. Nothing has been submitted yet.');
                }
              } else void submit();
            }}
            className="space-y-3"
          >
            {phase === 'edit' ? (
              <>
                <label className="block text-sm">
                  Issue category
                  <select
                    className="block w-full rounded border p-2 bg-background"
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  >
                    {ticketCategories.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  Describe the issue
                  <textarea
                    className="block w-full rounded border p-2 bg-background min-h-24"
                    required
                    minLength={10}
                    maxLength={2000}
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  />
                </label>
                <p className="text-xs">Do not include passwords, payment details or sensitive data.</p>
                <label className="block text-sm">
                  Contact name
                  <input
                    className="block w-full rounded border p-2 bg-background"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  Contact email
                  <input
                    className="block w-full rounded border p-2 bg-background"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  />
                </label>
              </>
            ) : (
              <div className="rounded border p-3 text-sm whitespace-pre-wrap break-words">
                <p>Category: {draft.category}</p>
                <p>{draft.description}</p>
                <p>
                  Contact: {draft.name} · {draft.email}
                </p>
                <p>Initial status after submission: pending</p>
              </div>
            )}
            {phase !== 'edit' && (
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={consent}
                  disabled={busy || phase === 'uncertain'}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                I confirm these details and consent to storing them with this support request for the
                authorized support team.
              </label>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy || (phase !== 'edit' && !consent)}>
                {phase === 'sending'
                  ? 'Submitting…'
                  : phase === 'edit'
                    ? 'Review request'
                    : phase === 'uncertain'
                      ? 'Retry same submission'
                      : 'Confirm and submit'}
              </Button>
              {phase === 'review' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPhase('edit');
                    setConsent(false);
                  }}
                >
                  Edit details
                </Button>
              )}
              <Button type="button" variant="outline" disabled={busy} onClick={() => void checkSaved()}>
                Check saved request
              </Button>
              {phase === 'edit' || phase === 'review' ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    setDraft(empty);
                    setConsent(false);
                    setPhase('edit');
                    setError('');
                    setNotice('Draft cancelled. Nothing was submitted.');
                    onClose();
                  }}
                >
                  Cancel draft
                </Button>
              ) : null}
            </div>
            {phase === 'uncertain' && (
              <p className="text-xs">
                Editing and cancellation are locked until the submission is recovered. Closing hides the form
                and preserves its retry key in memory; reloading loses the key, so check the saved request
                first.
              </p>
            )}
          </form>
        )}
      </section>
    </div>
  );
}

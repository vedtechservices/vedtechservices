'use client';
import Link from 'next/link';
import SupportTicketForm from './SupportTicketForm';
import { useProjects } from '@/hooks/use-projects';
import { suggestionsFor } from '@/lib/localFaq';
import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { initialConversation, initialState, projectSummary, respond } from '@/lib/localFaq';
const routes = new Set(['/contact', '/support', '/portfolio', '/demo', '/services/software', '/amc-plans']);
function SafeText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\/[a-z][a-z/-]*)/g).map((part, i) =>
        routes.has(part) ? (
          <Link key={i} href={part} className="underline">
            {part}
          </Link>
        ) : (
          part
        ),
      )}
    </>
  );
}
export default function ChatBot({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen),
    [text, setText] = useState(''),
    [messages, setMessages] = useState(initialConversation),
    [state, setState] = useState(initialState),
    [resetting, setResetting] = useState(false),
    [brief, setBrief] = useState<string | null>(null),
    [status, setStatus] = useState('');
  const { rawProjects } = useProjects('portfolio');
  const [ticketOpen, setTicketOpen] = useState(false);
  const end = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement>(null),
    launcher = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);
  useEffect(() => {
    end.current?.scrollIntoView?.({ block: 'nearest' });
  }, [messages]);
  const close = () => {
    setOpen(false);
    launcher.current?.focus();
  };
  const send = (value: string) => {
    if (!value.trim()) return;
    const answer = respond(value.trim(), state, rawProjects);
    setState(answer.state);
    if (answer.intent === 'reset') setBrief(null);
    setMessages((old) =>
      answer.intent === 'reset'
        ? initialConversation()
        : [
            ...old.slice(-98),
            {
              sender: 'user',
              body: answer.intent === 'privacy' ? '[Personal details omitted]' : value.trim().slice(0, 4000),
            },
            { sender: 'faq', body: answer.text },
          ],
    );
    setText('');
    setStatus('');
    input.current?.focus();
  };
  return (
    <>
      <SupportTicketForm
        visible={open && ticketOpen}
        onClose={() => {
          setTicketOpen(false);
          input.current?.focus();
        }}
      />
      {!open && (
        <Button
          ref={launcher}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-xl z-50"
          aria-label="Open support chat"
        >
          <Bot />
        </Button>
      )}
      {open && (
        <section
          role="dialog"
          aria-label="VedTech local business assistant"
          onKeyDown={(e) => {
            if (e.key === 'Escape') close();
          }}
          className="fixed bottom-2 right-2 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-96 max-w-md h-[min(700px,90dvh)] bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          <header className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
            <div>
              <strong>VedTech Support</strong>
              <p className="text-xs">VedBot · Local business assistant</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close support chat" onClick={close}>
              <X />
            </Button>
          </header>
          <p className="text-xs p-3 border-b">
            Local rules and website knowledge. No human agent or generative AI. FAQ chat clears on reload. Use
            the support form to explicitly submit details.
          </p>
          <div
            role="log"
            aria-live="polite"
            aria-label="FAQ conversation"
            className="flex-1 overflow-y-auto min-h-0 p-3 space-y-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  'p-3 rounded-lg text-sm whitespace-pre-wrap break-words ' +
                  (m.sender === 'user' ? 'bg-primary/10 ml-5' : 'bg-muted mr-5')
                }
              >
                <strong>{m.sender === 'user' ? 'You' : 'VedBot'}</strong>
                <p>
                  <SafeText text={m.body} />
                </p>
              </div>
            ))}
            <div ref={end} />
          </div>
          {brief !== null && (
            <div className="p-2 border-t">
              <label className="text-xs" htmlFor="vedbot-brief">
                Editable project brief
              </label>
              <textarea
                id="vedbot-brief"
                className="w-full h-28 text-sm bg-background border rounded p-2"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
              />
              <button
                className="text-xs underline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(brief);
                    setStatus('Brief copied.');
                  } catch {
                    setStatus('Copy unavailable. Select the brief text and copy it manually.');
                  }
                }}
              >
                Copy brief
              </button>{' '}
              <button className="text-xs underline" onClick={() => setBrief(null)}>
                Close brief
              </button>
            </div>
          )}
          <div className="p-2 flex flex-wrap gap-2">
            {suggestionsFor(state).map((q) => (
              <button key={q} className="border rounded px-2 py-1 text-xs" onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>
          <div className="px-3 flex flex-wrap gap-3 text-xs">
            <button className="underline" onClick={() => setResetting(true)}>
              Reset chat
            </button>
            <button className="underline" onClick={() => setBrief(projectSummary(state))}>
              Edit/copy brief
            </button>
            <button className="underline font-semibold" onClick={() => setTicketOpen(true)}>
              Create/check support request
            </button>
          </div>
          {resetting && (
            <div className="p-2 text-xs">
              Clear local FAQ chat and project brief? Saved tickets and the support form are kept.{' '}
              <button
                className="underline mr-3"
                onClick={() => {
                  setMessages(initialConversation());
                  setState(initialState());
                  setText('');
                  setBrief(null);
                  setStatus('Chat cleared.');
                  setResetting(false);
                }}
              >
                Clear
              </button>
              <button className="underline" onClick={() => setResetting(false)}>
                Cancel
              </button>
            </div>
          )}
          <p role="status" className="px-3 text-xs">
            {status}
          </p>
          <p className="px-3 pt-2 text-xs text-muted-foreground">
            FAQ replies submit nothing. Support requests are saved only after confirmation in the support
            form.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
            className="p-3 border-t flex gap-2"
          >
            <Input
              ref={input}
              aria-label="Your message"
              placeholder="Ask about our services..."
              maxLength={4000}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button type="submit" size="icon" aria-label="Send message" disabled={!text.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </section>
      )}
    </>
  );
}

import React, { useCallback, useEffect, useRef, useState } from 'react';

export type LiveMessage = { seq: number; id: string; sender: string; body: string; created_at: string };
export async function supportRequest(url: string, body?: unknown) {
  const response = await fetch(url, { method: body ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store',
    headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(35000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Support request failed. Please retry.');
  return data;
}
export async function initializeSupport(url: string, request = supportRequest) {
  const created = await request(url, { action: 'start' });
  // Verify a real persisted conversation through a separate cookie-authenticated read.
  const snapshot = await request(url);
  if (!created.id || snapshot.conversation?.id !== created.id) throw new Error('Support session could not be verified. Retry connection.');
  return snapshot;
}
export function useSupportConversation(url: string | null) {
  const [messages,setMessages]=useState<LiveMessage[]>([]);
  const [conversation,setConversation]=useState<any>(null);
  const [available,setAvailable]=useState(false);
  const [error,setError]=useState('');
  const cursor=useRef(0); const loading=useRef(false); const generation=useRef(0);
  const refresh=useCallback(async()=>{
    if(!url||loading.current) return;
    const version=generation.current; loading.current=true;
    try {
      let page:any;
      do {
        page=await supportRequest(`${url}${url.includes('?')?'&':'?'}after=${cursor.current}`);
        if(version!==generation.current) return;
        setConversation(page.conversation); setAvailable(page.agents_available);
        if(page.messages.length) {
          cursor.current=page.messages.at(-1).seq;
          setMessages(previous=>[...previous,...page.messages.filter((m:LiveMessage)=>!previous.some(p=>p.id===m.id))]);
        }
      } while(page.messages.length===100);
      setError('');
    }catch(err){if(version===generation.current)setError(err instanceof Error?err.message:'Connection lost. Retrying…');}
    finally{if(version===generation.current)loading.current=false;}
  },[url]);
  useEffect(()=>{
    generation.current++; loading.current=false; cursor.current=0; setMessages([]); setConversation(null); setError('');
    void refresh(); const timer=setInterval(()=>{if(!document.hidden)void refresh();},3000);
    return()=>{clearInterval(timer);generation.current++;loading.current=false;};
  },[refresh]);
  return {messages,conversation,available,error,refresh,setError};
}
export function SupportMessages({messages}:{messages:LiveMessage[]}) {
  const end=useRef<HTMLDivElement>(null);
  useEffect(()=>{end.current?.scrollIntoView({block:'nearest'});},[messages.length]);
  return <div role="log" aria-label="Conversation messages" aria-live="polite" className="space-y-3 p-3">
    {messages.map(message=><div key={message.id} className={`rounded-lg p-3 text-sm whitespace-pre-wrap break-words ${message.sender==='user'?'bg-primary/10 ml-5':'bg-muted mr-5'}`}>
      <div className="text-xs font-semibold mb-1">{({user:'Customer',ai:'VedBot · FAQ',agent:'Support agent · Human',system:'Support update'} as Record<string,string>)[message.sender]} <time className="font-normal text-muted-foreground" dateTime={message.created_at}>{new Date(message.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</time></div>
      {message.body}
    </div>)}<div ref={end}/>
  </div>;
}

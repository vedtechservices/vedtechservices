import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Send, Bot, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SupportMessages, supportRequest, initializeSupport, useSupportConversation } from './SupportConversation';
import { wantsHuman } from '@/lib/supportIntent';
import { supabasePublic } from '@/db/publicSupabase';
const endpoint='/api/chat/session';
export default function ChatBot({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
 const [open,setOpen]=useState(initiallyOpen);const [ready,setReady]=useState(false);const [starting,setStarting]=useState(false);
 const [text,setText]=useState('');const [busy,setBusy]=useState(false);const [offline,setOffline]=useState(false);
 const [handoff,setHandoff]=useState(false);const [contact,setContact]=useState({name:'',email:'',issue:''});
 const initializing=useRef(false);
 const retry=useRef<{text:string,id:string}|null>(null);const lock=useRef(false);
 const {messages,conversation:c,available,error,refresh,setError}=useSupportConversation(open&&ready?endpoint:null);
 useEffect(()=>{const update=()=>setOffline(!navigator.onLine);update();window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update);};},[]);
 const start=useCallback(async()=>{
  if(initializing.current)return;
  initializing.current=true;setStarting(true);setReady(false);setError('');
  try{
   await initializeSupport(endpoint);
   setReady(true);
  }catch(err){setError(err instanceof Error?err.message:'Could not connect.');}
  finally{initializing.current=false;setStarting(false);}
 },[setError]);
 useEffect(()=>{if(open)void start();},[open,start]);
 useEffect(()=>{
  if(!handoff)return;
  let active=true;
  void supabasePublic.auth.getSession().then(({data})=>{
   if(!active||!data.session?.user)return;
   const user=data.session.user;
   setContact(old=>({...old,name:old.name||String(user.user_metadata?.full_name||'').slice(0,100),email:old.email||(user.email||'').slice(0,254)}));
  }).catch(()=>{});
  return()=>{active=false;};
 },[handoff]);
 useEffect(()=>{if(open&&ready&&messages.length)void supportRequest(endpoint,{action:'seen',seen:messages.at(-1)?.seq}).catch(()=>{});},[open,ready,messages.length]);
 const send=async(event:React.FormEvent)=>{
  event.preventDefault();if(!text.trim()||lock.current||!usable)return;lock.current=true;setBusy(true);setError('');
  const message=text.trim();if(!retry.current||retry.current.text!==message)retry.current={text:message,id:crypto.randomUUID()};
  if(wantsHuman(message)){setHandoff(true);setContact(old=>({...old,issue:old.issue||message}));}
  try{await supportRequest(endpoint,{action:'message',request_id:retry.current.id,text:message});setText('');retry.current=null;await refresh();}
  catch(err){setError(err instanceof Error?err.message:'Message not sent. Retry.');}finally{lock.current=false;setBusy(false);}
 };
 const requestHuman=async(event:React.FormEvent)=>{
  event.preventDefault();if(lock.current||!usable)return;lock.current=true;setBusy(true);setError('');
  try{await supportRequest(endpoint,{action:'handoff',...contact});setHandoff(false);await refresh();}
  catch(err){setError(err instanceof Error?err.message:'Request failed. Retry.');await refresh();}finally{lock.current=false;setBusy(false);}
 };
 const pending=c&&['pending','active'].includes(c.status);
 const usable=ready&&!!c&&!error&&!starting&&!offline;
 return <>
  {!open&&<Button onClick={()=>setOpen(true)} className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-xl z-50" aria-label="Open support chat"><Bot/></Button>}
  {open&&<section role="dialog" aria-label="VedTech AI and human support" className="fixed bottom-2 right-2 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-96 max-w-md h-[min(650px,90dvh)] bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden">
   <header className="bg-primary text-primary-foreground p-3 flex items-center justify-between"><div><strong>VedTech Support</strong><p className="text-xs">{c?.status==='active'?(available?'Human agent connected':'Human conversation - Agent offline'):c?.status==='pending'?'Waiting for a human agent':c?.status==='resolved'?'Conversation resolved':'VedBot - AI assistant'}</p></div><Button size="icon" variant="ghost" aria-label="Close support chat" onClick={()=>setOpen(false)}><X/></Button></header>
   <div className="text-xs p-2 border-b" role="status">{offline?<><WifiOff className="inline h-3 w-3"/> Offline - reconnect to send</>:pending?available?'Support agents are online. Replies appear here.':c?.status==='active'?'Your agent is offline. Your messages are saved.':'No agent is currently online. Your conversation is pending.':c?.status==='resolved'?'Your history is saved. Choose Connect to Human to request support again.':'Ask about our services or connect to a human. Avoid sharing sensitive information.'}</div>
   <div className="flex-1 overflow-y-auto min-h-0">{messages.length===0&&<p className="p-4 text-sm">Hello! I can help with VedTech services and support. What do you need help with?</p>}<SupportMessages messages={messages}/></div>
   {starting&&<p role="status" className="px-3 text-xs">Connecting...</p>}{(busy||c?.generating)&&<p role="status" className="px-3 text-xs text-muted-foreground">{c?.status==='ai'?'AI response loading...':'Saving...'}</p>}
   {error&&<div role="alert" className="p-2 text-sm text-red-700">{error} <button className="underline" disabled={starting||offline} onClick={()=>void start()}>Retry connection</button></div>}
   {pending&&<div className="p-2 text-xs border-t" role="status">{c.notification_status==='sent'?'Support email accepted by the email provider; delivery is not guaranteed.':c.notification_status==='failed'?'Your request is saved. Support email failed.':c.notification_status==='unknown'?'Your request is saved; email delivery is uncertain.':'Your request is saved; support email is pending.'}{['pending','failed','sending'].includes(c.notification_status)&&<button className="underline ml-2" onClick={async()=>{try{await supportRequest(endpoint,{action:'retry_notification'});await refresh();}catch(err){setError(err instanceof Error?err.message:'Retry failed.');}}}>Retry email notification</button>}</div>}
   {handoff&&!pending&&<form onSubmit={requestHuman} className="p-3 space-y-2 border-t">
    <label className="block text-xs">Name<Input required maxLength={100} value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})} autoComplete="name"/></label>
    <label className="block text-xs">Email<Input required type="email" maxLength={254} value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})} autoComplete="email"/></label>
    <label className="block text-xs">Issue<textarea required maxLength={2000} className="w-full border rounded p-2 bg-background" rows={2} value={contact.issue} onChange={e=>setContact({...contact,issue:e.target.value})}/></label>
    <p className="text-xs">Your contact details and recent messages will be shared with support to handle this request.</p><Button disabled={busy||!usable} type="submit">Request human support</Button><Button type="button" variant="ghost" onClick={()=>setHandoff(false)}>Cancel</Button>
   </form>}
   {!pending&&!handoff&&<Button variant="outline" className="mx-3 mb-2" disabled={!usable||busy} onClick={()=>{setContact(old=>({...old,name:old.name||c?.customer_name||'',email:old.email||c?.customer_email||'',issue:old.issue||text||messages.filter(m=>m.sender==='user').at(-1)?.body||''}));setHandoff(true);}}>Connect to Human</Button>}
   <form onSubmit={send} className="p-3 border-t flex gap-2"><Input aria-label="Your message" placeholder="Type your message..." maxLength={4000} value={text} onChange={e=>setText(e.target.value)} disabled={!usable||busy||c?.status==='resolved'}/><Button type="submit" size="icon" aria-label="Send message" disabled={busy||!usable||!text.trim()||c?.status==='resolved'||c?.generating}><Send className="h-4 w-4"/></Button></form>
  </section>}
 </>;
}

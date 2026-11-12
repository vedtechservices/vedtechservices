import 'server-only';
import { cookies } from 'next/headers';
import { currentAdmin, cookieName, reviewDb } from '@/lib/reviewServer';
import {blogFields,blogIsPublic,type BlogPost} from './blog';
export class BlogError extends Error { constructor(public status:number,message:string){super(message);} }
export async function blogAdmin(){
 const actor=await currentAdmin();if(!actor)throw new BlogError(401,'Sign in required.');
 // currentAdmin verifies the entire HMAC-signed payload and re-reads the stored role.
 // The additional signed admin-role marker excludes employee tokens sharing the existing signer.
 const token=(await cookies()).get(cookieName)?.value;let payload;try{payload=JSON.parse(Buffer.from(token?.split('.')[0]||'','base64url').toString('utf8'));}catch{throw new BlogError(403,'A verified administrator session is required.');}
 if(actor.role!=='super_admin'||payload?.role!==actor.role||payload?.id!==actor.id)throw new BlogError(403,'An active Super Admin session is required for Blog Management.');
 return actor;
}
export async function blogRate(actorId:string,limit=60){const {data,error}=await reviewDb().rpc('support_rate',{p_key:'blog:'+actorId+':'+limit,p_limit:limit});if(error)throw new BlogError(503,'Blog backend setup is unavailable.');if(!data)throw new BlogError(429,'Too many blog operations. Please wait a minute.');}
export function blogOrigin(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')throw new BlogError(403,'Invalid request origin.');}
export async function blogInput(request:Request){if(!request.headers.get('content-type')?.startsWith('application/json'))throw new BlogError(415,'JSON is required.');const reader=request.body?.getReader();if(!reader)throw new BlogError(400,'Request body required.');let size=0;const chunks:Uint8Array[]=[];for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>524288){await reader.cancel();throw new BlogError(413,'Article request is too large.');}chunks.push(part.value);}try{const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!body||typeof body!=='object'||Array.isArray(body))throw Error();return body;}catch{throw new BlogError(400,'Invalid article request.');}}
export function validateBlog(fields:unknown){const result=blogFields.safeParse(fields);if(!result.success)throw new BlogError(400,result.error.issues.map(e=>e.message).slice(0,3).join(' '));if(result.data.status==='scheduled'&&Date.parse(result.data.scheduled_for!)<=Date.now())throw new BlogError(400,'Choose a future publication date.');return result.data;}
export function blogFailure(error:unknown){if(error instanceof BlogError)return {status:error.status,message:error.message};return {status:503,message:'Blog backend/schema is unavailable. No save is confirmed. Retry the same submission.'};}
export async function adminPosts(id?:string){let query=reviewDb().from('blog_posts').select('*');if(id)query=query.eq('id',id);const {data,error}=await query.order('updated_at',{ascending:false}).limit(1000);if(error)throw new BlogError(503,'Blog migration or database is unavailable.');return (data||[]) as BlogPost[];}
export {reviewDb,blogIsPublic};

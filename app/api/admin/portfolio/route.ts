import {NextResponse} from 'next/server';
import {currentAdmin,reviewDb} from '@/lib/reviewServer';
import {projectMutationSchema,projectId} from '@/lib/portfolio';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
async function authorize(){const admin=await currentAdmin();return !admin?json({error:'Sign in required.'},401):admin.role!=='super_admin'?json({error:'Super administrator access required.'},403):null;}
export async function GET(){try{const denied=await authorize();if(denied)return denied;const {data,error}=await reviewDb().from('portfolio_projects').select('*').order('display_order').order('slug');return error?json({error:'Portfolio schema or database unavailable.'},503):json(data||[]);}catch{return json({error:'Portfolio unavailable.'},503);}}
async function mutation(request:Request,method:string){try{const denied=await authorize();if(denied)return denied;
 if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Invalid request origin.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required.'},415);
 const reader=request.body?.getReader();if(!reader)return json({error:'Body required.'},400);let size=0;const chunks:Uint8Array[]=[];for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>20000){await reader.cancel();return json({error:'Request too large.'},413);}chunks.push(part.value);}
 let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return json({error:'Invalid JSON.'},400);}if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Invalid project.'},400);
 const {id,...fields}=body;if(method!=='POST'&&!projectId.safeParse(id).success)return json({error:'Invalid project ID.'},400);
 const db=reviewDb();let result;
 if(method==='DELETE'){if(Object.keys(fields).length)return json({error:'Only project ID is accepted.'},400);result=await db.from('portfolio_projects').delete().eq('id',id).select('id').maybeSingle();}
 else {const parsed=projectMutationSchema.safeParse(fields);if(!parsed.success)return json({error:'Invalid project fields. Check lengths, slug, URLs and display settings.'},400);const data={...parsed.data,updated_at:new Date().toISOString()};result=method==='POST'?await db.from('portfolio_projects').insert(data).select('*').single():await db.from('portfolio_projects').update(data).eq('id',id).select('*').maybeSingle();}
 if(result.error)return json({error:result.error.code==='23505'?'This slug already exists.':'Could not save project. Database/schema may be unavailable.'},result.error.code==='23505'?409:503);
 if(!result.data)return json({error:'Project not found.'},404);return json(result.data,method==='POST'?201:200);
 }catch{return json({error:'Portfolio operation unavailable.'},503);}}
export const POST=(request:Request)=>mutation(request,'POST');
export const PATCH=(request:Request)=>mutation(request,'PATCH');
export const DELETE=(request:Request)=>mutation(request,'DELETE');

import { z } from 'zod';
export const blogStatuses = ['draft','scheduled','published','archived'] as const;
export const blockTypes = ['paragraph','heading2','heading3','bulletList','orderedList','quote','code'] as const;
export const relatedServices = ['/services/software','/services/web-development','/services/mobile-app-development','/services/hardware','/services/hardware-repair','/services/networking-solutions','/services/it-support','/amc-plans'] as const;
export type BlogBlock = {type:typeof blockTypes[number];text:string};
export const safeBlogLink = (value:string) => {
 if (!value || /[\u0000-\u0020\u007f\\]/.test(value)) return false;
 if (value.startsWith('/') && !value.startsWith('//')) {try{return new URL(value,'https://vedtechservices.in').origin==='https://vedtechservices.in';}catch{return false;}}
 try {const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}
};
export const imageUrl = z.string().max(2048).refine(v=>v===''||safeBlogLink(v)&&(v.startsWith('https:')||/^\/images\/[a-zA-Z0-9_./-]+\.(png|jpg|jpeg|webp|gif)$/i.test(v)||/^\/api\/blog\/media\/[a-f0-9-]{36}$/i.test(v)),'Use an uploaded image, local raster image or HTTPS URL.');
export const blogBlocks = z.array(z.object({type:z.enum(blockTypes),text:z.string().max(8000)}).strict()).max(120).refine(v=>v.reduce((n,b)=>n+b.text.length,0)<=120000,'Article is too large.');
export const blogFields = z.object({
 title:z.string().trim().min(3).max(180),slug:z.string().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),excerpt:z.string().trim().max(500),body:blogBlocks,
 author:z.string().trim().max(100),category:z.string().trim().max(60),tags:z.array(z.string().trim().min(1).max(40)).max(20).refine(tags=>new Set(tags.map(t=>t.toLowerCase())).size===tags.length,'Tags must be unique.'),
 featured:z.boolean(),featured_image:imageUrl,featured_alt:z.string().trim().max(180),seo_title:z.string().trim().max(180),seo_description:z.string().trim().max(320),canonical:z.string().max(2048),og_image:imageUrl,
 status:z.enum(blogStatuses),scheduled_for:z.string().datetime({offset:true}).nullable(),related_services:z.array(z.enum(relatedServices)).max(8),
}).strict().superRefine((post,ctx)=>{
 if (post.canonical && post.canonical!==`https://vedtechservices.in/blog/${post.slug}`)ctx.addIssue({code:'custom',message:'Canonical must be this article’s own HTTPS URL.',path:['canonical']});
 if(post.featured_image&&!post.featured_alt)ctx.addIssue({code:'custom',message:'Describe the featured image for readers.',path:['featured_alt']});
 if(post.status==='published'||post.status==='scheduled'){
  if(post.title.length<8||post.excerpt.length<30||post.author.length<2||post.category.length<2||plainBlogText(post.body).split(/\s+/).filter(Boolean).length<40)ctx.addIssue({code:'custom',message:'Publication requires a descriptive title, excerpt, author, category and at least 40 words of article content.'});
 }
 if(post.status==='scheduled'&&!post.scheduled_for)ctx.addIssue({code:'custom',message:'Choose a publication date and time.',path:['scheduled_for']});
});
export type BlogFields=z.infer<typeof blogFields>;
export type BlogPost=BlogFields & {id:string;legacy_id:number|null;version:number;published_at:string|null;updated_at:string;created_at:string;reading_minutes:number};
export type PublicBlogPost=Omit<BlogPost,'version'|'created_at'|'status'|'scheduled_for'>;
export const plainBlogText=(body:BlogBlock[])=>body.map(b=>b.text).join(' ').trim();
export const readingMinutes=(body:BlogBlock[])=>Math.max(1,Math.ceil(plainBlogText(body).split(/\s+/).filter(Boolean).length/200));
export const blogIsPublic=(post:Pick<BlogPost,'status'|'scheduled_for'|'published_at'>,now=Date.now())=>post.status==='published'&&!!post.published_at&&Date.parse(post.published_at)<=now||post.status==='scheduled'&&!!post.scheduled_for&&Date.parse(post.scheduled_for)<=now;
export function legacyBlocks(content:string):BlogBlock[]{return content.trim().split(/\n\s*\n/).map(part=>{const text=part.split('\n').map(s=>s.trim()).join('\n').trim();if(/^### /.test(text))return {type:'heading3',text:text.slice(4)};if(/^## /.test(text))return {type:'heading2',text:text.slice(3)};if(/^\d+\. /.test(text))return {type:'orderedList',text:text.replace(/^\d+\. /gm,'')};if(/^[-*] /.test(text))return {type:'bulletList',text:text.replace(/^[-*] /gm,'')};return {type:'paragraph',text};});}
export function validImageBytes(bytes:Uint8Array,mime:string){const a=(...v:number[])=>v.every((n,i)=>bytes[i]===n);return mime==='image/png'?a(137,80,78,71,13,10,26,10):mime==='image/jpeg'?a(255,216,255):mime==='image/gif'?new TextDecoder().decode(bytes.slice(0,6)).match(/^GIF8[79]a$/)!==null:mime==='image/webp'?a(82,73,70,70)&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP':false;}

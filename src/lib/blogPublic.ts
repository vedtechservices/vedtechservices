import 'server-only';
import {reviewDb} from './reviewServer';
import {legacyBlogPosts} from '@/data/blog-legacy';
import type {PublicBlogPost} from './blog';
export type BlogSummary=Omit<PublicBlogPost,'body'>;
export type BlogSearch={items:BlogSummary[];total:number;categories:string[];tags:string[];featured:BlogSummary[];fallback:boolean};
export async function searchBlog(q='',category='',tag='',page=1):Promise<BlogSearch>{
 try{const {data,error}=await reviewDb().rpc('blog_public_search',{p_q:q,p_category:category,p_tag:tag,p_page:page});if(error||!data||!Array.isArray(data.items))throw Error();return {...data,fallback:false};}
 catch{const posts=[...legacyBlogPosts].sort((a,b)=>Date.parse(b.published_at!)-Date.parse(a.published_at!));const matches=posts.filter(p=>(!q||(p.title+' '+p.excerpt).toLowerCase().includes(q.toLowerCase()))&&(!category||p.category===category)&&(!tag||p.tags.includes(tag)));return {items:matches.slice((page-1)*6,page*6),total:matches.length,categories:[...new Set(posts.map(p=>p.category))].sort(),tags:[...new Set(posts.flatMap(p=>p.tags))].sort(),featured:posts.filter(p=>p.featured).slice(0,3),fallback:true};}
}
export async function publicBlogPost(slug:string):Promise<{post:PublicBlogPost|null;redirect?:string;fallback?:boolean}>{
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>160)return {post:null};
 try{const db=reviewDb();const {data,error}=await db.from('blog_public_posts').select('*').eq('slug',slug).maybeSingle();if(error)throw Error();if(data)return {post:data};const {data:alias,error:aliasError}=await db.from('blog_slugs').select('post_id').eq('slug',slug).maybeSingle();if(aliasError)throw Error();if(!alias?.post_id)return {post:null};const {data:target,error:targetError}=await db.from('blog_public_posts').select('*').eq('id',alias.post_id).maybeSingle();if(targetError)throw Error();return target?{post:target,redirect:'/blog/'+target.slug}:{post:null};}
 catch{const legacy=legacyBlogPosts.find(p=>p.slug===slug);if(legacy)return {post:legacy,fallback:true};throw new Error('BLOG_TEMPORARILY_UNAVAILABLE');}
}
export async function blogSitemapPosts():Promise<Pick<PublicBlogPost,'slug'|'updated_at'>[]>{try{const {data,error}=await reviewDb().from('blog_public_posts').select('slug,updated_at');if(error)throw Error();return data||[];}catch{return legacyBlogPosts.map(p=>({slug:p.slug,updated_at:p.updated_at}));}}
export async function relatedBlogPosts(post:PublicBlogPost){const matches=await searchBlog('',post.category);return matches.items.filter(p=>p.id!==post.id).slice(0,3);}

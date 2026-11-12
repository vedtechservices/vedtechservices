import {notFound,permanentRedirect} from 'next/navigation';
import BlogShell from '@/components/blog/BlogShell';
import BlogArticle from '@/components/blog/BlogArticle';
import {publicBlogPost,relatedBlogPosts} from '@/lib/blogPublic';
import {articleMetadata,articleSchema} from '@/lib/blogSeo';
export const dynamic='force-dynamic';export const revalidate=0;
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){const {post,redirect}=await publicBlogPost((await params).slug);if(redirect)permanentRedirect(redirect);if(!post)return {title:'Article not found',robots:{index:false,follow:false}};return articleMetadata(post);}
export default async function ArticlePage({params}:Props){const result=await publicBlogPost((await params).slug);if(result.redirect)permanentRedirect(result.redirect);if(!result.post)notFound();return <BlogShell><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(articleSchema(result.post)).replace(/</g,'\\u003c')}}/><BlogArticle post={result.post} related={await relatedBlogPosts(result.post)}/></BlogShell>;}

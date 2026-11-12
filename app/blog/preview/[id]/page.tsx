import {notFound,redirect} from 'next/navigation';
import BlogShell from '@/components/blog/BlogShell';
import BlogArticle from '@/components/blog/BlogArticle';
import {blogAdmin,adminPosts,BlogError} from '@/lib/blogServer';
export const dynamic='force-dynamic';export const revalidate=0;
export const metadata={title:'Private article preview | VedTech Services',robots:{index:false,follow:false}};
export default async function Preview({params}:{params:Promise<{id:string}>}){try{await blogAdmin();}catch(error){if(error instanceof BlogError&&error.status===401)redirect('/admin/login');notFound();}const {id}=await params;if(!/^[a-f0-9-]{36}$/i.test(id))notFound();const post=(await adminPosts(id))[0];if(!post)notFound();return <BlogShell><p className="bg-amber-100 text-amber-950 p-5 text-center">Private Super Admin preview. This article is not published by opening this page.</p><BlogArticle post={post} preview/></BlogShell>;}

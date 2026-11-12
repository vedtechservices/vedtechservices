import {NextResponse} from 'next/server';
import {reviewDb} from '@/lib/reviewServer';
export const dynamic='force-dynamic';
export async function GET(){try{const {data,error}=await reviewDb().from('portfolio_projects').select('*').order('featured',{ascending:false}).order('display_order').order('slug');if(error)throw Error();return NextResponse.json(data||[],{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Portfolio updates unavailable.'},{status:503});}}

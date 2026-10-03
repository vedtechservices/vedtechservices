import type { Metadata } from 'next';
import RouterView from '../RouterView';
import SeoStructuredData from '../SeoStructuredData';
import { getSeoMetadata } from '@/lib/seo';

interface PageProps {
    params: Promise<{ slug: string[] }>;
}

async function pathnameFromParams(params: PageProps['params']) {
    const { slug } = await params;
    return `/${slug.join('/')}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    return getSeoMetadata(await pathnameFromParams(params));
}

export default async function Page({ params }: PageProps) {
    const pathname = await pathnameFromParams(params);

    return (
        <>
            <SeoStructuredData pathname={pathname} />
            <RouterView />
        </>
    );
}

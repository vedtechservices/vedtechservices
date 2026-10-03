import type { Metadata } from 'next';
import RouterView from './RouterView';
import SeoStructuredData from './SeoStructuredData';
import { getSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = getSeoMetadata('/');

export default function Page() {
    return (
        <>
            <SeoStructuredData pathname="/" />
            <RouterView />
        </>
    );
}

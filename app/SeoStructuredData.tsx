import { getJsonLd } from '@/lib/seo';

export default function SeoStructuredData({ pathname }: { pathname: string }) {
    const jsonLd = JSON.stringify(getJsonLd(pathname)).replace(/</g, '\\u003c');

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
    );
}
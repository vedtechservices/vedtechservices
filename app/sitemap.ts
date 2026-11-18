import type { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blog';
import { PUBLIC_SEO_PATHS, SITE_URL } from '@/lib/seo';
import { citySeoEntries, isCityReadyForIndexing } from '@/lib/citySeo';

export default function sitemap(): MetadataRoute.Sitemap {
    const paths = [
        ...PUBLIC_SEO_PATHS,
        '/locations',
        ...citySeoEntries.filter(isCityReadyForIndexing).map((city) => `/locations/${city.slug}`),
        ...blogPosts.map((post) => `/blog/${post.id}`),
    ];

    return paths.map((path) => ({
        url: new URL(path, SITE_URL).toString(),
    }));
}

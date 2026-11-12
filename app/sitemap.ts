import { blogSitemapPosts } from '@/lib/blogPublic';
import type { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blog';
import { PUBLIC_SEO_PATHS, SITE_URL } from '@/lib/seo';
import { citySeoEntries, isCityReadyForIndexing } from '@/lib/citySeo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const paths = [
        ...PUBLIC_SEO_PATHS,
        '/locations',
        ...citySeoEntries.filter(isCityReadyForIndexing).map((city) => `/locations/${city.slug}`),
        ...blogPosts.map((post) => `/blog/${post.id}`),
    ];

    const cms = await blogSitemapPosts();
    const legacyPaths = new Set(blogPosts.map(post => '/blog/'+post.id));
    const eligible = [...paths.filter(path => !legacyPaths.has(path)), ...cms.map(post => '/blog/'+post.slug)];
    return [...new Set(eligible)].map((path) => ({
        url: new URL(path, SITE_URL).toString(),
    }));
}

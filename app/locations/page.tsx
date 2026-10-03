import type { Metadata } from 'next';
import Link from 'next/link';
import LocationSiteShell from './LocationSiteShell';
import { citySeoEntries, isCityReadyForIndexing } from '@/lib/citySeo';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
    title: 'Software & Website Projects by City | VedTech Services',
    description: 'Explore business software and website development topics for companies in VedTech Services city markets.',
    alternates: { canonical: new URL('/locations', SITE_URL).toString() },
    robots: { index: true, follow: true },
    openGraph: {
        type: 'website',
        url: new URL('/locations', SITE_URL).toString(),
        title: 'Software & Website Projects by City | VedTech Services',
        description: 'Explore business software and website development topics for companies in VedTech Services city markets.',
        siteName: 'VedTech Services',
        locale: 'en_IN',
    },
    twitter: {
        card: 'summary',
        title: 'Software & Website Projects by City | VedTech Services',
        description: 'Explore business software and website development topics for companies in VedTech Services city markets.',
    },
};

export default function LocationsPage() {
    const publishedCities = citySeoEntries.filter(isCityReadyForIndexing);
    const jsonLd = [
        { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Business Software & Website Development by City', url: `${SITE_URL}/locations` },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Locations', item: `${SITE_URL}/locations` },
        ] },
        { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Initial City SEO Pages', itemListElement: publishedCities.map((city, index) => ({
            '@type': 'ListItem', position: index + 1, name: `${city.city}, ${city.state}`, url: `${SITE_URL}/locations/${city.slug}`,
        })) },
    ];
    return (
        <LocationSiteShell>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
            <div className="flex flex-col w-full">
                <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 md:py-24">
                    <div className="container max-w-5xl">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5">Business Software & Website Development by City</h1>
                        <p className="text-slate-300 max-w-3xl text-lg leading-relaxed">Explore city-specific business needs, software demand, website requirements, and related service information for the initial target markets.</p>
                    </div>
                </section>
                <section className="container py-14 md:py-20">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">Current city pages</h2>
                    <p className="text-slate-600 mb-8">Each page outlines local business audiences, digital needs, software requirements, and related service options.</p>
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {publishedCities.map((city) => (
                            <li key={city.slug} className="rounded-lg border bg-white p-5">
                                <Link href={`/locations/${city.slug}`} className="font-semibold text-primary hover:underline">{city.city}, {city.state}</Link>
                                <p className="mt-2 text-sm text-slate-600">{city.targetIndustry}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-10 flex flex-wrap gap-5 text-sm">
                        <Link href="/services" className="font-semibold text-primary hover:underline">Explore Services</Link>
                        <Link href="/industries" className="font-semibold text-primary hover:underline">Explore Industry Solutions</Link>
                        <Link href="/contact" className="font-semibold text-primary hover:underline">Contact VedTech Services</Link>
                    </div>
                </section>
            </div>
        </LocationSiteShell>
    );
}

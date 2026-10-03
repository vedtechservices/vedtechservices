import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import LocationSiteShell from '../LocationSiteShell';
import { citySeoEntries, citySeoEntry, cityServiceLinks, industryPageForCity, isCityReadyForIndexing } from '@/lib/citySeo';
import { SITE_URL } from '@/lib/seo';

type Props = { params: Promise<{ city: string }> };

export function generateStaticParams() {
    return citySeoEntries.map(({ slug }) => ({ city: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { city: slug } = await params;
    const city = citySeoEntry(slug);
    if (!city) return { title: 'Location Not Found | VedTech Services', robots: { index: false, follow: false } };

    const canonical = new URL(`/locations/${city.slug}`, SITE_URL).toString();
    const primaryKeyword = city.seoPrimaryKeyword.charAt(0).toUpperCase() + city.seoPrimaryKeyword.slice(1);
    const description = `${city.city}, ${city.state}: ${city.targetIndustry}. Explore ${city.softwareDemand} and ${city.websiteDigitalNeed} with VedTech Services.`;
    return {
        title: `${primaryKeyword} | VedTech Services`,
        description,
        alternates: { canonical },
        robots: isCityReadyForIndexing(city) ? { index: true, follow: true } : { index: false, follow: true },
        openGraph: { type: 'website', url: canonical, title: `${primaryKeyword} | VedTech Services`, description, siteName: 'VedTech Services', locale: 'en_IN' },
        twitter: { card: 'summary', title: `${primaryKeyword} | VedTech Services`, description },
    };
}

export default async function CityLandingPage({ params }: Props) {
    const { city: slug } = await params;
    const city = citySeoEntry(slug);
    if (!city) notFound();

    const cityUrl = new URL(`/locations/${city.slug}`, SITE_URL).toString();
    const relatedIndustry = industryPageForCity(city.targetIndustry);
    const serviceLinks = cityServiceLinks(city);
    const jsonLd = [
        { '@context': 'https://schema.org', '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'VedTech Services', url: SITE_URL },
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${cityUrl}#webpage`,
            name: `${city.seoPrimaryKeyword.charAt(0).toUpperCase() + city.seoPrimaryKeyword.slice(1)} | VedTech Services`,
            url: cityUrl,
            description: `Software and website development requirements for businesses in ${city.city}, ${city.state}.`,
        },
        {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `Software development for ${city.city} businesses`,
            serviceType: 'Software development and website development',
            url: cityUrl,
            description: `Discuss custom software and website requirements for a business serving ${city.city}, ${city.state}.`,
            provider: { '@id': `${SITE_URL}/#organization` },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'Locations', item: `${SITE_URL}/locations` },
                { '@type': 'ListItem', position: 3, name: city.city, item: cityUrl },
            ],
        },
    ];

    return (
        <LocationSiteShell>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
            <div className="flex flex-col w-full">
                <nav aria-label="Breadcrumb" className="container pt-6 text-sm text-slate-500">
                    <Link href="/" className="hover:text-primary">Home</Link><span aria-hidden="true"> / </span>
                    <Link href="/locations" className="hover:text-primary">Locations</Link><span aria-hidden="true"> / </span>
                    <span aria-current="page">{city.city}</span>
                </nav>
                <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 md:py-24">
                    <div className="container max-w-5xl">
                        <p className="text-blue-300 font-medium mb-4">Software and website development · {city.state}</p>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">{city.seoPrimaryKeyword.charAt(0).toUpperCase() + city.seoPrimaryKeyword.slice(1)}</h1>
                        <p className="text-slate-300 max-w-3xl text-lg leading-relaxed">
                            VedTech Services works on business software, websites, CRM and ERP solutions. If your team in {city.city} is planning a digital project, share the goals, users, and workflow you need it to support.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <Link href="/contact" className="inline-flex items-center rounded-md bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90">Discuss a Project</Link>
                            <Link href="/demo" className="inline-flex items-center rounded-md border border-white/50 px-6 py-3 font-semibold text-white hover:bg-white/10">View Project Demos</Link>
                        </div>
                    </div>
                </section>

                <section className="container py-14 md:py-20 grid gap-10 lg:grid-cols-2">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Digital needs in {city.city}</h2>
                        <p className="text-slate-700 leading-relaxed">Organizations in {city.targetIndustry.toLowerCase()} may need {city.websiteDigitalNeed.toLowerCase()} and software for {city.softwareDemand.toLowerCase()}. These are starting points for a project discussion; the right scope depends on your organization.</p>
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Business problems to scope</h2>
                        <p className="text-slate-700 leading-relaxed">Teams may be looking to address {city.likelyPainPoint.toLowerCase()}. A discovery discussion can clarify the workflow, integrations, users, and reporting needs before recommending a website or software solution.</p>
                    </div>
                </section>

                <section className="bg-slate-50 py-14 md:py-20">
                    <div className="container">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">Relevant software and website services</h2>
                        <p className="text-slate-600 mb-8 max-w-3xl">These existing service pages cover development work relevant to the needs described for {city.city}.</p>
                        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {serviceLinks.map(({ keyword, url }) => (
                                <li key={keyword} className="rounded-lg border bg-white p-5">
                                    <Link href={url} className="font-semibold text-primary hover:underline">{keyword}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="container py-14 md:py-20">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Industry context</h2>
                    <p className="text-slate-700 leading-relaxed max-w-4xl">Potential project contexts include {city.targetIndustry.toLowerCase()}. A relevant starting point may be {city.primaryOfferToPitch.toLowerCase()}; we confirm the requirements and fit directly with your team.</p>
                    {relatedIndustry ? <p className="mt-5"><Link href={relatedIndustry.url} className="font-semibold text-primary hover:underline">Explore IT solutions for {relatedIndustry.name}</Link></p> : <p className="mt-5 text-sm text-slate-500">Contact us to discuss technology needs for your industry.</p>}
                </section>

                <section className="bg-slate-900 text-white py-12">
                    <div className="container flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div><h2 className="text-2xl font-bold">Planning a project in {city.city}?</h2><p className="text-slate-300 mt-2">Contact us to discuss fit, scope, and delivery arrangements.</p></div>
                        <Link href="/contact" className="inline-flex w-fit rounded-md bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90">Contact VedTech Services</Link>
                    </div>
                </section>
            </div>
        </LocationSiteShell>
    );
}

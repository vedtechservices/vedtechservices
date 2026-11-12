import Link from 'next/link';
import { verifiedLocation, verifiedLocations } from '@/data/verified-locations';

export function PublishedLocations() {
  return <section aria-labelledby="published-locations-title" className="container py-12 text-slate-800">
    <h2 id="published-locations-title" className="text-2xl font-bold">Published contact locations</h2>
    <p className="mt-3 max-w-3xl text-slate-600">The website lists the following locations. Confirm directions, appointments and service arrangements directly before visiting; a listed city is not a promise of on-site availability.</p>
    <div className="mt-6 grid gap-5 md:grid-cols-3">{verifiedLocations.map(location => <article key={location.slug} id={`office-${location.slug}`} className="rounded-lg border bg-white p-5 scroll-mt-24">
      <h3 className="font-semibold text-lg">{location.city}, {location.state}</h3><p className="mt-2 text-sm font-medium">{location.detail}</p><p className="mt-3 text-sm leading-relaxed">{location.introduction}</p>
      <Link href={location.guide} className="inline-block mt-4 text-primary underline">{location.slug === 'samastipur' ? 'Samastipur enquiry details' : `${location.city} project planning`}</Link>
      {location.slug === 'samastipur' && <p className="mt-3 text-sm">{location.answer}</p>}
    </article>)}</div>
    <p className="mt-6">Official contact: <a href="tel:+917858971869" className="underline">+91 7858971869</a> · <a href="mailto:info@vedtechservices.in" className="underline">info@vedtechservices.in</a>. <Link href="/contact" className="text-primary underline">Send an enquiry</Link>.</p>
  </section>;
}

export function VerifiedLocationGuidance({ slug }: { slug: string }) {
  const location = verifiedLocation(slug);
  if (!location) return null;
  return <section aria-labelledby="local-enquiry-title" className="container py-12 text-slate-800">
    <div className="max-w-4xl space-y-5"><h2 id="local-enquiry-title" className="text-2xl font-bold">Discussing a project from {location.city}</h2>
      <p>{location.introduction}</p><h3 className="text-xl font-semibold">Prepare your enquiry</h3><p className="leading-relaxed">{location.brief}</p>
      <h3 className="text-xl font-semibold">{location.question}</h3><p className="leading-relaxed">{location.answer}</p>
      <div className="flex flex-wrap gap-5"><Link className="text-primary underline" href={location.related}>{location.relatedLabel}</Link><Link className="text-primary underline" href="/portfolio">Company project case studies</Link><Link className="text-primary underline" href="/contact">Confirm scope and service arrangements</Link></div>
      <p className="text-sm text-slate-600">Project examples describe company work; they are not presented as projects delivered in {location.city}.</p>
    </div>
  </section>;
}

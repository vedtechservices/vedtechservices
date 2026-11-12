import Link from 'next/link';
import { serviceGuides } from '@/data/seo-guidance';

export function ServiceBreadcrumbs({ pathname }: { pathname: string }) {
  const guide = serviceGuides[pathname];
  const label = guide?.label ?? (pathname === '/portfolio' ? 'Portfolio and case studies' : undefined);
  if (!label) return null;
  return <nav aria-label="Breadcrumb" className="container py-4 text-sm text-slate-600">
    <ol className="flex flex-wrap gap-2">
      <li><Link href="/" className="underline">Home</Link></li>
      {guide && <li><span aria-hidden="true">/ </span><Link href="/services" className="underline">Services</Link></li>}
      <li aria-current="page"><span aria-hidden="true">/ </span>{label}</li>
    </ol>
  </nav>;
}

export default function ServiceGuidance({ pathname }: { pathname: string }) {
  const guide = serviceGuides[pathname];
  const article = pathname === '/services/web-development' ? {href:'/blog/2',label:'Why a business website matters'} : pathname === '/services/mobile-app-development' ? {href:'/blog/4',label:'Mobile app or website: compare the approaches'} : pathname === '/services/it-support' ? {href:'/blog/3',label:'Understanding annual maintenance contracts'} : undefined;
  if (!guide) return null;
  return <section aria-labelledby="service-planning-title" className="bg-slate-50 text-slate-800 py-12 md:py-16 border-t">
    <div className="container max-w-6xl space-y-8">
      <div className="max-w-3xl"><h2 id="service-planning-title" className="text-2xl md:text-3xl font-bold">{guide.heading}</h2><p className="mt-4 leading-relaxed">{guide.introduction}</p></div>
      <div className="grid gap-8 md:grid-cols-2">
        <div><h3 className="text-xl font-semibold">What to include in your enquiry</h3><ul className="mt-4 list-disc pl-5 space-y-3">{guide.checklist.map(item => <li key={item}>{item}</li>)}</ul>
          <Link href="/contact" className="inline-flex mt-6 rounded-md bg-primary px-5 py-3 font-semibold text-white">Discuss your requirements</Link>
        </div>
        <div><h3 className="text-xl font-semibold">Questions before you start</h3><dl className="mt-4 space-y-5">{guide.questions.map(item => <div key={item.question}><dt className="font-semibold">{item.question}</dt><dd className="mt-2 leading-relaxed text-slate-600">{item.answer}</dd></div>)}</dl></div>
      </div>
      <nav aria-label="Related service information" className="border-t pt-6"><h3 className="font-semibold mb-3">Related information</h3><ul className="flex flex-wrap gap-x-6 gap-y-3">{guide.related.map(link => <li key={link.href}><Link href={link.href} className="text-primary underline">{link.label}</Link></li>)}{article && <li><Link href={article.href} className="text-primary underline">{article.label}</Link></li>}<li><Link href="/locations" className="text-primary underline">Published contact locations and city project guides</Link></li></ul></nav>
    </div>
  </section>;
}

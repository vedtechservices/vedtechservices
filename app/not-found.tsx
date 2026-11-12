import Link from 'next/link';
export default function NotFound() {
  return <main className="container py-20 max-w-3xl text-slate-800">
    <h1 className="text-3xl font-bold">Page not found</h1>
    <p className="mt-4">This address does not match an available page. You can explore our services or contact the team about your requirements.</p>
    <nav aria-label="Page recovery" className="mt-6 flex flex-wrap gap-5"><Link className="underline" href="/">Home</Link><Link className="underline" href="/services">IT services</Link><Link className="underline" href="/contact">Contact VedTech Services</Link></nav>
  </main>;
}

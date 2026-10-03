import type { ReactNode } from 'react';
import Link from 'next/link';

export default function LocationSiteShell({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-white">
                <div className="container flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
                    <Link href="/" className="text-xl font-bold text-primary">VedTech Services</Link>
                    <nav aria-label="Main navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-700">
                        <Link href="/services" className="hover:text-primary">Services</Link>
                        <Link href="/industries" className="hover:text-primary">Industries</Link>
                        <Link href="/locations" className="hover:text-primary">Locations</Link>
                        <Link href="/contact" className="hover:text-primary">Contact</Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="bg-slate-950 py-8 text-slate-300">
                <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm">© 2026 VedTech Services</p>
                    <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                        <Link href="/services/software" className="hover:text-white">Software Development</Link>
                        <Link href="/services/web-development" className="hover:text-white">Website Development</Link>
                        <Link href="/demo" className="hover:text-white">Project Demos</Link>
                        <Link href="/contact" className="hover:text-white">Contact</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}

import { Link } from '@/lib/next-router';

const labels: Record<string, string> = {
    software: 'Custom software development', web: 'Website development', mobile: 'Mobile app development',
    hardware: 'Computer and hardware repair', networking: 'Networking solutions', support: 'IT support and AMC',
};
const paths: Record<string, string> = {
    software: '/services/software', web: '/services/web-development', mobile: '/services/mobile-app-development',
    hardware: '/services/hardware-repair', networking: '/services/networking-solutions', support: '/services/it-support',
};

export default function IndustryServiceLinks({ services }: { services: string[] }) {
    return (
        <nav aria-label="Related services" className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <span className="font-semibold text-white">Related services:</span>
            {services.map((service) => <Link key={service} href={paths[service]} className="text-white underline underline-offset-4 hover:text-blue-100">{labels[service]}</Link>)}
        </nav>
    );
}

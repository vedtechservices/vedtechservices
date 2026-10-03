import type { Metadata } from 'next';
import { blogPosts } from '@/data/blog';

export const SITE_URL = 'https://vedtechservices.in';

interface SeoPage {
    title: string;
    description: string;
}

const seoPages: Record<string, SeoPage> = {
    '/': {
        title: 'IT Services for Businesses | Software, Web, Hardware & Support | VedTech',
        description: 'Explore business software development, websites, mobile apps, computer repair, networking, and ongoing IT support from VedTech Services.',
    },
    '/about': {
        title: 'About VedTech Services — Expert IT Partner in Bihar, India',
        description: "VedTech Services is Bihar's trusted enterprise IT partner. Learn about our mission, values, team, and commitment to delivering fast, reliable technology solutions.",
    },
    '/services': {
        title: 'Business IT Services | Software, Hardware & Support | VedTech',
        description: "Explore VedTech Services for custom software and website development, mobile apps, computer repair, networking, and ongoing IT support for businesses.",
    },
    '/services/software': {
        title: 'Software Development Services | Custom Software & Apps | VedTech',
        description: 'Plan custom software, CRM and ERP solutions, business websites, mobile apps, and cloud services with VedTech Services. Discuss your project requirements.',
    },
    '/services/hardware': {
        title: 'Computer Repair & IT Infrastructure Services | VedTech',
        description: 'Get computer and laptop repair, printer support, hardware upgrades, server setup, networking, and CCTV installation for your business IT infrastructure.',
    },
    '/services/it-support': {
        title: 'Business IT Support & AMC Plans | Helpdesk | VedTech',
        description: 'Explore business IT support, annual maintenance contracts (AMC), helpdesk assistance, and on-site or remote technical support from VedTech Services.',
    },
    '/services/web-development': {
        title: 'Website Development Company | Business Websites & Web Apps',
        description: 'Plan a business website, e-commerce site, or custom web application with VedTech Services. Explore website design, development, integrations, and support.',
    },
    '/services/mobile-app-development': {
        title: 'Mobile App Development | Android, iOS & Cross-Platform Apps',
        description: 'Discuss Android, iOS, or cross-platform mobile app development with VedTech Services, from app planning and design through deployment and maintenance.',
    },
    '/services/hardware-repair': {
        title: 'Computer & Laptop Repair Services | Hardware Support | VedTech',
        description: 'Arrange computer or laptop diagnostics, hardware repairs, upgrades, printer support, and data recovery with VedTech Services. Contact us about your device.',
    },
    '/services/networking-solutions': {
        title: 'Business Networking Solutions | LAN, Wi-Fi & Network Security',
        description: 'Plan office LAN and Wi-Fi setup, network security, VPN, and server connectivity with VedTech Services. Discuss your network requirements with our team.',
    },
    '/industries': {
        title: 'Industry IT Solutions | Education, Corporate, Retail & More | VedTech',
        description: 'Explore IT solutions for educational institutions, corporate offices, retail businesses, startups, healthcare providers, and manufacturers.',
    },
    '/industries/educational-institutions': {
        title: 'IT Solutions for Educational Institutions | School Technology | VedTech',
        description: 'Explore computer lab setup, smart classrooms, campus Wi-Fi, and student management software for schools, colleges, and coaching institutions.',
    },
    '/industries/corporate-offices': {
        title: 'IT Solutions for Corporate Offices | Networks & Cloud | VedTech',
        description: 'Plan office IT infrastructure, server management, network security, cloud services, and ongoing technical support for corporate teams.',
    },
    '/industries/retail-shops': {
        title: 'Retail IT Solutions | POS, Billing & Inventory | VedTech',
        description: 'Explore point-of-sale systems, billing software, inventory management, and CCTV solutions for retail shops and stores.',
    },
    '/industries/startups-smes': {
        title: 'IT Solutions for Startups & SMEs | Software & Support | VedTech',
        description: 'Plan a business website, custom software, cloud setup, or IT support arrangement suited to a startup or small-to-medium enterprise.',
    },
    '/industries/healthcare': {
        title: 'Healthcare IT Solutions | Patient Systems & Data Security | VedTech',
        description: 'Explore patient management software, appointment workflows, data protection, backup, and device integration for clinics and healthcare providers.',
    },
    '/industries/manufacturing': {
        title: 'Manufacturing IT Solutions | ERP & Industrial Networking | VedTech',
        description: 'Explore ERP integration, inventory and warehouse systems, industrial networking, and automation support for manufacturing operations.',
    },
    '/why-us': {
        title: 'Why Choose VedTech Services — Fast, Reliable IT Support in Bihar',
        description: 'Discover why businesses across Bihar trust VedTech Services for IT support. Fast response, certified engineers, transparent pricing, and 24/7 emergency assistance.',
    },
    '/amc-plans': {
        title: 'IT AMC Plans & Pricing — VedTech Services Annual Maintenance Contracts',
        description: "Explore VedTech Services' affordable Annual Maintenance Contract (AMC) plans for businesses. Comprehensive IT support, hardware maintenance, and SLA-backed service across Bihar.",
    },
    '/support': {
        title: 'Customer Support Center | VedTech Services',
        description: 'Contact VedTech Services for technical support, service requests, and help with an existing issue.',
    },
    '/contact': {
        title: 'Contact VedTech Services — Get Free IT Consultation | 24/7 Support',
        description: 'Contact VedTech Services for professional IT support. Get free consultation, 24/7 emergency support, and expert solutions. Call, email, or WhatsApp us now for immediate assistance.',
    },
    '/privacy': {
        title: 'Privacy Policy — VedTech Services',
        description: 'Learn how VedTech Services collects, uses, and protects your personal information. We are committed to safeguarding your privacy.',
    },
    '/terms': {
        title: 'Terms of Service — VedTech Services',
        description: "Read the terms and conditions governing your use of VedTech Services' website and IT services. Please read carefully before using our services.",
    },
    '/blog': {
        title: 'VedTech Services Blog — IT Tips, Guides & Technology Insights',
        description: 'Read expert articles on IT services, web development, cybersecurity, and business technology. Get practical tips and insights from VedTech Services professionals.',
    },
    '/demo': {
        title: 'Live Project Portfolio — VedTech Services | 17 Projects',
        description: 'Explore 17 live projects built by VedTech Services — from e-commerce platforms and school management systems to hospital software and food delivery apps.',
    },
};

export const PUBLIC_SEO_PATHS = Object.keys(seoPages);

const serviceNames: Record<string, string> = {
    '/services/software': 'Software & Digital Services',
    '/services/hardware': 'Hardware & Infrastructure Services',
    '/services/it-support': 'IT Support & AMC Services',
    '/services/web-development': 'Web Development Services',
    '/services/mobile-app-development': 'Mobile App Development',
    '/services/hardware-repair': 'Computer Repair Services',
    '/services/networking-solutions': 'Networking Solutions',
    '/amc-plans': 'IT Annual Maintenance Contract Plans',
};

const industryNames: Record<string, string> = {
    '/industries/educational-institutions': 'IT Solutions for Educational Institutions',
    '/industries/corporate-offices': 'IT Solutions for Corporate Offices',
    '/industries/retail-shops': 'IT Solutions for Retail Shops',
    '/industries/startups-smes': 'IT Solutions for Startups & SMEs',
    '/industries/healthcare': 'Healthcare IT Solutions',
    '/industries/manufacturing': 'Manufacturing IT Solutions',
};

const privatePath = (pathname: string) =>
    /^\/(?:admin|employee|engineer)(?:\/|$)/.test(pathname) ||
    /^\/(?:dashboard|settings)(?:\/|$)/.test(pathname);

const normalizePath = (pathname: string) => {
    if (!pathname || pathname === '/') return '/';
    return `/${pathname.split('/').filter(Boolean).join('/')}`;
};

const blogPostForPath = (pathname: string) => {
    const match = pathname.match(/^\/blog\/(\d+)$/);
    return match ? blogPosts.find((post) => post.id === Number(match[1])) : undefined;
};

export function getSeoMetadata(pathname: string): Metadata {
    const path = normalizePath(pathname);

    if (privatePath(path)) {
        return {
            title: 'Private Area | VedTech Services',
            robots: { index: false, follow: false },
        };
    }

    const post = blogPostForPath(path);
    const page = post
        ? { title: `${post.title} - VedTech Blog`, description: post.excerpt }
        : seoPages[path];

    if (!page) {
        return {
            title: 'Page Not Found | VedTech Services',
            robots: { index: false, follow: false },
        };
    }

    const canonical = new URL(path, SITE_URL).toString();
    const openGraphType = post ? 'article' : 'website';

    return {
        title: page.title,
        description: page.description,
        alternates: { canonical },
        robots: { index: true, follow: true },
        openGraph: {
            type: openGraphType,
            url: canonical,
            title: page.title,
            description: page.description,
            siteName: 'VedTech Services',
            locale: 'en_IN',
        },
        twitter: {
            card: 'summary',
            title: page.title,
            description: page.description,
        },
    };
}

export function getJsonLd(pathname: string) {
    const path = normalizePath(pathname);
    const post = blogPostForPath(path);
    const page = post
        ? { title: `${post.title} - VedTech Blog`, description: post.excerpt }
        : seoPages[path];

    if (!page || privatePath(path)) return [];

    const canonical = new URL(path, SITE_URL).toString();
    const organizationId = `${SITE_URL}/#organization`;
    const websiteId = `${SITE_URL}/#website`;
    const schemas: Record<string, unknown>[] = [
        {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': organizationId,
            name: 'VedTech Services',
            url: SITE_URL,
        },
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': websiteId,
            name: 'VedTech Services',
            url: SITE_URL,
            publisher: { '@id': organizationId },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${canonical}#webpage`,
            url: canonical,
            name: page.title,
            description: page.description,
            isPartOf: { '@id': websiteId },
            about: { '@id': organizationId },
        },
    ];

    if (path === '/services') {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'VedTech Services',
            url: canonical,
            itemListElement: Object.entries(serviceNames)
                .filter(([servicePath]) => servicePath.startsWith('/services/'))
                .map(([servicePath, name], index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name,
                    url: new URL(servicePath, SITE_URL).toString(),
                })),
        });
    }

    if (path === '/industries') {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Industries Served by VedTech Services',
            url: canonical,
            itemListElement: Object.entries(industryNames).map(([industryPath, name], index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name,
                url: new URL(industryPath, SITE_URL).toString(),
            })),
        });
    }

    const industryName = industryNames[path];
    if (industryName) {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: industryName,
            serviceType: industryName,
            url: canonical,
            description: page.description,
            provider: { '@id': organizationId },
        });
    }

    if (path !== '/') {
        const segments = path.split('/').filter(Boolean);
        const crumbs = [{ name: 'Home', item: SITE_URL }];
        let currentPath = '';

        for (const segment of segments) {
            currentPath += `/${segment}`;
            const isFinalSegment = currentPath === path;
            const label = isFinalSegment && post
                ? post.title
                : seoPages[currentPath]?.title ?? segment.replace(/-/g, ' ');
            crumbs.push({ name: label, item: new URL(currentPath, SITE_URL).toString() });
        }

        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: crumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: crumb.name,
                item: crumb.item,
            })),
        });
    }

    const serviceName = serviceNames[path];
    if (serviceName) {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: serviceName,
            serviceType: serviceName,
            url: canonical,
            description: page.description,
            provider: { '@id': organizationId },
        });
    }

    if (post) {
        const datePublished = new Date(post.date);
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            url: canonical,
            mainEntityOfPage: { '@id': `${canonical}#webpage` },
            image: post.image,
            author: { '@type': 'Person', name: post.author },
            publisher: { '@id': organizationId },
            ...(Number.isNaN(datePublished.getTime()) ? {} : { datePublished: datePublished.toISOString() }),
        });
    }

    return schemas;
}

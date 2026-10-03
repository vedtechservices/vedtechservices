import cityRows from '@/data/citySeo.json';

export type CitySeoEntry = (typeof cityRows)[number];

export const citySeoEntries = cityRows;
export const citySeoEntry = (slug: string) => citySeoEntries.find((row) => row.slug === slug);
export const isCityReadyForIndexing = (city: CitySeoEntry) => city.phase === 'Phase 1';

export const industryPageForCity = (industry: string) => {
    const value = industry.toLowerCase();
    if (/startup|sme/.test(value)) return { name: 'Startups & SMEs', url: '/industries/startups-smes' };
    if (/education|coaching|hostel/.test(value)) return { name: 'Educational Institutions', url: '/industries/educational-institutions' };
    if (/corporate|office/.test(value)) return { name: 'Corporate Offices', url: '/industries/corporate-offices' };
    if (/retail|shop|jewellery/.test(value)) return { name: 'Retail & Shops', url: '/industries/retail-shops' };
    if (/health|clinic|pharma/.test(value)) return { name: 'Healthcare', url: '/industries/healthcare' };
    if (/manufactur|auto|factory|industrial|engineering/.test(value)) return { name: 'Manufacturing', url: '/industries/manufacturing' };
    return undefined;
};

export const cityServiceLinks = (city: CitySeoEntry) => {
    const terms = city.seoServiceKeywords.split(';').map((keyword) => keyword.trim()).filter(Boolean);
    return terms.map((keyword) => {
        const normalized = keyword.toLowerCase();
        const url = /crm|erp|software development/.test(normalized)
            ? '/services/software'
            : /website development|business website/.test(normalized)
                ? '/services/web-development'
                : /mobile app development/.test(normalized)
                    ? '/services/mobile-app-development'
                    : undefined;
        return url ? { keyword, url } : undefined;
    }).filter((link): link is { keyword: string; url: string } => Boolean(link));
};

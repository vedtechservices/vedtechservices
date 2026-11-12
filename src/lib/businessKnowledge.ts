import seed from '../data/portfolio-seed.json';
// Evidence paths are kept beside each editable entry. No prices or delivery promises are inferred.
export const knowledge = {
    company: { source: 'src/views/About.tsx; CONTACT_INFO.md', text: 'VedTech Services provides IT services for businesses across India. Locations listed on the website include Gurugram, Haryana (Sector 17A head office) and Samastipur, Bihar (848101).' },
    contact: { source: 'src/views/Contact.tsx', text: 'The website lists +91 7858971869 and info@vedtechservices.in. Visit /contact for official contact options.' },
    process: { source: 'src/views/SoftwareServices.tsx:process', text: 'The published software process is discovery, planning, design, development, testing, deployment, then ongoing support. Scope and schedule need confirmation for each project.' },
    technology: { source: 'src/views/SoftwareServices.tsx', text: 'Listed technologies include React, WordPress, PHP, React Native, Flutter, Java, Python, .NET, Node.js, AWS, Azure, MySQL, PostgreSQL and MongoDB. The team must confirm the right stack for your project.' },
    pricing: { source: 'src/views/AMCPlans.tsx; src/views/SoftwareServices.tsx', text: 'A project quote needs confirmed scope; I do not have a verified fixed project price. Published maintenance plans are at /amc-plans; confirm applicability and current terms with the team at /contact.' },
};
export type PublicProject = {
    title: string;
    description: string;
    project_url?: string;
    technologies?: string[];
    surfaces?: string[];
};
export const portfolioProjects: PublicProject[] = seed;
export function portfolioAnswer(projects: PublicProject[] = portfolioProjects) {
    const entries = projects.filter(p => p.surfaces?.includes('portfolio')).slice(0, 6);
    return entries.length ? 'From the shared website portfolio data:\n' + entries.map(p => `${p.title}: ${p.description}${p.project_url && /^https:\/\//.test(p.project_url) ? ` (${p.project_url})` : ''}`).join('\n') + '\nExplore /portfolio and /demo. Project examples do not guarantee the same scope for a new project.' : 'No project details are available in this local dataset. Please check /portfolio or /contact.';
}

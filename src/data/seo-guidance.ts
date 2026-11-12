export type ServiceGuide = {
  label: string;
  heading: string;
  introduction: string;
  checklist: string[];
  questions: { question: string; answer: string }[];
  related: { href: string; label: string }[];
};
// Intent-specific additions to existing pages. These are discovery guidance,
// not new guarantees, packages, fixed prices, delivery dates or local case studies.
export const serviceGuides: Record<string, ServiceGuide> = {
  '/services/software': {
    label: 'Software development', heading: 'Plan software around the workflow it needs to support',
    introduction: 'Custom software starts with a business process: the people using it, the information they handle and the decisions they need to make. A clear brief helps distinguish a website project from a business application.',
    checklist: ['Describe the current workflow and the problem to solve.', 'List user roles, reports and systems that may need integration.', 'Identify existing data and any migration or access requirements.'],
    questions: [
      { question: 'Should I request a website or custom business software?', answer: 'A business website usually presents information and captures enquiries. An application may also manage records, permissions or internal workflows. Describe the tasks first; the team can confirm which service fits.' },
      { question: 'What is needed for a custom software quote?', answer: 'Share the workflow, users, requested features, existing systems and optional budget or target date. Pricing and delivery depend on the confirmed scope; this page does not establish a fixed quote.' },
      { question: 'How is a software project developed?', answer: 'The published process covers discovery, planning, design, development, testing, deployment and support. The scope of each stage is agreed for the particular project.' },
    ],
    related: [{ href: '/services/web-development', label: 'Business website development' }, { href: '/services/mobile-app-development', label: 'Mobile app development' }, { href: '/portfolio', label: 'Project case studies' }],
  },
  '/services/web-development': {
    label: 'Website development', heading: 'Prepare a useful brief for your business website',
    introduction: 'Start with what a visitor should learn or do: understand a service, browse products or send an enquiry. This gives the team a practical basis for discussing pages, content and requested functionality.',
    checklist: ['List essential pages and the action visitors should take.', 'Identify who will supply and update text, product information and images.', 'Describe requested forms, catalogue or booking workflows for scope review.'],
    questions: [
      { question: 'What information is needed to estimate website development cost?', answer: 'Provide the website purpose, page list, content readiness and requested features. An enquiry website and an application with customer accounts have different requirements. Confirm the price and inclusions with the team.' },
      { question: 'Can I discuss an e-commerce website?', answer: 'E-commerce development is listed among the website services. Prepare the product catalogue, ordering requirements and requested payment or delivery workflows. Each integration and responsibility needs confirmation.' },
      { question: 'What should I prepare for a website redesign?', answer: 'List useful existing pages and URLs, content to retain, current enquiry routes and the problems you want to solve. Discuss URL preservation and any proposed redirects before approving a new structure.' },
    ],
    related: [{ href: '/services/software', label: 'Custom applications and business software' }, { href: '/demo', label: 'Website and application demos' }, { href: '/locations/gurugram', label: 'Project planning with the Gurugram head office' }],
  },
  '/services/mobile-app-development': {
    label: 'Mobile app development', heading: 'Scope the app journey before choosing the platform',
    introduction: 'A mobile app brief should explain its users and the tasks they need to complete. Platform choice, accounts and connections to existing software can then be discussed against actual requirements.',
    checklist: ['Identify Android, iOS or cross-platform requirements.', 'Describe the main user journeys and requested account roles.', 'List existing services or data the app would need to use.'],
    questions: [
      { question: 'Which mobile platforms can I discuss?', answer: 'The published service pages describe Android, iOS and cross-platform app development. The team must confirm the technology and platform scope for the proposed app.' },
      { question: 'Do I need an app or a mobile-friendly website?', answer: 'Describe how often people will use the service and what tasks they need to perform. Compare an app project with a responsive website before selecting the approach.' },
      { question: 'What affects a mobile app estimate?', answer: 'Platforms, screens, account roles, data connections and requested functionality affect the scope. Share these requirements to obtain a project-specific quote; no fixed app price is published here.' },
    ],
    related: [{ href: '/services/web-development', label: 'Responsive website development' }, { href: '/services/software', label: 'Business software and integrations' }, { href: '/portfolio', label: 'Explore project case studies' }],
  },
  '/services/hardware': {
    label: 'Hardware and infrastructure', heading: 'Plan office infrastructure as a connected system',
    introduction: 'Office IT planning involves devices, printers, connectivity and ongoing care. Describing the working environment helps separate a single-device repair from a wider infrastructure requirement.',
    checklist: ['List device types, approximate quantities and office users.', 'Describe shared printers, connectivity and existing equipment.', 'Explain whether you need a new setup, upgrades or ongoing maintenance.'],
    questions: [
      { question: 'Is an office setup different from a computer repair?', answer: 'An office setup considers several devices and shared infrastructure. A repair enquiry focuses on a particular fault. Use the relevant service page and describe the actual requirement.' },
      { question: 'Can existing equipment be reviewed for upgrades?', answer: 'Hardware upgrades are listed as a service. Provide device specifications and the work you need to perform; diagnosis and compatible options need confirmation.' },
    ],
    related: [{ href: '/services/hardware-repair', label: 'Computer and laptop repair' }, { href: '/services/networking-solutions', label: 'Office networking solutions' }, { href: '/amc-plans', label: 'Published maintenance plans' }],
  },
  '/services/hardware-repair': {
    label: 'Computer and laptop repair', heading: 'Describe the fault without sharing sensitive access',
    introduction: 'A precise repair enquiry helps the team understand the affected device and the symptoms. Avoid sending passwords, access codes or private files in an initial enquiry.',
    checklist: ['Include device type and model where known.', 'Describe symptoms, visible errors and when the problem started.', 'Mention whether several devices or a shared connection are affected.'],
    questions: [
      { question: 'What should I include in a laptop repair enquiry?', answer: 'Describe the fault, the device model where known and any visible error message. Let the team confirm diagnosis and suitable next steps; do not share passwords or payment details.' },
      { question: 'Can a repair price be confirmed before diagnosis?', answer: 'The fault and any parts or work required must be confirmed. Ask the team for a diagnosis and quotation rather than treating a general service description as a fixed repair price.' },
      { question: 'Where can I confirm repair service arrangements?', answer: 'Use the official contact page. Published contact locations include Gurugram, Samastipur and Bhopal; confirm the relevant address, appointment and service arrangements directly.' },
    ],
    related: [{ href: '/services/hardware', label: 'Office IT infrastructure and upgrades' }, { href: '/services/networking-solutions', label: 'Help with shared network issues' }, { href: '/contact#office-samastipur', label: 'Samastipur contact information' }],
  },
  '/services/networking-solutions': {
    label: 'Networking solutions', heading: 'Separate a network fault from a new network requirement',
    introduction: 'A network enquiry is easier to scope when it explains the affected users, equipment and shared services. This helps distinguish a single-device issue from a wider office connectivity problem.',
    checklist: ['Describe the office layout and approximate number of users.', 'List affected routers, Wi-Fi areas or shared devices where known.', 'For a fault, note whether it affects all users or only certain devices.'],
    questions: [
      { question: 'What networking services are listed?', answer: 'The service pages cover LAN/WAN, Wi-Fi, router configuration, firewall setup and related connectivity requirements. The team must confirm which work applies to your environment.' },
      { question: 'What information helps with an office Wi-Fi enquiry?', answer: 'Describe affected areas, approximate users and whether wired devices also have problems. Share symptoms rather than passwords, router credentials or private network configuration.' },
    ],
    related: [{ href: '/services/hardware', label: 'Office infrastructure planning' }, { href: '/services/it-support', label: 'IT support and maintenance' }, { href: '/contact', label: 'Discuss your network requirements' }],
  },
  '/services/it-support': {
    label: 'IT support and AMC', heading: 'Choose support around the systems your business relies on',
    introduction: 'A support enquiry should identify the systems that matter to daily work and the issues affecting them. For ongoing care, compare the published maintenance options with your actual equipment and requirements.',
    checklist: ['List the systems or devices affected and the business impact.', 'Separate an immediate issue from ongoing maintenance needs.', 'Review the published plan terms and confirm applicable coverage.'],
    questions: [
      { question: 'How do I raise a technical support request?', answer: 'Use the support page or the confirmed support-request form in VedBot. A request is submitted only after the server confirms it; a local FAQ reply or project brief does not submit a ticket.' },
      { question: 'Where can I review AMC plans?', answer: 'Published annual maintenance options are available on the AMC plans page. Confirm device eligibility, coverage, exclusions and current terms with the team before deciding.' },
      { question: 'Does opening VedBot connect a human agent?', answer: 'VedBot provides local business information. Opening the assistant does not establish a human connection or promise a response time. Use a confirmed support submission for a request.' },
    ],
    related: [{ href: '/amc-plans', label: 'Compare published AMC plans' }, { href: '/support', label: 'Raise or check a support request' }, { href: '/services/hardware-repair', label: 'Device repair information' }],
  },
};

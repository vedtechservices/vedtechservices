// Verified against Contact.tsx, Footer.tsx and CONTACT_INFO.md. These are published
// contact locations, not promises of walk-in hours, on-site coverage or local clients.
export const verifiedLocations = [
  { slug: 'gurugram', city: 'Gurugram', state: 'Haryana', detail: 'Sector 17A (Head Office)', guide: '/locations/gurugram',
    introduction: 'The website lists Sector 17A, Gurugram as the head office. Confirm the appointment and service arrangements with the team before visiting.',
    brief: 'For a corporate website or internal portal, prepare your service pages, enquiry-routing needs, user roles and reporting requirements. Keep a list of systems that a proposed project would need to connect to.',
    related: '/industries/corporate-offices', relatedLabel: 'IT planning for corporate offices',
    question: 'Can I discuss a corporate website with the Gurugram team?',
    answer: 'Use the official contact page to describe your business, website goals and existing systems. The team must confirm the scope, meeting arrangements and any location-specific service requirements.' },
  { slug: 'samastipur', city: 'Samastipur', state: 'Bihar', detail: '848101', guide: '/contact#office-samastipur',
    introduction: 'Samastipur, Bihar 848101 is a published contact location. The website does not provide a street-level address here; request directions and confirm arrangements before a visit.',
    brief: 'For device repair or IT maintenance, describe the device type, symptoms, number of affected computers and whether the issue affects a shared network. Do not send passwords or access codes.',
    related: '/services/hardware-repair', relatedLabel: 'Computer and laptop repair enquiries',
    question: 'What should I include in a Samastipur repair enquiry?',
    answer: 'Include the device type, the problem and any visible error message. Use the contact page to confirm diagnosis, location arrangements and whether a maintenance plan is relevant. Avoid passwords and sensitive files.' },
  { slug: 'bhopal', city: 'Bhopal', state: 'Madhya Pradesh', detail: 'City listed in the website contact information', guide: '/locations/bhopal',
    introduction: 'Bhopal, Madhya Pradesh appears in the website contact information. No street address or opening hours are confirmed here; contact the team to arrange a discussion.',
    brief: 'For an education or service-business website, list the information visitors need, the people who will update it and how enquiries should be handled. Describe requested admissions or appointment workflows for feasibility review rather than assuming they are included.',
    related: '/industries/educational-institutions', relatedLabel: 'Technology planning for educational institutions',
    question: 'How do I enquire about a website project from Bhopal?',
    answer: 'Share the organization type, content needs and requested enquiry workflow through the official contact page. The team must confirm project suitability, scope and service arrangements. No local project result or visit availability is implied.' },
] as const;
export const verifiedLocation = (slug: string) => verifiedLocations.find(location => location.slug === slug);

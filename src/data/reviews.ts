export interface ClientReview {
  id: string;
  name: string;
  company: string;
  role: string;
  review: string;
  service: string;
  avatar: string;
  rating?: number;
  createdAt?: string;
}

/**
 * Replace these clearly marked demo entries with client-approved reviews before
 * presenting them as real testimonials. Keep review details in this file.
 */
export const clientReviews: ClientReview[] = [
  {
    id: 'sample-it-support',
    name: 'Client Name',
    company: 'Company Name',
    role: 'Role / industry',
    review: 'Approved client feedback for IT support will appear here.',
    service: 'IT Support',
    avatar: 'C',
  },
  {
    id: 'sample-web-development',
    name: 'Client Name',
    company: 'Company Name',
    role: 'Role / industry',
    review: 'Approved client feedback for web development will appear here.',
    service: 'Web Development',
    avatar: 'C',
  },
  {
    id: 'sample-software',
    name: 'Client Name',
    company: 'Company Name',
    role: 'Role / industry',
    review: 'Approved client feedback for software services will appear here.',
    service: 'Software Services',
    avatar: 'C',
  },
  {
    id: 'sample-hardware',
    name: 'Client Name',
    company: 'Company Name',
    role: 'Role / industry',
    review: 'Approved client feedback for hardware services will appear here.',
    service: 'Hardware Services',
    avatar: 'C',
  },
  {
    id: 'sample-networking',
    name: 'Client Name',
    company: 'Company Name',
    role: 'Role / industry',
    review: 'Approved client feedback for networking solutions will appear here.',
    service: 'Networking Solutions',
    avatar: 'C',
  },
];

/** Configure this only with the verified Google Business Profile review URL. */
export const GOOGLE_REVIEW_URL = '';

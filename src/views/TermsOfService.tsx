import React from 'react';
import { Link } from '@/lib/next-router';
import PageMeta from '@/components/common/PageMeta';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
  </section>
);

const TermsOfService: React.FC = () => (
  <>
    <PageMeta
      title="Terms of Service — VedTech Services"
      description="Read the terms and conditions governing your use of VedTech Services' website and IT services. Please read carefully before using our services."
    />
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-14">
        <div className="container max-w-3xl">
          <Link to="/">
            <Button variant="ghost" className="border border-white/30 text-white hover:bg-white/10 mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-balance">Terms of Service</h1>
          </div>
          <p className="text-slate-400 text-sm">Last updated: January 2026 · Effective immediately</p>
        </div>
      </div>

      {/* Content */}
      <article className="container max-w-3xl py-12 space-y-10">
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using the VedTech Services website (<strong>vedtechservices.in</strong>) or any of our IT
            services, you agree to be bound by these Terms of Service and our{' '}
            <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>. If you disagree with any part
            of these terms, you may not use our services.
          </p>
        </Section>

        <Section title="2. Description of Services">
          <p>VedTech Services provides technology solutions including but not limited to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hardware repair and maintenance (computers, printers, networking equipment)</li>
            <li>IT support and Annual Maintenance Contracts (AMC)</li>
            <li>Custom software and web development</li>
            <li>Networking infrastructure setup and support</li>
            <li>CCTV installation and security systems</li>
            <li>Mobile application development</li>
          </ul>
        </Section>

        <Section title="3. User Responsibilities">
          <p>By using our services, you agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate and complete information when submitting requests or forms</li>
            <li>Not use our website or services for any unlawful purpose</li>
            <li>Not attempt to gain unauthorised access to any part of our systems</li>
            <li>Not transmit malicious code, spam, or disruptive content</li>
            <li>Respect intellectual property rights of VedTech Services and third parties</li>
          </ul>
        </Section>

        <Section title="4. Service Agreements and Warranties">
          <p>
            Specific service terms, warranties, and SLAs for paid engagements are defined in individual service agreements
            or quotations issued by VedTech Services. In the absence of a specific agreement:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hardware repairs carry a 30-day workmanship warranty</li>
            <li>Replaced parts carry the manufacturer's warranty only</li>
            <li>Software deliverables carry a 15-day bug-fix warranty post-delivery</li>
            <li>Network installations carry a 90-day defect warranty</li>
          </ul>
        </Section>

        <Section title="5. Limitation of Liability">
          <p>
            VedTech Services shall not be liable for any indirect, incidental, special, consequential, or punitive
            damages, including loss of profits, data, or goodwill, arising from or related to your use of our services
            or website.
          </p>
          <p>
            Our total liability in any matter arising out of these terms shall not exceed the amount paid by you to
            VedTech Services for the specific service giving rise to the claim in the preceding 30 days.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            All content on the VedTech Services website — including text, graphics, logos, images, and software — is the
            property of VedTech Services and is protected by applicable intellectual property laws.
          </p>
          <p>
            Custom software or assets developed for a client become the client's property upon full payment, as specified
            in the individual project agreement.
          </p>
        </Section>

        <Section title="7. Confidentiality">
          <p>
            Both parties agree to keep confidential any proprietary information disclosed during service engagements.
            This obligation continues for 2 years after the end of the engagement unless the information becomes
            publicly available through no fault of either party.
          </p>
        </Section>

        <Section title="8. Payment Terms">
          <ul className="list-disc pl-6 space-y-1">
            <li>Invoices are payable within 7 days of issuance unless otherwise agreed</li>
            <li>Late payments may attract a 1.5% monthly surcharge</li>
            <li>Advance payments are non-refundable unless VedTech Services cancels the engagement</li>
            <li>AMC payments are due at the beginning of each contract period</li>
          </ul>
        </Section>

        <Section title="9. Cancellation and Refunds">
          <p>
            Service cancellation requests must be submitted in writing. Refunds for partially completed work are
            evaluated on a case-by-case basis. Emergency call-out fees are non-refundable once the technician is
            dispatched.
          </p>
        </Section>

        <Section title="10. Third-Party Links">
          <p>
            Our website may contain links to third-party websites. VedTech Services is not responsible for the content,
            privacy practices, or accuracy of those sites. Accessing third-party links is at your own risk.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            These Terms are governed by and construed in accordance with the laws of India. Any disputes arising under
            or related to these Terms shall be subject to the exclusive jurisdiction of the courts of Bihar, India.
          </p>
        </Section>

        <Section title="12. Changes to Terms">
          <p>
            VedTech Services reserves the right to modify these Terms at any time. Changes are effective immediately upon
            posting. Continued use of our services constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>For questions about these Terms, please contact:</p>
          <address className="not-italic bg-white border rounded-lg p-4 space-y-1 text-sm">
            <p><strong>VedTech Services</strong></p>
            <p>Gurugram, Haryana — Sector 17A India (Head Office)</p>
            <p>Samastipur, Bihar — 848101 India</p>
            <p>Email: <a href="mailto:info@vedtechservices.in" className="text-primary underline">info@vedtechservices.in</a></p>
            <p>Phone: <a href="tel:+917858971869" className="text-primary underline">+91 7858971869</a></p>
          </address>
        </Section>

        <div className="border-t pt-6 flex flex-col md:flex-row gap-4 text-sm text-slate-500">
          <Link to="/privacy" className="text-primary underline">Privacy Policy →</Link>
          <Link to="/contact" className="text-primary underline">Contact Us →</Link>
        </div>
      </article>
    </div>
  </>
);

export default TermsOfService;

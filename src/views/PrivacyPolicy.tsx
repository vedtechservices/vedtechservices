import React from 'react';
import { Link } from '@/lib/next-router';
import PageMeta from '@/components/common/PageMeta';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
  </section>
);

const PrivacyPolicy: React.FC = () => (
  <>
    <PageMeta
      title="Privacy Policy — VedTech Services"
      description="Learn how VedTech Services collects, uses, and protects your personal information. We are committed to safeguarding your privacy."
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
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-balance">Privacy Policy</h1>
          </div>
          <p className="text-slate-400 text-sm">Last updated: January 2026 · Effective immediately</p>
        </div>
      </div>

      {/* Content */}
      <article className="container max-w-3xl py-12 space-y-10">
        <Section title="1. Introduction">
          <p>
            VedTech Services ("we", "our", or "us") operates the website at <strong>vedtechservices.in</strong> and
            related services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
            when you visit our website or use our services.
          </p>
          <p>
            By using our services, you agree to the collection and use of information in accordance with this policy.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p><strong>Information you provide directly:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name, email address, and phone number submitted via contact or support forms</li>
            <li>Company name and service requirements you share with us</li>
            <li>Feedback and ratings you submit through our chatbot or service portals</li>
          </ul>
          <p><strong>Information collected automatically:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Browser type, operating system, and device information</li>
            <li>Pages visited, time on site, and referring URLs</li>
            <li>IP address (anonymised for analytics)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc pl-6 space-y-1">
            <li>To process and respond to your service or support requests</li>
            <li>To send you service updates, quotes, and follow-ups you have requested</li>
            <li>To improve our website, services, and internal operations</li>
            <li>To comply with legal obligations</li>
            <li>To detect and prevent fraud or misuse of our systems</li>
          </ul>
          <p>We do <strong>not</strong> sell, trade, or rent your personal information to third parties.</p>
        </Section>

        <Section title="4. Cookies">
          <p>
            We use cookies to enhance user experience and collect anonymous analytics data. You can instruct your browser
            to refuse cookies, but some features of our website may not function properly without them.
          </p>
          <p>
            We use session cookies (cleared on browser close) and persistent cookies (stored until expiry or manual deletion).
          </p>
        </Section>

        <Section title="5. Data Storage and Security">
          <p>
            Your data is stored on secure cloud servers (Supabase / AWS infrastructure) with encryption at rest and in
            transit via HTTPS/TLS. We implement row-level security, access controls, and regular security audits.
          </p>
          <p>
            While we strive to protect your personal information, no method of internet transmission or electronic storage
            is 100% secure. We cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="6. Third-Party Services">
          <p>Our website may use the following third-party services, each governed by its own privacy policy:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Google Analytics</strong> — anonymous usage analytics</li>
            <li><strong>OpenStreetMap / Leaflet</strong> — interactive maps (no personal data sent)</li>
            <li><strong>WhatsApp Business API</strong> — customer communication</li>
          </ul>
        </Section>

        <Section title="7. Data Retention">
          <p>
            We retain personal data only as long as necessary to fulfil the purposes for which it was collected, or as
            required by law. Support ticket data is retained for 3 years. Contact form submissions are retained for 1 year.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (subject to legal obligations)</li>
            <li>Withdraw consent at any time for processing based on consent</li>
          </ul>
          <p>
            To exercise these rights, contact us at{' '}
            <a href="mailto:info@vedtechservices.in" className="text-primary underline">info@vedtechservices.in</a>.
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            Our services are not directed to individuals under 13 years of age. We do not knowingly collect personal
            information from children under 13. If we become aware of such data, we will delete it promptly.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy periodically. Changes will be posted on this page with a revised date.
            Continued use of our services after changes constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>For any privacy-related queries, contact:</p>
          <address className="not-italic bg-white border rounded-lg p-4 space-y-1 text-sm">
            <p><strong>VedTech Services</strong></p>
            <p>Gurugram, Haryana — Sector 17A (Head Office)</p>
            <p>Email: <a href="mailto:info@vedtechservices.in" className="text-primary underline">info@vedtechservices.in</a></p>
            <p>Phone: <a href="tel:+917858971869" className="text-primary underline">+91 7858971869</a></p>
          </address>
        </Section>

        <div className="border-t pt-6 flex flex-col md:flex-row gap-4 text-sm text-slate-500">
          <Link to="/terms" className="text-primary underline">Terms of Service →</Link>
          <Link to="/contact" className="text-primary underline">Contact Us →</Link>
        </div>
      </article>
    </div>
  </>
);

export default PrivacyPolicy;

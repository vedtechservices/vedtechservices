import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hospital, Shield, Activity, Database, Lock, Users, CheckCircle2, Star, Clock } from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';
import IndustryServiceLinks from '@/components/common/IndustryServiceLinks';

const Healthcare: React.FC = () => {
  const solutions = [
    {
      icon: <Database className="h-8 w-8" />,
      title: "Patient Management Systems",
      description: "Comprehensive software for clinics and hospitals to manage patient data, appointments, and billing.",
      features: ["Appointment Scheduling", "Electronic Health Records (EHR)", "Billing & Invoicing", "Patient History Tracking", "Prescription Management", "Lab Integration"]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "HIPAA Compliant Security",
      description: "Advanced security protocols to ensure patient data privacy and regulatory compliance.",
      features: ["Data Encryption", "Access Controls", "Audit Logs", "Secure Backups", "Network Firewalls", "Compliance Monitoring"]
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Medical Equipment Integration",
      description: "Connecting medical devices to your IT infrastructure for real-time data monitoring.",
      features: ["Diagnostic Tool Sync", "Real-time Monitoring", "Device Networking", "Imaging Systems (PACS)", "Maintenance Alerts", "Data Aggregation"]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Staff Collaboration Tools",
      description: "Internal communication systems for healthcare professionals to collaborate efficiently.",
      features: ["Secure Messaging", "Role-based Access", "Schedule Management", "Resource Allocation", "Internal Portals", "Training Modules"]
    }
  ];

  return (
    <>
      <Helmet>
        <title>IT Solutions for Healthcare & Clinics | Healthcare IT Services | VedTech</title>
        <meta name="description" content="Specialized IT solutions for hospitals, clinics, and diagnostic centers. Patient management, data security, and device integration for healthcare providers." />
      </Helmet>

      <div className="flex flex-col w-full">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 md:py-28 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="container relative z-10">
            <div className="max-w-4xl">
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-400/30">
                <Hospital className="h-3 w-3 mr-2" />
                Healthcare IT Solutions
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                Healthcare IT Solutions for Clinics and Providers
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
              VedTech Services helps healthcare teams plan patient management systems, data handling, backup, and device integration around their operational requirements.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact">Request Hospital Audit</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/support">Get Technical Support</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Grid */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Specialized Healthcare Solutions</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Our technology ensures your clinic or hospital operates smoothly while keeping patient data secure and accessible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {solutions.map((solution, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-primary">
                      {solution.icon}
                    </div>
                    <CardTitle className="text-2xl">{solution.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600">{solution.description}</p>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Key Features:</h4>
                      <ul className="grid grid-cols-2 gap-2">
                        {solution.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Healthcare Providers Choose VedTech</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Lock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Unmatched Security</h3>
                <p className="text-slate-600">We prioritize patient data privacy with enterprise-grade encryption and access controls.</p>
              </div>
              <div className="space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">24/7 Availability</h3>
                <p className="text-slate-600">Medical emergencies don't wait. Our support team is available around the clock to keep your systems running.</p>
              </div>
              <div className="space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Activity className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Process Efficiency</h3>
                <p className="text-slate-600">Automate billing, records, and scheduling so you can focus on patient care.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-32 bg-primary text-white text-center">
          <div className="container">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Partner with Healthcare IT Experts</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">Ready to modernize your healthcare facility with secure, reliable IT solutions? Let's talk.</p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link to="/contact">Book a Consultation</Link>
            </Button>
            <IndustryServiceLinks services={["software", "networking", "support"]} />
          </div>
        </section>
      </div>
    </>
  );
};

export default Healthcare;

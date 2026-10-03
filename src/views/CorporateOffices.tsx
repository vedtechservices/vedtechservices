import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Server, Shield, Cloud, Network, Users, CheckCircle2, Star, Zap } from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';
import IndustryServiceLinks from '@/components/common/IndustryServiceLinks';

const CorporateOffices: React.FC = () => {
  const solutions = [
    {
      icon: <Server className="h-8 w-8" />,
      title: "Office IT Infrastructure",
      description: "Complete IT setup for corporate offices",
      features: ["Workstation Setup", "Server Installation", "Network Configuration", "Printer Setup", "CCTV Installation", "Access Control"]
    },
    {
      icon: <Cloud className="h-8 w-8" />,
      title: "Cloud Solutions",
      description: "Modern cloud infrastructure for businesses",
      features: ["Cloud Migration", "Data Backup", "Email Hosting", "File Sharing", "Collaboration Tools", "Disaster Recovery"]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Network Security",
      description: "Enterprise-grade security solutions",
      features: ["Firewall Setup", "Antivirus Deployment", "VPN Configuration", "Security Audit", "Data Encryption", "Threat Protection"]
    },
    {
      icon: <Network className="h-8 w-8" />,
      title: "IT Support & AMC",
      description: "Comprehensive IT maintenance and support",
      features: ["24/7 Helpdesk", "On-site Support", "Remote Assistance", "Regular Maintenance", "Hardware Repairs", "Software Updates"]
    }
  ];

  const officeTypes = [
    "Small Offices", "Medium Enterprises", "Large Corporations", "Branch Offices",
    "Co-working Spaces", "Business Centers", "Regional Offices", "Head Offices"
  ];

  const benefits = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Increased Productivity",
      description: "Reliable IT infrastructure boosts employee efficiency"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Data Security",
      description: "Enterprise-grade security protects business data"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Scalable Solutions",
      description: "Grow your IT infrastructure as business expands"
    }
  ];

  const projects = [
    {
      name: "IT Company Office",
      location: "Patna, Bihar",
      solution: "Complete office IT setup with 50 workstations",
      results: ["Zero downtime", "Cloud migration", "24/7 support"]
    },
    {
      name: "CA Firm",
      location: "Gaya, Bihar",
      solution: "Secure network with data backup solutions",
      results: ["Data security", "Remote access", "Automated backups"]
    },
    {
      name: "Trading Company",
      location: "Muzaffarpur, Bihar",
      solution: "Multi-branch networking and ERP integration",
      results: ["3 branches connected", "Real-time data", "Centralized management"]
    }
  ];

  return (
    <>
      <Helmet>
        <title>IT Solutions for Corporate Offices in Bihar | Office IT Setup Patna | VedTech</title>
        <meta name="description" content="Complete IT solutions for corporate offices in Bihar. Office IT setup, network security, cloud solutions, IT support in Patna, Gaya, Muzaffarpur. Enterprise IT services." />
        <meta name="keywords" content="corporate IT solutions Bihar, office IT setup Patna, business IT services Bihar, network security Gaya, cloud solutions Muzaffarpur, IT support Bihar, enterprise IT Patna" />
        <link rel="canonical" href="https://vedtechservices.in/industries/corporate-offices" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Corporate IT Solutions",
            "provider": {
              "@type": "Organization",
              "name": "VedTech Services"
            },
            "areaServed": {
              "@type": "State",
              "name": "Bihar"
            }
          })}
        </script>
      </Helmet>

      <div className="flex flex-col w-full">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 md:py-28 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="container relative z-10">
            <div className="max-w-4xl">
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-400/30">
                <Building2 className="h-3 w-3 mr-2" />
                Corporate IT Solutions in Bihar
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                IT Infrastructure and Support for Corporate Offices
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Complete IT infrastructure and support for corporate offices in Bihar. From small businesses to large enterprises, we provide scalable IT solutions in Patna, Gaya, Muzaffarpur, and across Bihar.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact">Schedule Consultation</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/support">Get Free Assessment</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>100+ Offices Served</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Enterprise-Grade Solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>24/7 Support Available</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Grid */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">IT Solutions for Corporate Offices</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Comprehensive technology solutions for modern businesses
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
                      <h4 className="font-semibold mb-2 text-sm">Features:</h4>
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

        {/* Projects */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Corporate Clients in Bihar</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Successful IT implementations for businesses
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {project.location}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 font-semibold">{project.solution}</p>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Results:</h4>
                      <ul className="space-y-1">
                        {project.results.map((result, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{result}</span>
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

        {/* Office Types */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">We Serve All Types of Offices</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {officeTypes.map((type, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <p className="font-semibold">{type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Corporate Offices Choose Us</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((item, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-blue-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Upgrade Your Office IT?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Transform your corporate office with modern IT infrastructure. Contact us for a free consultation!
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/contact">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Link to="/support">Request Quote</Link>
              </Button>
            </div>
            <IndustryServiceLinks services={["software", "networking", "support"]} />
          </div>
        </section>
      </div>
    </>
  );
};

export default CorporateOffices;

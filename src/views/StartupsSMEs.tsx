import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Globe, Cloud, Briefcase, Zap, CheckCircle2, DollarSign, Shield, Layout } from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';
import IndustryServiceLinks from '@/components/common/IndustryServiceLinks';

const StartupsSMEs: React.FC = () => {
  const solutions = [
    {
      icon: <Layout className="h-8 w-8" />,
      title: "Digital Presence Foundation",
      description: "Establishing your brand online with high-performance websites and mobile applications.",
      features: ["Custom Web Development", "Mobile App Development", "SEO Optimization", "E-commerce Integration", "Brand Identity Setup", "Content Management Systems"]
    },
    {
      icon: <Cloud className="h-8 w-8" />,
      title: "Scalable Cloud Infrastructure",
      description: "Cost-effective cloud solutions that grow as your business grows, eliminating heavy hardware costs.",
      features: ["Cloud Migration", "Managed Hosting", "SaaS Implementation", "Serverless Computing", "Cloud Backup", "Collaborative Workspaces"]
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Cost-Effective AMC Plans",
      description: "Tailored IT maintenance contracts designed for small budgets but requiring enterprise-level reliability.",
      features: ["Remote Tech Support", "Scheduled Maintenance", "Hardware Upgrades", "Software Updates", "Emergency Response", "Asset Management"]
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      title: "IT Consulting for Growth",
      description: "Expert advice on selecting the right technology stack to achieve your business objectives.",
      features: ["Tech Stack Selection", "Process Automation", "Digital Transformation", "Security Audits", "Scalability Planning", "Budget Optimization"]
    }
  ];

  return (
    <>
      <Helmet>
        <title>IT Solutions for Startups & SMEs | Small Business IT Support | VedTech</title>
        <meta name="description" content="Affordable and scalable IT solutions for startups and small-to-medium enterprises. Web development, cloud setup, and IT consulting for growing businesses." />
      </Helmet>

      <div className="flex flex-col w-full">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 md:py-28 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="container relative z-10">
            <div className="max-w-4xl">
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-400/30">
                <Rocket className="h-3 w-3 mr-2" />
                Startup & SME Growth Partner
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                Scalable IT Solutions for Startups and SMEs
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                VedTech Services empowers startups and SMEs in Bihar with affordable, high-quality IT infrastructure and digital solutions designed to scale with your success.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact">Discuss Your Project</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/amc-plans">View AMC Plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Startup Solutions Grid */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Solutions for Growing Businesses</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                We bridge the gap between small business budgets and enterprise-grade technology.
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

        {/* Values Section */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="space-y-4">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-primary">
                  <DollarSign className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Budget Friendly</h3>
                <p className="text-slate-600">Flexible pricing and AMC plans tailored for small and medium enterprises.</p>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Zap className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Rapid Deployment</h3>
                <p className="text-slate-600">Get your IT foundation up and running quickly so you can focus on sales and operations.</p>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Shield className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Reliable Partner</h3>
                <p className="text-slate-600">We act as your extended IT department, providing expert support whenever you need it.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories Preview */}
        <section className="py-20 md:py-32 bg-slate-900 text-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold">Ready to Launch Your Digital Transformation?</h2>
              <p className="text-slate-300 text-lg">Discuss the software, website, cloud, and support needs involved in your next stage of growth.</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
                <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                  <Link to="/contact">Get Started Today</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="px-8 py-6">
                  <Link to="/why-us">Why Choose VedTech</Link>
                </Button>
              </div>
              <IndustryServiceLinks services={["software", "web", "mobile", "support"]} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default StartupsSMEs;

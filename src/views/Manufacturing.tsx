import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Factory, Cog, Truck, BarChart, Settings, Shield, CheckCircle2, Cpu, Zap } from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';
import IndustryServiceLinks from '@/components/common/IndustryServiceLinks';

const Manufacturing: React.FC = () => {
  const solutions = [
    {
      icon: <Cpu className="h-8 w-8" />,
      title: "Industrial Automation",
      description: "Implementing IT controls for manufacturing machinery and assembly lines to improve output.",
      features: ["Machine Control Systems", "PLC Integration", "Real-time Monitoring", "Automated Workflows", "Performance Analytics", "System Synchronization"]
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: "ERP & Inventory Management",
      description: "Custom ERP solutions to track raw materials, production progress, and finished goods.",
      features: ["Stock Tracking", "Supply Chain Management", "Order Processing", "Resource Planning", "Supplier Portals", "Demand Forecasting"]
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Logistics & Supply Chain",
      description: "Connecting your production floor with distribution networks for seamless operations.",
      features: ["GPS Tracking Integration", "Warehouse Management", "Fleet Monitoring", "Dispatch Automation", "Route Optimization", "Shipment Tracking"]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Industrial Network Security",
      description: "Securing your factory floor networks from cyber threats and industrial espionage.",
      features: ["Network Segmentation", "Intrusion Detection", "Firewall Management", "Secure Remote Access", "Threat Monitoring", "Vulnerability Audits"]
    }
  ];

  return (
    <>
      <Helmet>
        <title>IT Solutions for Manufacturing & Warehouses | Industrial IT Services | VedTech</title>
        <meta name="description" content="Industrial IT solutions for manufacturing units and warehouses. Automation, ERP integration, and secure networking for the manufacturing sector." />
      </Helmet>

      <div className="flex flex-col w-full">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 md:py-28 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="container relative z-10">
            <div className="max-w-4xl">
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-400/30">
                <Factory className="h-3 w-3 mr-2" />
                Manufacturing IT Solutions
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                IT Solutions for Manufacturing Operations
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                VedTech Services provides specialized IT infrastructure for manufacturing plants and warehouses, focusing on automation, security, and supply chain visibility.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact">Optimize Your Factory</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/support">Maintenance & Support</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Grid */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Smart Manufacturing Solutions</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Transform your traditional manufacturing unit into a smart factory with our cutting-edge IT services.
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

        {/* Key Benefits */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Industry Leaders Trust VedTech</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto text-primary">
                  <Zap className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Reduced Downtime</h3>
                <p className="text-slate-600">Our predictive maintenance alerts and 24/7 support ensure your production lines stay moving.</p>
              </div>
              <div className="text-center space-y-4">
                <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto text-primary">
                  <Settings className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Process Optimization</h3>
                <p className="text-slate-600">Identify bottlenecks in your production with data-driven insights and automated workflows.</p>
              </div>
              <div className="text-center space-y-4">
                <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto text-primary">
                  <BarChart className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold">Inventory Accuracy</h3>
                <p className="text-slate-600">Eliminate stock shortages and overages with real-time tracking from warehouse to dispatch.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-32 bg-primary text-white text-center">
          <div className="container">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Scale Your Production with Modern IT</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">VedTech Services is your partner in industrial growth. Let's build a more efficient future together.</p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link to="/contact">Request a Site Visit</Link>
            </Button>
            <IndustryServiceLinks services={["software", "hardware", "networking"]} />
          </div>
        </section>
      </div>
    </>
  );
};

export default Manufacturing;

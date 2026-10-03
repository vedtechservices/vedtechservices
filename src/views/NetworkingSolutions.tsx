import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, Wifi, Server, Lock, Cable, CheckCircle2, Shield, Zap, Star } from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';

const NetworkingSolutions: React.FC = () => {
  const services = [
    {
      icon: <Network className="h-8 w-8" />,
      title: "LAN/WAN Setup",
      description: "Complete local and wide area network installation",
      features: ["Network Design", "Cable Installation", "Switch Configuration", "Network Testing", "Documentation", "Troubleshooting"],
      price: "Starting ₹5,000"
    },
    {
      icon: <Wifi className="h-8 w-8" />,
      title: "Wi-Fi Installation",
      description: "Wireless network setup for offices and homes",
      features: ["Router Installation", "Wi-Fi Configuration", "Coverage Optimization", "Security Setup", "Guest Network", "Bandwidth Management"],
      price: "Starting ₹2,000"
    },
    {
      icon: <Server className="h-8 w-8" />,
      title: "Server Networking",
      description: "Enterprise server network configuration",
      features: ["Server Setup", "Network Storage", "Backup Solutions", "Load Balancing", "Redundancy", "Performance Tuning"],
      price: "Custom Pricing"
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Network Security",
      description: "Comprehensive network security solutions",
      features: ["Firewall Setup", "VPN Configuration", "Access Control", "Security Audit", "Threat Protection", "Monitoring"],
      price: "Starting ₹8,000"
    }
  ];

  const networkTypes = [
    "Office Networks", "Home Networks", "Enterprise Networks", "Retail Networks",
    "Educational Networks", "Healthcare Networks", "Industrial Networks", "Wireless Networks"
  ];

  const benefits = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Fast & Reliable",
      description: "High-speed network with minimal downtime"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure",
      description: "Enterprise-grade security protection"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Scalable",
      description: "Easily expand as your business grows"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Networking Solutions in Bihar | LAN WiFi Setup Patna | VedTech Services</title>
        <meta name="description" content="Professional networking solutions in Bihar. LAN setup, WiFi installation, network security in Patna, Gaya, Muzaffarpur. Expert network engineers in Bihar." />
        <meta name="keywords" content="networking solutions Bihar, LAN setup Patna, WiFi installation Bihar, network setup Gaya, networking company Bihar, IT networking Muzaffarpur, network security Bihar" />
        <link rel="canonical" href="https://vedtechservices.in/services/networking-solutions" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "VedTech Services - Networking Solutions",
            "description": "Professional networking solutions in Bihar",
            "areaServed": {
              "@type": "State",
              "name": "Bihar"
            },
            "serviceType": "Networking Solutions"
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
                <Network className="h-3 w-3 mr-2" />
                Business Networking Solutions
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Networking Solutions</span> for Business
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Plan office LAN/WAN setup, Wi-Fi installation, network security, and server connectivity around your team’s requirements.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact">Get Network Setup</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/support">Free Consultation</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Certified Engineers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Enterprise Solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Networking Services</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                LAN, Wi-Fi, server networking, and security for business environments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-primary">
                      {service.icon}
                    </div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600">{service.description}</p>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Services Include:</h4>
                      <ul className="grid grid-cols-2 gap-2">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t">
                      <Badge variant="outline" className="text-primary">
                        {service.price}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Network Types */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Network Solutions We Provide</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Customized networking for every industry
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {networkTypes.map((type, index) => (
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
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Our Networking Services?</h2>
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

        {/* Service Areas */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Network Support for Different Environments</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Network design and support can be tailored to each environment.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                "Office Networks", "Home Networks", "Enterprise Networks", "Retail Networks",
                "Educational Networks", "Healthcare Networks", "Industrial Networks", "Wireless Networks"
              ].map((city, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-4 text-center">
                    <p className="font-semibold text-slate-700">{city}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-blue-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Need Networking Solutions?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Get professional network setup and support. Contact us today!
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/contact">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Link to="/support">Free Consultation</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default NetworkingSolutions;

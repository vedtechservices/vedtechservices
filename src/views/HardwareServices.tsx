import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Laptop, Monitor, Printer, Wifi, HardDrive, Cpu, Server, Camera, CheckCircle2, Wrench, Clock, Shield } from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';

const HardwareServices: React.FC = () => {
  const services = [
    {
      icon: <Laptop className="h-8 w-8" />,
      title: "Computer & Laptop Repair",
      description: "Expert repair services for all brands and models",
      features: [
        "Hardware Diagnostics",
        "Component Replacement",
        "Screen Replacement",
        "Keyboard Repair",
        "Battery Replacement",
        "Data Recovery"
      ],
      pricing: "Starting from ₹500"
    },
    {
      icon: <Printer className="h-8 w-8" />,
      title: "Printer & Scanner Services",
      description: "Complete printer and scanner solutions",
      features: [
        "Printer Installation",
        "Printer Repair",
        "Scanner Setup",
        "Cartridge Replacement",
        "Network Printer Setup",
        "Maintenance Services"
      ],
      pricing: "Starting from ₹300"
    },
    {
      icon: <HardDrive className="h-8 w-8" />,
      title: "Hardware Upgrades",
      description: "Boost your system performance with upgrades",
      features: [
        "RAM Upgrade",
        "SSD Installation",
        "Graphics Card Upgrade",
        "Processor Upgrade",
        "Storage Expansion",
        "Performance Optimization"
      ],
      pricing: "Starting from ₹1,000"
    },
    {
      icon: <Wifi className="h-8 w-8" />,
      title: "Networking Solutions",
      description: "Professional network setup and maintenance",
      features: [
        "LAN Setup",
        "Wi-Fi Installation",
        "Router Configuration",
        "Network Security",
        "Cable Management",
        "Network Troubleshooting"
      ],
      pricing: "Starting from ₹2,000"
    },
    {
      icon: <Server className="h-8 w-8" />,
      title: "Server Setup & Maintenance",
      description: "Enterprise server solutions",
      features: [
        "Server Installation",
        "Server Configuration",
        "RAID Setup",
        "Backup Solutions",
        "Server Monitoring",
        "Performance Tuning"
      ],
      pricing: "Custom Pricing"
    },
    {
      icon: <Camera className="h-8 w-8" />,
      title: "CCTV & Security Systems",
      description: "Complete surveillance solutions",
      features: [
        "CCTV Installation",
        "IP Camera Setup",
        "DVR/NVR Configuration",
        "Remote Viewing Setup",
        "Maintenance Services",
        "System Upgrades"
      ],
      pricing: "Starting from ₹5,000"
    }
  ];

  const brands = [
    "Dell", "HP", "Lenovo", "Acer", "Asus", "Apple",
    "Canon", "Epson", "Brother", "Samsung", "LG", "Sony"
  ];

  const benefits = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Same-Day Service",
      description: "Fast turnaround for urgent repairs"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Warranty Protection",
      description: "All repairs come with warranty"
    },
    {
      icon: <Wrench className="h-6 w-6" />,
      title: "Expert Technicians",
      description: "Certified and experienced professionals"
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Genuine Parts",
      description: "Only authentic components used"
    }
  ];

  const commonIssues = [
    {
      category: "Computer Issues",
      problems: [
        "Slow Performance",
        "Blue Screen Errors",
        "Overheating",
        "No Display",
        "Boot Failure",
        "Virus/Malware"
      ]
    },
    {
      category: "Laptop Issues",
      problems: [
        "Battery Not Charging",
        "Broken Screen",
        "Keyboard Not Working",
        "Touchpad Issues",
        "Hinge Problems",
        "Charging Port Damage"
      ]
    },
    {
      category: "Printer Issues",
      problems: [
        "Paper Jam",
        "Print Quality Issues",
        "Not Printing",
        "Connection Problems",
        "Cartridge Errors",
        "Slow Printing"
      ]
    },
    {
      category: "Network Issues",
      problems: [
        "Slow Internet",
        "Connection Drops",
        "Wi-Fi Not Working",
        "Limited Connectivity",
        "Router Issues",
        "Network Security"
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Hardware & Infrastructure Services | Computer Repair, Networking | VedTech Services</title>
        <meta name="description" content="Professional hardware services including computer repair, laptop repair, printer services, networking solutions, server setup, and CCTV installation. Expert technicians in India." />
        <meta name="keywords" content="computer repair, laptop repair, printer repair, networking, hardware upgrade, server setup, CCTV installation, IT infrastructure, VedTech Services" />
        <link rel="canonical" href="https://vedtechservices.in/services/hardware" />

        {/* Open Graph */}
        <meta property="og:title" content="Hardware & Infrastructure Services | VedTech Services" />
        <meta property="og:description" content="Professional hardware services including computer repair, networking solutions, and IT infrastructure setup." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vedtechservices.in/services/hardware" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Hardware & Infrastructure Services",
            "provider": {
              "@type": "Organization",
              "name": "VedTech Services"
            },
            "areaServed": "India",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Hardware Services",
              "itemListElement": services.map(service => ({
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": service.title,
                  "description": service.description
                }
              }))
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
                <Laptop className="h-3 w-3 mr-2" />
                Hardware & Infrastructure
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Hardware Solutions</span> for Your Business
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                From computer repairs to complete IT infrastructure setup, we provide reliable hardware services with same-day support.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact">Schedule Service</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/support">Emergency Support</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Hardware Services</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Comprehensive hardware solutions for all your IT infrastructure needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      <ul className="space-y-1">
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
                        {service.pricing}
                      </Badge>
                    </div>
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
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Our Hardware Services</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Professional service with customer satisfaction guaranteed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                      {benefit.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-slate-600 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Common Issues */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Common Issues We Fix</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Expert solutions for all hardware problems
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {commonIssues.map((issue, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{issue.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {issue.problems.map((problem, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <Wrench className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{problem}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Brands We Service</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Expert service for all major brands
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {brands.map((brand, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <p className="font-semibold text-lg">{brand}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-blue-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Need Hardware Support?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Get fast, reliable hardware services from our expert technicians
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/contact">Book Service Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Link to="/support">Emergency Support</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HardwareServices;

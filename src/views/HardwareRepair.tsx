import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Laptop, Monitor, Printer, HardDrive, Wrench, CheckCircle2, Clock, Shield, Star } from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';

const HardwareRepair: React.FC = () => {
  const services = [
    {
      icon: <Laptop className="h-8 w-8" />,
      title: "Computer & Laptop Repair",
      description: "Expert repair for all brands and models",
      features: ["Screen Replacement", "Motherboard Repair", "Battery Replacement", "Keyboard Repair", "Data Recovery", "Performance Upgrade"],
      price: "Starting ₹500"
    },
    {
      icon: <Printer className="h-8 w-8" />,
      title: "Printer & Scanner Repair",
      description: "Complete printer and scanner solutions",
      features: ["Printer Repair", "Scanner Repair", "Cartridge Issues", "Paper Jam Fix", "Network Setup", "Maintenance"],
      price: "Starting ₹300"
    },
    {
      icon: <HardDrive className="h-8 w-8" />,
      title: "Hardware Upgrades",
      description: "Boost your system performance",
      features: ["RAM Upgrade", "SSD Installation", "HDD Replacement", "Graphics Card", "Processor Upgrade", "Storage Expansion"],
      price: "Starting ₹1,000"
    },
    {
      icon: <Monitor className="h-8 w-8" />,
      title: "Desktop & Server Repair",
      description: "Professional desktop and server services",
      features: ["Desktop Repair", "Server Maintenance", "Component Replacement", "System Optimization", "BIOS Configuration", "Hardware Testing"],
      price: "Starting ₹800"
    }
  ];

  const brands = [
    "Dell", "HP", "Lenovo", "Acer", "Asus", "Apple",
    "Canon", "Epson", "Brother", "Samsung", "LG", "Sony"
  ];

  const commonIssues = [
    "Slow Performance", "Blue Screen Errors", "Overheating", "No Display",
    "Battery Not Charging", "Broken Screen", "Keyboard Not Working", "Touchpad Issues",
    "Printer Not Printing", "Paper Jam", "Print Quality Issues", "Connection Problems"
  ];

  return (
    <>
      <Helmet>
        <title>Computer Repair Services in Bihar | Laptop Repair Patna | VedTech Services</title>
        <meta name="description" content="Professional computer and laptop repair services in Bihar. Hardware repair, printer repair, data recovery in Patna, Gaya, Muzaffarpur. Expert technicians in Bihar." />
        <meta name="keywords" content="computer repair Bihar, laptop repair Patna, hardware repair Bihar, printer repair Gaya, computer service Muzaffarpur, laptop service Bihar, IT repair Patna, hardware service Bihar" />
        <link rel="canonical" href="https://vedtechservices.in/services/hardware-repair" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "VedTech Services - Hardware Repair",
            "description": "Professional hardware repair services in Bihar",
            "areaServed": {
              "@type": "State",
              "name": "Bihar"
            },
            "serviceType": "Hardware Repair"
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
                <Wrench className="h-3 w-3 mr-2" />
                Hardware Repair Services in Bihar
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Hardware Repair</span> Services in Bihar
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Arrange diagnostics and repair for computers, laptops, printers, and related hardware. On-site and workshop options depend on the device and issue.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact">Book Repair Service</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/support">Emergency Support</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Same-Day Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>All Brands Supported</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Warranty on Repairs</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Hardware Repair Services</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Diagnostics, repair, upgrades, and data recovery for computers and business devices.
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

        {/* Common Issues */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Common Issues We Fix</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Expert solutions for all hardware problems
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {commonIssues.map((issue, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-700 flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary flex-shrink-0" />
                      {issue}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Brands We Service</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Expert repair for all major brands
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

        {/* Why Choose Us */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose VedTech for Hardware Repair?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Clock className="h-6 w-6" />,
                  title: "Fast Service",
                  description: "Same-day repair for most issues"
                },
                {
                  icon: <Shield className="h-6 w-6" />,
                  title: "Warranty Protection",
                  description: "All repairs come with warranty"
                },
                {
                  icon: <Star className="h-6 w-6" />,
                  title: "Expert Technicians",
                  description: "Certified and experienced professionals"
                }
              ].map((item, index) => (
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
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Repair and Support Options</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Contact us to discuss the issue and the right service option for your device.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                "Computer Diagnostics", "Laptop Repair", "Printer Support", "Hardware Upgrades",
                "Data Recovery", "Component Replacement", "Preventive Maintenance", "On-site Support"
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
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Need Hardware Repair?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Get fast, reliable hardware repair services. Contact us today!
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

export default HardwareRepair;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Monitor, Camera, Wifi, CheckCircle2, Star } from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';
import IndustryServiceLinks from '@/components/common/IndustryServiceLinks';

const RetailShops: React.FC = () => {
  const solutions = [
    {
      icon: <Monitor className="h-8 w-8" />,
      title: "POS Systems",
      description: "Modern point-of-sale solutions for retail",
      features: ["Billing Software", "Inventory Tracking", "Barcode Scanner", "Receipt Printer", "Customer Display", "Sales Reports"]
    },
    {
      icon: <Camera className="h-8 w-8" />,
      title: "CCTV Surveillance",
      description: "Complete security camera systems",
      features: ["HD Cameras", "DVR/NVR Setup", "Remote Viewing", "Night Vision", "Motion Detection", "Cloud Storage"]
    },
    {
      icon: <Wifi className="h-8 w-8" />,
      title: "Store Networking",
      description: "Reliable internet and network setup",
      features: ["Wi-Fi Setup", "Network Cabling", "Router Configuration", "Bandwidth Management", "Guest Wi-Fi", "Network Security"]
    },
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      title: "Inventory Management",
      description: "Digital inventory tracking systems",
      features: ["Stock Management", "Barcode System", "Low Stock Alerts", "Purchase Orders", "Supplier Management", "Reports & Analytics"]
    }
  ];

  return (
    <>
      <Helmet>
        <title>IT Solutions for Retail Shops in Bihar | POS Systems Patna | VedTech</title>
        <meta name="description" content="Complete IT solutions for retail shops in Bihar. POS systems, billing software, CCTV, inventory management in Patna, Gaya, Muzaffarpur." />
        <meta name="keywords" content="retail IT solutions Bihar, POS system Patna, billing software Bihar, CCTV installation Gaya, inventory management Muzaffarpur" />
        <link rel="canonical" href="https://vedtechservices.in/industries/retail-shops" />
      </Helmet>

      <div className="flex flex-col w-full">
        <section className="relative py-20 md:py-32 md:py-28 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="container relative z-10">
            <div className="max-w-4xl">
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-400/30">
                <ShoppingBag className="h-3 w-3 mr-2" />
                Retail IT Solutions in Bihar
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                Retail IT Solutions for Shops and Stores
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Modern POS systems, CCTV surveillance, and inventory management for retail businesses in Bihar. Serving shops in Patna, Gaya, Muzaffarpur, and across Bihar.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact">Get Started</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/support">Request Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">IT Solutions for Retail</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Complete technology solutions for modern retail businesses
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

        <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-blue-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Modernize Your Shop?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Transform your retail business with modern IT solutions. Contact us today!
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/contact">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/support">Request Quote</Link>
              </Button>
            </div>
            <IndustryServiceLinks services={["software", "hardware", "networking"]} />
          </div>
        </section>
      </div>
    </>
  );
};

export default RetailShops;

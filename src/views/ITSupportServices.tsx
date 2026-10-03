import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Headphones, Clock, MapPin, Phone, Mail, CheckCircle2, Star, Users, Building } from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';

const ITSupportServices: React.FC = () => {
  const services = [
    {
      icon: <Headphones className="h-8 w-8" />,
      title: "24/7 IT Helpdesk",
      description: "Round-the-clock technical support for your business",
      features: [
        "Phone Support",
        "Email Support",
        "Remote Desktop Support",
        "Ticket Management",
        "Priority Response",
        "Multi-language Support"
      ]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Annual Maintenance Contract (AMC)",
      description: "Comprehensive maintenance plans for peace of mind",
      features: [
        "Regular Maintenance",
        "Preventive Checks",
        "Priority Support",
        "Discounted Repairs",
        "Free Consultations",
        "Performance Reports"
      ]
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "On-site IT Support",
      description: "Expert technicians at your location",
      features: [
        "Same-day Service",
        "Hardware Repairs",
        "Software Installation",
        "Network Setup",
        "Training Sessions",
        "System Optimization"
      ]
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Remote Technical Support",
      description: "Instant help from anywhere",
      features: [
        "Screen Sharing",
        "Remote Troubleshooting",
        "Software Updates",
        "Configuration Help",
        "Quick Resolution",
        "Secure Connection"
      ]
    }
  ];

  const amcPlans = [
    {
      name: "Basic Plan",
      price: "₹5,000/year",
      features: [
        "Quarterly Maintenance Visits",
        "Email Support",
        "10% Discount on Repairs",
        "Basic Troubleshooting",
        "Software Updates"
      ],
      popular: false
    },
    {
      name: "Professional Plan",
      price: "₹12,000/year",
      features: [
        "Monthly Maintenance Visits",
        "Phone & Email Support",
        "20% Discount on Repairs",
        "Priority Response",
        "Remote Support",
        "Free Minor Repairs"
      ],
      popular: true
    },
    {
      name: "Enterprise Plan",
      price: "Custom Pricing",
      features: [
        "Weekly Maintenance Visits",
        "24/7 Dedicated Support",
        "30% Discount on Repairs",
        "Immediate Response",
        "On-site Technician",
        "Free Parts Replacement",
        "Performance Monitoring"
      ],
      popular: false
    }
  ];

  const supportTypes = [
    {
      title: "Small Business Support",
      description: "Tailored IT support for small businesses and startups",
      icon: <Users className="h-6 w-6" />,
      benefits: ["Cost-effective", "Flexible plans", "Scalable solutions"]
    },
    {
      title: "Corporate IT Support",
      description: "Enterprise-grade support for large organizations",
      icon: <Building className="h-6 w-6" />,
      benefits: ["Dedicated team", "SLA guarantees", "24/7 availability"]
    },
    {
      title: "Educational Institutions",
      description: "Specialized support for schools and colleges",
      icon: <Star className="h-6 w-6" />,
      benefits: ["Student-friendly", "Lab management", "Training included"]
    }
  ];

  const responseTime = [
    { priority: "Critical", time: "Within 1 hour", description: "System down, business impact" },
    { priority: "High", time: "Within 4 hours", description: "Major functionality affected" },
    { priority: "Medium", time: "Within 24 hours", description: "Minor issues, workarounds available" },
    { priority: "Low", time: "Within 48 hours", description: "General queries, enhancements" }
  ];

  return (
    <>
      <Helmet>
        <title>IT Support & AMC Services | 24/7 Helpdesk, Maintenance Contracts | VedTech Services</title>
        <meta name="description" content="Professional IT support services including 24/7 helpdesk, annual maintenance contracts (AMC), on-site support, and remote technical assistance. Dedicated support for businesses in India." />
        <meta name="keywords" content="IT support, AMC, annual maintenance contract, helpdesk, technical support, on-site support, remote support, IT maintenance, VedTech Services" />
        <link rel="canonical" href="https://vedtechservices.in/services/it-support" />

        {/* Open Graph */}
        <meta property="og:title" content="IT Support & AMC Services | VedTech Services" />
        <meta property="og:description" content="Professional IT support services including 24/7 helpdesk, AMC plans, and comprehensive technical assistance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vedtechservices.in/services/it-support" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "IT Support & AMC Services",
            "provider": {
              "@type": "Organization",
              "name": "VedTech Services"
            },
            "areaServed": "India",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "IT Support Services",
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
                <Shield className="h-3 w-3 mr-2" />
                IT Support & AMC
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">24/7 IT Support</span> for Your Business
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Dedicated IT helpdesk, comprehensive AMC plans, and expert technical support to keep your business running smoothly.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/amc-plans">View AMC Plans</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/support">Get Support Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Our IT Support Services</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Comprehensive support solutions for businesses of all sizes
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
                      <h4 className="font-semibold mb-2 text-sm">Features:</h4>
                      <ul className="space-y-1">
                        {service.features.map((feature, i) => (
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

        {/* AMC Plans */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">AMC Plans</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Choose the perfect maintenance plan for your business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {amcPlans.map((plan, index) => (
                <Card key={index} className={`hover:shadow-xl transition-shadow ${plan.popular ? 'border-2 border-primary' : ''}`}>
                  <CardHeader>
                    {plan.popular && (
                      <Badge className="w-fit mb-2">Most Popular</Badge>
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <p className="text-3xl font-bold text-primary mt-2">{plan.price}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                      <Link to="/amc-plans">Choose Plan</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Support Types */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Support for Every Business</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Tailored IT support solutions for different business needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {supportTypes.map((type, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary">
                      {type.icon}
                    </div>
                    <CardTitle className="text-xl">{type.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600">{type.description}</p>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Benefits:</h4>
                      <ul className="space-y-1">
                        {type.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <span>{benefit}</span>
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

        {/* Response Time */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Response Time Commitment</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Fast response times based on issue priority
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {responseTime.map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <Badge className={`mb-4 ${item.priority === 'Critical' ? 'bg-red-500' :
                        item.priority === 'High' ? 'bg-orange-500' :
                          item.priority === 'Medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                      }`}>
                      {item.priority}
                    </Badge>
                    <p className="text-2xl font-bold text-primary mb-2">{item.time}</p>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Get Support Now</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Multiple ways to reach our support team
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <Phone className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Call Us</h3>
                  <p className="text-slate-600 mb-4">24/7 Phone Support</p>
                  <a href="tel:+917858971869" className="text-primary font-semibold hover:underline">
                    +91-7858971869
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Email Us</h3>
                  <p className="text-slate-600 mb-4">Quick Response</p>
                  <a href="mailto:info@vedtechservices.in" className="text-primary font-semibold hover:underline">
                    info@vedtechservices.in
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <Headphones className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Raise a Ticket</h3>
                  <p className="text-slate-600 mb-4">Online Support</p>
                  <Button asChild variant="link" className="text-primary font-semibold">
                    <Link to="/support">Create Ticket</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-blue-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready for Reliable IT Support?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Choose an AMC plan or get immediate support from our expert team
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/amc-plans">View AMC Plans</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Link to="/support">Get Support Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ITSupportServices;

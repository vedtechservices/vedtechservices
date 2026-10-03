import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Code, ShoppingBag, Users, Zap, CheckCircle2, Star, TrendingUp } from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';

const MobileAppDevelopment: React.FC = () => {
  const services = [
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Android App Development",
      description: "Native Android applications for maximum performance",
      features: ["Native Android", "Material Design", "Play Store Publishing", "Push Notifications", "Offline Support", "Performance Optimized"]
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "iOS App Development",
      description: "Premium iOS applications for iPhone and iPad",
      features: ["Native iOS", "Swift/Objective-C", "App Store Publishing", "iCloud Integration", "Apple Pay", "iOS Guidelines"]
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Cross-Platform Apps",
      description: "Single codebase for both Android and iOS",
      features: ["React Native", "Flutter", "Cost Effective", "Faster Development", "Shared Codebase", "Native Performance"]
    },
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      title: "E-commerce Mobile Apps",
      description: "Complete mobile shopping experience",
      features: ["Product Catalog", "Cart & Checkout", "Payment Gateway", "Order Tracking", "Push Notifications", "User Accounts"]
    }
  ];

  const appTypes = [
    "Business Apps", "E-commerce Apps", "Educational Apps", "Food Delivery Apps",
    "Healthcare Apps", "Booking Apps", "Social Apps", "Utility Apps"
  ];

  const projects = [
    {
      title: "Food Delivery App",
      platform: "Android & iOS",
      location: "Patna, Bihar",
      results: ["5000+ Downloads", "4.5★ Rating", "Real-time Tracking"]
    },
    {
      title: "Educational Learning App",
      platform: "Android",
      location: "Gaya, Bihar",
      results: ["10,000+ Students", "Video Lessons", "Quiz System"]
    },
    {
      title: "Business Management App",
      platform: "Cross-Platform",
      location: "Muzaffarpur, Bihar",
      results: ["Inventory Management", "Sales Tracking", "Reports"]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Mobile App Development in Bihar | Android iOS App Patna | VedTech Services</title>
        <meta name="description" content="Professional mobile app development services in Bihar. Android app development, iOS app development, cross-platform apps in Patna, Gaya, Muzaffarpur. Expert app developers in Bihar." />
        <meta name="keywords" content="mobile app development Bihar, Android app development Patna, iOS app development Bihar, app development company Bihar, mobile app developer Gaya, app development Muzaffarpur, IT company Bihar" />
        <link rel="canonical" href="https://vedtechservices.in/services/mobile-app-development" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "VedTech Services - Mobile App Development",
            "description": "Professional mobile app development services in Bihar",
            "areaServed": {
              "@type": "State",
              "name": "Bihar"
            },
            "serviceType": "Mobile App Development"
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
                <Smartphone className="h-3 w-3 mr-2" />
                Mobile App Development
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Mobile App Development</span> for Your Business
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                We plan and build Android, iOS, and cross-platform applications around your product goals, users, and technical requirements.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact">Start Your App Project</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/support">Get Free Consultation</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>50+ Apps Developed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Android & iOS Experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Product-focused Team</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Mobile App Development Services</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Mobile application development from product planning through deployment and maintenance.
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
                      <ul className="grid grid-cols-2 gap-2">
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

        {/* App Types */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Types of Apps We Develop</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Custom mobile applications for every business need
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {appTypes.map((type, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <p className="font-semibold">{type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Selected Mobile App Projects</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Examples of applications built for different business and user needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <Badge className="w-fit mb-2">{project.platform}</Badge>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {project.location}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Achievements:</h4>
                      <ul className="space-y-1">
                        {project.results.map((result, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <Zap className="h-4 w-4 text-blue-500 flex-shrink-0" />
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

        {/* Why Choose Us */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Us for Mobile App Development?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Users className="h-6 w-6" />,
                  title: "Experienced Team",
                  description: "Expert mobile app developers with proven track record"
                },
                {
                  icon: <TrendingUp className="h-6 w-6" />,
                  title: "Quality Assurance",
                  description: "Rigorous testing for bug-free applications"
                },
                {
                  icon: <Star className="h-6 w-6" />,
                  title: "Post-Launch Support",
                  description: "Ongoing maintenance and updates"
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

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-blue-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Build Your Mobile App?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Transform your business idea into a powerful mobile application. Contact us today!
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/contact">Start Your Project</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Link to="/support">Get Free Quote</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default MobileAppDevelopment;

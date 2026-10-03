import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Monitor, Wifi, BookOpen, Users, Shield, CheckCircle2, Star } from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';
import IndustryServiceLinks from '@/components/common/IndustryServiceLinks';

const EducationalInstitutions: React.FC = () => {
  const solutions = [
    {
      icon: <Monitor className="h-8 w-8" />,
      title: "Computer Lab Setup",
      description: "Complete computer lab solutions for schools and colleges",
      features: ["Desktop Installation", "Lab Management Software", "Network Setup", "Maintenance Support", "Student Monitoring", "Software Licensing"]
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Smart Classroom Solutions",
      description: "Modern digital classroom technology",
      features: ["Interactive Displays", "Projector Setup", "Audio Systems", "Digital Content", "Remote Learning", "Recording Systems"]
    },
    {
      icon: <Wifi className="h-8 w-8" />,
      title: "Campus-Wide Networking",
      description: "Reliable internet connectivity across campus",
      features: ["Wi-Fi Installation", "Network Security", "Bandwidth Management", "Access Control", "Coverage Optimization", "24/7 Monitoring"]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Student Management System",
      description: "Complete ERP solution for educational institutions",
      features: ["Admission Management", "Attendance Tracking", "Fee Management", "Exam Management", "Parent Portal", "Report Generation"]
    }
  ];

  const institutions = [
    "Schools", "Colleges", "Universities", "Coaching Centers",
    "Training Institutes", "Research Centers", "Libraries", "Hostels"
  ];

  const benefits = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Safe",
      description: "Child-safe internet with content filtering"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Affordable",
      description: "Budget-friendly solutions for educational institutions"
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Reliable Support",
      description: "Dedicated technical support during academic hours"
    }
  ];

  const projects = [
    {
      name: "DAV Public School",
      location: "Patna, Bihar",
      solution: "50-seat computer lab with smart classrooms",
      results: ["100% uptime", "500+ students benefited", "Digital learning enabled"]
    },
    {
      name: "Coaching Institute",
      location: "Gaya, Bihar",
      solution: "Online learning platform and video conferencing",
      results: ["200+ online students", "Live classes", "Recorded lectures"]
    },
    {
      name: "College Campus",
      location: "Muzaffarpur, Bihar",
      solution: "Campus-wide Wi-Fi and student management system",
      results: ["1000+ students connected", "Paperless administration", "Mobile app access"]
    }
  ];

  return (
    <>
      <Helmet>
        <title>IT Solutions for Educational Institutions in Bihar | School IT Services Patna | VedTech</title>
        <meta name="description" content="Complete IT solutions for schools, colleges, and educational institutions in Bihar. Computer labs, smart classrooms, campus WiFi, student management systems in Patna, Gaya, Muzaffarpur." />
        <meta name="keywords" content="school IT solutions Bihar, computer lab setup Patna, smart classroom Bihar, educational IT services Gaya, campus WiFi Muzaffarpur, student management system Bihar, school software Patna" />
        <link rel="canonical" href="https://vedtechservices.in/industries/educational-institutions" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Educational IT Solutions",
            "provider": {
              "@type": "Organization",
              "name": "VedTech Services"
            },
            "areaServed": {
              "@type": "State",
              "name": "Bihar"
            },
            "audience": {
              "@type": "EducationalOrganization"
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
                <GraduationCap className="h-3 w-3 mr-2" />
                Educational IT Solutions in Bihar
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                Education IT Solutions for Schools and Colleges
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Transform your school or college with modern IT infrastructure. Computer labs, smart classrooms, campus networking, and student management systems for educational institutions across Bihar.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact">Schedule Campus Visit</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/support">Get Free Consultation</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>50+ Schools Served</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Budget-Friendly Solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Expert Support Team</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Grid */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">IT Solutions for Education</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Comprehensive technology solutions to enhance learning and administration
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
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Success Stories in Bihar</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Educational institutions we've helped transform
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

        {/* Institution Types */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">We Serve All Educational Institutions</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {institutions.map((type, index) => (
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
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Educational Institutions Choose Us</h2>
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
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Modernize Your Institution?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Transform your educational institution with modern IT infrastructure. Contact us for a free campus assessment!
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/contact">Schedule Visit</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Link to="/support">Get Quote</Link>
              </Button>
            </div>
            <IndustryServiceLinks services={["software", "networking", "support"]} />
          </div>
        </section>
      </div>
    </>
  );
};

export default EducationalInstitutions;

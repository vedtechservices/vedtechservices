import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Code, Smartphone, Cloud, Database, Palette, ShoppingCart, Rocket, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';

const SoftwareServices: React.FC = () => {
  const services = [
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Website Development",
      description: "Professional, responsive websites that drive business growth",
      features: [
        "Custom Website Design",
        "E-commerce Websites",
        "Corporate Websites",
        "Portfolio Websites",
        "Landing Pages",
        "CMS Integration"
      ],
      technologies: ["React", "WordPress", "PHP", "HTML5/CSS3"]
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile App Development",
      description: "Native and cross-platform mobile applications",
      features: [
        "Android App Development",
        "iOS App Development",
        "Cross-platform Apps",
        "App UI/UX Design",
        "App Store Deployment",
        "App Maintenance"
      ],
      technologies: ["React Native", "Flutter", "Android", "iOS"]
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Custom Software Development",
      description: "Tailored software solutions for your unique business needs",
      features: [
        "Business Management Software",
        "Inventory Management",
        "CRM Systems",
        "ERP Solutions",
        "Billing Software",
        "Custom Applications"
      ],
      technologies: ["Java", "Python", ".NET", "Node.js"]
    },
    {
      icon: <Cloud className="h-8 w-8" />,
      title: "Cloud Solutions",
      description: "Scalable cloud infrastructure and migration services",
      features: [
        "Cloud Migration",
        "Cloud Hosting",
        "Cloud Storage",
        "Cloud Backup",
        "SaaS Solutions",
        "Cloud Security"
      ],
      technologies: ["AWS", "Azure", "Google Cloud", "DigitalOcean"]
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Database Management",
      description: "Robust database design, optimization, and maintenance",
      features: [
        "Database Design",
        "Database Migration",
        "Performance Optimization",
        "Data Backup & Recovery",
        "Database Security",
        "Data Analytics"
      ],
      technologies: ["MySQL", "PostgreSQL", "MongoDB", "SQL Server"]
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "UI/UX Design",
      description: "Beautiful, user-friendly interfaces that enhance user experience",
      features: [
        "User Interface Design",
        "User Experience Design",
        "Wireframing & Prototyping",
        "Design Systems",
        "Responsive Design",
        "Usability Testing"
      ],
      technologies: ["Figma", "Adobe XD", "Sketch", "InVision"]
    }
  ];

  const portfolioProjects = [
    {
      title: "VedTech Services Official",
      category: "Corporate Website",
      description: "Official professional services website for VedTech Services.",
      image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_4d281b68-bc1c-4c3d-b384-1e78f72970ff.jpg",
      link: "https://vedtechservices.in/"
    },
    {
      title: "VedArambh Online Gurukul",
      category: "Educational Portal",
      description: "A Sanatan initiative for traditional and modern education.",
      image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0866568b-b656-45f5-a62b-84c47abc3c46.jpg",
      link: "https://vedarambhin.vercel.app/"
    },
    {
      title: "VedArambh Mart",
      category: "E-commerce",
      description: "Comprehensive online marketplace for retail products.",
      image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_64a9d5c7-85a8-48da-bff0-f792374f4496.jpg",
      link: "https://app-9gbc95t8hhq9.appmedo.com"
    },
    {
      title: "Guru Shishya Public School",
      category: "School ERP",
      description: "Complete school management system for administration and academics.",
      image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_1b9c9dd5-69e5-4c33-8235-44894fa55d56.jpg",
      link: "https://app-9d204bkggf0h.appmedo.com"
    },
    {
      title: "College Management System",
      category: "Enterprise Software",
      description: "Unified platform for college administrative and educational management.",
      image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_b0783a9d-a234-4fcb-9370-d9032da3bd7d.jpg",
      link: "https://app-8t84np01ksu9.appmedo.com"
    },
    {
      title: "VedArambh Learning Language",
      category: "Learning Platform",
      description: "Digital platform for language acquisition and coaching.",
      image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_eed35a87-07ee-4769-b38d-44d408a43d33.jpg",
      link: "https://app-99gy8ue2nwu9.appmedo.com"
    },
    {
      title: "IT Management System",
      category: "SaaS Application",
      description: "Operational dashboard for managing IT infrastructure and services.",
      image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3e2a7f1b-93a6-442c-a38f-651e2821decc.jpg",
      link: "https://app-9d1ic5zguu4h.appmedo.com"
    },
    {
      title: "Beauty Parlor Management",
      category: "Business Software",
      description: "Appointment and management solution for salon and parlor businesses.",
      image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_4c7a61c9-cf39-4d97-bc60-16e846c470c6.jpg",
      link: "https://app-9grz3x2dsf0h.appmedo.com"
    },
    {
      title: "VedArambh Group",
      category: "Corporate Site",
      description: "Corporate portfolio website for the VedArambh Group of companies.",
      image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_4d281b68-bc1c-4c3d-b384-1e78f72970ff.jpg",
      link: "https://app-82srpbr0v9xd.appmedo.com/"
    },
    {
      title: "VedArambh Learning Platform",
      category: "EdTech Solution",
      description: "Full-featured online learning and course management platform.",
      image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0866568b-b656-45f5-a62b-84c47abc3c46.jpg",
      link: "https://app-7vh9c6jdo3cz.appmedo.com"
    },
    {
      title: "VED FITNESS",
      category: "Gym & Health",
      description: "Member management and workout tracking site for fitness centers.",
      image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e55de5fe-91aa-4df5-b863-632b849406bc.jpg",
      link: "https://app-9j7xgqljr6dd.appmedo.com"
    },
    {
      title: "VedArambh Coaching Center",
      category: "Educational Site",
      description: "Dedicated website for local coaching centers and institutes.",
      image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_6aa5fb4a-c845-4519-ad4a-d373f845b288.jpg",
      link: "https://app-9j7w69fc8nb5.appmedo.com"
    }
  ];

  const process = [
    { step: "1", title: "Discovery", description: "Understanding your requirements and goals" },
    { step: "2", title: "Planning", description: "Creating detailed project roadmap and timeline" },
    { step: "3", title: "Design", description: "Crafting beautiful and functional designs" },
    { step: "4", title: "Development", description: "Building your solution with best practices" },
    { step: "5", title: "Testing", description: "Rigorous quality assurance and bug fixing" },
    { step: "6", title: "Deployment", description: "Launching your solution to production" },
    { step: "7", title: "Support", description: "Ongoing maintenance and updates" }
  ];

  return (
    <>
      <Helmet>
        <title>Software & Digital Services | Web Development, Mobile Apps | VedTech Services</title>
        <meta name="description" content="Professional software development services including website development, mobile apps, custom software, cloud solutions, and UI/UX design. Expert developers in India." />
        <meta name="keywords" content="software development, web development, mobile app development, custom software, cloud solutions, UI/UX design, website design, e-commerce development, VedTech Services" />
        <link rel="canonical" href="https://vedtechservices.in/services/software" />

        {/* Open Graph */}
        <meta property="og:title" content="Software & Digital Services | VedTech Services" />
        <meta property="og:description" content="Professional software development services including website development, mobile apps, custom software, and cloud solutions." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vedtechservices.in/services/software" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Software Development Services",
            "provider": {
              "@type": "Organization",
              "name": "VedTech Services"
            },
            "areaServed": "India",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Software Services",
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
                <Globe className="h-3 w-3 mr-2" />
                Software & Digital Services
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                Transform Your Business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Custom Software Solutions</span>
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                From stunning websites to powerful mobile apps and enterprise software, we deliver digital solutions that drive growth and innovation.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact">Start Your Project</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/support">Request a Quote</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Software Services</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Comprehensive software development services to meet all your digital needs
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
                      <h4 className="font-semibold mb-2 text-sm">Key Features:</h4>
                      <ul className="space-y-1">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Technologies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.technologies.map((tech, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Showcase */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Portfolio</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Explore our successful software and digital projects delivered to clients across various industries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioProjects.map((project, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full border-muted/50 group">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <Badge className="bg-primary text-white border-none">{project.category}</Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-slate-600 text-sm leading-relaxed">{project.description}</p>
                    <div className="pt-4 mt-auto border-t">
                      <Button asChild variant="outline" size="sm" className="w-full hover:bg-primary hover:text-white transition-colors">
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          Visit Project <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Development Process */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Development Process</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                A proven methodology that ensures quality and timely delivery
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map((item, index) => (
                <div key={index} className="relative">
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                        {item.step}
                      </div>
                      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-slate-600 text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                  {index < process.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-primary h-6 w-6" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technologies */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Technologies We Use</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Cutting-edge technologies for modern software solutions
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                "React", "Node.js", "Python", "Java", "PHP", "WordPress",
                "React Native", "Flutter", "Android", "iOS", "AWS", "Azure",
                "MySQL", "MongoDB", "PostgreSQL", "Firebase", "Docker", "Git"
              ].map((tech, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <p className="font-semibold">{tech}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-blue-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Build Your Software Solution?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Let's discuss your project requirements and create something amazing together
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/contact">Get Started Now</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/support">Request a Quote</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SoftwareServices;

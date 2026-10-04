import React, { useEffect, useState } from 'react';
import { ArrowRight, Laptop, Globe, Shield, Zap, CheckCircle2, Award, Users, TrendingUp, Sparkles, Code, Server, Smartphone, Wrench, HeadphonesIcon, ExternalLink, MessageCircle, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/lib/next-router';
import { Badge } from '@/components/ui/badge';
import PageMeta from '@/components/common/PageMeta';
import { blogPosts } from '@/data/blog';
import ReviewsSection from '@/components/reviews/ReviewsSection';

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <PageMeta 
        title="IT Services for Businesses | Software, Web, Hardware & Support | VedTech"
        description="Explore business software development, websites, mobile apps, computer repair, networking, and ongoing IT support from VedTech Services."
        canonical="/"
        keywords="business IT services, software development, website development, mobile app development, hardware repair, networking solutions, IT support"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "VedTech Services",
            "url": "https://vedtechservices.in",
            "logo": "/vedtech-logo.png",
            "description": "VedTech Services is a trusted enterprise IT partner providing comprehensive technology solutions including hardware support, software development, networking, cloud, CCTV, and IT AMC services across India.",
            "foundingDate": "2020",
            "email": "info@vedtechservices.in",
            "telephone": "+917858971869",
            "sameAs": [
              "https://www.linkedin.com/company/ved-tech-services",
              "https://twitter.com/vedtechservices",
              "https://www.facebook.com/people/Ved-Tech-Services/61587364952337"
              
            ],
            "address": [
              {
                "@type": "PostalAddress",
                "streetAddress": "Sector 56, Gurugram",
                "addressLocality": "Gurugram",
                "addressRegion": "Haryana",
                "postalCode": "122011",
                "addressCountry": "IN"
              },
              
            ],
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": "+917858971869",
                "contactType": "customer service",
                "areaServed": "IN",
                "availableLanguage": ["English", "Hindi"]
              },
              {
                "@type": "ContactPoint",
                "telephone": "+917858971869",
                "contactType": "technical support",
                "areaServed": "IN",
                "availableLanguage": ["English", "Hindi"]
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "VedTech Services",
            "url": "https://vedtechservices.in",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://vedtechservices.in/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "VedTech Services",
            "@id": "https://vedtechservices.in/#organization",
            "url": "https://vedtechservices.in",
            "telephone": "+917858971869",
            "email": "info@vedtechservices.in",
            "image": "https://vedtechservices.in/og-image.png",
            "priceRange": "₹₹",
            "currenciesAccepted": "INR",
            "paymentAccepted": "Cash, Credit Card, UPI, Bank Transfer",
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
              "opens": "09:00",
              "closes": "19:00"
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Sector 56, Gurugram",
              "addressLocality": "Gurugram",
              "addressRegion": "Haryana",
              "postalCode": "122011",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "28.4089",
              "longitude": "77.0423"
            },
            "hasMap": "https://maps.google.com/?q=VedTech+Services+Gurugram",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "87",
              "bestRating": "5"
            }
          }
        ]}
      />
      <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section with Enhanced Animations */}
      <section className="relative py-20 md:py-32 md:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px] animate-pulse" />
        
        {/* Floating Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float-delayed" />
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 backdrop-blur-sm animate-fade-in">{"We help  startups & businesses grow with Website, App & Digital Solutions"}</div>

              <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight animate-slide-up">
                Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 animate-gradient">IT Solutions</span> for Software, Web & Support
              </h1>

              <p className="text-xl text-slate-300 leading-relaxed max-w-3xl animate-slide-up-delayed">
                VedTech Services is your trusted enterprise IT partner delivering comprehensive technology solutions.
                From hardware infrastructure to custom software development, we provide fast, reliable, and professional services under one roof.
              </p>

              <div className="flex flex-col md:flex-row gap-4 pt-4 animate-slide-up-delayed-2">
                <Button asChild size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Link to="/support">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Raise a Ticket
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Link to="/services">
                    Explore Services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-8 pt-8 text-slate-300 animate-fade-in-delayed">
                {[
                  { icon: CheckCircle2, text: "24/7 Support" },
                  { icon: Users, text: "100+ Happy Clients" },
                  { icon: TrendingUp, text: "Pan-India Service" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 hover:text-white transition-colors duration-300 cursor-default group">
                    <item.icon className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Laptop + Phone Device Mockups */}
            <div className={`relative hidden lg:flex items-center justify-center min-h-[380px] transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              {/* Glow rings */}
              <div className="absolute w-72 h-72 bg-blue-500/25 rounded-full blur-3xl" />
              <div className="absolute w-56 h-56 bg-cyan-400/15 rounded-full blur-2xl" />

              {/* Laptop — main image */}
              <div className="relative z-10 animate-float">
                <img
                  src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e9f5af18-68fd-4e22-b65d-875b711fde66.jpg"
                  alt="IT professional working on laptop"
                  className="w-72 h-52 rounded-2xl shadow-2xl border border-white/10 object-cover"
                />
                <div className="absolute -top-3 -left-3 bg-green-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Live Support
                </div>
              </div>

              {/* Phone — overlapping bottom-right */}
              <div className="absolute bottom-2 right-8 z-20 animate-float-delayed">
                <img
                  src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_81dcc0b5-19a6-42e2-bb4a-f892cbafaf8f.jpg"
                  alt="Mobile IT solutions on smartphone"
                  className="w-32 h-48 rounded-2xl shadow-2xl border border-white/10 object-cover"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
                  📱 Mobile IT
                </div>
              </div>

              {/* Floating stat card */}
              <div className="absolute top-2 right-4 z-30 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="font-semibold">100+ Clients Served</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated Background Icons */}
        <div className="absolute right-10 top-20 opacity-10 animate-float">
          <Code className="w-24 h-24 text-blue-400" />
        </div>
        <div className="absolute right-32 bottom-32 opacity-10 animate-float-delayed">
          <Server className="w-20 h-20 text-cyan-400" />
        </div>
      </section>
      {/* Trust Indicators with Counter Animation */}
      <section className="py-16 md:py-24 bg-white border-y">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "100+", label: "Satisfied Clients", icon: Users },
              { value: "100+", label: "Projects Completed", icon: CheckCircle2 },
              { value: "24/7", label: "Support Available", icon: HeadphonesIcon },
              { value: "98%", label: "Client Retention", icon: Award }
            ].map((stat, i) => (
              <div key={i} className="group hover:scale-105 transition-transform duration-300 cursor-default">
                <div className="flex justify-center mb-3">
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                    <stat.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary mb-2 group-hover:text-blue-600 transition-colors duration-300">{stat.value}</div>
                <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Services Overview with Enhanced Cards */}
      <section className="py-20 md:py-32 md:py-32 bg-slate-50">
        <div className="container">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
              <Sparkles className="h-5 w-5" />
              <span>Our Services</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">Complete IT Solutions Under One Roof</h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-lg">
              From enterprise software development to hardware maintenance, VedTech Services provides end-to-end IT solutions for businesses across India.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                link: "/services/web-development",
                icon: Globe,
                title: "Website Development",
                desc: "Business growth, SEO optimized, mobile responsive",
                details: "Custom websites that drive results. Built with modern technologies, optimized for search engines, and designed to convert visitors into customers.",
                items: ["SEO Optimized", "Mobile Responsive", "Fast Loading", "Secure & Scalable"],
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                link: "/services/hardware",
                icon: Laptop,
                title: "Hardware & Infrastructure",
                desc: "Complete setup, maintenance, and support",
                details: "Professional hardware solutions for offices and businesses. From computer repairs to complete IT infrastructure setup.",
                items: ["Computer Repair", "Network Setup", "Hardware Upgrades", "CCTV Installation"],
                gradient: "from-purple-500 to-pink-500"
              },
              {
                link: "/services/it-support",
                icon: Shield,
                title: "IT Support & AMC",
                desc: "24/7 support, fast response, priority service",
                details: "Dedicated IT helpdesk with annual maintenance contracts. Get priority support and peace of mind for your business operations.",
                items: ["24/7 Helpdesk", "AMC Plans", "Remote Support", "On-site Service"],
                gradient: "from-green-500 to-emerald-500"
              }
            ].map((service, i) => (
              <Link key={i} to={service.link} className="block group">
                <Card className="border-2 border-transparent hover:border-primary transition-all duration-500 shadow-lg hover:shadow-2xl cursor-pointer h-full hover:-translate-y-2 bg-white overflow-hidden">
                  <CardContent className="pt-8 relative">
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    <div className="relative">
                      <div className={`bg-gradient-to-br ${service.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                        <service.icon className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">{service.title}</h3>
                      <p className="text-primary font-semibold mb-3 text-sm">✔️ {service.desc}</p>
                      <p className="text-slate-600 mb-6 leading-relaxed text-sm">{service.details}</p>
                      
                      <ul className="space-y-2 mb-6">
                        {service.items.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-slate-700 group-hover:translate-x-1 transition-transform duration-300">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <span className="text-primary font-semibold flex items-center group-hover:gap-3 gap-2 transition-all duration-300">
                        Learn more <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <nav aria-label="More business services" className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
            <Link to="/services/software" className="font-semibold text-primary hover:underline">Custom software development</Link>
            <Link to="/services/mobile-app-development" className="font-semibold text-primary hover:underline">Mobile app development</Link>
            <Link to="/services/hardware-repair" className="font-semibold text-primary hover:underline">Computer repair</Link>
            <Link to="/services/networking-solutions" className="font-semibold text-primary hover:underline">Networking solutions</Link>
            <Link to="/locations" className="font-semibold text-primary hover:underline">Explore city-specific software needs</Link>
          </nav>
        </div>
      </section>
      {/* Why Choose Us with Animated Elements */}
      <section className="py-20 md:py-32 md:py-32 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
                <Award className="h-5 w-5" />
                <span>Why Choose Us</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">Why Businesses Trust VedTech Services</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                We're not just another IT service provider. VedTech Services is built on the foundation of reliability, expertise, and customer-first approach.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Zap, title: "Fast Response Time", desc: "Same-day service for urgent issues", color: "text-yellow-500", bg: "bg-yellow-50" },
                  { icon: Users, title: "Expert Team", desc: "Certified professionals with 10+ years experience", color: "text-blue-500", bg: "bg-blue-50" },
                  { icon: TrendingUp, title: "Scalable Solutions", desc: "Grow your IT infrastructure as you grow", color: "text-green-500", bg: "bg-green-50" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-lg hover:bg-slate-50 transition-all duration-300 group cursor-default hover:shadow-md">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-300">{item.title}</div>
                      <div className="text-slate-600 text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button asChild size="lg" className="mt-6 hover:scale-105 transition-transform duration-300">
                <Link to="/why-us">
                  Discover More Benefits
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:opacity-0 transition-opacity duration-500 z-10" />
              <img 
                src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d19bfcb7-b08f-4153-8d6b-3a56b1c14bac.jpg" 
                alt="IT Specialist at Work" 
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Projects Delivered Section */}
      <section className="py-20 md:py-32 md:py-32 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
              <Award className="h-5 w-5" />
              <span>Our Work</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Projects Delivered</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Real projects, real results. See how we've helped businesses transform their digital presence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: "VedTech Services",
                category: "Company Website",
                image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d19bfcb7-b08f-4153-8d6b-3a56b1c14bac.jpg",
                link: "https://vedtechservices.in/",
                tech: ["React", "TypeScript", "Tailwind CSS"]
              },
              {
                name: "VedArambh Sanatan Initiative",
                category: "Online Gurukul",
                image: "https://miaoda-conversation-file.s3cdn.medo.dev/user-8t7j0johoxds/conv-99gjdx4fbuv4/20260402/file-aojgukmrw0zk.png",
                link: "https://vedarambhin.vercel.app/",
                tech: ["Next.js", "React", "MongoDB"]
              },
              {
                name: "VedArambh Mart",
                category: "E-commerce Platform",
                image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d19bfcb7-b08f-4153-8d6b-3a56b1c14bac.jpg",
                link: "https://app-9gbc95t8hhq9.appmedo.com",
                tech: ["React", "Node.js", "PostgreSQL"]
              },
              {
                name: "Guru Shishya Public School",
                category: "School Management System",
                image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_81c94b3f-98d2-474e-93f2-ac5ecb11b096.jpg",
                link: "https://app-9d204bkggf0h.appmedo.com",
                tech: ["React", "Supabase", "TypeScript"]
              },
              {
                name: "VED FITNESS",
                category: "Gym Management",
                image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d19bfcb7-b08f-4153-8d6b-3a56b1c14bac.jpg",
                link: "https://app-9j7xgqljr6dd.appmedo.com",
                tech: ["React", "Firebase", "Tailwind"]
              },
              {
                name: "VedArambh Group",
                category: "Corporate Website",
                image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_81c94b3f-98d2-474e-93f2-ac5ecb11b096.jpg",
                link: "https://app-82srpbr0v9xd.appmedo.com/",
                tech: ["React", "TypeScript", "Vite"]
              }
            ].map((project, i) => (
              <Card key={i} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-primary/30">
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img 
                    src={project.image} 
                    alt={project.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <a 
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  >
                    <Button size="sm" variant="secondary" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View Demo
                    </Button>
                  </a>
                </div>
                <CardContent className="p-6 md:p-8">
                  <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20">{project.category}</Badge>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{project.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, j) => (
                      <span key={j} className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-8 p-6 md:p-8 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl">
              <div>
                <div className="text-5xl font-bold text-primary mb-2">100+</div>
                <div className="text-slate-600 font-medium">Projects Delivered</div>
              </div>
              <div className="h-16 w-px bg-slate-300" />
              <div>
                <div className="text-5xl font-bold text-primary mb-2">50+</div>
                <div className="text-slate-600 font-medium">Happy Clients</div>
              </div>
              <div className="h-16 w-px bg-slate-300" />
              <div>
                <div className="text-5xl font-bold text-primary mb-2">98%</div>
                <div className="text-slate-600 font-medium">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection />

      {/* Happy Clients Section */}
      <section className="py-20 md:py-32 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-blue-400 font-semibold mb-4">
              <Users className="h-5 w-5" />
              <span>Our Clients</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Trusted by 100+ Happy Clients</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              From startups to established businesses, schools to corporate offices - we serve them all
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { name: "Educational Institutions", count: "25+", icon: "🎓" },
              { name: "Corporate Offices", count: "30+", icon: "🏢" },
              { name: "Retail Businesses", count: "20+", icon: "🛍️" },
              { name: "Startups & SMEs", count: "25+", icon: "🚀" }
            ].map((client, i) => (
              <div key={i} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{client.icon}</div>
                <div className="text-3xl font-bold text-blue-400 mb-2">{client.count}</div>
                <div className="text-slate-300 font-medium">{client.name}</div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="secondary" className="hover:scale-105 transition-transform duration-300">
              <Link to="/industries">
                See All Industries We Serve
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Industries Section with Hover Effects */}
      <section className="py-20 md:py-32 md:py-32 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
              <Sparkles className="h-5 w-5" />
              <span>Industries</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Industries We Serve</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Specialized IT solutions for diverse sectors across India
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: "Educational Institutions", icon: "🎓", link: "/industries/educational-institutions" },
              { name: "Corporate Offices", icon: "🏢", link: "/industries/corporate-offices" },
              { name: "Retail & Shops", icon: "🛍️", link: "/industries/retail-shops" },
              { name: "Healthcare", icon: "🏥", link: "/industries/healthcare" },
              { name: "Manufacturing", icon: "🏭", link: "/industries/manufacturing" },
              { name: "Startups & SMEs", icon: "🚀", link: "/industries/startups-smes" }
            ].map((industry, i) => (
              <Link key={i} to={industry.link} className="block group">
                <Card className="text-center hover:shadow-xl transition-all duration-300 cursor-pointer h-full hover:-translate-y-1 border-2 border-transparent hover:border-primary/30">
                  <CardContent className="p-6 md:p-8">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{industry.icon}</div>
                    <div className="font-semibold text-slate-800 group-hover:text-primary transition-colors duration-300">{industry.name}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="hover:scale-105 transition-transform duration-300">
              <Link to="/industries">
                View All Industries
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Blog Preview Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <div className="text-center mb-12 space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <TrendingUp className="h-3 w-3 mr-1" />
              Latest Insights
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">From Our Blog</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Expert articles, practical tips, and the latest trends in IT services and technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.slice(0, 3).map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group block">
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 overflow-hidden">
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6 space-y-3">
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors text-balance">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 text-pretty">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg" className="hover:scale-105 transition-transform duration-300">
              <Link to="/blog">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section with Animated Background */}
      <section className="relative py-20 md:py-32 md:py-32 overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-primary text-white">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.1] bg-[size:40px_40px] animate-pulse" />
        </div>
        
        {/* Floating Orbs */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-300/10 rounded-full blur-3xl animate-float-delayed" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Get Started Today</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold animate-fade-in">Start Your Project Today</h2>
            <p className="text-blue-100 text-xl max-w-2xl mx-auto animate-fade-in-delayed">
              Get Free Consultation from our IT experts. Let's discuss how we can help your business grow with the right technology solutions.
            </p>
            
            <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Link to="/contact">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Free Consultation
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <a href="https://wa.me/917858971869?text=Hi%2C%20I%20need%20IT%20support" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Us Now
                </a>
              </Button>
            </div>
            
            <div className="pt-8 flex items-center justify-center gap-4 text-blue-100">
              <CheckCircle2 className="h-5 w-5" />
              <span>Free Consultation</span>
              <span>•</span>
              <CheckCircle2 className="h-5 w-5" />
              <span>Fast Response</span>
              <span>•</span>
              <CheckCircle2 className="h-5 w-5" />
              <span>Expert Team</span>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;

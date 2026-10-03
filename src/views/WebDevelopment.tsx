import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Code,
  ShoppingCart,
  Palette,
  Rocket,
  CheckCircle2,
  Star,
  TrendingUp,
  Database,
  Bug,
  Plug,
  Users,
  Gauge,
  HeadphonesIcon,
  Layers,
  Server,
  Monitor,
  GitBranch,
  RefreshCw,
  Lock,
  Smartphone,
  Zap,
  BarChart3,
  MessageSquare,
  Award
} from 'lucide-react';
import { Link } from '@/lib/next-router';
import { LegacyHelmet as Helmet } from '@/components/common/PageMeta';

const WebDevelopment: React.FC = () => {
  const services = [
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Corporate Websites",
      description: "Professional business websites that establish your online presence and convert visitors into clients.",
      features: ["Responsive Design", "SEO Optimized", "Fast Loading", "Mobile Friendly", "Content Management", "Analytics Integration"]
    },
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "E-commerce Development",
      description: "Complete online store solutions with secure payment gateway integration and order management.",
      features: ["Product Catalog", "Shopping Cart", "Payment Gateway", "Order Management", "Inventory System", "Customer Accounts"]
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Custom Web Applications",
      description: "Tailored web applications engineered for your specific business workflows and goals.",
      features: ["Custom Features", "Database Integration", "User Management", "API Development", "Third-party Integration", "Scalable Architecture"]
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Website Redesign & UI/UX",
      description: "Modernize your existing website with fresh design, improved UX, and enhanced performance.",
      features: ["Modern UI/UX", "Performance Boost", "Mobile Optimization", "SEO Enhancement", "Content Migration", "Brand Refresh"]
    }
  ];

  const fullStackCapabilities = [
    {
      icon: <Monitor className="h-7 w-7" />,
      category: "Frontend Development",
      color: "bg-blue-100 text-blue-700",
      items: [
        "React, Next.js & Vue.js SPAs",
        "Responsive & mobile-first UI",
        "Component libraries & design systems",
        "Animations & micro-interactions",
        "Accessibility (WCAG 2.1)",
        "Cross-browser compatibility"
      ]
    },
    {
      icon: <Server className="h-7 w-7" />,
      category: "Backend Development",
      color: "bg-green-100 text-green-700",
      items: [
        "Node.js, PHP & Laravel APIs",
        "RESTful & GraphQL endpoints",
        "Authentication & authorization",
        "Server-side rendering",
        "Microservices architecture",
        "Background job processing"
      ]
    },
    {
      icon: <Database className="h-7 w-7" />,
      category: "Database Management",
      color: "bg-purple-100 text-purple-700",
      items: [
        "PostgreSQL & MySQL design",
        "Schema migrations & versioning",
        "Query optimization & indexing",
        "Supabase & Firebase",
        "Data backup & recovery",
        "Row-level security policies"
      ]
    },
    {
      icon: <Plug className="h-7 w-7" />,
      category: "API Integration",
      color: "bg-orange-100 text-orange-700",
      items: [
        "Payment gateways (Stripe, Razorpay)",
        "Google Maps & location services",
        "SMS & email (Twilio, SendGrid)",
        "Social media OAuth",
        "Third-party SaaS platforms",
        "Webhook setup & management"
      ]
    }
  ];

  const developmentProcess = [
    {
      icon: <Bug className="h-6 w-6 text-red-500" />,
      title: "Bug Fixing & Debugging",
      description: "Systematic identification and resolution of frontend, backend, and integration bugs. We use console logs, network traces, and structured debugging to fix issues fast."
    },
    {
      icon: <Gauge className="h-6 w-6 text-blue-500" />,
      title: "Performance Optimization",
      description: "Improving Core Web Vitals, reducing bundle sizes, implementing lazy loading, caching strategies, CDN configuration, and database query optimization."
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-green-500" />,
      title: "Continuous Maintenance",
      description: "Ongoing updates, dependency management, security patches, content updates, uptime monitoring, and proactive performance checks."
    },
    {
      icon: <Lock className="h-6 w-6 text-purple-500" />,
      title: "Security Implementation",
      description: "HTTPS/SSL setup, input validation, OWASP best practices, rate limiting, data encryption, and regular vulnerability assessments."
    },
    {
      icon: <GitBranch className="h-6 w-6 text-slate-600" />,
      title: "Version Control & CI/CD",
      description: "Git-based workflows, code reviews, automated testing pipelines, staging environments, and smooth production deployments."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-cyan-500" />,
      title: "Mobile & Cross-Platform",
      description: "Fully responsive layouts tested on all screen sizes, progressive web apps (PWA), and React Native mobile apps for iOS & Android."
    }
  ];

  const teamCollaboration = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Team-Based Delivery",
      description: "Our developers, designers, and QA engineers collaborate using Agile sprints, daily standups, and milestone-based delivery to keep projects on track."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Transparent Communication",
      description: "Regular progress updates, demo sessions, and a dedicated project manager ensure you're always in the loop on timelines, decisions, and deliverables."
    },
    {
      icon: <HeadphonesIcon className="h-8 w-8 text-primary" />,
      title: "Client Support & Training",
      description: "Post-launch support, CMS training, documentation handoff, and a responsive help desk so your team can manage the website independently."
    }
  ];

  const technologies = [
    { name: "React", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { name: "Next.js", color: "bg-slate-50 border-slate-200 text-slate-700" },
    { name: "Node.js", color: "bg-green-50 border-green-200 text-green-700" },
    { name: "TypeScript", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { name: "Tailwind CSS", color: "bg-cyan-50 border-cyan-200 text-cyan-700" },
    { name: "PostgreSQL", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
    { name: "Supabase", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { name: "Laravel", color: "bg-red-50 border-red-200 text-red-700" },
    { name: "PHP", color: "bg-purple-50 border-purple-200 text-purple-700" },
    { name: "WordPress", color: "bg-sky-50 border-sky-200 text-sky-700" },
    { name: "React Native", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { name: "Docker", color: "bg-blue-50 border-blue-200 text-blue-700" },
  ];

  const projects = [
    {
      title: "E-commerce Platform for Retail Store",
      category: "E-commerce",
      location: "Patna, Bihar",
      stack: ["React", "Node.js", "PostgreSQL"],
      results: ["300+ Products", "50+ Daily Orders", "₹5L+ Monthly Revenue"]
    },
    {
      title: "Educational Institute Website",
      category: "Corporate",
      location: "Gaya, Bihar",
      stack: ["Next.js", "WordPress CMS"],
      results: ["10,000+ Visitors/Month", "Online Admissions", "Student Portal"]
    },
    {
      title: "Restaurant Booking System",
      category: "Web Application",
      location: "Muzaffarpur, Bihar",
      stack: ["React", "Laravel", "MySQL"],
      results: ["200+ Bookings/Month", "Online Menu", "Payment Integration"]
    }
  ];

  const metrics = [
    { value: "100+", label: "Websites Delivered", icon: <Globe className="h-6 w-6" /> },
    { value: "50+", label: "Happy Clients", icon: <Star className="h-6 w-6" /> },
    { value: "5+", label: "Years in Bihar", icon: <Award className="h-6 w-6" /> },
    { value: "99%", label: "Client Satisfaction", icon: <BarChart3 className="h-6 w-6" /> },
  ];

  return (
    <>
      <Helmet>
        <title>Web Development Services in Bihar | Website Design Patna | VedTech Services</title>
        <meta name="description" content="Professional web development services in Bihar. Custom website design, e-commerce development, frontend & backend development, API integration, database management, and UI/UX improvements in Patna, Gaya, Muzaffarpur." />
        <meta name="keywords" content="web development Bihar, website design Patna, web development company Bihar, e-commerce development Bihar, frontend developer Bihar, backend development Patna, API integration Bihar, database management, UI UX Bihar" />
        <link rel="canonical" href="https://vedtechservices.in/services/web-development" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "VedTech Services - Web Development",
            "description": "Full-stack web development services in Bihar: frontend, backend, API integration, database management, and UI/UX improvements.",
            "areaServed": { "@type": "State", "name": "Bihar" },
            "serviceType": "Web Development",
            "provider": { "@type": "Organization", "name": "VedTech Services" }
          })}
        </script>
      </Helmet>

      <div className="flex flex-col w-full">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="container relative z-10">
            <div className="max-w-4xl">
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-400/30">
                <Globe className="h-3 w-3 mr-2" />
                Website Development for Businesses
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6 text-balance">
                Professional{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Website Development
                </span>{' '}
                for Your Business
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8 text-pretty">
                End-to-end website development, from responsive design and frontend applications to backend APIs, database management, integrations, and ongoing support.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact">Start Your Project</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
                  <Link to="/support">Get Free Quote</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 text-slate-300">
                {[
                  "Serving Bihar Since 2020",
                  "100+ Websites Delivered",
                  "Frontend + Backend + DevOps"
                ].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Metrics ──────────────────────────────────────────────────────── */}
        <section className="py-12 bg-primary">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {metrics.map((m) => (
                <div key={m.label} className="text-center text-primary-foreground">
                  <div className="flex justify-center mb-2 opacity-80">{m.icon}</div>
                  <div className="text-3xl font-extrabold">{m.value}</div>
                  <div className="text-sm opacity-80 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services Grid ─────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-3">What We Build</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Web Development Services</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto text-pretty">
                Business websites, e-commerce experiences, and custom web applications.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow h-full flex flex-col">
                  <CardHeader>
                    <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-primary">
                      {service.icon}
                    </div>
                    <CardTitle className="text-2xl text-balance">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    <p className="text-slate-600 text-pretty">{service.description}</p>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Features:</h4>
                      <ul className="grid grid-cols-2 gap-2">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
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

        {/* ── Full-Stack Capabilities ───────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-3">Full-Stack Expertise</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
                Frontend · Backend · Database · API
              </h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto text-pretty">
                Our engineers cover every layer of the stack — from pixel-perfect UIs to optimized database schemas and third-party API integrations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {fullStackCapabilities.map((cap, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${cap.color}`}>
                      {cap.icon}
                    </div>
                    <CardTitle className="text-xl">{cap.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {cap.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-slate-700">
                          <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Development Process ───────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-3">How We Work</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
                End-to-End Development & Maintenance
              </h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto text-pretty">
                From initial build to bug fixes, performance tuning, and ongoing client support — we handle the complete software lifecycle.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {developmentProcess.map((item, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <CardTitle className="text-base leading-snug text-balance">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-slate-600 text-sm leading-relaxed text-pretty">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team Collaboration ────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <div className="container">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-3">Team & Collaboration</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
                Collaborative Delivery You Can Count On
              </h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto text-pretty">
                Our team collaborates closely — across development, design, QA, and client support — to deliver high-quality software on time and within scope.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamCollaboration.map((item, i) => (
                <Card key={i} className="text-center hover:shadow-xl transition-shadow h-full flex flex-col">
                  <CardContent className="pt-10 flex-1 flex flex-col items-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-5">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-balance">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed text-pretty">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Workflow badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {["Agile Sprints", "Daily Standups", "Code Reviews", "Staging Environments", "UAT Testing", "Documentation Handoff", "Post-Launch Support"].map(tag => (
                <Badge key={tag} variant="outline" className="text-sm py-1.5 px-3">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* ── Performance & Optimization ────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">Performance First</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                  Optimized for Speed, SEO & Scale
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6 text-pretty">
                  We engineer websites built for real-world traffic. Every project includes Core Web Vital optimization, lazy loading, CDN setup, database indexing, and SEO best practices from day one — not as afterthoughts.
                </p>
                <ul className="space-y-3">
                  {[
                    { icon: <Zap className="h-5 w-5 text-yellow-500" />, text: "Sub-2s load times on mobile & desktop" },
                    { icon: <BarChart3 className="h-5 w-5 text-blue-500" />, text: "Google PageSpeed score 90+" },
                    { icon: <Lock className="h-5 w-5 text-green-500" />, text: "HTTPS, security headers, WAF-ready" },
                    { icon: <RefreshCw className="h-5 w-5 text-purple-500" />, text: "Incremental builds & smart caching" },
                    { icon: <Database className="h-5 w-5 text-indigo-500" />, text: "Indexed queries, connection pooling" },
                    { icon: <Smartphone className="h-5 w-5 text-cyan-500" />, text: "PWA & offline-first capabilities" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700">
                      <div className="shrink-0">{item.icon}</div>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Avg. PageSpeed Score", value: "92+", color: "bg-green-50 border-green-200 text-green-700" },
                  { label: "Uptime Guarantee", value: "99.9%", color: "bg-blue-50 border-blue-200 text-blue-700" },
                  { label: "Bug Fix Response", value: "< 24h", color: "bg-orange-50 border-orange-200 text-orange-700" },
                  { label: "Support Coverage", value: "6 Days", color: "bg-purple-50 border-purple-200 text-purple-700" },
                ].map((stat, i) => (
                  <Card key={i} className={`border-2 ${stat.color}`}>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
                      <div className="text-xs font-medium opacity-80">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Technologies ──────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-slate-50">
          <div className="container">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">Modern Stack</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Technologies We Use</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto text-pretty">
                Battle-tested, modern tools chosen for performance, maintainability, and long-term scalability.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {technologies.map((tech, i) => (
                <span key={i} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${tech.color}`}>
                  <Code className="h-3.5 w-3.5" />
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Projects Showcase ─────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-3">Case Studies</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Selected Website Projects</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto text-pretty">
                Website development examples for business, education, and other organizations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.map((project, i) => (
                <Card key={i} className="hover:shadow-xl transition-shadow h-full flex flex-col">
                  <CardHeader>
                    <Badge className="w-fit mb-2">{project.category}</Badge>
                    <CardTitle className="text-xl text-balance">{project.title}</CardTitle>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Star className="h-3.5 w-3.5 text-yellow-500" />
                      {project.location}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {project.stack.map((s, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Results:</h4>
                      <ul className="space-y-1.5">
                        {project.results.map((result, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-slate-700">
                            <Rocket className="h-4 w-4 text-blue-500 shrink-0" />
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

        {/* ── Why Choose Us ─────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-3">Why VedTech</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
                Why Choose VedTech for Web Development?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <TrendingUp className="h-6 w-6" />,
                  title: "Local Expertise",
                  description: "Deep understanding of Bihar's market dynamics, business culture, and client expectations."
                },
                {
                  icon: <Rocket className="h-6 w-6" />,
                  title: "Fast, Quality Delivery",
                  description: "Agile sprints, automated testing, and dedicated QA ensure on-time delivery without cutting corners."
                },
                {
                  icon: <HeadphonesIcon className="h-6 w-6" />,
                  title: "Ongoing Support",
                  description: "Long-term maintenance contracts, dedicated account managers, and same-day bug triage for production issues."
                }
              ].map((item, i) => (
                <Card key={i} className="text-center hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardContent className="pt-8 flex-1 flex flex-col items-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-balance">{item.title}</h3>
                    <p className="text-slate-600 text-sm text-pretty">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Service Areas ─────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-3">Coverage</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">How We Work With Clients</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto text-pretty">
                We discuss project goals, delivery needs, and support arrangements before recommending an approach.
              </p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
              {["Project Discovery", "Website Planning", "Design & Development", "Launch & Support"].map((city, i) => (
                <Card key={i} className="hover:shadow-md hover:border-primary/40 transition-all">
                  <CardContent className="py-3 text-center">
                    <p className="font-medium text-slate-700 text-sm">{city}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary to-blue-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">
              Ready to Build Your Website?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 text-pretty">
              Get a professional, fully-optimized website for your Bihar business. Contact us today for a free consultation and project estimate.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/contact">Get Started Now</Link>
              </Button>
              <Button asChild size="lg" className="text-lg px-8 py-6" style={{ backgroundColor: 'transparent', border: '2px solid rgba(255,255,255,0.6)', color: 'white' }}>
                <Link to="/support">Request Free Quote</Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default WebDevelopment;


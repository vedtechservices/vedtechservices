import React, { useState, useMemo } from 'react';
import { ExternalLink, Code, Globe, ShoppingCart, GraduationCap, Dumbbell, Building2, CheckCircle2, Star, MapPin, BookOpen, Cpu, Scissors, Utensils, HeartPulse, Sparkles, UtensilsCrossed, Search, Filter, X, Quote, ArrowRight, TrendingUp, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageMeta from '@/components/common/PageMeta';

interface Demo {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  link: string;
  tech: string[];
  features: string[];
  icon: React.ElementType;
  color: string;
  testimonial: { text: string; author: string; role: string };
  caseStudy: { challenge: string; solution: string; result: string };
}

const demos: Demo[] = [
  {
    id: 1,
    name: "VedTech Services",
    category: "Company Website",
    description: "Professional IT services company website with modern design, service showcase, and client testimonials. Built with React, TypeScript, and Tailwind CSS.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e4b0aec3-2ed3-456a-a3f0-e7e03bd46a72.jpg",
    link: "https://vedtechservices.in/",
    tech: ["React", "TypeScript", "Tailwind CSS", "Supabase"],
    features: ["Responsive Design", "SEO Optimized", "Fast Loading", "Modern UI"],
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
    testimonial: { text: "VedTech built us a stunning website that truly represents our brand and drives client conversions.", author: "Chandan Kumar Yajee", role: "Founder, VedTech Services" },
    caseStudy: { challenge: "Needed a professional web presence to attract enterprise clients across India.", solution: "Built a responsive React + Supabase site with service pages, CRM integration, and AMC portal.", result: "200% increase in inbound leads within 3 months of launch." }
  },
  {
    id: 2,
    name: "VedArambh — A Sanatan Initiative",
    category: "E-Learning Platform",
    description: "Comprehensive online learning platform for Vedic education with course management, student enrollment, and interactive learning modules.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3a40009b-8077-4eb7-898c-d3c866799d85.jpg",
    link: "https://vedarambhin.vercel.app/",
    tech: ["Next.js", "React", "MongoDB", "Node.js"],
    features: ["Course Management", "Student Portal", "Payment Integration", "Admin Dashboard"],
    icon: GraduationCap,
    color: "from-purple-500 to-pink-500",
    testimonial: { text: "The platform perfectly captures the essence of Vedic learning with a modern, accessible interface.", author: "Arpit Singh Parihar", role: "Co-founder, VedArambh" },
    caseStudy: { challenge: "Bridging traditional Vedic education with modern digital learners.", solution: "Developed a full LMS with video lessons, Sanskrit modules, and multi-device support.", result: "500+ students enrolled in the first month after launch." }
  },
  {
    id: 3,
    name: "Explore Bihar",
    category: "Tourism Portal",
    description: "A vibrant tourism portal showcasing the heritage, culture, and travel destinations of Bihar, helping visitors explore hidden gems across the state.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_4f5f9d98-cb73-446f-8602-e735ce9d09e2.jpg",
    link: "https://app-9zmiaritk935.appmedo.com",
    tech: ["React", "TypeScript", "Tailwind CSS", "Supabase"],
    features: ["Destination Listings", "Travel Guides", "Interactive Maps", "Photo Gallery"],
    icon: MapPin,
    color: "from-green-500 to-teal-500",
    testimonial: { text: "Finally a platform that showcases Bihar's real beauty. The design is vibrant and the content is engaging.", author: "Rajiv Kumar", role: "Tourism Enthusiast, Patna" },
    caseStudy: { challenge: "Bihar lacked a modern digital tourism platform to attract visitors.", solution: "Built a full portal with destination guides, photo galleries, and travel tips.", result: "10,000+ page views in the first two weeks post-launch." }
  },
  {
    id: 4,
    name: "VedArambh Mart",
    category: "E-Commerce",
    description: "Full-featured e-commerce platform with product catalog, shopping cart, payment gateway integration, and order management system.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_16c6cce9-b651-48a2-90d7-32337177a6b1.jpg",
    link: "https://app-9gbc95t8hhq9.appmedo.com",
    tech: ["React", "Node.js", "PostgreSQL", "Stripe"],
    features: ["Product Catalog", "Shopping Cart", "Payment Gateway", "Order Tracking"],
    icon: ShoppingCart,
    color: "from-orange-500 to-amber-500",
    testimonial: { text: "Our sales doubled after launching VedArambh Mart. The checkout process is seamless.", author: "Priya Sharma", role: "Store Owner, VedArambh Mart" },
    caseStudy: { challenge: "Needed a scalable online store to sell Vedic and spiritual products nationwide.", solution: "Built a full e-commerce platform with Stripe payments, inventory management, and order tracking.", result: "150+ orders processed in the first month with zero downtime." }
  },
  {
    id: 5,
    name: "Gurushishya Public School",
    category: "School Management",
    description: "Complete school management solution with student information system, attendance tracking, grade management, and parent portal.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_f2e49064-dd13-4267-9ec1-9edde6f60c7e.jpg",
    link: "https://app-9d204bkggf0h.appmedo.com",
    tech: ["React", "Supabase", "TypeScript", "Tailwind"],
    features: ["Student Management", "Attendance System", "Grade Tracking", "Parent Portal"],
    icon: GraduationCap,
    color: "from-orange-500 to-red-500",
    testimonial: { text: "Managing 800+ students is now effortless. Parents love the real-time attendance updates.", author: "Principal Verma", role: "Gurushishya Public School" },
    caseStudy: { challenge: "Manual record-keeping was causing errors and delays in a school with 800+ students.", solution: "Deployed a full SMS with digital attendance, grade cards, fee management, and parent portal.", result: "Admin workload reduced by 60%; parent satisfaction improved significantly." }
  },
  {
    id: 6,
    name: "VED FITNESS",
    category: "Gym Management",
    description: "Modern gym management platform with membership management, workout tracking, payment processing, and trainer scheduling.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8c62d0e5-c1a9-475e-9b06-c0be1bdd608f.jpg",
    link: "https://app-9j7xgqljr6dd.appmedo.com",
    tech: ["React", "Firebase", "Tailwind", "Chart.js"],
    features: ["Membership Management", "Workout Tracking", "Payment System", "Trainer Portal"],
    icon: Dumbbell,
    color: "from-red-500 to-pink-500",
    testimonial: { text: "VED FITNESS software transformed how we run our gym. Renewals and billing are now fully automated.", author: "Vikram Singh", role: "Owner, VED FITNESS" },
    caseStudy: { challenge: "Manual membership tracking led to revenue leakage and scheduling conflicts.", solution: "Built an all-in-one gym platform with automated renewals, trainer slots, and workout logs.", result: "Membership renewal rate increased by 40% within 2 months." }
  },
  {
    id: 7,
    name: "VedArambh Group",
    category: "Company Website",
    description: "Professional corporate website showcasing company services, portfolio, team members, and client testimonials with modern design.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e028bd8a-6917-4f33-9866-edeb9e1ba0a0.jpg",
    link: "https://app-82srpbr0v9xd.appmedo.com/",
    tech: ["React", "TypeScript", "Vite", "Tailwind CSS"],
    features: ["Portfolio Showcase", "Team Section", "Service Pages", "Contact Forms"],
    icon: Building2,
    color: "from-indigo-500 to-purple-500",
    testimonial: { text: "Our new website reflects our group's stature. Enquiries have increased significantly.", author: "MD, VedArambh Group", role: "Managing Director" },
    caseStudy: { challenge: "An outdated corporate website was harming brand perception for a growing group.", solution: "Redesigned with a premium corporate aesthetic, service showcases, and lead capture forms.", result: "Bounce rate dropped by 45%; enquiry form submissions tripled." }
  },
  {
    id: 8,
    name: "College Management System",
    category: "College Management",
    description: "End-to-end college administration platform covering student records, faculty management, timetable scheduling, and examination management.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e9381e76-0487-4fa3-8074-19842c5c360c.jpg",
    link: "https://app-8t84np01ksu9.appmedo.com",
    tech: ["React", "Supabase", "TypeScript", "Tailwind"],
    features: ["Student Records", "Faculty Portal", "Timetable System", "Exam Management"],
    icon: GraduationCap,
    color: "from-cyan-500 to-blue-500",
    testimonial: { text: "End-to-end college administration is now digital. Examination management alone saves us weeks of effort.", author: "Registrar", role: "College Administration" },
    caseStudy: { challenge: "College relied on spreadsheets for timetabling and exam scheduling causing frequent errors.", solution: "Built an ERP-style CMS with automated timetable generation and digital mark entry.", result: "Exam result processing time cut from 2 weeks to 2 days." }
  },
  {
    id: 9,
    name: "Vedarambh Learning Language",
    category: "Coaching Site",
    description: "Interactive language coaching website offering structured course content, live sessions, and progress tracking for learners of all levels.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_10d6a8cc-3624-4d2f-ba57-76a0709a727c.jpg",
    link: "https://app-99gy8ue2nwu9.appmedo.com",
    tech: ["React", "Supabase", "Tailwind", "Vite"],
    features: ["Course Listings", "Live Sessions", "Progress Tracking", "Student Dashboard"],
    icon: BookOpen,
    color: "from-violet-500 to-indigo-500",
    testimonial: { text: "The platform made learning Sanskrit accessible and fun. The progress tracker keeps students motivated.", author: "Language Trainer", role: "Vedarambh Learning" },
    caseStudy: { challenge: "Language coaching was limited to physical classes with no digital reach.", solution: "Built an online coaching portal with live session scheduling and structured course content.", result: "Enrolled 300+ remote learners within 6 weeks of going live." }
  },
  {
    id: 10,
    name: "IT Management System",
    category: "IT Management",
    description: "Centralised IT asset and service management system for tracking hardware inventory, support tickets, and maintenance schedules.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d7a71210-933a-4c20-9575-19685e0192b2.jpg",
    link: "https://app-9d1ic5zguu4h.appmedo.com",
    tech: ["React", "TypeScript", "Supabase", "Tailwind"],
    features: ["Asset Tracking", "Ticket Management", "Maintenance Logs", "Reports & Analytics"],
    icon: Cpu,
    color: "from-slate-500 to-blue-500",
    testimonial: { text: "Tracking 500+ IT assets across departments used to be a nightmare. Not anymore.", author: "IT Head", role: "Enterprise Client" },
    caseStudy: { challenge: "Enterprise client had no visibility into IT asset lifecycle or support ticket status.", solution: "Deployed a centralised ITMS with asset tagging, ticket routing, and SLA dashboards.", result: "IT incident resolution time reduced by 35%." }
  },
  {
    id: 11,
    name: "Beauty Parlour",
    category: "Beauty & Wellness",
    description: "Elegant beauty parlour website with service listings, online appointment booking, stylist profiles, and client gallery.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c86762e6-307a-46b8-a02e-2d41e1336cb6.jpg",
    link: "https://app-9grz3x2dsf0h.appmedo.com",
    tech: ["React", "Supabase", "Tailwind", "Vite"],
    features: ["Service Catalogue", "Appointment Booking", "Stylist Profiles", "Gallery"],
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
    testimonial: { text: "No-shows dropped drastically after we launched online bookings. Clients love the reminder system.", author: "Salon Owner", role: "Beauty Parlour" },
    caseStudy: { challenge: "Walk-in only model caused revenue loss due to no-shows and scheduling conflicts.", solution: "Built an online booking system with stylist selection, reminders, and a service catalogue.", result: "No-show rate decreased by 50%; monthly bookings increased by 35%." }
  },
  {
    id: 12,
    name: "Vedarambh Learning Platform",
    category: "E-Learning Platform",
    description: "Full-featured e-learning platform with multi-course management, video lessons, assessments, certificates, and student progress dashboards.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d72e8eb0-da62-4bf4-884a-4a689512f8c8.jpg",
    link: "https://app-7vh9c6jdo3cz.appmedo.com",
    tech: ["React", "Node.js", "Supabase", "Tailwind"],
    features: ["Multi-Course Portal", "Video Lessons", "Assessments & Quizzes", "Certificates"],
    icon: BookOpen,
    color: "from-emerald-500 to-green-500",
    testimonial: { text: "Our full learning platform is the best investment we made. Students love the certificate feature.", author: "Platform Director", role: "Vedarambh Learning" },
    caseStudy: { challenge: "Needed a scalable LMS to host 50+ courses for thousands of students simultaneously.", solution: "Built a robust LMS with video hosting, quiz engine, auto-grading, and certificate generation.", result: "1,000+ active learners; 95% course completion rate." }
  },
  {
    id: 13,
    name: "VedArambh Coaching Center",
    category: "Coaching Site",
    description: "Professional coaching centre website with batch management, study materials, doubt-clearing sessions, and student performance tracking.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e9140d2f-35ab-4bc9-bd97-baa8f8bfbc23.jpg",
    link: "https://app-9j7w69fc8nb5.appmedo.com",
    tech: ["React", "Supabase", "TypeScript", "Tailwind"],
    features: ["Batch Management", "Study Materials", "Doubt Sessions", "Performance Reports"],
    icon: GraduationCap,
    color: "from-yellow-500 to-orange-500",
    testimonial: { text: "Managing 20 batches and 400 students is now completely stress-free with this system.", author: "Center Director", role: "VedArambh Coaching" },
    caseStudy: { challenge: "Coaching centre struggled to manage multiple batches and share study materials efficiently.", solution: "Deployed a batch management portal with digital study resources and doubt-clearing sessions.", result: "Student pass rate improved by 25%; admin effort halved." }
  },
  {
    id: 14,
    name: "Hospital Management Software",
    category: "Healthcare",
    description: "Comprehensive hospital management software covering patient registration, OPD/IPD management, doctor scheduling, billing, and medical records.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_2ae10b7d-585b-4edf-8f26-23c6665eab2d.jpg",
    link: "https://app-bsfwui384a2p.appmedo.com",
    tech: ["React", "Supabase", "TypeScript", "Tailwind"],
    features: ["Patient Registration", "OPD/IPD Management", "Doctor Scheduling", "Billing System"],
    icon: HeartPulse,
    color: "from-red-500 to-rose-500",
    testimonial: { text: "Patient waiting times reduced and billing errors are now zero. This software is a game-changer.", author: "Hospital Administrator", role: "Multi-specialty Hospital" },
    caseStudy: { challenge: "Hospital paperwork caused long waiting times and frequent billing errors.", solution: "Implemented a full HMS with digital registration, OPD queues, and automated billing with GST.", result: "Patient processing time cut by 55%; billing accuracy reached 100%." }
  },
  {
    id: 15,
    name: "Restaurant Management System",
    category: "Restaurant Management",
    description: "Full-stack restaurant management system with table booking, digital menu, order management, kitchen display, and billing with GST support.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_444e0e4c-4894-44f6-af7c-594e42cc48c8.jpg",
    link: "https://app-bdycsxwvkmwx.appmedo.com",
    tech: ["React", "Supabase", "TypeScript", "Tailwind"],
    features: ["Table Booking", "Digital Menu", "Order Management", "GST Billing"],
    icon: Utensils,
    color: "from-amber-500 to-yellow-500",
    testimonial: { text: "Table management and kitchen display have transformed our service speed and customer experience.", author: "Restaurant Owner", role: "RMS Client" },
    caseStudy: { challenge: "Peak-hour mismanagement led to order delays and customer dissatisfaction.", solution: "Built a full RMS with real-time kitchen display, table management, and digital menu.", result: "Order fulfilment speed improved by 40%; table turnover rate increased." }
  },
  {
    id: 16,
    name: "Professional Tailoring Services",
    category: "Fashion & Tailoring",
    description: "Modern tailoring business website with service catalogue, custom measurement booking, order status tracking, and client testimonials.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_197f2b54-c3dc-43ca-9a81-12bafc739ff3.jpg",
    link: "https://app-b6s9hrt0e0w1.appmedo.com",
    tech: ["React", "Supabase", "Tailwind", "Vite"],
    features: ["Service Catalogue", "Custom Booking", "Order Tracking", "Client Reviews"],
    icon: Scissors,
    color: "from-teal-500 to-cyan-500",
    testimonial: { text: "Our clients now book online and track their orders live. Business has never been this organised.", author: "Master Tailor", role: "Professional Tailoring" },
    caseStudy: { challenge: "Custom tailoring orders were hard to track and clients had no visibility on delivery status.", solution: "Built a booking site with custom measurement forms, order status tracking, and SMS notifications.", result: "Customer satisfaction score rose from 3.5 to 4.8 out of 5." }
  },
  {
    id: 17,
    name: "FoodMart — Food Delivered",
    category: "Food Delivery",
    description: "Fast food delivery platform featuring restaurant listings, real-time order tracking, cart management, and seamless payment checkout.",
    image: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_f11ac0d9-1a2f-4c21-bb5e-86f0532dcb21.jpg",
    link: "https://app-awsgr5vo114x.appmedo.com",
    tech: ["React", "Supabase", "TypeScript", "Tailwind"],
    features: ["Restaurant Listings", "Real-time Tracking", "Cart & Checkout", "Payment Gateway"],
    icon: UtensilsCrossed,
    color: "from-orange-500 to-red-500",
    testimonial: { text: "FoodMart went live in record time. The real-time tracking feature is loved by every customer.", author: "FoodMart Founder", role: "Food Delivery Startup" },
    caseStudy: { challenge: "Local restaurants lacked a unified platform to reach online customers.", solution: "Built a multi-restaurant delivery platform with real-time GPS tracking and Razorpay checkout.", result: "50+ restaurants onboarded; 1,000+ orders in the first month." }
  }
];

const categories = ["All", "Company Website", "E-Learning Platform", "Tourism Portal", "E-Commerce", "School Management", "Gym Management", "College Management", "Coaching Site", "IT Management", "Beauty & Wellness", "Healthcare", "Restaurant Management", "Fashion & Tailoring", "Food Delivery"];

const Demo: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Demo | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'casestudy' | 'testimonial'>('overview');

  const filtered = useMemo(() => {
    return demos.filter(d => {
      const matchCat = selectedCategory === 'All' || d.category === selectedCategory;
      const matchSearch = search.trim() === '' ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.category.toLowerCase().includes(search.toLowerCase()) ||
        d.description.toLowerCase().includes(search.toLowerCase()) ||
        d.tech.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [search, selectedCategory]);

  const clearFilters = () => { setSearch(''); setSelectedCategory('All'); };

  return (
    <>
      <PageMeta
        title="Live Project Portfolio — VedTech Services | 17 Projects"
        description="Explore 17 live projects built by VedTech Services — from e-commerce platforms and school management systems to hospital software and food delivery apps."
      />
      <div className="flex flex-col w-full">

        {/* Hero */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float-delayed" />
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge className="bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border-blue-400/30">
                <Code className="h-3 w-3 mr-1" />
                Live Portfolio
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">Our Project Portfolio</h1>
              <p className="text-slate-300 text-lg">
                17 live projects across industries — click any project to explore the case study, client testimonial, and live demo.
              </p>
              <div className="flex items-center justify-center gap-8 pt-4">
                {[{ val: '17+', label: 'Projects Live' }, { val: '50+', label: 'Happy Clients' }, { val: '98%', label: 'Satisfaction' }].map((s, i) => (
                  <React.Fragment key={s.label}>
                    {i > 0 && <div className="h-12 w-px bg-slate-700" />}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">{s.val}</div>
                      <div className="text-sm text-slate-400">{s.label}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Search + Filter Bar */}
        <section className="py-8 bg-white border-b sticky top-0 z-40 shadow-sm">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by project name, category, or technology..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 h-10"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Filter className="h-4 w-4 text-muted-foreground hidden md:block" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[220px] h-10">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(search || selectedCategory !== 'All') && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground gap-1">
                    <X className="h-3.5 w-3.5" /> Clear
                  </Button>
                )}
              </div>
              <div className="text-sm text-muted-foreground shrink-0 flex items-center">
                <span className="font-semibold text-foreground">{filtered.length}</span>&nbsp;project{filtered.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {/* Active filter chips */}
            {(search || selectedCategory !== 'All') && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedCategory !== 'All' && (
                  <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedCategory('All')}>
                    {selectedCategory} <X className="h-3 w-3" />
                  </Badge>
                )}
                {search && (
                  <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSearch('')}>
                    "{search}" <X className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Project Grid */}
        <section className="py-16 bg-slate-50 min-h-[400px]">
          <div className="container">
            {filtered.length === 0 ? (
              <div className="text-center py-24 space-y-4">
                <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold">No projects match your search</h3>
                <p className="text-muted-foreground">Try different keywords or clear the filters.</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map(demo => (
                  <Card
                    key={demo.id}
                    className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-primary/30 cursor-pointer h-full flex flex-col"
                    onClick={() => { setSelectedProject(demo); setActiveTab('overview'); }}
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-200">
                      <img
                        src={demo.image}
                        alt={demo.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-3 left-3">
                        <Badge className={`bg-gradient-to-r ${demo.color} text-white border-0 text-xs`}>
                          <demo.icon className="h-3 w-3 mr-1" />
                          {demo.category}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <Button size="sm" variant="secondary" className="gap-2 shadow-xl">
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-balance leading-tight">{demo.name}</h3>
                        <div className="flex shrink-0">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm line-clamp-2 text-pretty flex-1">{demo.description}</p>
                      {/* Mini testimonial */}
                      <div className="bg-slate-50 rounded-lg p-3 border-l-2 border-primary/40">
                        <p className="text-xs text-slate-600 italic line-clamp-2">"{demo.testimonial.text}"</p>
                        <p className="text-xs font-semibold text-slate-700 mt-1">— {demo.testimonial.author}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {demo.tech.slice(0, 3).map((t, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-white">{t}</Badge>
                        ))}
                        {demo.tech.length > 3 && <Badge variant="outline" className="text-xs bg-white">+{demo.tech.length - 3}</Badge>}
                      </div>
                      <Button
                        className="w-full mt-auto"
                        size="sm"
                        onClick={e => { e.stopPropagation(); window.open(demo.link, '_blank', 'noopener,noreferrer'); }}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                        Open Live Demo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Project Detail Dialog */}
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-3xl max-h-[90dvh] overflow-y-auto p-0">
            {selectedProject && (
              <>
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <img src={selectedProject.image} alt={selectedProject.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className={`bg-gradient-to-r ${selectedProject.color} text-white border-0 mb-2`}>
                      <selectedProject.icon className="h-3 w-3 mr-1" />
                      {selectedProject.category}
                    </Badge>
                    <DialogHeader>
                      <DialogTitle className="text-white text-2xl font-bold text-balance">{selectedProject.name}</DialogTitle>
                    </DialogHeader>
                  </div>
                </div>

                {/* Tab nav */}
                <div className="flex border-b px-6">
                  {(['overview', 'casestudy', 'testimonial'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                      {tab === 'casestudy' ? 'Case Study' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="p-6 space-y-5">
                  {activeTab === 'overview' && (
                    <>
                      <p className="text-slate-600 leading-relaxed">{selectedProject.description}</p>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Key Features</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedProject.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />{f}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Code className="h-4 w-4 text-primary" /> Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.tech.map((t, i) => <Badge key={i} variant="outline" className="bg-slate-50">{t}</Badge>)}
                        </div>
                      </div>
                      <Button asChild className="w-full">
                        <a href={selectedProject.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" /> Open Live Demo
                        </a>
                      </Button>
                    </>
                  )}

                  {activeTab === 'casestudy' && (
                    <div className="space-y-5">
                      {[
                        { icon: TrendingUp, label: 'Challenge', color: 'text-red-500', bg: 'bg-red-50 border-red-200', text: selectedProject.caseStudy.challenge },
                        { icon: Code, label: 'Our Solution', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200', text: selectedProject.caseStudy.solution },
                        { icon: Award, label: 'Result', color: 'text-green-500', bg: 'bg-green-50 border-green-200', text: selectedProject.caseStudy.result },
                      ].map(s => (
                        <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                          <div className={`flex items-center gap-2 font-semibold mb-2 ${s.color}`}>
                            <s.icon className="h-4 w-4" />{s.label}
                          </div>
                          <p className="text-slate-700 text-sm leading-relaxed">{s.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'testimonial' && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-2xl p-6 border relative">
                        <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />
                        <div className="flex mb-3">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                        </div>
                        <p className="text-slate-700 text-lg leading-relaxed italic mb-4">"{selectedProject.testimonial.text}"</p>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{selectedProject.testimonial.author}</div>
                            <div className="text-sm text-muted-foreground">{selectedProject.testimonial.role}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary via-blue-600 to-primary text-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">Ready to Start Your Project?</h2>
              <p className="text-blue-100 text-lg">
                Let's build something amazing together. Get a free consultation and see how we can help transform your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                  <a href="/contact">Get Free Consultation</a>
                </Button>
                <Button asChild size="lg" className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700 text-white">
                  <a href="https://wa.me/917858971869?text=Hi%2C%20I%20want%20to%20discuss%20a%20project" target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Demo;

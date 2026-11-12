import { useProjects } from '@/hooks/use-projects';
import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, TrendingUp, Users, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/lib/next-router';
import PageMeta from '@/components/common/PageMeta';
import { motion, AnimatePresence } from 'motion/react';

const LEGACY_CATEGORIES = ['All', 'Web Development', 'Networking', 'Cloud & IT', 'Security', 'Mobile App', 'ERP & Software'];



const STATS = [
  { label: 'Projects Delivered', value: '100+', icon: CheckCircle2 },
  { label: 'Happy Clients', value: '50+', icon: Users },
  { label: 'Avg. Client Rating', value: '4.9★', icon: Star },
  { label: 'Revenue Impact', value: '₹2Cr+', icon: TrendingUp },
];

const Portfolio: React.FC = () => {
  const {projects: PROJECTS, error} = useProjects('portfolio');
  const [activeCategory, setActiveCategory] = useState('All');

  const CATEGORIES = [...new Set([...LEGACY_CATEGORIES,...PROJECTS.map(p=>p.category)])];
  const filtered = activeCategory === 'All'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === activeCategory);

  return (
    <>
      <PageMeta
        title="Portfolio & Case Studies — VedTech Services"
        description="Explore VedTech Services' portfolio of successful IT projects including web development, networking, cloud migration, security, and ERP implementations across India."
        canonical="/portfolio"
        keywords="IT portfolio India, VedTech case studies, web development project, network infrastructure project, cloud migration India, ERP implementation"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "VedTech Services Portfolio & Case Studies",
            "url": "https://vedtechservices.in/portfolio",
            "description": "Real IT projects with measurable results delivered by VedTech Services across India.",
            "provider": { "@type": "Organization", "name": "VedTech Services", "url": "https://vedtechservices.in" }
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vedtechservices.in" },
              { "@type": "ListItem", "position": 2, "name": "Portfolio", "item": "https://vedtechservices.in/portfolio" }
            ]
          }
        ]}
      />

      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container text-center max-w-3xl mx-auto space-y-6">
          <Badge variant="outline" className="border-blue-400/40 text-blue-300 bg-blue-500/10">
            Our Work
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Portfolio &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Case Studies
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Real projects. Measurable results. Discover how we've helped 100+ businesses across India transform their IT infrastructure and digital presence.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/contact">Start Your Project</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/support">Raise a Ticket</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-center">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-slate-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error&&<p role="status" className="container py-3 text-sm">{error}</p>}
      {/* Filter + Grid */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            <Filter className="h-4 w-4 text-slate-400 self-center mr-1 hidden md:block" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Project cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.88, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, y: 24 }}
                  transition={{ duration: 0.32, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full flex flex-col">
                    {/* Image */}
                    <div className="relative overflow-hidden aspect-[16/9]">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-primary text-white text-[11px]">{project.category}</Badge>
                        <Badge variant="secondary" className="text-[11px]">{project.year}</Badge>
                      </div>
                      <div className="absolute bottom-3 right-3 flex gap-0.5">
                        {Array.from({ length: project.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>

                    <CardContent className="p-6 flex flex-col flex-1 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1">{project.title}</h3>
                        <p className="text-sm text-primary font-semibold">{project.client}</p>
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed flex-1">{project.description}</p>

                      {/* Results */}
                      <ul className="space-y-1.5">
                        {project.results.map((r: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>

                      {/* Tags + Duration */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0.5">{tag}</Badge>
                          ))}
                        </div>
                        <span className="text-xs text-slate-400 shrink-0 ml-2">{project.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-primary">{project.link&&<a href={project.link} target="_blank" rel="noopener noreferrer">View project</a>}{project.github_url&&<a href={project.github_url} target="_blank" rel="noopener noreferrer">GitHub</a>}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-slate-500 py-16">No projects in this category yet. Check back soon!</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container text-center max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Be Our Next Success Story?</h2>
          <p className="text-lg text-blue-100">
            Let's discuss your project. Get a free consultation and custom quote from our expert team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link to="/contact">Get Free Consultation</Link>
            </Button>
            <Button
              asChild size="lg"
              className="text-lg px-8 py-6 bg-transparent border-2 border-white text-white hover:bg-white/10"
            >
              <a href="https://wa.me/917858971869" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-5 w-5" /> WhatsApp Us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Portfolio;

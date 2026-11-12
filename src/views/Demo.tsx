import { useProjects } from '@/hooks/use-projects';
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
  id: string;
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



const legacyCategories = ["All", "Company Website", "E-Learning Platform", "Tourism Portal", "E-Commerce", "School Management", "Gym Management", "College Management", "Coaching Site", "IT Management", "Beauty & Wellness", "Healthcare", "Restaurant Management", "Fashion & Tailoring", "Food Delivery"];

const Demo: React.FC = () => {
  const {projects, error} = useProjects('demo');
  const icons:Record<string,React.ElementType>={Globe,GraduationCap,MapPin,ShoppingCart,Dumbbell,Building2,BookOpen,Cpu,Sparkles,HeartPulse,Utensils,Scissors,UtensilsCrossed,TrendingUp,Code,Award};
  const categories=[...new Set([...legacyCategories,...projects.map(p=>p.category)])];
  const demos:Demo[]=projects.map(p=>({...p,icon:icons[p.icon]||Globe})) as Demo[];
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
  }, [search, selectedCategory, projects]);

  const clearFilters = () => { setSearch(''); setSelectedCategory('All'); };

  return (
    <>
      <PageMeta
        title={`Live Project Portfolio — VedTech Services | ${demos.length} Projects`}
        description="Explore live projects built by VedTech Services, including websites and business applications."
      />
      {error&&<p role="status" className="container py-3 text-sm">{error}</p>}
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
                {demos.length} live projects across industries — click any project to explore the case study, client testimonial, and live demo.
              </p>
              <div className="flex items-center justify-center gap-8 pt-4">
                {[{ val: String(demos.length), label: 'Projects Live' }, { val: '50+', label: 'Happy Clients' }, { val: '98%', label: 'Satisfaction' }].map((s, i) => (
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
                        disabled={!demo.link}
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
                      {selectedProject.link&&<Button asChild className="w-full">
                        <a href={selectedProject.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" /> Open Live Demo
                        </a>
                      </Button>}
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

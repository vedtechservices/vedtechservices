import React, { useEffect, useState } from 'react';
import { Check, Star, Clock, Shield, Zap, ArrowRight, Sparkles } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabasePublic as supabase } from '@/db/publicSupabase';
import { useNavigate } from '@/lib/next-router';

interface AMCPlan {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  features: string[];
  response_time: string;
  is_popular: boolean;
}

const AMCPlans: React.FC = () => {
  const [plans, setPlans] = useState<AMCPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('amc_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
      } else {
        setPlans(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    navigate(`/contact?plan=${planId}`);
  };

  const categories = [
    { title: "Standard Office", range: "₹4,999 - ₹14,999/yr", bestFor: "5-10 Workstations" },
    { title: "Corporate Branch", range: "₹24,999 - ₹49,999/yr", bestFor: "10-25 Workstations" },
    { title: "Enterprise Hub", range: "Custom Pricing", bestFor: "25+ Workstations + Servers" }
  ];

  return (
    <>
      <PageMeta
        title="IT AMC Plans & Pricing — VedTech Services Annual Maintenance Contracts"
        description="Explore VedTech Services' affordable Annual Maintenance Contract (AMC) plans for businesses. Comprehensive IT support, hardware maintenance, and SLA-backed service across Bihar."
        canonical="/amc-plans"
        keywords="IT AMC plans India, annual maintenance contract, IT support contract Bihar, hardware maintenance plan, SLA IT support"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "IT Annual Maintenance Contract (AMC)",
            "provider": { "@type": "Organization", "name": "VedTech Services", "url": "https://vedtechservices.in" },
            "url": "https://vedtechservices.in/amc-plans",
            "description": "Comprehensive IT AMC plans covering hardware maintenance, software support, networking, and 24/7 helpdesk for businesses across India.",
            "areaServed": "India",
            "serviceType": "IT Maintenance Contract",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "VedTech AMC Plans",
              "itemListElement": [
                { "@type": "Offer", "name": "Basic AMC Plan", "description": "Essential hardware and software support for small businesses" },
                { "@type": "Offer", "name": "Standard AMC Plan", "description": "Full IT support including networking and priority response" },
                { "@type": "Offer", "name": "Enterprise AMC Plan", "description": "Dedicated engineer, SLA-backed 24/7 support, cloud included" }
              ]
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is an IT AMC plan?",
                "acceptedAnswer": { "@type": "Answer", "text": "An IT AMC (Annual Maintenance Contract) is a yearly service agreement where VedTech Services provides regular maintenance, support, and repairs for your IT infrastructure at a fixed cost." }
              },
              {
                "@type": "Question",
                "name": "What does the VedTech AMC cover?",
                "acceptedAnswer": { "@type": "Answer", "text": "VedTech AMC plans cover hardware repair, software troubleshooting, networking support, CCTV maintenance, antivirus management, and 24/7 helpdesk access depending on the tier chosen." }
              },
              {
                "@type": "Question",
                "name": "How do I contact VedTech Services for an AMC quote?",
                "acceptedAnswer": { "@type": "Answer", "text": "You can contact VedTech Services at info@vedtechservices.in, call +91 7858971869, or WhatsApp us for a free AMC quote tailored to your business needs." }
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vedtechservices.in" },
              { "@type": "ListItem", "position": 2, "name": "AMC Plans", "item": "https://vedtechservices.in/amc-plans" }
            ]
          }
        ]}
      />
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-2 mb-6 border border-primary/30">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary-foreground">Enterprise Support Plans</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">AMC Packages</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Guranteed uptime for your IT infrastructure. Our Annual Maintenance Contracts provide 
            priority response, unlimited support, and peace of mind.
          </p>
        </div>
      </section>

      {/* Benefits with Interactive Hover */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "SLA Priority", desc: "4-24 hour guaranteed resolution time for critical issues", bg: "bg-blue-50", color: "text-blue-600" },
              { icon: Clock, title: "Proactive Health Checks", desc: "Quarterly preventative maintenance to catch issues before they happen", bg: "bg-green-50", color: "text-green-600" },
              { icon: Shield, title: "Inventory Coverage", desc: "Comprehensive management of all your IT assets under one contract", bg: "bg-purple-50", color: "text-purple-600" }
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-4 p-6 md:p-8 rounded-2xl hover:shadow-lg transition-all border border-transparent hover:border-slate-100 group">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3", benefit.bg, benefit.color)}>
                  <benefit.icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{benefit.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 md:py-32 md:py-32 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-slate-600 text-lg">India-friendly pricing for businesses of all sizes</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading plans...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.is_popular ? 'border-primary border-2 shadow-xl scale-105' : 'border-slate-200'}`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white px-4 py-1 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" />
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-slate-600"> / year</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{plan.response_time} response</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className={`w-full ${plan.is_popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.is_popular ? 'default' : 'outline'}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      Select {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose AMC */}
      <section className="py-20 md:py-32 md:py-32 bg-white relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Value Proposition</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">The AMC Advantage</h2>
              <p className="text-slate-600">Enterprise-grade maintenance for the modern Indian office</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Cost Effective", desc: "Predictable annual budgeting with up to 40% savings compared to pay-per-visit models.", emoji: "💰" },
                { title: "Zero Visit Charges", desc: "No call-out fees or technician travel charges for all covered hardware issues.", emoji: "🛡️" },
                { title: "Hardware Lifespan", desc: "Proactive maintenance increases the average lifespan of your IT equipment by 2-3 years.", emoji: "⚡" },
                { title: "Documentation", desc: "Maintain full digital service history and asset logs for compliance and tax purposes.", emoji: "📄" }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-6 md:p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all group">
                  <div className="text-4xl group-hover:scale-110 transition-transform">{item.emoji}</div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-slate-900">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Category Comparison */}
            <div className="mt-20 bg-slate-900 rounded-[32px] p-6 md:p-8 md:p-12 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5">
                <Sparkles className="h-48 w-48" />
              </div>
              <h3 className="text-2xl font-bold mb-8 text-center">Service Tier Estimates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl hover:bg-white/10 transition-all text-center">
                    <p className="text-primary-foreground font-bold mb-1">{cat.title}</p>
                    <p className="text-2xl font-extrabold text-white mb-2">{cat.range}</p>
                    <p className="text-xs text-slate-400">Best for: {cat.bestFor}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center text-sm text-slate-400">
                *Final pricing depends on the number of systems, servers, and required response time.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-blue-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Choose your plan and get priority IT support for your business today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-transparent border-white hover:bg-white hover:text-primary"
              onClick={() => window.location.href = 'tel:+917858971869'}
            >
              Call +91 7858971869
            </Button>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default AMCPlans;

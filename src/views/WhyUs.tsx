import React from 'react';
import { CheckCircle2, Zap, ShieldCheck, Clock, ThumbsUp, Wallet } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

const WhyUs: React.FC = () => {
  const reasons = [
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "Fast Response Time",
      desc: "We understand that your time is valuable. Our technicians are ready to provide quick support, often within the same day."
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "One Call Solution",
      desc: "Why call multiple vendors? From hardware fixes to software bugs, one call to VedTech solves it all."
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: "Certified Experts",
      desc: "Our team consists of certified professionals with years of experience in various IT domains."
    },
    {
      icon: <ThumbsUp className="h-10 w-10 text-primary" />,
      title: "Customer Focused",
      desc: "We prioritize your satisfaction above all. We don't just fix problems; we build long-term relationships."
    },
    {
      icon: <Wallet className="h-10 w-10 text-primary" />,
      title: "Transparent Pricing",
      desc: "No hidden costs. We provide clear estimates upfront so you know exactly what you're paying for."
    },
    {
      icon: <CheckCircle2 className="h-10 w-10 text-primary" />,
      title: "Quality Guarantee",
      desc: "We stand behind our work. If the problem persists after our service, we'll make it right."
    }
  ];

  return (
    <>
      <PageMeta
        title="Why Choose VedTech Services — Fast, Reliable IT Support in Bihar"
        description="Discover why businesses across Bihar trust VedTech Services for IT support. Fast response, certified engineers, transparent pricing, and 24/7 emergency assistance."
        canonical="/why-us"
      />
    <div className="flex flex-col w-full">
      <section className="bg-slate-900 text-white py-20 md:py-32">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Why Choose VedTech?</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Discover what makes us the preferred IT partner for hundreds of clients across the region.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {reasons.map((reason, i) => (
              <div key={i} className="flex flex-col gap-4 p-6 md:p-8 rounded-2xl border hover:border-primary/50 hover:bg-slate-50 transition-all group">
                <div className="mb-2 group-hover:scale-110 transition-transform">{reason.icon}</div>
                <h3 className="text-xl font-bold">{reason.title}</h3>
                <p className="text-slate-600 leading-relaxed">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Quote */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container max-w-4xl">
          <div className="text-center space-y-8">
            <div className="text-5xl text-primary font-serif opacity-50">"</div>
            <p className="text-2xl md:text-3xl font-medium text-slate-800 italic leading-snug">
              VedTech Services has been our primary IT partner for 3 years. Their 'One Call' approach has saved us countless hours of downtime and frustration. Highly recommended!
            </p>
            <div className="space-y-1">
              <div className="font-bold text-lg">Arjun Mehta</div>
              <div className="text-slate-500">Principal, Bright Mind Academy</div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default WhyUs;

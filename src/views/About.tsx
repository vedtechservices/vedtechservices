import React from 'react';
import { Target, Eye, Heart, ShieldCheck, TrendingUp, Users, Award, Zap } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

const About: React.FC = () => {
  return (
    <>
      <PageMeta
        title="About VedTech Services — Expert IT Partner in Bihar, India"
        description="VedTech Services is Bihar's trusted enterprise IT partner. Learn about our mission, values, team, and commitment to delivering fast, reliable technology solutions."
        canonical="/about"
        keywords="about VedTech Services, IT company Bihar, Chandan Kumar Yajee, Arpit Singh Parihar, IT company India, IT partner Samastipur"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About VedTech Services",
            "url": "https://vedtechservices.in/about",
            "description": "Learn about VedTech Services, our leadership team, mission, and values.",
            "mainEntity": {
              "@type": "Organization",
              "name": "VedTech Services",
              "foundingDate": "2020",
              "founder": {
                "@type": "Person",
                "name": "Chandan Kumar Yajee",
                "jobTitle": "Founder & Managing Director",
                "email": "founder@vedtechservices.in",
                "sameAs": "https://www.linkedin.com/in/chandan-yajee"
              },
              "numberOfEmployees": { "@type": "QuantitativeValue", "value": "20" },
              "areaServed": "India"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vedtechservices.in" },
              { "@type": "ListItem", "position": 2, "name": "About Us", "item": "https://vedtechservices.in/about" }
            ]
          }
        ]}
      />
      <div className="flex flex-col w-full">
        {/* Header */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-32">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
                <Award className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-semibold">Self-Employed IT Enterprise</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6">About VedTech Services</h1>
              <p className="text-slate-300 text-xl leading-relaxed">
                Building India's most trusted IT services company. Registered as a self-employment enterprise 
                under the PMEGP scheme, committed to local employment and digital transformation.
              </p>
            </div>
          </div>
        </section>
        {/* Company Story */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Story</h2>
              <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-6">
                <p className="text-lg">
                  VedTech Services is an IT Services & Technical Support company established to provide complete 
                  hardware and software solutions under one roof. The company offers services such as computer and 
                  hardware maintenance, software installation, IT support services, website development, and networking solutions.
                </p>
                <p className="text-lg">
                  VedTech Services follows a customer-centric and fast service model, providing on-call, remote, and 
                  on-site IT support to small businesses, schools, offices, and individual customers. Our 
                  <strong> "One Call – Complete IT Solutions"</strong> approach ensures that clients receive comprehensive 
                  support without the need to contact multiple vendors.
                </p>
                <p className="text-lg">
                  The objective of the enterprise is to generate self-employment and local employment while delivering 
                  reliable and affordable IT services in the region. We are committed to building long-term relationships 
                  with our clients and becoming their trusted technology partner for growth and success.
                </p>
                <p className="text-lg">
                  As part of the <strong>VedArambh - A Sanatan initiative</strong>, we combine traditional values of 
                  trust and service excellence with modern technology solutions to serve businesses across India.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Mission & Vision */}
        <section className="py-20 md:py-32 bg-slate-50">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-12">
                <div>
                  <div className="inline-flex items-center gap-3 text-primary font-bold mb-6">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Target className="h-6 w-6" />
                    </div>
                    <span className="text-xl">OUR MISSION</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-6">Empowering Businesses Through Technology</h2>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    To provide comprehensive, reliable, and affordable IT solutions that enable businesses to focus 
                    on their core operations while we handle their technology needs. We strive to be the single point 
                    of contact for all IT requirements, delivering fast service and expert solutions.
                  </p>
                </div>
                <div>
                  <div className="inline-flex items-center gap-3 text-primary font-bold mb-6">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Eye className="h-6 w-6" />
                    </div>
                    <span className="text-xl">OUR VISION</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-6">India's Most Trusted IT Partner</h2>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    To become the leading IT services company in India, known for excellence, reliability, and 
                    customer-first approach. We envision a future where every business, regardless of size, has 
                    access to enterprise-grade IT support and solutions.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_81c94b3f-98d2-474e-93f2-ac5ecb11b096.jpg" alt="Our Team Consultation" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>
        {/* Core Values */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                The principles that guide every decision we make and every service we deliver.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Heart className="h-10 w-10 text-primary" />,
                  title: "Customer First",
                  description: "Every decision we make starts with one question: How does this benefit our customers?"
                },
                {
                  icon: <ShieldCheck className="h-10 w-10 text-primary" />,
                  title: "Integrity & Trust",
                  description: "Honest advice, transparent pricing, and ethical business practices in everything we do."
                },
                {
                  icon: <Zap className="h-10 w-10 text-primary" />,
                  title: "Excellence",
                  description: "We don't just meet expectations; we exceed them with quality service and expert solutions."
                },
                {
                  icon: <TrendingUp className="h-10 w-10 text-primary" />,
                  title: "Continuous Growth",
                  description: "We invest in learning, technology, and innovation to serve you better every day."
                }
              ].map((value, i) => (
                <div key={i} className="bg-slate-50 p-6 md:p-8 rounded-2xl border-2 border-transparent hover:border-primary transition-all text-center">
                  <div className="mb-6 flex justify-center">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Why We're Different */}
        <section className="py-20 md:py-32 bg-primary text-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What Makes Us Different</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Users className="h-8 w-8" />,
                    title: "Expert Team",
                    desc: "Certified professionals with 10+ years of industry experience"
                  },
                  {
                    icon: <ShieldCheck className="h-8 w-8" />,
                    title: "Comprehensive Services",
                    desc: "Hardware, software, and support – everything under one roof"
                  },
                  {
                    icon: <Zap className="h-8 w-8" />,
                    title: "Fast Response",
                    desc: "Same-day service for urgent issues, 24/7 support availability"
                  }
                ].map((item, i) => (
                  <div key={i} className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-blue-100">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Leadership Team Section */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Leadership Team</h2>
                <p className="text-slate-600 text-lg">Meet the experts driving VedTech Services forward</p>
              </div>

              {/* Founder */}
              {/* <div className="mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="order-2 md:order-1 space-y-6">
                    <h3 className="text-3xl font-bold text-slate-900">Chandan Kumar Yajee</h3>
                    <p className="text-lg text-primary font-semibold">Founder & Managing Director</p>
                      <a href="mailto:founder@vedtechservices.in" className="text-sm text-slate-500 hover:text-primary transition-colors">founder@vedtechservices.in</a>
                    <div className="space-y-4">
                      <p className="text-slate-600 leading-relaxed">
                        With a passion for technology and a vision to make IT services accessible to businesses across India, 
                        Chandan Kumar Yajee founded VedTech Services in 2020. His commitment to excellence and customer satisfaction 
                        has been the driving force behind the company's rapid growth and success.
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        Under his leadership, VedTech Services has grown from a local initiative to a trusted IT partner for over 500+ 
                        businesses, delivering comprehensive technology solutions with a focus on quality, reliability, and innovation.
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-primary">
                        <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Business Vision</p>
                        <p className="text-slate-700 italic">"Our goal is to build a self-reliant digital ecosystem in India where every small business has access to top-tier technical support at an affordable cost."</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                      <a 
                        href="https://www.linkedin.com/in/chandan-yajee" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        Connect on LinkedIn
                      </a>
                    </div>
                  </div>
                  <div className="order-1 md:order-2">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                      <img
                        src="https://miaoda-conversation-file.s3cdn.medo.dev/user-8t7j0johoxds/app-99gjdx4fbuv5/20260528/Chandan_yajee.png"
                        alt="Chandan Kumar Yajee - Founder"
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Team Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* CEO */}
                <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src="https://miaoda-edit-image.s3cdn.medo.dev/99gjdx4fbuv5/IMG-9duv4o51yark.jpg" 
                      alt="Arpit Singh Parihar" 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6 md:p-8 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Arpit Singh Parihar</h3>
                      <p className="text-primary font-semibold">Co-founder & CEO</p>
                      <a href="mailto:ceo@vedtechservices.in" className="text-sm text-slate-500 hover:text-primary transition-colors">ceo@vedtechservices.in</a>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Strategic leader driving business growth and operational excellence at VedTech Services.
                    </p>
                    <a 
                      href="https://www.linkedin.com/in/arpit-singh-parihar-67696b330" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
                {/* IT Manager */}
                <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="aspect-square from-purple-100 to-purple-200 flex items-center justify-center bg-inherit bg-cover bg-center bg-no-repeat bg-[url(https://miaoda-edit-image.s3cdn.medo.dev/99gjdx4fbuv5/IMG-9dv12n1pp1c0.jpg)]">

                  </div>
                  <div className="p-6 md:p-8 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Aasita Sarathe</h3>
                      <p className="text-primary font-semibold">IT Manager</p>
                      <a href="mailto:it.manager@vedtechservices.in" className="text-sm text-slate-500 hover:text-primary transition-colors">it.manager@vedtechservices.in</a>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Leading technical operations and ensuring seamless IT infrastructure management for our clients.
                    </p>
                    <a 
                      href="https://www.linkedin.com/in/aasita-sarathe-b53382384" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn Profile
                    </a>
                  </div>
                </div>

                {/* HR Manager */}
                <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="aspect-square from-pink-100 to-pink-200 flex items-center justify-center bg-inherit bg-cover bg-center bg-no-repeat bg-[url(https://miaoda-edit-image.s3cdn.medo.dev/99gjdx4fbuv5/IMG-9duzcdmlqcqo.jpg)]">

                  </div>
                  <div className="p-6 md:p-8 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Muskan Dubey</h3>
                      <p className="text-primary font-semibold">HR Manager</p>
                      <a href="mailto:hr@vedtechservices.in" className="text-sm text-slate-500 hover:text-primary transition-colors">hr@vedtechservices.in</a>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Building and nurturing our talented team to deliver exceptional service to every client.
                    </p>
                    <a 
                      href="https://www.linkedin.com/in/muskan-dubey-b990b3330" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn Profile
                    </a>
                  </div>
                </div>

                {/* Testing Engineer */}
                <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src="https://miaoda-conversation-file.s3cdn.medo.dev/user-8t7j0johoxds/app-99gjdx4fbuv5/20260620/Parasun.jpg" 
                      alt="Prasun Prakash - Testing Engineer" 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6 md:p-8 space-y-4">
                      <a href="mailto:prasun.prakash@vedtechservices.in" className="text-sm text-slate-500 hover:text-primary transition-colors">prasun.prakash@vedtechservices.in</a>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Prasun Prakash</h3>
                      <p className="text-primary font-semibold">Testing Engineer</p>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Ensuring software quality through manual and automated testing, bug tracking, and performance validation for reliable client solutions.
                    </p>
                  </div>
                </div>

                {/* Software Developer */}
                <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                  <div className="aspect-square from-slate-200 to-slate-300 flex items-center justify-center bg-inherit bg-cover bg-center bg-no-repeat bg-[url(https://miaoda-edit-image.s3cdn.medo.dev/99gjdx4fbuv5/IMG-dayfvhur3o5c.jpg)]">

                  </div>
                  <div className="p-6 md:p-8 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Sundaram Prince</h3>
                      <p className="text-primary font-semibold">Software Developer</p>
                      <a href="mailto:sundaram.prince@vedtechservices.in" className="text-sm text-slate-500 hover:text-primary transition-colors">sundaram.prince@vedtechservices.in</a>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      A dedicated developer focused on building scalable, efficient, and user-friendly digital solutions. Contributing to the development of high-performance applications and ensuring smooth technical execution at VedTech Services.
                    </p>
                    <a
                      href="https://www.linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Growth Journey */}
        <section className="py-20 md:py-32 md:py-32 bg-slate-50">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-12">Our Growth Journey</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { year: "2020", milestone: "Company Founded" },
                  { year: "2021", milestone: "10+ Clients" },
                  { year: "2023", milestone: "Pan-India Presence" },
                  { year: "2026", milestone: "100+ Clients" }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-3xl font-bold text-primary">{item.year}</div>
                    <div className="text-slate-700 font-medium">{item.milestone}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;

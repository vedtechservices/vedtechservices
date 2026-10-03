import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Send, Sparkles, CheckCircle2, Building2, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import PageMeta from '@/components/common/PageMeta';
import { supabasePublic as supabase } from '@/db/publicSupabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Contact: React.FC = () => {
  const [offices, setOffices] = useState<any[]>([]);

  useEffect(() => {
    (supabase.from('offices') as any)
      .select('id, name, branch_code, address, city, state, phone, email, manager_name, office_type, status')
      .eq('status', 'active')
      .order('office_type', { ascending: true })
      .then(({ data }: { data: any[] | null }) => setOffices(data || []));
  }, []);

  const TYPE_COLORS: Record<string, string> = {
    headquarters: 'bg-purple-100 text-purple-800 border-purple-200',
    branch: 'bg-blue-100 text-blue-800 border-blue-200',
    service_center: 'bg-orange-100 text-orange-800 border-orange-200',
    remote: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  const TYPE_LABELS: Record<string, string> = {
    headquarters: 'HQ', branch: 'Branch', service_center: 'Service Centre', remote: 'Remote',
  };
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "",
      message: ""
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const { error } = await (supabase.from('contact_submissions') as any).insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        service: data.service || null,
        message: data.message,
      });
      if (error) throw error;
      toast.success('Message sent!', {
        description: 'We received your inquiry and will get back to you within 24 hours.',
      });
      form.reset();
    } catch (err) {
      console.error('Contact form error:', err);
      toast.error('Failed to send message', {
        description: 'Please try emailing us directly at info@vedtechservices.in',
      });
    }
  };

  return (
    <>
      <PageMeta
        title="Contact VedTech Services — Get Free IT Consultation | 24/7 Support"
        description="Contact VedTech Services for professional IT support. Get free consultation, 24/7 emergency support, and expert solutions. Call, email, or WhatsApp us now for immediate assistance."
        canonical="/contact"
        keywords="contact VedTech Services, IT support contact India, IT helpdesk phone number, info@vedtechservices.in, WhatsApp IT support"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact VedTech Services",
            "url": "https://vedtechservices.in/contact",
            "description": "Get in touch with VedTech Services for IT support, consultation, and quotes.",
            "mainEntity": {
              "@type": "Organization",
              "name": "VedTech Services",
              "email": "info@vedtechservices.in",
              "telephone": "+917858971869",
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+917858971869",
                  "contactType": "customer service",
                  "contactOption": "TollFree",
                  "areaServed": "IN",
                  "availableLanguage": ["English", "Hindi"]
                }
              ]
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vedtechservices.in" },
              { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://vedtechservices.in/contact" }
            ]
          }
        ]}
      />
      <div className="flex flex-col w-full">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-blue-300 mb-4">
                <Sparkles className="h-4 w-4" />
                <span>Get Free Consultation</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Start Your Project Today</h1>
              <p className="text-slate-300 text-lg">
                Have an IT problem? We have the solution. Get free consultation from our experts and transform your business with the right technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6"
                  onClick={() => window.open('https://wa.me/917858971869?text=Hi%2C%20I%20need%20IT%20support', '_blank')}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  WhatsApp Us Now
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6"
                  onClick={() => window.location.href = 'tel:+917858971869'}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call: +91 7858971869
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 pt-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Free Consultation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Fast Response</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <Card>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg text-primary">
                        <Phone className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold">Call Us</div>
                        <div className="text-slate-600">+91 7858971869</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg text-primary">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold">Email Us</div>
                        <div className="text-slate-600">{"info@vedtechservices.in"}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 p-3 rounded-lg text-green-600">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold mb-2">WhatsApp (RECOMMENDED)</div>
                        <div className="text-slate-600 mb-3">+91 7858971869</div>
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => window.open('https://wa.me/917858971869?text=Hi%2C%20I%20need%20IT%20support', '_blank')}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Chat on WhatsApp
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg text-primary">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold">Our Office</div>
                        <div className="text-slate-600">{"Gurugram, Haryana — Sector 17A (Head Office)"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl space-y-4">
                  <h3 className="text-xl font-bold">Business Hours</h3>
                  <div className="space-y-2 text-slate-400">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 7:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="text-primary font-bold">On-Call Only</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem id="contact-form-name">
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Full Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem id="contact-form-email">
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="info@vedtechservices.in" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem id="contact-form-phone">
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+91 7858971869" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="service"
                          render={({ field }) => (
                            <FormItem id="contact-form-service">
                              <FormLabel>Service Interested In</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Website, Laptop Repair" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem id="contact-form-message">
                            <FormLabel>Your Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about your IT problem..."
                                className="min-h-[150px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full md:w-auto px-8 py-6 text-lg">
                        <Send className="mr-2 h-5 w-5" /> Send Inquiry
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Our Offices Section ─────────────────────────────────────── */}
        {offices.length > 0 && (
          <section className="py-16 bg-slate-50 border-t">
            <div className="container">
              <div className="text-center mb-10">
                <div className="flex justify-center mb-3">
                  <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Our Locations
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 text-balance">Find the Nearest VedTech Office</h2>
                <p className="text-slate-500 mt-2 text-pretty max-w-xl mx-auto">
                  We're expanding across Bihar. Walk in at any of our offices or call us directly for fastest response.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {offices.map((o) => (
                  <Card key={o.id} className="h-full hover:shadow-md transition-shadow border-slate-200">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-800 text-balance">{o.name}</h3>
                          <span className="text-xs font-mono text-slate-400">{o.branch_code}</span>
                        </div>
                        <Badge variant="outline" className={cn('text-xs shrink-0', TYPE_COLORS[o.office_type] ?? 'bg-slate-100 text-slate-700')}>
                          {TYPE_LABELS[o.office_type] ?? o.office_type}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-pretty">{o.address}, {o.city}, {o.state}</span>
                        </div>
                        {o.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary shrink-0" />
                            <a href={`tel:${o.phone}`} className="hover:text-primary transition-colors">{o.phone}</a>
                          </div>
                        )}
                        {o.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary shrink-0" />
                            <a href={`mailto:${o.email}`} className="hover:text-primary transition-colors truncate">{o.email}</a>
                          </div>
                        )}
                        {o.manager_name && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="text-slate-500">{o.manager_name}</span>
                          </div>
                        )}
                      </div>
                      {o.phone && (
                        <Button
                          size="sm" variant="outline"
                          className="w-full mt-1 gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={() => window.open(`tel:${o.phone}`)}
                        >
                          <Phone className="h-3.5 w-3.5" /> Call This Office
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default Contact;

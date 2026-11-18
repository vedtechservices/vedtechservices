import React, { useState } from 'react';
import { Headset, Ticket, Clock, CheckCircle2, AlertCircle, Copy, ExternalLink, Search, RefreshCw, Bot, Mail, Phone, ArrowRight, MessageCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from '@/lib/next-router';
import { Badge } from '@/components/ui/badge';

import { LoadingSpinner } from '@/components/common/Loader';

const TicketTracker = () => {
  const [input, setInput] = useState('');
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTrack = async () => {
    setIsLoading(true);
    try {
      if (!input.trim() || !email.trim()) {
        toast({
          title: "Error",
          description: "Please enter both the Ticket ID and its contact email.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/support/tickets?ticketId=${encodeURIComponent(input.trim())}&email=${encodeURIComponent(email.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ticket tracking failed.');

      if (!data || data.length === 0) {
        toast({
          title: "No Ticket Found",
          description: "We couldn't find any tickets with that ID or email.",
          variant: "destructive"
        });
      } else {
        setResults(data);
      }
    } catch (err) {
      console.error('Error tracking ticket:', err);
      toast({
        title: "Error",
        description: "Failed to fetch ticket status.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return <Badge className="bg-blue-100 text-blue-800">Open</Badge>;
      case 'in-progress': return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'resolved': return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed': return <Badge className="bg-slate-100 text-slate-800">Closed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input 
          placeholder="Ticket ID (VTS-...)" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
        />
        <Input type="email" placeholder="Email used for the ticket" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleTrack()} />
        <Button onClick={handleTrack} disabled={isLoading || !input.trim() || !email.trim()}>
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
          Track
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((ticket: any) => (
          <Card key={ticket.id} className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">{ticket.ticket_id}</h4>
          <p className="text-sm text-slate-500">{new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
                {getStatusBadge(ticket.status)}
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-800">{ticket.subject}</p>
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Category: {ticket.category}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Support: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [ticketDetails, setTicketDetails] = useState({ ticketId: '', email: '', isNewCustomer: false });
  
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      location: "",
      serviceType: "",
      priority: "",
      category: "",
      subject: "",
      description: ""
    }
  });

  const copyTicketId = () => {
    navigator.clipboard.writeText(ticketDetails.ticketId);
    toast({
      title: "Copied!",
      description: "Ticket ID copied to clipboard",
    });
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const ticketResponse = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const ticketResult = await ticketResponse.json();
      if (!ticketResponse.ok || !ticketResult.success || !ticketResult.ticketId) throw new Error(ticketResult.error || 'Ticket submission failed.');
      const ticketId = ticketResult.ticketId;

      // Create email content for ticket
      const subject = `Support Ticket ${ticketId}: ${data.subject}`;
      const body = `
Support Ticket Details:

Ticket ID: ${ticketId}
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Company: ${data.company || 'N/A'}
Location: ${data.location || 'N/A'}
Service Type: ${data.serviceType}
Category: ${data.category}
Priority: ${data.priority}
Subject: ${data.subject}

Description:
${data.description}

---
This ticket has been saved to the VedTech Services support system.
      `;
      
      // Open default email client
      const mailtoLink = `mailto:info@vedtechservices.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
      
      // Show success dialog
      setTicketDetails({ ticketId, email: data.email, isNewCustomer: false });
      setShowSuccessDialog(true);
      form.reset();
    } catch (err) {
      console.error('Error submitting ticket:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-primary text-white py-20 md:py-32">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
            <Headset className="h-5 w-5" />
            <span className="text-sm font-semibold">24/7 Support Available</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Customer Support Center</h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Raise a ticket and get expert assistance. Our dedicated support team is here to resolve your IT issues quickly and efficiently.
          </p>
        </div>
      </section>
      {/* Support Stats */}
      <section className="py-16 md:py-24 bg-white border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{"< 4 Hrs"}</div>
              <div className="text-sm text-slate-600">Average Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-slate-600">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-slate-600">Support Availability</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{"100+"}</div>
              <div className="text-sm text-slate-600">Tickets Resolved</div>
            </div>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Ticket Form */}
            <div className="md:col-span-2">
              <Card className="border-2">
                <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-6 w-6" />
                    Raise a Support Ticket
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Column: Tracking */}
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-6 md:p-8 rounded-xl border-2 border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-primary p-2 rounded-lg text-white">
                            <Search className="h-5 w-5" />
                          </div>
                          <h3 className="text-xl font-bold">Track Your Request</h3>
                        </div>
                        <p className="text-slate-600 text-sm mb-6">Already have a ticket? Enter your Ticket ID or email to see its progress.</p>
                        <TicketTracker />
                      </div>

                      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-xl space-y-4">
                        <div className="flex items-center gap-3">
                          <Bot className="h-6 w-6 text-primary" />
                          <h3 className="text-lg font-bold">Instant AI Help</h3>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">Our VedBot AI is ready to answer questions about services and AMC plans 24/7.</p>
                        <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => document.dispatchEvent(new CustomEvent('open-chatbot'))}>
                          Open Chatbot
                        </Button>
                      </div>
                    </div>

                    {/* Right Column: New Request */}
                    <div>
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-primary" />
                        New Service Request
                      </h3>
                      <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          rules={{ required: "Name is required" }}
                          render={({ field }) => (
                            <FormItem id="support-form-name">
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          rules={{ 
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address"
                            }
                          }}
                          render={({ field }) => (
                            <FormItem id="support-form-email">
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" {...field} />
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
                          rules={{ required: "Phone number is required" }}
                          render={({ field }) => (
                            <FormItem id="support-form-phone">
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="+91 7858971869" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem id="support-form-company">
                              <FormLabel>Company / Organization</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Company Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem id="support-form-location">
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="City, State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="serviceType"
                          rules={{ required: "Service type is required" }}
                          render={({ field }) => (
                            <FormItem id="support-form-service-type">
                              <FormLabel>Service Type *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select service type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="hardware">Hardware Support</SelectItem>
                                  <SelectItem value="software">Software Support</SelectItem>
                                  <SelectItem value="web">Web Development</SelectItem>
                                  <SelectItem value="app">App Development</SelectItem>
                                  <SelectItem value="networking">Networking</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="category"
                          rules={{ required: "Please select a category" }}
                          render={({ field }) => (
                            <FormItem id="support-form-category">
                              <FormLabel>Issue Category *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="hardware">Hardware Issue</SelectItem>
                                  <SelectItem value="software">Software Issue</SelectItem>
                                  <SelectItem value="network">Network Problem</SelectItem>
                                  <SelectItem value="website">Website/App Issue</SelectItem>
                                  <SelectItem value="amc">AMC Support</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="priority"
                          rules={{ required: "Please select priority" }}
                          render={({ field }) => (
                            <FormItem id="support-form-priority">
                              <FormLabel>Priority Level *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low - General Query</SelectItem>
                                  <SelectItem value="medium">Medium - Issue but not urgent</SelectItem>
                                  <SelectItem value="high">High - Urgent Issue</SelectItem>
                                  <SelectItem value="critical">Critical - System Down</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        rules={{ required: "Subject is required" }}
                        render={({ field }) => (
                          <FormItem id="support-form-subject">
                            <FormLabel>Subject *</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief description of the issue" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        rules={{ required: "Please describe your issue" }}
                        render={({ field }) => (
                          <FormItem id="support-form-description">
                            <FormLabel>Detailed Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please provide detailed information about your issue..." 
                                className="min-h-[150px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full md:w-auto px-8 py-6 text-lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner className="mr-2 h-5 w-5 text-white" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Ticket className="mr-2 h-5 w-5" /> Submit Ticket
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card className="border-2 border-primary/10">
                <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
                    <Headset className="h-5 w-5 text-primary" />
                    Direct Expert Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8">
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <div className="bg-blue-100 p-3 rounded-full text-primary shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">On-Site Help Line</h4>
                      <p className="text-xs text-slate-500 mb-2">24/7 Priority Emergency Line</p>
                      <a href="tel:+917858971869" className="text-lg font-extrabold text-primary hover:underline">+91 7858971869</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <div className="bg-green-100 p-3 rounded-full text-green-600 shrink-0">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">WhatsApp Business</h4>
                      <p className="text-xs text-slate-500 mb-2">Fast response messaging</p>
                      <a href="https://wa.me/917858971869" className="text-lg font-extrabold text-green-600 hover:underline">+91 7858971869</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <div className="bg-purple-100 p-3 rounded-full text-purple-600 shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Official Email</h4>
                      <p className="text-xs text-slate-500 mb-2">For detailed queries & quotes</p>
                      <a href="mailto:info@vedtechservices.in" className="text-sm font-extrabold text-purple-600 hover:underline">info@vedtechservices.in</a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary to-blue-700 text-white overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Zap className="h-32 w-32" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">AMC Advantage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm relative z-10">
                  <p className="text-blue-100">Annual Maintenance Contract holders get priority treatment.</p>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="font-medium">4-Hour SLA Response</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="font-medium">Unlimited Remote Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="font-medium">No Visit Charges</span>
                  </div>
                  <Button asChild variant="secondary" className="w-full mt-4 bg-white text-primary hover:bg-white/90">
                    <Link to="/amc-plans">View Plans</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">Ticket Created Successfully!</DialogTitle>
            <DialogDescription className="text-center space-y-4 pt-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Your Ticket ID</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-bold text-primary">{ticketDetails.ticketId}</p>
                  <Button size="sm" variant="ghost" onClick={copyTicketId}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {ticketDetails.isNewCustomer && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-left">
                  <p className="text-sm font-semibold text-blue-900 mb-2">✅ Account Created</p>
                  <p className="text-sm text-blue-800">
                    Your customer account has been created with email: <strong>{ticketDetails.email}</strong>
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    You can now track all your tickets using this email on the Customer Dashboard.
                  </p>
                </div>
              )}

              <div className="space-y-2 text-sm text-slate-700">
                <p className="font-semibold">✅ Ticket saved to our system</p>
                <p className="font-semibold">✅ Email notification sent</p>
                <p className="font-semibold">✅ Our team will contact you within 2 hours</p>
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setShowSuccessDialog(false);
                    navigate('/dashboard');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Go to Customer Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowSuccessDialog(false)}
                >
                  Close
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;

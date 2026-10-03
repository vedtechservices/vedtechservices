import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ticket, Clock, CheckCircle2, Shield, FileText, Plus, Search, Activity, Package, Monitor, PenTool as Tool, Download, Bell, AlertCircle, History, CreditCard, ShoppingCart, ArrowRight, Check, X, Wallet, Loader2, Lock, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/db/supabase';
import { supabasePublic } from '@/db/publicSupabase';
import { useNavigate } from '@/lib/next-router';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/Loader';

interface CustomerTicket {
  id: string;
  ticket_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  service_type: string;
  created_at: string;
  updated_at: string;
}

interface HardwareRepair {
  id: string;
  device_name: string;
  serial_number: string;
  issue_description: string;
  status: string;
  progress_percent: number;
  technician_notes: string;
  estimated_completion: string;
  created_at: string;
  updated_at: string;
}

interface AMCSubscription {
  id: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  status: string;
  amount: number;
}

interface ServiceInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  items: any[];
  created_at: string;
  paid_at: string | null;
}

const CustomerDashboard: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [repairs, setRepairs] = useState<HardwareRepair[]>([]);
  const [amcSubscriptions, setAmcSubscriptions] = useState<AMCSubscription[]>([]);
  const [invoices, setInvoices] = useState<ServiceInvoice[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Renewal States
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedRenewalPlan, setSelectedRenewalPlan] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  const CURRENCIES = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 1 },
    { code: 'USD', symbol: '$', name: 'US Dollar', rate: exchangeRates['USD'] || 0.012 },
    { code: 'EUR', symbol: '€', name: 'Euro', rate: exchangeRates['EUR'] || 0.011 },
    { code: 'GBP', symbol: '£', name: 'British Pound', rate: exchangeRates['GBP'] || 0.0094 },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: exchangeRates['AUD'] || 0.018 },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: exchangeRates['CAD'] || 0.016 },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: exchangeRates['SGD'] || 0.016 },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: exchangeRates['AED'] || 0.044 },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: exchangeRates['JPY'] || 1.8 },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: exchangeRates['CNY'] || 0.086 },
    { code: 'CHF', symbol: 'Fr.', name: 'Swiss Franc', rate: exchangeRates['CHF'] || 0.010 },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rate: exchangeRates['HKD'] || 0.094 },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rate: exchangeRates['NZD'] || 0.020 },
  ];

  const fetchExchangeRates = async () => {
    try {
      const { data, error } = await (supabasePublic
        .from('exchange_rates') as any)
        .select('rates')
        .eq('base_currency', 'INR')
        .maybeSingle();
      
      if (data && (data as any).rates) {
        setExchangeRates((data as any).rates);
      }
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const getConvertedAmount = (amount: number, currencyCode: string) => {
    if (currencyCode === 'INR') return amount;
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    const rate = currency?.rate;
    // If rate is missing or not yet fetched, return a safe estimate or the amount itself
    return amount * (rate && rate > 0 ? rate : 1);
  };


  const navigate = useNavigate();
  const { toast } = useToast();

  const generateReceipt = (repair: HardwareRepair) => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // primary color
    doc.text('VedTech Services', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text('Hardware Service Receipt', 105, 30, { align: 'center' });
    
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 35, 190, 35);
    
    // Receipt Info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Customer Name: ${customerName}`, 20, 50);
    doc.text(`Customer Email: ${email}`, 20, 55);
    
    // Device Info Table
    (doc as any).autoTable({
      startY: 65,
      head: [['Device Details', 'Value']],
      body: [
        ['Device Name', repair.device_name],
        ['Serial Number', repair.serial_number],
        ['Issue Reported', repair.issue_description],
        ['Service Status', repair.status.toUpperCase()],
        ['Completed Date', formatDate(repair.updated_at || new Date().toISOString())],
      ],
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175] },
    });
    
    // Technician Notes
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Technician Notes:', 20, finalY);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(repair.technician_notes || 'Service successfully completed as per requirements.', 20, finalY + 10, { maxWidth: 170 });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(30, 64, 175);
    doc.text('Thank you for choosing VedTech Services!', 105, 280, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('This is a computer-generated receipt. For any queries, contact info@vedtechservices.in', 105, 285, { align: 'center' });
    
    doc.save(`VedTech_Service_Receipt_${repair.id.slice(0, 8)}.pdf`);
    toast({
      title: "Receipt Generated",
      description: "Your service receipt has been downloaded successfully.",
    });
  };

  const handleLogin = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      if (!otpSent) {
        const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
        if (error) throw error;
        setOtpSent(true);
        toast({ title: 'Check your email', description: 'We sent you a one-time sign-in code.' });
        return;
      }
      const { error: verifyError } = await supabase.auth.verifyOtp({ email: email.trim(), token: otp.trim(), type: 'email' });
      if (verifyError) throw verifyError;
      const { data: customer, error: customerError } = await (supabase.from('customers') as any).select('id,name,email').maybeSingle();
      if (customerError || !customer) {
        await supabase.auth.signOut();
        toast({ title: 'Account Not Found', description: 'Your verified email is not associated with a customer account. Contact support.', variant: 'destructive' });
        setOtpSent(false);
        setOtp('');
        return;
      }
      setCustomerName(customer.name);
      setCustomerId(customer.id);
      setEmail(customer.email);
      setIsLoggedIn(true);
      
      // Fetch data
      fetchDashboardData(customer.id, customer.email);
      
      // Setup Realtime subscriptions
      setupRealtimeSubscriptions(customer.id, customer.email);
      
    } catch (err) {
      console.error('Error:', err);
      toast({ title: "Login Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardData = async (cId: string, cEmail: string) => {
    // Fetch tickets
    const { data: ticketsData } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('email', cEmail)
      .order('created_at', { ascending: false });

    setTickets(ticketsData || []);

    // Fetch Repairs
    const { data: repairsData } = await supabase
      .from('hardware_repairs')
      .select('*')
      .eq('customer_id', cId)
      .order('created_at', { ascending: false });

    setRepairs(repairsData || []);

    // Fetch Notifications
    const { data: notificationsData } = await (supabase
      .from('customer_notifications') as any)
      .select('*')
      .eq('customer_id', cId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    setNotifications(notificationsData || []);

    // Fetch Invoices
    const { data: invoicesData } = await (supabase
      .from('service_invoices') as any)
      .select('*')
      .eq('customer_id', cId)
      .order('created_at', { ascending: false });
    
    setInvoices(invoicesData || []);

    // Fetch AMC subscriptions
    const { data: amcData } = await supabase
      .from('amc_subscriptions')
      .select(`
        id,
        start_date,
        end_date,
        status,
        amount,
        amc_plans (name)
      `)
      .eq('customer_id', cId)
      .order('created_at', { ascending: false });

    if (amcData) {
      const formattedAMC = amcData.map((sub: any) => ({
        id: sub.id,
        plan_name: sub.amc_plans?.name || 'Unknown Plan',
        start_date: sub.start_date,
        end_date: sub.end_date,
        status: sub.status,
        amount: sub.amount
      }));
      setAmcSubscriptions(formattedAMC);
    }
  };

  const handleRenewPlan = async (amc: any) => {
    setIsProcessingPayment(true);
    const convertedAmount = getConvertedAmount(amc.amount, selectedCurrency);
    try {
      // 1. Create Payment Intent via Stripe Edge Function
      const { data: intentData, error: intentError } = await (supabase as any).functions.invoke('create-stripe-payment-intent', {
        body: { 
          amount: Math.round(convertedAmount * 100), // Stripe expects amounts in cents
          currency: selectedCurrency.toLowerCase(),
          metadata: { amc_id: amc.id, customer_id: customerId }
        }
      });

      if (intentError) throw intentError;
      
      console.log('Stripe Intent Created:', intentData?.clientSecret);

      // 2. Simulate secure card verification delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const newEndDate = new Date();
      newEndDate.setFullYear(newEndDate.getFullYear() + 1); // Extend for 1 year
      
      // 3. Update subscription
      const { error: amcError } = await (supabase
        .from('amc_subscriptions') as any)
        .update({ 
          end_date: newEndDate.toISOString(),
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', amc.id);

      if (amcError) throw amcError;

      // 4. Create Invoice
      const invoiceNumber = `INV-AMC-${Date.now().toString().slice(-6)}`;
      const currencySymbol = CURRENCIES.find(c => c.code === selectedCurrency)?.symbol || '₹';
      await (supabase
        .from('service_invoices') as any)
        .insert({
          customer_id: customerId,
          invoice_number: invoiceNumber,
          amount: convertedAmount,
          currency: selectedCurrency,
          status: 'paid',
          paid_at: new Date().toISOString(),
          items: [{ name: `AMC Renewal: ${amc.plan_name}`, amount: convertedAmount, currency: selectedCurrency }]
        });

      // 5. Notify Customer
      await (supabase
        .from('customer_notifications') as any)
        .insert({
          customer_id: customerId,
          title: 'AMC Renewed Successfully',
          message: `Your AMC plan ${amc.plan_name} has been renewed until ${newEndDate.toLocaleDateString()}. Payment of ${currencySymbol}${convertedAmount.toFixed(2)} received.`,
          type: 'success',
          link: '/dashboard'
        });

      setPaymentSuccess(true);
      fetchDashboardData(customerId, email);
    } catch (err) {
      console.error('Renewal failed:', err);
      toast({ title: "Renewal Failed", description: "Payment processing failed. Please try again or contact support.", variant: "destructive" });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const setupRealtimeSubscriptions = (cId: string, cEmail: string) => {
    // Tickets Realtime
    const ticketChannel = supabase
      .channel('customer-tickets')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'support_tickets',
        filter: `email=eq.${cEmail}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTickets(prev => [payload.new as CustomerTicket, ...prev]);
          toast({ title: "Ticket Created", description: "Your new ticket has been registered." });
        } else if (payload.eventType === 'UPDATE') {
          setTickets(prev => prev.map(t => t.id === payload.new.id ? payload.new as CustomerTicket : t));
          toast({ title: "Ticket Updated", description: "One of your tickets has been updated." });
        }
      })
      .subscribe();

    // Repairs Realtime
    const repairChannel = supabase
      .channel('customer-repairs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'hardware_repairs',
        filter: `customer_id=eq.${cId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRepairs(prev => [payload.new as HardwareRepair, ...prev]);
          toast({ title: "Repair Started", description: "A new repair entry has been added." });
        } else if (payload.eventType === 'UPDATE') {
          setRepairs(prev => prev.map(r => r.id === payload.new.id ? payload.new as HardwareRepair : r));
          toast({ title: "Repair Updated", description: `Progress: ${payload.new.progress_percent}% for ${payload.new.device_name}` });
        }
      })
      .subscribe();

    // Notifications Realtime
    const notifChannel = supabase
      .channel('customer-notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'customer_notifications',
        filter: `customer_id=eq.${cId}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        toast({ title: payload.new.title, description: payload.new.message });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
      supabase.removeChannel(repairChannel);
      supabase.removeChannel(notifChannel);
    };
  };

  const markNotificationAsRead = async (id: string) => {
    await (supabase.from('customer_notifications') as any).update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleLogout = () => {
    void supabase.auth.signOut();
    setIsLoggedIn(false);
    setEmail('');
    setOtp('');
    setOtpSent(false);
    setCustomerName('');
    setTickets([]);
    setRepairs([]);
    setInvoices([]);
    setNotifications([]);
    setCustomerId('');
    setAmcSubscriptions([]);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isAMCActive = amcSubscriptions.some(
    sub => sub.status === 'active' && new Date(sub.end_date) >= new Date()
  );

  const filteredTickets = tickets.filter(ticket =>
    ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const timelineItems = [
    ...tickets.map(t => ({ ...t, type: 'ticket', date: t.created_at })),
    ...repairs.map(r => ({ ...r, type: 'repair', date: r.created_at })),
    ...invoices.map(i => ({ ...i, type: 'invoice', date: i.created_at }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col w-full min-h-screen">
        <section className="bg-gradient-to-br from-primary via-blue-600 to-primary text-white py-20 md:py-32">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Customer Dashboard</h1>
            <p className="text-xl text-blue-100">Track your tickets and AMC status</p>
          </div>
        </section>

        <section className="flex-1 flex items-center justify-center py-20 md:py-32">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-center">Login to Your Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              {otpSent && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Email sign-in code</label>
                  <Input inputMode="numeric" autoComplete="one-time-code" placeholder="Enter the code from your email" value={otp} onChange={event => setOtp(event.target.value)} onKeyPress={event => event.key === 'Enter' && handleLogin()} />
                </div>
              )}
              <Button 
                className="w-full" 
                onClick={handleLogin}
                disabled={isLoading || !email || (otpSent && !otp.trim())}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4 text-white" />
                    {otpSent ? 'Verifying...' : 'Sending code...'}
                  </>
                ) : otpSent ? 'Verify code' : 'Send sign-in code'}
              </Button>
              <p className="text-sm text-slate-600 text-center">
                Don't have an account? <a href="/support" className="text-primary hover:underline">Raise a ticket</a> to get started
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-primary text-white py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {customerName}!</h1>
              <p className="text-blue-100">{email}</p>
            </div>
            <div className="flex gap-2">
              <div className="relative mr-2">
                <Button variant="secondary" size="icon" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell className="h-4 w-4" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </Button>
                {showNotifications && (
                  <Card className="absolute top-12 right-0 w-80 z-50 shadow-xl border-slate-200 text-slate-900">
                    <CardHeader className="py-3 bg-slate-50 border-b">
                      <CardTitle className="text-sm">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-slate-500">No notifications</p>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            className={`p-3 border-b hover:bg-slate-50 cursor-pointer ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                            onClick={() => markNotificationAsRead(n.id)}
                          >
                            <p className="text-xs font-bold text-slate-900">{n.title}</p>
                            <p className="text-[11px] text-slate-600 mt-1">{n.message}</p>
                            <p className="text-[9px] text-slate-400 mt-2">{new Date(n.created_at).toLocaleTimeString()}</p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Repairs</p>
                    <p className="text-3xl font-bold">{repairs.filter(r => r.status !== 'delivered').length}</p>
                  </div>
                  <Package className="h-10 w-10 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Open Tickets</p>
                    <p className="text-3xl font-bold">
                      {tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length}
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Resolved</p>
                    <p className="text-3xl font-bold">
                      {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">AMC Status</p>
                    <p className="text-lg font-bold">
                      {isAMCActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-800">Inactive</Badge>
                      )}
                    </p>
                  </div>
                  <Shield className="h-10 w-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Content Tabs */}
      <section className="py-8 flex-1">
        <div className="container">
          <Tabs defaultValue="tickets" className="space-y-8">
            <TabsList className="bg-white border w-full flex overflow-x-auto justify-start md:justify-center h-auto p-1">
              <TabsTrigger value="tickets" className="flex-1 md:flex-none py-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Ticket className="h-4 w-4" /> Tickets
              </TabsTrigger>
              <TabsTrigger value="repairs" className="flex-1 md:flex-none py-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Package className="h-4 w-4" /> Hardware Repairs
              </TabsTrigger>
              <TabsTrigger value="amc" className="flex-1 md:flex-none py-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Shield className="h-4 w-4" /> AMC Plans
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 md:flex-none py-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <History className="h-4 w-4" /> Service History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <CardTitle>My Support Tickets</CardTitle>
                    <div className="flex gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search tickets..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button onClick={() => navigate('/support')}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Ticket
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600">No tickets found</p>
                      <Button className="mt-4" onClick={() => navigate('/support')}>
                        Raise Your First Ticket
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTickets.map((ticket) => (
                        <div key={ticket.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-lg">{ticket.ticket_id}</p>
                              <p className="text-slate-900">{ticket.subject}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status}
                              </Badge>
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>Category: {ticket.category}</span>
                            <span>•</span>
                            <span>Service: {ticket.service_type || 'General'}</span>
                            <span>•</span>
                            <span>Created: {formatDate(ticket.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="repairs">
              <Card className="border-2 border-orange-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-500" />
                    Real-time Hardware Repair Tracking
                  </CardTitle>
                  <CardDescription>Live progress of your devices in our service center</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {repairs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No active repair tasks</div>
                  ) : (
                    repairs.map(repair => (
                      <div key={repair.id} className="space-y-4 p-4 border rounded-xl bg-white shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                              <Monitor className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{repair.device_name}</h4>
                              <p className="text-sm text-slate-500 font-mono">{repair.serial_number}</p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <Badge className={
                                repair.status === 'ready' || repair.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                repair.status === 'delivering' ? 'bg-blue-100 text-blue-700' :
                                'bg-orange-100 text-orange-700'
                              }>
                                {repair.status.toUpperCase()}
                              </Badge>
                              {(repair.status === 'ready' || repair.status === 'delivered') && (
                                <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] gap-1" onClick={() => generateReceipt(repair)}>
                                  <Download className="h-3 w-3" />
                                  Download Receipt
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">Est. Completion: {formatDate(repair.estimated_completion)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Current Progress</span>
                            <span>{repair.progress_percent}%</span>
                          </div>
                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 ease-out" 
                              style={{ width: `${repair.progress_percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg flex items-start gap-3 border">
                          <Tool className="h-4 w-4 text-slate-400 mt-1" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Technician's Latest Note</p>
                            <p className="text-sm text-slate-700 italic">"{repair.technician_notes || 'No updates yet. Diagnosis in progress.'}"</p>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="amc">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>AMC Subscriptions</CardTitle>
                    <Button size="sm" onClick={() => navigate('/amc-plans')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Plan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {amcSubscriptions.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">No active AMC plans</div>
                    ) : (
                      amcSubscriptions.map((sub: any) => {
                        const daysRemaining = Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        const isExpiring = daysRemaining <= 30 && daysRemaining > 0;
                        const isExpired = daysRemaining <= 0;

                        return (
                          <div key={sub.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-xl border-2 border-slate-100 hover:border-primary/20 transition-all gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-bold text-xl">{sub.plan_name}</h4>
                                <Badge className={sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                                  {sub.status.toUpperCase()}
                                </Badge>
                                {isExpiring && <Badge className="bg-orange-100 text-orange-800">Expiring Soon</Badge>}
                                {isExpired && <Badge className="bg-red-100 text-red-800">Expired</Badge>}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600">
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-400">Validity</p>
                                  <p className="font-medium">{formatDate(sub.start_date)} - {formatDate(sub.end_date)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-400">Amount Paid</p>
                                  <p className="font-medium">₹{sub.amount.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-400">Remaining</p>
                                  <p className={`font-medium ${isExpiring ? 'text-orange-600' : isExpired ? 'text-red-600' : 'text-slate-600'}`}>
                                    {isExpired ? 'Expired' : `${daysRemaining} days left`}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {(isExpiring || isExpired) && (
                              <Dialog open={selectedRenewalPlan?.id === sub.id} onOpenChange={(open) => {
                                if (!open) {
                                  setSelectedRenewalPlan(null);
                                  setPaymentSuccess(false);
                                } else {
                                  setSelectedRenewalPlan(sub);
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="default" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                    <ShoppingCart className="h-4 w-4" /> Renew Plan
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Renew Subscription</DialogTitle>
                                    <DialogDescription>Extend your AMC coverage for another year.</DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-6 py-4">
                                    <div className="space-y-2">
                                      <Label className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" /> Select Currency
                                      </Label>
                                      <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select Currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {CURRENCIES.map(c => (
                                            <SelectItem key={c.code} value={c.code}>
                                              {c.code} - {c.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-lg border">
                                      <p className="text-sm font-medium text-slate-500 mb-1">Plan to Renew</p>
                                      <div className="flex justify-between items-center">
                                        <h5 className="font-bold text-lg">{sub.plan_name}</h5>
                                        <p className="font-bold text-blue-600 text-xl">
                                          {CURRENCIES.find(c => c.code === selectedCurrency)?.symbol}
                                          {getConvertedAmount(sub.amount, selectedCurrency).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                      </div>
                                    </div>

                                    {!paymentSuccess ? (
                                      <div className="space-y-4">
                                        <Label>Select Payment Method</Label>
                                        <RadioGroup defaultValue="card">
                                          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                                            <RadioGroupItem value="card" id="card" />
                                            <Label htmlFor="card" className="flex flex-1 items-center gap-2 cursor-pointer">
                                              <CreditCard className="h-4 w-4 text-blue-600" /> Credit/Debit Card
                                            </Label>
                                          </div>
                                          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                                            <RadioGroupItem value="upi" id="upi" />
                                            <Label htmlFor="upi" className="flex flex-1 items-center gap-2 cursor-pointer">
                                              <Wallet className="h-4 w-4 text-green-600" /> UPI (GPay/PhonePe)
                                            </Label>
                                          </div>
                                        </RadioGroup>

                                        <div className="grid grid-cols-1 gap-3">
                                          <Input placeholder="Cardholder Name" />
                                          <Input placeholder="Card Number" maxLength={16} />
                                          <div className="grid grid-cols-2 gap-2">
                                            <Input placeholder="MM/YY" maxLength={5} />
                                            <Input placeholder="CVV" type="password" maxLength={3} />
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-center gap-1.5 py-2 border-t mt-4 border-slate-100">
                                          <Lock className="h-3 w-3 text-slate-400" />
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secured by Stripe</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-8 space-y-4">
                                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <Check className="h-10 w-10 text-green-600" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-slate-900">Payment Successful!</h4>
                                        <p className="text-slate-500">Your AMC plan has been renewed. You can download the invoice from the history tab.</p>
                                      </div>
                                    )}
                                  </div>

                                  <DialogFooter>
                                    {!paymentSuccess ? (
                                      <Button 
                                        className="w-full h-12 text-lg font-bold gap-2" 
                                        onClick={() => handleRenewPlan(sub)}
                                        disabled={isProcessingPayment}
                                      >
                                        {isProcessingPayment ? (
                                          <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                          <ShoppingCart className="h-5 w-5" />
                                        )}
                                        {isProcessingPayment ? 'Processing...' : `Pay ${CURRENCIES.find(c => c.code === selectedCurrency)?.symbol}${getConvertedAmount(sub.amount, selectedCurrency).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                      </Button>
                                    ) : (
                                      <Button className="w-full" onClick={() => window.location.reload()}>
                                        Done
                                      </Button>
                                    )}
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Unified Service History</CardTitle>
                  <CardDescription>A chronological timeline of all your interactions and services.</CardDescription>
                </CardHeader>
                <CardContent>
                  {timelineItems.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 italic">No history available yet.</div>
                  ) : (
                    <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {timelineItems.map((item: any, idx) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[27px] p-1 rounded-full bg-white border-2 ${
                            item.type === 'ticket' ? 'border-blue-400' : 
                            item.type === 'repair' ? 'border-orange-400' : 'border-green-400'
                          }`}>
                            {item.type === 'ticket' && <Ticket className="h-3 w-3 text-blue-500" />}
                            {item.type === 'repair' && <Package className="h-3 w-3 text-orange-500" />}
                            {item.type === 'invoice' && <FileText className="h-3 w-3 text-green-500" />}
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {formatDate(item.date)}
                              </span>
                              <Badge className={
                                item.type === 'ticket' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                item.type === 'repair' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-green-50 text-green-700 border-green-200'
                              }>
                                {item.type.toUpperCase()}
                              </Badge>
                            </div>
                            
                            {item.type === 'ticket' && (
                              <div>
                                <h5 className="font-bold text-slate-900">{item.subject}</h5>
                                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{item.description}</p>
                                <div className="mt-3 flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px] h-5">{item.status}</Badge>
                                  <span className="text-xs text-slate-400">#{item.ticket_id}</span>
                                </div>
                              </div>
                            )}

                            {item.type === 'repair' && (
                              <div>
                                <h5 className="font-bold text-slate-900">{item.device_name} Repair</h5>
                                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{item.issue_description}</p>
                                <div className="mt-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] h-5">{item.status}</Badge>
                                    <span className="text-xs text-slate-400">S/N: {item.serial_number}</span>
                                  </div>
                                  {(item.status === 'ready' || item.status === 'delivered') && (
                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] text-blue-600 p-0 hover:bg-transparent" onClick={() => generateReceipt(item)}>
                                      <Download className="h-3 w-3 mr-1" /> Receipt
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}

                            {item.type === 'invoice' && (
                              <div>
                                <h5 className="font-bold text-slate-900">Invoice {item.invoice_number}</h5>
                                <p className="text-sm text-slate-500 mt-1">Payment for {item.items?.[0]?.name || 'Services'}</p>
                                <div className="mt-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800 text-[10px] h-5">PAID</Badge>
                                    <span className="font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                                  </div>
                                  <Button variant="ghost" size="sm" className="h-7 text-[10px] text-blue-600 p-0 hover:bg-transparent">
                                    <Download className="h-3 w-3 mr-1" /> PDF
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default CustomerDashboard;

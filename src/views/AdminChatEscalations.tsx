import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare, ArrowLeft, RefreshCw,
  CheckCircle2, User, Clock, Eye,
  Mail, Send, Timer, AlertTriangle, Info, Zap, Plus, BookOpen, Activity,
  FileSearch, Loader2, Star, Download, BarChart2, CalendarIcon, X
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useNavigate } from '@/lib/next-router';
import { LoadingSpinner } from '@/components/common/Loader';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select as UiSelect, SelectContent as UiSelectContent, SelectItem as UiSelectItem, SelectTrigger as UiSelectTrigger, SelectValue as UiSelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';

const AdminChatEscalations: React.FC = () => {
  const [escalations, setEscalations] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [slaSettings, setSlaSettings] = useState<any[]>([]);
  const [sendLog, setSendLog] = useState<any[]>([]);
  const [isLoadingSendLog, setIsLoadingSendLog] = useState(false);
  const [ratingsData, setRatingsData] = useState<{ total: number; avg: number; distribution: { star: number; count: number }[] }>({ total: 0, avg: 0, distribution: [] });
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [ratingsDateFrom, setRatingsDateFrom] = useState<Date | undefined>(undefined);
  const [ratingsDateTo, setRatingsDateTo] = useState<Date | undefined>(undefined);
  const [ratingsPreset, setRatingsPreset] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEscalation, setSelectedEscalation] = useState<any>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyEmail, setReplyEmail] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('none');
  const [isSending, setIsSending] = useState(false);

  // Email Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewEscalation, setPreviewEscalation] = useState<any>(null);
  const [previewType, setPreviewType] = useState<'breached' | 'approaching'>('breached');
  const [previewHtml, setPreviewHtml] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Test/Sample Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [testCustomerName, setTestCustomerName] = useState('Test Customer');
  const [testQuery, setTestQuery] = useState('This is a test escalation for SLA verification.');
  const [testSlaTarget, setTestSlaTarget] = useState('15');
  const [testPriority, setTestPriority] = useState('High');
  const [testInitialStatus, setTestInitialStatus] = useState('Approaching');
  const [sampleCustomerName, setSampleCustomerName] = useState('Sample Customer');
  const [sampleQuery, setSampleQuery] = useState('How do I reset my password?');
  const [isCreatingTest, setIsCreatingTest] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const openEmailPreview = async (esc: any, type: 'breached' | 'approaching') => {
    setPreviewEscalation(esc);
    setPreviewType(type);
    setPreviewHtml('');
    setIsPreviewModalOpen(true);
    setIsGeneratingPreview(true);
    try {
      const { data, error } = await supabase.functions.invoke('preview-sla-email', {
        body: { escalationId: esc.id, type }
      });
      if (error) {
        const msg = await error?.context?.text?.();
        throw new Error(msg || error.message);
      }
      setPreviewHtml(data?.html || '<p>No content generated.</p>');
    } catch (err: any) {
      toast({ title: 'Preview Failed', description: err.message, variant: 'destructive' });
      setIsPreviewModalOpen(false);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleSendNow = async () => {
    if (!previewEscalation) return;
    setIsSendingEmail(true);
    try {
      const triggeredBy = localStorage.getItem('vts_admin_email') || 'unknown';
      const { data, error } = await supabase.functions.invoke('preview-sla-email', {
        body: { escalationId: previewEscalation.id, type: previewType, send: true, triggeredBy }
      });
      if (error) {
        const msg = await error?.context?.text?.();
        throw new Error(msg || error.message);
      }
      toast({
        title: 'Email Sent',
        description: `Alert dispatched to ${data?.recipients ?? 'all'} active admin${data?.recipients !== 1 ? 's' : ''}.`
      });
      fetchSendLog(); // refresh log panel
    } catch (err: any) {
      toast({ title: 'Send Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCreateTestEscalation = async () => {
    setIsCreatingTest(true);
    try {
      let createdAt = new Date();
      if (testInitialStatus === 'Approaching') {
        // High is 15 mins. 80% is 12 mins.
        createdAt = new Date(Date.now() - 13 * 60 * 1000);
      } else if (testInitialStatus === 'Breached') {
        createdAt = new Date(Date.now() - 16 * 60 * 1000);
      }

      const { error } = await (supabase.from('chatbot_escalations') as any).insert({
        customer_name: testCustomerName,
        customer_email: 'test@example.com',
        message: testQuery,
        priority: testPriority,
        status: 'pending',
        is_test: true,
        created_at: createdAt.toISOString()
      });

      if (error) throw error;

      toast({
        title: "Test Escalation Created",
        description: `Status: ${testInitialStatus}.`,
      });
      setIsTestModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to create test", description: err.message, variant: "destructive" });
    } finally {
      setIsCreatingTest(false);
    }
  };

  const handleCreateSampleEscalation = async () => {
    setIsCreatingTest(true);
    try {
      const { error } = await (supabase.from('chatbot_escalations') as any).insert({
        customer_name: sampleCustomerName,
        customer_email: 'sample@example.com',
        message: sampleQuery,
        priority: 'Medium',
        status: 'pending',
        is_sample: true,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: "Sample Escalation Created",
        description: `You can now use this in the Knowledge Base AI Generation.`,
      });
      setIsSampleModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to create sample", description: err.message, variant: "destructive" });
    } finally {
      setIsCreatingTest(false);
    }
  };

  const handleRunSlaMonitor = async () => {
    setIsMonitoring(true);
    try {
      const { data, error } = await supabase.functions.invoke('monitor-slas', {
        body: {}
      });
      if (error) throw error;

      toast({
        title: "SLA Monitor Executed",
        description: `Sent ${data.sent?.length || 0} notifications.`,
      });
      fetchData();
    } catch (err: any) {
      toast({ title: "SLA Monitor Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsMonitoring(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [escalationsRes, templatesRes, slaRes] = await Promise.all([
        supabase.from('chatbot_escalations').select('*').order('created_at', { ascending: false }),
        supabase.from('email_templates').select('*').order('name', { ascending: true }),
        supabase.from('sla_settings').select('*')
      ]);

      if (escalationsRes.error) throw escalationsRes.error;
      setEscalations(escalationsRes.data || []);
      setTemplates(templatesRes.data || []);
      setSlaSettings(slaRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSendLog = async () => {
    setIsLoadingSendLog(true);
    try {
      const { data, error } = await (supabase
        .from('sla_email_send_log') as any)
        .select('*, chatbot_escalations(customer_name, priority)')
        .order('sent_at', { ascending: false })
        .limit(50);
      if (!error) setSendLog(data || []);
    } catch (err) {
      console.error('Error fetching send log:', err);
    } finally {
      setIsLoadingSendLog(false);
    }
  };

  const fetchRatings = async (fromDate?: Date, toDate?: Date) => {
    setIsLoadingRatings(true);
    try {
      let query = (supabase.from('chatbot_ratings') as any).select('rating, created_at');
      if (fromDate) query = query.gte('created_at', startOfDay(fromDate).toISOString());
      if (toDate) query = query.lte('created_at', endOfDay(toDate).toISOString());
      const { data, error } = await query;
      if (error || !data) return;
      const total = data.length;
      const avg = total > 0 ? data.reduce((s: number, r: any) => s + r.rating, 0) / total : 0;
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach((r: any) => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++; });
      const distribution = [1, 2, 3, 4, 5].map((star) => ({ star, count: dist[star] }));
      setRatingsData({ total, avg, distribution });
    } catch (err) {
      console.error('Error fetching ratings:', err);
    } finally {
      setIsLoadingRatings(false);
    }
  };

  const applyRatingsPreset = (preset: string) => {
    setRatingsPreset(preset);
    const now = new Date();
    if (preset === 'all') {
      setRatingsDateFrom(undefined);
      setRatingsDateTo(undefined);
      fetchRatings(undefined, undefined);
    } else if (preset === '7d') {
      const from = subDays(now, 7);
      setRatingsDateFrom(from);
      setRatingsDateTo(now);
      fetchRatings(from, now);
    } else if (preset === '30d') {
      const from = subDays(now, 30);
      setRatingsDateFrom(from);
      setRatingsDateTo(now);
      fetchRatings(from, now);
    } else if (preset === '90d') {
      const from = subDays(now, 90);
      setRatingsDateFrom(from);
      setRatingsDateTo(now);
      fetchRatings(from, now);
    }
  };

  const exportSendLogCSV = () => {
    if (sendLog.length === 0) return;
    const headers = ['Sent At', 'Customer', 'Type', 'Priority', 'Recipients', 'Triggered By'];
    const rows = sendLog.map((row: any) => [
      new Date(row.sent_at).toLocaleString('en-IN'),
      row.chatbot_escalations?.customer_name || 'Deleted',
      row.email_type,
      row.chatbot_escalations?.priority || '',
      row.recipient_count,
      row.triggered_by || 'system',
    ]);
    const csv = [headers, ...rows].map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sla-email-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('vts_admin_auth');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }
    fetchData();
    fetchSendLog();
    fetchRatings();

    // SLA Timer Tick
    const timer = setInterval(() => {
      setEscalations(prev => [...prev]); // Force re-render to update timers
    }, 1000);

    // Subscribe to new escalations
    const channel = supabase
      .channel('admin-escalations-page')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chatbot_escalations' }, (payload) => {
        setEscalations(prev => [payload.new, ...prev]);
        toast({
          title: "New Chat Escalation!",
          description: `From: ${payload.new.customer_name || 'Guest'}`,
          variant: "default"
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [navigate]);


  const getSlaStatus = (esc: any) => {
    if (esc.status === 'resolved') return { status: 'Resolved', color: 'text-green-600', icon: <CheckCircle2 className="h-3 w-3" /> };

    const settings = slaSettings.find(s => s.priority === (esc.priority || 'Medium'));
    if (!settings) return { status: 'N/A', color: 'text-slate-400', icon: <Info className="h-3 w-3" /> };

    const createdAt = new Date(esc.created_at).getTime();
    const now = new Date().getTime();
    const elapsedMin = (now - createdAt) / (1000 * 60);

    const firstResponseTarget = settings.first_response_target_min;

    if (esc.first_response_at) {
      const respondedAt = new Date(esc.first_response_at).getTime();
      const responseTimeMin = (respondedAt - createdAt) / (1000 * 60);
      if (responseTimeMin > firstResponseTarget) return { status: 'SLA Breached', color: 'text-red-600', icon: <AlertTriangle className="h-3 w-3" /> };
      return { status: 'Within SLA', color: 'text-green-600', icon: <CheckCircle2 className="h-3 w-3" /> };
    }

    if (elapsedMin > firstResponseTarget) return { status: 'SLA Breached', color: 'text-red-600', icon: <AlertTriangle className="h-3 w-3" /> };
    if (elapsedMin > firstResponseTarget * 0.8) return { status: 'Approaching SLA', color: 'text-orange-600', icon: <Timer className="h-3 w-3" /> };

    return { status: 'Within SLA', color: 'text-green-600', icon: <CheckCircle2 className="h-3 w-3" /> };
  };

  const getSlaTimer = (esc: any) => {
    if (esc.status === 'resolved' || esc.first_response_at) return null;

    const settings = slaSettings.find(s => s.priority === (esc.priority || 'Medium'));
    if (!settings) return null;

    const createdAt = new Date(esc.created_at).getTime();
    const targetAt = createdAt + (settings.first_response_target_min * 60 * 1000);
    const now = new Date().getTime();
    const diff = targetAt - now;

    if (diff <= 0) return { text: 'Overdue!', color: 'text-red-600' };

    const min = Math.floor(diff / (1000 * 60));
    const sec = Math.floor((diff % (1000 * 60)) / 1000);
    return { text: `${min}m ${sec}s remaining`, color: min < 5 ? 'text-red-600' : min < 10 ? 'text-orange-600' : 'text-green-600' };
  };

  const resolveEscalation = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('chatbot_escalations') as any)
        .update({
          status: 'resolved',
          resolved_at: new Date(),
          sla_status: getSlaStatus(escalations.find(e => e.id === id)).status
        })
        .eq('id', id);

      if (error) throw error;
      setEscalations(prev => prev.map(e => e.id === id ? { ...e, status: 'resolved' } : e));
      toast({ title: "Escalation Resolved" });
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const openReplyModal = (esc: any) => {
    setSelectedEscalation(esc);
    setReplyEmail(esc.customer_email || '');
    setReplySubject(`Re: Your Support Request - ${esc.id.slice(0, 8)}`);
    setReplyMessage('');
    setSelectedTemplateId('none');
    setIsReplyModalOpen(true);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === 'none') return;

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const adminAuth = JSON.parse(localStorage.getItem('vts_admin_auth') || '{}');

    // Replace placeholders
    const body = template.body
      .replace(/{{customer_name}}/g, selectedEscalation?.customer_name || 'Customer')
      .replace(/{{ticket_id}}/g, selectedEscalation?.id.slice(0, 8) || 'N/A')
      .replace(/{{admin_name}}/g, adminAuth.name || 'Admin')
      .replace(/{{company_name}}/g, 'VedTech Services');

    const subject = template.subject
      .replace(/{{customer_name}}/g, selectedEscalation?.customer_name || 'Customer')
      .replace(/{{ticket_id}}/g, selectedEscalation?.id.slice(0, 8) || 'N/A')
      .replace(/{{admin_name}}/g, adminAuth.name || 'Admin')
      .replace(/{{company_name}}/g, 'VedTech Services');

    setReplySubject(subject);
    setReplyMessage(body);
  };

  const sendEmailReply = async () => {
    if (!replyEmail || !replyMessage) {
      toast({ title: "Error", description: "Email and message are required", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const adminAuth = JSON.parse(localStorage.getItem('vts_admin_auth') || '{}');
      const { data, error } = await (supabase as any).functions.invoke('send-admin-reply', {
        body: {
          customerEmail: replyEmail,
          subject: replySubject,
          message: replyMessage,
          escalationId: selectedEscalation.id,
          adminName: adminAuth.name || 'Admin'
        }
      });

      if (error) throw error;

      // Update local state if needed (e.g. update customer_email if it was empty)
      // Also update first_response_at if this is the first response
      const updateData: any = {};
      if (!selectedEscalation.customer_email) updateData.customer_email = replyEmail;
      if (!selectedEscalation.first_response_at) updateData.first_response_at = new Date();

      if (Object.keys(updateData).length > 0) {
        await (supabase.from('chatbot_escalations') as any).update(updateData).eq('id', selectedEscalation.id);
        setEscalations(prev => prev.map(e => e.id === selectedEscalation.id ? { ...e, ...updateData } : e));
      }

      toast({ title: "Success", description: "Email reply sent successfully" });
      setIsReplyModalOpen(false);
    } catch (err: any) {
      console.error('Error sending email:', err);
      toast({ title: "Failed", description: err.message || "Failed to send email reply", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size={48} /></div>;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      <div className="container pt-4"><AdminRoleWarning /></div>
      <section className="bg-slate-900 text-white py-12">
        <div className="container">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="border-white/20 hover:bg-white/10" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-blue-400" />
                Chatbot Escalations
              </h1>
              <p className="text-slate-400">Respond to customers who requested human assistance via VedBot.</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 gap-2" onClick={handleRunSlaMonitor} disabled={isMonitoring}>
                {isMonitoring ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                Run SLA Monitor
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 gap-2" onClick={() => setIsTestModalOpen(true)}>
                <Timer className="h-4 w-4" /> Create Test (SLA)
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 gap-2" onClick={() => setIsSampleModalOpen(true)}>
                <Zap className="h-4 w-4" /> Create Sample (AI KB)
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Total Escalations</p>
                  <p className="text-xl font-bold">{escalations.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Timer className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Pending Actions</p>
                  <p className="text-xl font-bold">{escalations.filter(e => e.status !== 'resolved').length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">SLA Breaches</p>
                  <p className="text-xl font-bold">{escalations.filter(e => getSlaStatus(e).status === 'SLA Breached').length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Compliance Rate</p>
                  <p className="text-xl font-bold">
                    {escalations.length > 0
                      ? Math.round(((escalations.length - escalations.filter(e => getSlaStatus(e).status === 'SLA Breached').length) / escalations.length) * 100)
                      : 100}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {escalations.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-slate-500 italic">No chatbot escalations yet.</CardContent></Card>
            ) : (
              escalations.map(esc => (
                <Card key={esc.id} className={esc.status === 'pending' ? 'border-blue-200 bg-blue-50/10' : ''}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={esc.status === 'pending' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                            {esc.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={cn(
                            "uppercase text-[10px]",
                            esc.priority === 'High' ? 'border-red-200 text-red-700 bg-red-50' :
                              esc.priority === 'Medium' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                                'border-blue-200 text-blue-700 bg-blue-50'
                          )}>
                            {esc.priority || 'Medium'} Priority
                          </Badge>
                          <div className={cn("flex items-center gap-1 text-[10px] font-bold", getSlaStatus(esc).color)}>
                            {getSlaStatus(esc).icon}
                            {getSlaStatus(esc).status}
                          </div>
                          {esc.sla_breach_notified_at && (
                            <Badge variant="secondary" className="bg-red-600 text-white text-[9px] h-4">
                              BREACH EMAIL SENT
                            </Badge>
                          )}
                          {esc.sla_approaching_notified_at && !esc.sla_breach_notified_at && (
                            <Badge variant="secondary" className="bg-orange-500 text-white text-[9px] h-4">
                              WARNING EMAIL SENT
                            </Badge>
                          )}
                          <span className="text-xs text-slate-400 font-mono">ID: {esc.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                          <User className="h-4 w-4 text-slate-400" />
                          {esc.customer_name} ({esc.customer_identifier})
                        </div>
                        <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100 italic">
                          "{esc.message}"
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            {new Date(esc.created_at).toLocaleString()}
                          </div>
                          {esc.status !== 'resolved' && !esc.first_response_at && (
                            <div className="flex items-center gap-2 text-[10px] font-mono">
                              <Timer className="h-3 w-3 text-slate-400" />
                              <span className={getSlaTimer(esc)?.color}>SLA: {getSlaTimer(esc)?.text}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end justify-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="gap-2"
                              onClick={() => setSelectedEscalation(esc)}
                            >
                              <Eye className="h-4 w-4" /> View Full History
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                            <DialogHeader>
                              <DialogTitle>Chat History - {esc.customer_name}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="flex-1 pr-4">
                              <div className="space-y-4 py-4">
                                {esc.messages && Array.isArray(esc.messages) ? (
                                  esc.messages.map((m: any, idx: number) => (
                                    <div key={idx} className={cn(
                                      "flex flex-col gap-1 max-w-[80%]",
                                      m.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                    )}>
                                      <div className={cn(
                                        "px-4 py-2 rounded-2xl text-sm shadow-sm",
                                        m.sender === 'user' ? "bg-primary text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"
                                      )}>
                                        {m.text}
                                      </div>
                                      <span className="text-[10px] text-slate-400">
                                        {m.sender.toUpperCase()} • {new Date(m.timestamp).toLocaleTimeString()}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center text-slate-400 italic">No history available.</div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>

                        {/* SLA Email Preview */}
                        {esc.status !== 'resolved' && (
                          <div className="flex gap-2 w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1 text-orange-700 border-orange-200 hover:bg-orange-50"
                              onClick={() => openEmailPreview(esc, 'approaching')}
                            >
                              <FileSearch className="h-3.5 w-3.5" /> Preview Warning Email
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1 text-red-700 border-red-200 hover:bg-red-50"
                              onClick={() => openEmailPreview(esc, 'breached')}
                            >
                              <FileSearch className="h-3.5 w-3.5" /> Preview Breach Email
                            </Button>
                          </div>
                        )}

                        <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
                          <Button
                            variant="secondary"
                            className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => openReplyModal(esc)}
                          >
                            <Mail className="h-4 w-4" /> Reply via Email
                          </Button>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Send Email Reply</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="template">Email Template</Label>
                                <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a template" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None (Compose manually)</SelectItem>
                                    {templates.map(t => (
                                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email">Customer Email</Label>
                                <Input
                                  id="email"
                                  placeholder="customer@example.com"
                                  value={replyEmail}
                                  onChange={(e) => setReplyEmail(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                  id="subject"
                                  value={replySubject}
                                  onChange={(e) => setReplySubject(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                  id="message"
                                  placeholder="Write your reply here..."
                                  className="h-32"
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsReplyModalOpen(false)}>Cancel</Button>
                              <Button onClick={sendEmailReply} disabled={isSending} className="gap-2">
                                {isSending ? <LoadingSpinner size={16} /> : <Send className="h-4 w-4" />}
                                Send Email
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {esc.status === 'pending' && (
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                            onClick={() => resolveEscalation(esc.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" /> Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Satisfaction Ratings Dashboard ──────────────────────────── */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          {/* Header + controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-slate-800">Customer Satisfaction Ratings</h2>
              {(ratingsDateFrom || ratingsDateTo) && (
                <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">Filtered</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Quick preset buttons */}
              {(['all', '7d', '30d', '90d'] as const).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={ratingsPreset === p ? 'default' : 'outline'}
                  className="h-7 text-xs px-2"
                  onClick={() => applyRatingsPreset(p)}
                >
                  {p === 'all' ? 'All Time' : p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                </Button>
              ))}

              {/* Custom date FROM */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 px-2">
                    <CalendarIcon className="h-3 w-3" />
                    {ratingsDateFrom ? format(ratingsDateFrom, 'dd MMM yy') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={ratingsDateFrom}
                    onSelect={(d) => {
                      setRatingsDateFrom(d);
                      setRatingsPreset('custom');
                      fetchRatings(d, ratingsDateTo);
                    }}
                    disabled={(d) => d > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Custom date TO */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 px-2">
                    <CalendarIcon className="h-3 w-3" />
                    {ratingsDateTo ? format(ratingsDateTo, 'dd MMM yy') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={ratingsDateTo}
                    onSelect={(d) => {
                      setRatingsDateTo(d);
                      setRatingsPreset('custom');
                      fetchRatings(ratingsDateFrom, d);
                    }}
                    disabled={(d) => d > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Clear filter */}
              {(ratingsDateFrom || ratingsDateTo) && (
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-slate-500" onClick={() => applyRatingsPreset('all')}>
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}

              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => fetchRatings(ratingsDateFrom, ratingsDateTo)} disabled={isLoadingRatings}>
                <RefreshCw className={cn('h-3.5 w-3.5', isLoadingRatings && 'animate-spin')} />
              </Button>
            </div>
          </div>

          {isLoadingRatings ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : ratingsData.total === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                <Star className="h-8 w-8" />
                <p className="text-sm">No ratings yet. Ratings appear when resolved tickets are rated by customers.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Average Score */}
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center py-8 gap-2">
                  <span className="text-5xl font-bold text-yellow-500">{ratingsData.avg.toFixed(1)}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn('h-5 w-5', ratingsData.avg >= s ? 'fill-yellow-400 text-yellow-400' : ratingsData.avg >= s - 0.5 ? 'fill-yellow-200 text-yellow-300' : 'text-slate-200')} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Average Score</p>
                </CardContent>
              </Card>

              {/* Total Ratings */}
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center py-8 gap-2">
                  <span className="text-5xl font-bold text-primary">{ratingsData.total}</span>
                  <p className="text-sm text-slate-500 font-medium">Total Ratings</p>
                  <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                    {ratingsData.total === 1 ? '1 review' : `${ratingsData.total} reviews`}
                  </Badge>
                </CardContent>
              </Card>

              {/* Distribution Bar Chart */}
              <Card className="h-full">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <BarChart2 className="h-4 w-4 text-slate-400" /> Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-4">
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={ratingsData.distribution} barSize={22} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                      <XAxis dataKey="star" tick={{ fontSize: 11 }} tickFormatter={(v) => `★${v}`} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v: number) => [v, 'Ratings']}
                        labelFormatter={(l) => `${l} Star`}
                        contentStyle={{ fontSize: 12, borderRadius: 6 }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {ratingsData.distribution.map((entry) => (
                          <Cell key={entry.star} fill={entry.star >= 4 ? '#22c55e' : entry.star === 3 ? '#f59e0b' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* ── Sent Email Log ─────────────────────────────────────────── */}
      <section className="py-8 bg-slate-50">
        <div className="container">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-800">Sent Email Log</h2>
              <Badge variant="outline" className="text-xs">{sendLog.length} record{sendLog.length !== 1 ? 's' : ''}</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm" className="gap-1.5"
                onClick={exportSendLogCSV}
                disabled={sendLog.length === 0}
                title="Export as CSV"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchSendLog} disabled={isLoadingSendLog}>
                <RefreshCw className={cn('h-3.5 w-3.5', isLoadingSendLog && 'animate-spin')} /> Refresh
              </Button>
            </div>
          </div>

          {isLoadingSendLog ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : sendLog.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                <Mail className="h-8 w-8" />
                <p className="text-sm">No emails have been manually dispatched yet.</p>
                <p className="text-xs">Use the <span className="font-medium">Send Now</span> button in the SLA Email Preview to dispatch alerts.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Sent At</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Recipients</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Triggered By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sendLog.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {new Date(row.sent_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {row.chatbot_escalations?.customer_name || <span className="text-slate-400 italic">Deleted</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.email_type === 'breached' ? (
                          <Badge variant="outline" className="text-[10px] bg-red-50 border-red-200 text-red-700">🔴 Breach</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-orange-50 border-orange-200 text-orange-700">⚠️ Warning</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {row.chatbot_escalations?.priority || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="secondary" className="text-xs">{row.recipient_count}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {row.triggered_by || <span className="italic text-slate-300">system</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* SLA Email Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl flex flex-col max-h-[90dvh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-slate-600" />
              {previewType === 'breached' ? '🔴 SLA Breach Email Preview' : '⚠️ SLA Warning Email Preview'}
            </DialogTitle>
            <DialogDescription>
              AI-generated email for <span className="font-semibold">{previewEscalation?.customer_name}</span> — {previewType === 'breached' ? 'Breach notification' : 'Approaching SLA warning'}. Customise the prompt in Admin Settings.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs text-slate-500">Preview as:</span>
            <UiSelect value={previewType} onValueChange={(v) => {
              setPreviewType(v as 'breached' | 'approaching');
              if (previewEscalation) openEmailPreview(previewEscalation, v as 'breached' | 'approaching');
            }}>
              <UiSelectTrigger className="h-7 text-xs w-44">
                <UiSelectValue />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem value="approaching">⚠️ Approaching SLA</UiSelectItem>
                <UiSelectItem value="breached">🔴 SLA Breached</UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>

          <ScrollArea className="flex-1 min-h-0 rounded-lg border bg-white">
            {isGeneratingPreview ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Generating email with AI…</p>
              </div>
            ) : (
              <div
                className="p-4 text-sm"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </ScrollArea>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => previewEscalation && openEmailPreview(previewEscalation, previewType)}
              disabled={isGeneratingPreview || isSendingEmail}
            >
              <RefreshCw className={cn('h-4 w-4', isGeneratingPreview && 'animate-spin')} /> Regenerate
            </Button>
            <Button
              className="gap-2"
              onClick={handleSendNow}
              disabled={isGeneratingPreview || isSendingEmail || !previewHtml}
            >
              {isSendingEmail
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />}
              {isSendingEmail ? 'Sending…' : 'Send Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Escalation Dialog (SLA) */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-600" />
              Create Test Escalation (SLA)
            </DialogTitle>
            <DialogDescription>
              Simulate a customer escalation to verify SLA timers and email notifications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Test Customer Name</Label>
              <Input value={testCustomerName} onChange={(e) => setTestCustomerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Test Query</Label>
              <Textarea value={testQuery} onChange={(e) => setTestQuery(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={testPriority} onValueChange={setTestPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Initial State</Label>
                <Select value={testInitialStatus} onValueChange={setTestInitialStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New (0 mins elapsed)</SelectItem>
                    <SelectItem value="Approaching">Approaching (80% elapsed)</SelectItem>
                    <SelectItem value="Breached">Breached (100%+ elapsed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTestEscalation} disabled={isCreatingTest} className="gap-2">
              {isCreatingTest ? <LoadingSpinner size={16} /> : <Zap className="h-4 w-4" />}
              Create Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sample Escalation Dialog (AI KB) */}
      <Dialog open={isSampleModalOpen} onOpenChange={setIsSampleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Create Sample Escalation (AI KB)
            </DialogTitle>
            <DialogDescription>
              Create a common customer query to test the AI Knowledge Base generation feature.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sample Customer Name</Label>
              <Input value={sampleCustomerName} onChange={(e) => setSampleCustomerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Common Customer Query</Label>
              <Textarea
                placeholder="e.g. How do I upgrade my storage plan?"
                value={sampleQuery}
                onChange={(e) => setSampleQuery(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSampleModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSampleEscalation} disabled={isCreatingTest} className="bg-green-600 hover:bg-green-700 text-white gap-2">
              {isCreatingTest ? <LoadingSpinner size={16} /> : <Plus className="h-4 w-4" />}
              Create Sample
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChatEscalations;

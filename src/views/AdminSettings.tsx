import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Shield, ShieldCheck, ShieldAlert, Lock, 
  Key, LogOut, ArrowLeft, CheckCircle2, 
  Copy, RefreshCw, Smartphone, QrCode,
  Mail, Plus, Edit, Trash2, FileText, Settings, HelpCircle,
  Clock, Timer, Zap, Bot, Save, RotateCcw
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { logActivity } from '@/db/api';
import { useNavigate } from '@/lib/next-router';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/Loader';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { generateSecret, verifySync, generateURI } from 'otplib';
import { cn } from '@/lib/utils';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';

const AdminSettings: React.FC = () => {
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [tempSecret, setTempSecret] = useState('');
  
  // Email Templates State
  const [templates, setTemplates] = useState<any[]>([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>({ name: '', subject: '', body: '' });
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  // SLA Settings State
  const [slaSettings, setSlaSettings] = useState<any[]>([]);
  const [isSlaDialogOpen, setIsSlaDialogOpen] = useState(false);
  const [currentSla, setCurrentSla] = useState<any>({ priority: 'Medium', first_response_target_min: 30, resolution_target_min: 240, email_reply_target_min: 60 });

  // SLA Email Prompt State
  const [slaEmailPrompt, setSlaEmailPrompt] = useState('');
  const [slaEmailPromptDraft, setSlaEmailPromptDraft] = useState('');
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    const adminId = localStorage.getItem('vts_admin_id');
    try {
      const [adminRes, templatesRes, slaRes, promptRes] = await Promise.all([
        (supabase.from('admin_users') as any).select('id,email,full_name,role,is_active,totp_enabled').eq('id', adminId).single(),
        (supabase.from('email_templates') as any).select('*').order('name', { ascending: true }),
        (supabase.from('sla_settings') as any).select('*').order('priority', { ascending: true }),
        (supabase.from('admin_settings') as any).select('value').eq('key', 'sla_email_prompt').maybeSingle()
      ]);

      if (adminRes.error) throw adminRes.error;
      setAdmin(adminRes.data);
      setTemplates(templatesRes.data || []);
      setSlaSettings(slaRes.data || []);
      const promptVal = promptRes.data?.value || '';
      setSlaEmailPrompt(promptVal);
      setSlaEmailPromptDraft(promptVal);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      toast({
        title: "Fetch Failed",
        description: "Could not load settings data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Template Management Functions
  const handleSaveTemplate = async () => {
    if (!currentTemplate.name || !currentTemplate.subject || !currentTemplate.body) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    setIsUpdating(true);
    try {
      if (isEditingTemplate) {
        const { error } = await (supabase.from('email_templates') as any)
          .update({
            subject: currentTemplate.subject,
            body: currentTemplate.body,
            updated_at: new Date()
          })
          .eq('id', currentTemplate.id);
        if (error) throw error;
        toast({ title: "Template Updated", description: "Email template saved successfully." });
      } else {
        const { error } = await (supabase.from('email_templates') as any)
          .insert({
            name: currentTemplate.name,
            subject: currentTemplate.subject,
            body: currentTemplate.body
          });
        if (error) throw error;
        toast({ title: "Template Created", description: "New email template added." });
      }

      await logActivity({
        user_id: admin.id,
        user_name: admin.email,
        user_role: admin.role,
        action: isEditingTemplate ? 'UPDATE_TEMPLATE' : 'CREATE_TEMPLATE',
        target_id: currentTemplate.name,
        target_type: 'EMAIL_TEMPLATE'
      });

      setIsTemplateDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Save Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setIsUpdating(true);
    try {
      const { error } = await (supabase.from('email_templates') as any).delete().eq('id', id);
      if (error) throw error;

      await logActivity({
        user_id: admin.id,
        user_name: admin.email,
        user_role: admin.role,
        action: 'DELETE_TEMPLATE',
        target_id: name,
        target_type: 'EMAIL_TEMPLATE'
      });

      toast({ title: "Template Deleted" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Delete Failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const openAddTemplate = () => {
    setCurrentTemplate({ name: '', subject: '', body: '' });
    setIsEditingTemplate(false);
    setIsTemplateDialogOpen(true);
  };

  const openEditTemplate = (template: any) => {
    setCurrentTemplate(template);
    setIsEditingTemplate(true);
    setIsTemplateDialogOpen(true);
  };

  const handleSaveSla = async () => {
    setIsUpdating(true);
    try {
      const { error } = await (supabase.from('sla_settings') as any)
        .update({
          first_response_target_min: Number(currentSla.first_response_target_min),
          resolution_target_min: Number(currentSla.resolution_target_min),
          email_reply_target_min: Number(currentSla.email_reply_target_min),
          updated_at: new Date()
        })
        .eq('id', currentSla.id);

      if (error) throw error;

      await logActivity({
        user_id: admin.id,
        user_name: admin.email,
        user_role: admin.role,
        action: 'UPDATE_SLA',
        target_id: currentSla.priority,
        target_type: 'SLA_SETTINGS'
      });

      toast({ title: "SLA Updated", description: `${currentSla.priority} priority targets saved.` });
      setIsSlaDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveSlaEmailPrompt = async () => {
    if (!slaEmailPromptDraft.trim()) {
      toast({ title: 'Prompt Required', description: 'The prompt cannot be empty.', variant: 'destructive' });
      return;
    }
    setIsSavingPrompt(true);
    try {
      const { error } = await (supabase.from('admin_settings') as any)
        .update({ value: slaEmailPromptDraft.trim(), updated_at: new Date().toISOString() })
        .eq('key', 'sla_email_prompt');
      if (error) throw error;
      setSlaEmailPrompt(slaEmailPromptDraft.trim());
      toast({ title: 'Prompt Saved', description: 'The SLA breach email prompt has been updated.' });
    } catch (err: any) {
      toast({ title: 'Save Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const openEditSla = (sla: any) => {
    setCurrentSla(sla);
    setIsSlaDialogOpen(true);
  };

  const initiate2FASetup = () => {
    const secret = generateSecret({ length: 20 });
    setTempSecret(secret);
    setShow2FASetup(true);
  };

  const handleVerifyAndEnable2FA = async () => {
    try {
      const isValid = verifySync({ token: totpCode, secret: tempSecret });
      if (!isValid) {
        toast({
          title: "Verification Failed",
          description: "The 6-digit code is incorrect. Please check your app.",
          variant: "destructive"
        });
        return;
      }
    } catch (err) {
      toast({
        title: "Code Error",
        description: "Invalid code format.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await (supabase
        .from('admin_users') as any)
        .update({
          totp_secret: tempSecret,
          totp_enabled: true
        })
        .eq('id', admin.id);

      if (error) throw error;

      await logActivity({
        user_id: admin.id,
        user_name: admin.email,
        user_role: admin.role,
        action: 'ENABLE_2FA',
        target_id: admin.email,
        target_type: 'ADMIN_USER'
      });

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication is now active on your account."
      });
      setShow2FASetup(false);
      fetchData();
    } catch (err) {
      toast({ title: "Setup Failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This decreases your account security.')) return;
    
    setIsUpdating(true);
    try {
      const { error } = await (supabase
        .from('admin_users') as any)
        .update({
          totp_secret: null,
          totp_enabled: false
        })
        .eq('id', admin.id);

      if (error) throw error;

      await logActivity({
        user_id: admin.id,
        user_name: admin.email,
        user_role: admin.role,
        action: 'DISABLE_2FA',
        target_id: admin.email,
        target_type: 'ADMIN_USER'
      });

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been removed."
      });
      fetchData();
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      <div className="container pt-4"><AdminRoleWarning /></div>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="border-white/20 hover:bg-white/10" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-blue-400" />
                Security Settings
              </h1>
              <p className="text-slate-400">Manage account security and authentication preferences</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 container max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl">
                    {admin.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-xl">{admin.full_name}</h2>
                    <p className="text-sm text-slate-500">{admin.email}</p>
                    <Badge className="mt-2 uppercase text-[10px] tracking-widest">{admin.role}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                      Email Templates
                    </CardTitle>
                    <CardDescription>Standardize your replies to support escalations.</CardDescription>
                  </div>
                  <Button size="sm" onClick={openAddTemplate} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {templates.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed">
                        <Mail className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>No templates defined yet.</p>
                      </div>
                    ) : (
                      templates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border group hover:border-blue-200 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900">{template.name}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1">{template.subject}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditTemplate(template)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDeleteTemplate(template.id, template.name)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{isEditingTemplate ? 'Edit Template' : 'Add New Template'}</DialogTitle>
                  <DialogDescription>
                    Create a reusable template for your support replies. Use placeholders like {"{{customer_name}}"}, {"{{ticket_id}}"}, and {"{{admin_name}}"}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input 
                      id="template-name" 
                      placeholder="e.g., Ticket Resolved" 
                      value={currentTemplate.name}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                      disabled={isEditingTemplate}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-subject">Default Subject Line</Label>
                    <Input 
                      id="template-subject" 
                      placeholder="e.g., Re: Your Support Ticket {{ticket_id}}" 
                      value={currentTemplate.subject}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-body">Message Body</Label>
                    <Textarea 
                      id="template-body" 
                      placeholder="Write your email content here..." 
                      className="min-h-[200px]"
                      value={currentTemplate.body}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, body: e.target.value })}
                    />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border text-[10px] space-y-1">
                    <p className="font-bold text-slate-700 flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" /> Available Placeholders:
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-500">
                      <span>{"{{customer_name}}"}: Customer Full Name</span>
                      <span>{"{{ticket_id}}"}: Ticket or Escalation ID</span>
                      <span>{"{{admin_name}}"}: Your Name</span>
                      <span>{"{{company_name}}"}: VedTech Services</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveTemplate} disabled={isUpdating}>
                    {isUpdating ? <LoadingSpinner size={16} /> : 'Save Template'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-blue-500" />
                  SLA Target Configurations
                </CardTitle>
                <CardDescription>Define target response and resolution times by priority.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {slaSettings.map((sla) => (
                    <div key={sla.id} className="p-4 bg-white border rounded-xl shadow-sm hover:border-blue-200 transition-colors group">
                      <div className="flex justify-between items-center mb-4">
                        <Badge className={cn(
                          "uppercase text-[10px]",
                          sla.priority === 'High' ? 'bg-red-100 text-red-700' :
                          sla.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        )}>
                          {sla.priority} Priority
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => openEditSla(sla)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1"><Zap className="h-3 w-3" /> 1st Response:</span>
                          <span className="font-bold">{sla.first_response_target_min}m</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Resolution:</span>
                          <span className="font-bold">{sla.resolution_target_min}m</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3" /> Email Reply:</span>
                          <span className="font-bold">{sla.email_reply_target_min}m</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Dialog open={isSlaDialogOpen} onOpenChange={setIsSlaDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit {currentSla.priority} SLA Targets</DialogTitle>
                  <DialogDescription>Set the maximum time (in minutes) allowed for each action.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>First Response (Minutes)</Label>
                    <Input 
                      type="number" 
                      value={currentSla.first_response_target_min}
                      onChange={(e) => setCurrentSla({ ...currentSla, first_response_target_min: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resolution Time (Minutes)</Label>
                    <Input 
                      type="number" 
                      value={currentSla.resolution_target_min}
                      onChange={(e) => setCurrentSla({ ...currentSla, resolution_target_min: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Reply Time (Minutes)</Label>
                    <Input 
                      type="number" 
                      value={currentSla.email_reply_target_min}
                      onChange={(e) => setCurrentSla({ ...currentSla, email_reply_target_min: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSlaDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveSla} disabled={isUpdating}>
                    {isUpdating ? <LoadingSpinner size={16} /> : 'Update Targets'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-500" />
                  SLA Breach Email — AI Prompt
                </CardTitle>
                <CardDescription>
                  Customise the instructions given to the AI when it generates SLA breach and approaching-deadline emails. Changes apply to all future automated alerts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  className="min-h-[160px] font-mono text-xs leading-relaxed"
                  placeholder="Enter your custom AI prompt instructions here…"
                  value={slaEmailPromptDraft}
                  onChange={(e) => setSlaEmailPromptDraft(e.target.value)}
                />
                <div className="bg-slate-50 p-3 rounded-lg border text-[10px] space-y-1">
                  <p className="font-bold text-slate-700 flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" /> Tips:
                  </p>
                  <ul className="text-slate-500 space-y-0.5 list-disc list-inside">
                    <li>The system appends breach/approaching context automatically after your prompt.</li>
                    <li>Specify tone, formatting, word-count limits, or brand guidelines here.</li>
                    <li>Use "inline CSS" instructions if you want custom email styling.</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-slate-600"
                  onClick={() => setSlaEmailPromptDraft(slaEmailPrompt)}
                  disabled={slaEmailPromptDraft === slaEmailPrompt || isSavingPrompt}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Discard Changes
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={handleSaveSlaEmailPrompt}
                  disabled={isSavingPrompt || slaEmailPromptDraft.trim() === slaEmailPrompt.trim()}
                >
                  {isSavingPrompt ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Prompt
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-blue-500" />
                  Two-Factor Authentication (2FA)
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your admin account by requiring a code from an authenticator app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${admin.totp_enabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                      {admin.totp_enabled ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="font-bold">Authenticator App</div>
                      <div className="text-xs text-slate-500">
                        {admin.totp_enabled ? 'Actively protecting your account' : 'Highly recommended for Super Admins'}
                      </div>
                    </div>
                  </div>
                  {admin.totp_enabled ? (
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDisable2FA} disabled={isUpdating}>
                      Disable 2FA
                    </Button>
                  ) : (
                    <Button size="sm" onClick={initiate2FASetup}>
                      Setup 2FA
                    </Button>
                  )}
                </div>

                {show2FASetup && (
                  <div className="p-6 bg-blue-50/50 rounded-xl border-2 border-dashed border-blue-200 space-y-6 animate-in fade-in slide-in-from-top-4">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="bg-white p-3 rounded-lg border shadow-sm">
                        <QRCodeDataUrl 
                          text={generateURI({ secret: tempSecret, label: admin.email, issuer: 'VedTechServices' })}
                          width={180}
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <QrCode className="h-4 w-4" />
                            1. Scan QR Code
                          </h4>
                          <p className="text-xs text-slate-600">Scan this image using Google Authenticator or Authy on your mobile device.</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            2. Enter Code
                          </h4>
                          <p className="text-xs text-slate-600 mb-3">Enter the 6-digit code from your app to verify setup.</p>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="000000" 
                              className="text-center font-mono tracking-widest text-lg"
                              value={totpCode}
                              onChange={(e) => setTotpCode(e.target.value)}
                              maxLength={6}
                            />
                            <Button onClick={handleVerifyAndEnable2FA} disabled={isUpdating || totpCode.length < 6}>
                              {isUpdating ? <LoadingSpinner className="h-4 w-4" /> : 'Enable'}
                            </Button>
                          </div>
                          <p className="text-[10px] text-blue-500 mt-2 font-medium italic">Security: Your secret is generated locally.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-slate-600" />
                  Password Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                  <div>
                    <div className="font-bold">Last Password Change</div>
                    <div className="text-xs text-slate-500">2 months ago</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/login?reset=true')}>
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminSettings;

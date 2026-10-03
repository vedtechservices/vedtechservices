import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/next-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/db/supabase';
import { ArrowLeft, Save, Eye, RotateCcw, Palette, Mail } from 'lucide-react';
import { toast } from 'sonner';
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';

interface EmailTemplateSettings {
  id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url: string | null;
  footer_content: string | null;
  company_name: string;
  company_tagline: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_website: string;
}

export default function AdminEmailTemplateSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<EmailTemplateSettings | null>(null);
  const [formData, setFormData] = useState({
    primary_color: '#0a1f44',
    secondary_color: '#1e3a8a',
    accent_color: '#3b82f6',
    logo_url: '',
    footer_content: '',
    company_name: 'VED TECH SERVICES',
    company_tagline: 'Digital Solutions | Endless Possibilities',
    company_address: 'Samastipur, Bihar, India',
    company_phone: '+91 7858971869',
    company_email: 'info@vedtechservices.in',
    company_website: 'https://vedtechservices.in',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase
        .from('email_template_settings') as any)
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setFormData({
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color,
          logo_url: data.logo_url || '',
          footer_content: data.footer_content || '',
          company_name: data.company_name,
          company_tagline: data.company_tagline,
          company_address: data.company_address,
          company_phone: data.company_phone,
          company_email: data.company_email,
          company_website: data.company_website,
        });
      }
    } catch (error: any) {
      console.error('Error fetching email template settings:', error);
      toast.error('Failed to fetch email template settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (settings) {
        // Update existing settings
        const { error } = await (supabase
          .from('email_template_settings') as any)
          .update({
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            accent_color: formData.accent_color,
            logo_url: formData.logo_url || null,
            footer_content: formData.footer_content || null,
            company_name: formData.company_name,
            company_tagline: formData.company_tagline,
            company_address: formData.company_address,
            company_phone: formData.company_phone,
            company_email: formData.company_email,
            company_website: formData.company_website,
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await (supabase
          .from('email_template_settings') as any)
          .insert({
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            accent_color: formData.accent_color,
            logo_url: formData.logo_url || null,
            footer_content: formData.footer_content || null,
            company_name: formData.company_name,
            company_tagline: formData.company_tagline,
            company_address: formData.company_address,
            company_phone: formData.company_phone,
            company_email: formData.company_email,
            company_website: formData.company_website,
          });

        if (error) throw error;
      }

      toast.success('Email template settings saved successfully');
      fetchSettings();
    } catch (error: any) {
      console.error('Error saving email template settings:', error);
      toast.error('Failed to save email template settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        accent_color: settings.accent_color,
        logo_url: settings.logo_url || '',
        footer_content: settings.footer_content || '',
        company_name: settings.company_name,
        company_tagline: settings.company_tagline,
        company_address: settings.company_address,
        company_phone: settings.company_phone,
        company_email: settings.company_email,
        company_website: settings.company_website,
      });
      toast.info('Form reset to saved values');
    }
  };

  const generatePreviewHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 50%, ${formData.accent_color} 100%); padding: 40px 20px; text-align: center; }
            .logo { width: 60px; height: 60px; margin: 0 auto 15px; background-color: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.3); }
            .logo-text { color: white; font-size: 24px; font-weight: bold; }
            .company-name { color: white; font-size: 28px; font-weight: bold; margin: 0 0 8px 0; }
            .tagline { color: rgba(255,255,255,0.9); font-size: 14px; margin: 0; }
            .content { padding: 30px 20px; }
            .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
            .summary-cards { display: flex; gap: 10px; margin: 20px 0; }
            .summary-card { flex: 1; background-color: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center; }
            .summary-label { font-size: 12px; color: #666; margin-bottom: 5px; }
            .summary-value { font-size: 24px; font-weight: bold; color: ${formData.accent_color}; }
            .cta-button { display: inline-block; background-color: ${formData.accent_color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .footer-content { margin-bottom: 10px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${formData.logo_url ? `<img src="${formData.logo_url}" alt="Logo" style="width: 60px; height: 60px; margin-bottom: 15px;">` : `<div class="logo"><span class="logo-text">VS</span></div>`}
              <h1 class="company-name">${formData.company_name}</h1>
              <p class="tagline">${formData.company_tagline}</p>
            </div>
            <div class="content">
              <p class="greeting">Hello,</p>
              <p>This is a preview of your customized email template. Your scheduled reports will be sent using this design.</p>
              <div class="summary-cards">
                <div class="summary-card">
                  <div class="summary-label">TOTAL CUSTOMERS</div>
                  <div class="summary-value">150</div>
                </div>
                <div class="summary-card">
                  <div class="summary-label">NEW LEADS</div>
                  <div class="summary-value">25</div>
                </div>
                <div class="summary-card">
                  <div class="summary-label">REVENUE</div>
                  <div class="summary-value">$12.5K</div>
                </div>
              </div>
              <p>Your report data will appear here with detailed metrics and insights.</p>
              <center>
                <a href="#" class="cta-button">View Full Report in Dashboard</a>
              </center>
            </div>
            <div class="footer">
              ${formData.footer_content ? `<div class="footer-content">${formData.footer_content}</div>` : ''}
              <div class="footer-content">
                <strong>${formData.company_name}</strong><br>
                ${formData.company_address}<br>
                Phone: ${formData.company_phone} | Email: ${formData.company_email}<br>
                <a href="${formData.company_website}" style="color: ${formData.accent_color};">${formData.company_website}</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="container pt-4"><AdminRoleWarning /></div>
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white border border-white/20 hover:bg-white/10"
                onClick={() => navigate('/admin/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Email Template Settings</h1>
                <p className="text-sm text-blue-200">Customize email branding and appearance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white border border-white/20 hover:bg-white/10"
                onClick={handleReset}
                disabled={loading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-muted" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="branding" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="branding">
                <Palette className="h-4 w-4 mr-2" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="content">
                <Mail className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* Branding Tab */}
            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Colors & Logo</CardTitle>
                  <CardDescription>Customize the color scheme and logo for your email templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="w-20 h-10 px-2"
                        />
                        <Input
                          type="text"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="flex-1"
                          placeholder="#0a1f44"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Header gradient start</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary_color">Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          className="w-20 h-10 px-2"
                        />
                        <Input
                          type="text"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          className="flex-1"
                          placeholder="#1e3a8a"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Header gradient middle</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accent_color">Accent Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="accent_color"
                          type="color"
                          value={formData.accent_color}
                          onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                          className="w-20 h-10 px-2"
                        />
                        <Input
                          type="text"
                          value={formData.accent_color}
                          onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                          className="flex-1"
                          placeholder="#3b82f6"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Buttons and highlights</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                    <Input
                      id="logo_url"
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to use default logo. Recommended size: 60x60px
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Update company details displayed in email templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="VED TECH SERVICES"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_tagline">Company Tagline</Label>
                      <Input
                        id="company_tagline"
                        value={formData.company_tagline}
                        onChange={(e) => setFormData({ ...formData, company_tagline: e.target.value })}
                        placeholder="Digital Solutions | Endless Possibilities"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_address">Company Address</Label>
                    <Input
                      id="company_address"
                      value={formData.company_address}
                      onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                      placeholder="Samastipur, Bihar, India"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="company_phone">Phone</Label>
                      <Input
                        id="company_phone"
                        value={formData.company_phone}
                        onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                        placeholder="+91 7858971869"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_email">Email</Label>
                      <Input
                        id="company_email"
                        type="email"
                        value={formData.company_email}
                        onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                        placeholder="info@vedtechservices.in"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_website">Website</Label>
                      <Input
                        id="company_website"
                        type="url"
                        value={formData.company_website}
                        onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                        placeholder="https://vedtechservices.in"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_content">Custom Footer Content (Optional)</Label>
                    <Textarea
                      id="footer_content"
                      value={formData.footer_content}
                      onChange={(e) => setFormData({ ...formData, footer_content: e.target.value })}
                      placeholder="Add custom footer text, disclaimers, or additional information..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      This content will appear above the company contact information in the email footer
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Email Template Preview</CardTitle>
                  <CardDescription>Preview how your customized email template will look</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <iframe
                      srcDoc={generatePreviewHTML()}
                      className="w-full h-[600px] border-0"
                      title="Email Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

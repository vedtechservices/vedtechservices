import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/next-router';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Mail, 
  Send, 
  Calendar,
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
  Download,
  Plus
} from 'lucide-react';
import type { EmailCampaign, CustomerSegment } from '@/types';
import { crmOperation, validateEmailFormat } from '@/lib/crmOperations';

export default function EmailCampaigns() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [metrics, setMetrics] = useState({
    total: 0,
    sent: 0,
    scheduled: 0,
    avgOpenRate: 0
  });

  const [newCampaign, setNewCampaign] = useState({
    campaign_name: '',
    subject_line: '',
    email_content: '',
    campaign_type: 'Newsletter' as const,
    sender_name: 'VedTech Services',
    sender_email: 'info@vedtechservices.in',
    target_segment_id: '',
    scheduled_at: '',
    status: 'Draft' as const
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      const campaigns = (campaignsData || []) as EmailCampaign[];
      setCampaigns(campaigns);

      // Calculate metrics
      const total = campaigns.length;
      const sent = campaigns.filter(c => c.status === 'Sent').length;
      const scheduled = campaigns.filter(c => c.status === 'Scheduled').length;
      const sentCampaigns = campaigns.filter(c => c.status === 'Sent' && c.recipients_count > 0);
      const avgOpenRate = sentCampaigns.length > 0
        ? sentCampaigns.reduce((sum, c) => sum + c.open_rate, 0) / sentCampaigns.length
        : 0;

      setMetrics({ total, sent, scheduled, avgOpenRate });

      // Fetch segments
      const { data: segmentsData, error: segmentsError } = await supabase
        .from('customer_segments')
        .select('*')
        .order('segment_name');

      if (segmentsError) throw segmentsError;

      setSegments((segmentsData || []) as CustomerSegment[]);

    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    const errors: string[] = [];
    if (!newCampaign.campaign_name.trim()) errors.push('Campaign name is required.');
    else if (newCampaign.campaign_name.trim().length < 3) errors.push('Campaign name must be at least 3 characters.');
    if (!newCampaign.subject_line.trim()) errors.push('Email subject is required.');
    else if (newCampaign.subject_line.trim().length < 5) errors.push('Email subject must be at least 5 characters.');
    if (!newCampaign.email_content.trim()) errors.push('Email content is required.');
    if (newCampaign.sender_email) {
      const emailErr = validateEmailFormat(newCampaign.sender_email);
      if (emailErr) errors.push(`Sender email: ${emailErr}`);
    }

    if (errors.length > 0) {
      errors.forEach(e => toast.error(e));
      return;
    }

    try {
      const result = await crmOperation({
        table: 'email_campaigns',
        action: 'CREATE',
        data: {
          campaign_name: newCampaign.campaign_name,
          campaign_type: newCampaign.campaign_type,
          subject_line: newCampaign.subject_line,
          sender_name: newCampaign.sender_name,
          sender_email: newCampaign.sender_email,
          email_content: newCampaign.email_content,
          email_subject: newCampaign.subject_line,
          recipient_selection: newCampaign.target_segment_id ? { segment_id: newCampaign.target_segment_id } : null,
          scheduled_at: newCampaign.scheduled_at || null,
          campaign_status: newCampaign.status,
          status: newCampaign.status,
          recipients_count: 0,
          open_rate: 0,
          click_rate: 0,
          bounce_rate: 0,
          unsubscribe_rate: 0
        }
      });

      if (!result.success) {
        (result.errors ?? [result.error ?? 'Failed to create campaign.']).forEach(e => toast.error(e));
        return;
      }

      toast.success('Campaign created and audited successfully');
      setShowCreateDialog(false);
      setNewCampaign({
        campaign_name: '',
        subject_line: '',
        email_content: '',
        campaign_type: 'Newsletter',
        sender_name: 'VedTech Services',
        sender_email: 'info@vedtechservices.in',
        target_segment_id: '',
        scheduled_at: '',
        status: 'Draft'
      });
      fetchData();

    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) return;

    try {
      const result = await crmOperation({
        table: 'email_campaigns',
        action: 'UPDATE',
        record_id: campaignId,
        data: { status: 'Sent', sent_at: new Date().toISOString() }
      });

      if (!result.success) {
        toast.error(result.errors?.[0] ?? 'Failed to send campaign');
        return;
      }

      toast.success('Campaign sent successfully');
      fetchData();

    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    }
  };

  const filteredCampaigns = filterStatus === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.status === filterStatus);

  const exportToCSV = () => {
    const headers = ['Campaign Name', 'Status', 'Recipients', 'Open Rate', 'Click Rate'];
    const rows = filteredCampaigns.map(c => [
      c.campaign_name,
      c.status,
      c.recipients_count,
      (c.open_rate * 100).toFixed(2) + '%',
      (c.click_rate * 100).toFixed(2) + '%'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email_campaigns_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Campaign data exported successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'Scheduled': return 'default';
      case 'Sent': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/admin/crm')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Email Campaigns</h1>
              <p className="text-muted-foreground">Create and manage email marketing campaigns</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Email Campaign</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-name">Campaign Name *</Label>
                    <Input
                      id="campaign-name"
                      value={newCampaign.campaign_name}
                      onChange={(e) => setNewCampaign({ ...newCampaign, campaign_name: e.target.value })}
                      placeholder="Summer Sale 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line *</Label>
                    <Input
                      id="subject"
                      value={newCampaign.subject_line}
                      onChange={(e) => setNewCampaign({ ...newCampaign, subject_line: e.target.value })}
                      placeholder="Don't miss our summer sale!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body">Email Body *</Label>
                    <Textarea
                      id="body"
                      value={newCampaign.email_content}
                      onChange={(e) => setNewCampaign({ ...newCampaign, email_content: e.target.value })}
                      placeholder="Write your email content here..."
                      rows={8}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="segment">Target Segment</Label>
                      <Select
                        value={newCampaign.target_segment_id}
                        onValueChange={(value) => setNewCampaign({ ...newCampaign, target_segment_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Customers</SelectItem>
                          {segments.map(segment => (
                            <SelectItem key={segment.id} value={segment.id}>
                              {segment.segment_name} ({segment.customer_count})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schedule">Schedule Date (Optional)</Label>
                      <Input
                        id="schedule"
                        type="datetime-local"
                        value={newCampaign.scheduled_at}
                        onChange={(e) => setNewCampaign({ ...newCampaign, scheduled_at: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCampaign}>
                    Create Campaign
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.total}</div>
                  <p className="text-xs text-muted-foreground">All campaigns</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
              <Send className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.sent}</div>
                  <p className="text-xs text-muted-foreground">Successfully sent</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.scheduled}</div>
                  <p className="text-xs text-muted-foreground">Pending send</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.avgOpenRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Across all campaigns</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Campaign List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Campaigns</CardTitle>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full bg-muted" />
                ))}
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No campaigns found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCampaigns.map(campaign => (
                  <div
                    key={campaign.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{campaign.campaign_name}</h3>
                          <Badge variant={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{campaign.subject_line}</p>
                        
                        <div className="flex items-center gap-6 mt-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{campaign.recipients_count} recipients</span>
                          </div>
                          {campaign.status === 'Sent' && (
                            <>
                              <div className="flex items-center gap-1 text-sm">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <span>{(campaign.open_rate * 100).toFixed(1)}% open rate</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                                <span>{(campaign.click_rate * 100).toFixed(1)}% click rate</span>
                              </div>
                            </>
                          )}
                          {campaign.scheduled_at && (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{new Date(campaign.scheduled_at).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {campaign.status === 'Draft' && (
                        <Button 
                          size="sm"
                          onClick={() => handleSendCampaign(campaign.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

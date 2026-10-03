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
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Search, 
  Mail, 
  Phone,
  Building2,
  Download,
  ArrowLeft,
  Calendar,
  DollarSign,
  Target,
  Loader2,
  AlertCircle
} from 'lucide-react';
import type { Lead } from '@/types';
import { crmOperation, validateEmailFormat, validatePhoneFormat } from '@/lib/crmOperations';

export default function LeadManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    newLeads: 0,
    converted: 0,
    conversionRate: 0
  });

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    lead_source: 'Website Form',
    estimated_deal_value: 0,
    notes: ''
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const leadsData = (data || []) as Lead[];
      setLeads(leadsData);

      // Calculate metrics
      const total = leadsData.length;
      const newLeads = leadsData.filter(l => l.lead_status === 'New').length;
      const converted = leadsData.filter(l => l.lead_status === 'Won').length;
      const conversionRate = total > 0 ? (converted / total) * 100 : 0;

      setMetrics({ total, newLeads, converted, conversionRate });

    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leads',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async () => {
    setFormErrors([]);

    // Client-side pre-validation for instant feedback
    const clientErrors: string[] = [];
    if (!newLead.name.trim()) clientErrors.push('Name is required.');
    const emailErr = validateEmailFormat(newLead.email);
    if (emailErr) clientErrors.push(emailErr);
    const phoneErr = validatePhoneFormat(newLead.phone);
    if (phoneErr) clientErrors.push(phoneErr);
    if (newLead.estimated_deal_value < 0) clientErrors.push('Estimated deal value must be 0 or greater.');

    if (clientErrors.length > 0) {
      setFormErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await crmOperation({
        table: 'leads',
        action: 'CREATE',
        data: {
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone || null,
          company_name: newLead.company_name || null,
          lead_source: newLead.lead_source,
          estimated_deal_value: newLead.estimated_deal_value,
          notes: newLead.notes || null,
          lead_status: 'New',
          lead_score: 0
        }
      });

      if (!result.success) {
        setFormErrors(result.errors ?? [result.error ?? 'Failed to add lead.']);
        return;
      }

      toast({ title: 'Lead Added', description: 'Lead has been created and logged successfully.' });
      setShowAddDialog(false);
      setFormErrors([]);
      setNewLead({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        lead_source: 'Website Form',
        estimated_deal_value: 0,
        notes: ''
      });
      fetchLeads();
    } catch (err: any) {
      console.error('Error adding lead:', err);
      toast({
        title: 'Error adding lead',
        description: err.message || 'Unexpected error. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };


  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || lead.lead_status === filterStatus;
    const matchesSource = filterSource === 'all' || lead.lead_source === filterSource;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Deal Value', 'Score'];
    const rows = filteredLeads.map(l => [
      l.name,
      l.email || '',
      l.phone || '',
      l.company_name || '',
      l.lead_status,
      l.lead_source,
      l.estimated_deal_value,
      l.lead_score
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast({
      title: 'Success',
      description: 'Lead data exported successfully'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-500';
      case 'Contacted': return 'bg-purple-500';
      case 'Qualified': return 'bg-yellow-500';
      case 'Proposal Sent': return 'bg-orange-500';
      case 'Negotiation': return 'bg-pink-500';
      case 'Won': return 'bg-green-500';
      case 'Lost': return 'bg-red-500';
      default: return 'bg-muted';
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
              <h1 className="text-3xl font-bold">Lead Management</h1>
              <p className="text-muted-foreground">Track and convert leads into customers</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newLead.name}
                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newLead.email}
                        onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newLead.phone}
                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        value={newLead.company_name}
                        onChange={(e) => setNewLead({ ...newLead, company_name: e.target.value })}
                        placeholder="Acme Corp"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="source">Lead Source</Label>
                      <Select
                        value={newLead.lead_source}
                        onValueChange={(value) => setNewLead({ ...newLead, lead_source: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Website Form">Website Form</SelectItem>
                          <SelectItem value="Phone Call">Phone Call</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Referral">Referral</SelectItem>
                          <SelectItem value="Social Media">Social Media</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deal_value">Estimated Deal Value (₹)</Label>
                      <Input
                        id="deal_value"
                        type="number"
                        value={newLead.estimated_deal_value}
                        onChange={(e) => setNewLead({ ...newLead, estimated_deal_value: parseFloat(e.target.value) || 0 })}
                        placeholder="50000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newLead.notes}
                      onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                      placeholder="Additional information about the lead..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {formErrors.length > 0 && (
                    <div className="w-full rounded-md bg-destructive/10 border border-destructive/30 p-3 mb-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        <ul className="text-sm text-destructive space-y-1">
                          {formErrors.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setShowAddDialog(false); setFormErrors([]); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddLead} disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Lead
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
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.total}</div>
                  <p className="text-xs text-muted-foreground">All leads in pipeline</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.newLeads}</div>
                  <p className="text-xs text-muted-foreground">Awaiting contact</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Converted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.converted}</div>
                  <p className="text-xs text-muted-foreground">Won deals</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Success rate</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lead List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lead List</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="Website Form">Website Form</SelectItem>
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full bg-muted" />
                ))}
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No leads found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeads.map(lead => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/crm/leads/${lead.id}`)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(lead.lead_status)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{lead.name}</h3>
                          <Badge variant="outline">{lead.lead_status}</Badge>
                          <Badge variant="secondary">{lead.lead_source}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </span>
                          )}
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </span>
                          )}
                          {lead.company_name && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {lead.company_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ₹{lead.estimated_deal_value.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Score: {lead.lead_score}/100
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won'].map((status, index) => {
                const count = leads.filter(l => l.lead_status === status).length;
                const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
                
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{status}</span>
                      <span className="font-medium">{count} leads ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStatusColor(status)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@/lib/next-router';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  DollarSign,
  Target,
  UserCheck,
  Edit,
  Trash2
} from 'lucide-react';
import type { Lead } from '@/types';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id as string)
        .maybeSingle();

      if (error) throw error;

      setLead(data as Lead | null);

    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToCustomer = async () => {
    try {
      if (!lead) return;

      // Create customer from lead
      const customerData = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        customer_type: (lead.company_name ? 'Business' : 'Individual') as 'Business' | 'Individual',
        status: 'Active' as const,
        notes: lead.notes,
        lifetime_value: lead.estimated_deal_value,
        registration_date: new Date().toISOString().split('T')[0],
        health_score: 'Green' as const
      };

      const { error: customerError } = await (supabase.from('customers') as any).insert([customerData]);

      if (customerError) throw customerError;

      // Update lead status to Won
      const { error: leadError } = await (supabase.from('leads') as any).update({ lead_status: 'Won' }).eq('id', lead.id);

      if (leadError) throw leadError;

      toast.success('Lead converted to customer successfully');
      setShowConvertDialog(false);
      navigate('/admin/crm');

    } catch (error) {
      console.error('Error converting lead:', error);
      toast.error('Failed to convert lead to customer');
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id);

      if (error) throw error;

      toast.success('Lead deleted successfully');
      navigate('/admin/crm/leads');

    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-12 w-64 bg-muted" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 bg-muted" />
            <Skeleton className="h-64 bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Lead not found</p>
            <Button onClick={() => navigate('/admin/crm/leads')} className="mt-4">
              Back to Leads
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              onClick={() => navigate('/admin/crm/leads')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{lead.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{lead.lead_status}</Badge>
                <Badge variant="secondary">{lead.lead_source}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            {lead.lead_status !== 'Won' && lead.lead_status !== 'Lost' && (
              <Button onClick={() => setShowConvertDialog(true)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Convert to Customer
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Lead Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">{lead.name}</div>
              </div>

              {lead.email && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                      {lead.email}
                    </a>
                  </div>
                </div>
              )}

              {lead.phone && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}

              {lead.company_name && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Company</div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.company_name}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Lead Source</div>
                <Badge variant="secondary">{lead.lead_source}</Badge>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Created Date</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(lead.lead_status)}`} />
                  <span className="font-medium">{lead.lead_status}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Estimated Deal Value</div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">₹{lead.estimated_deal_value.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Lead Score</div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{lead.lead_score}/100</span>
                      <span className="text-xs text-muted-foreground">
                        {lead.lead_score >= 70 ? 'Hot' : lead.lead_score >= 40 ? 'Warm' : 'Cold'}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          lead.lead_score >= 70 ? 'bg-green-500' : 
                          lead.lead_score >= 40 ? 'bg-yellow-500' : 
                          'bg-blue-500'
                        }`}
                        style={{ width: `${lead.lead_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {lead.tags && lead.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {lead.notes && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Convert to Customer Dialog */}
        <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert Lead to Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground">
                Are you sure you want to convert this lead to a customer? This will:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Create a new customer profile with the lead's information</li>
                <li>Mark the lead status as "Won"</li>
                <li>Set the customer's lifetime value to the estimated deal value</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleConvertToCustomer}>
                Convert to Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

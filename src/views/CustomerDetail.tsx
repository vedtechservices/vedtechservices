import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@/lib/next-router';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  MessageSquare,
  PhoneCall,
  Video,
  FileText,
  Activity
} from 'lucide-react';
import type { Customer, CustomerInteraction } from '@/types';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    customer_type: 'Individual' as 'Individual' | 'Business',
    status: 'Active' as 'Active' | 'Inactive',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      // Fetch customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id as string)
        .maybeSingle();

      if (customerError) throw customerError;

      const customer = customerData as Customer | null;
      setCustomer(customer);

      if (customer) {
        setEditForm({
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          customer_type: customer.customer_type,
          status: customer.status,
          notes: customer.notes || ''
        });
      }

      // Fetch interactions
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('customer_interactions')
        .select('*')
        .eq('customer_id', id as string)
        .order('interaction_date', { ascending: false });

      if (interactionsError) throw interactionsError;

      setInteractions((interactionsData || []) as CustomerInteraction[]);

      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('customer_id', id as string)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ticketsError) throw ticketsError;

      setTickets(ticketsData || []);

    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      if (!customer) return;

      const { error } = await (supabase.from('customers') as any)
        .update({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          customer_type: editForm.customer_type,
          status: editForm.status,
          notes: editForm.notes
        })
        .eq('id', customer.id);

      if (error) throw error;

      toast.success('Customer updated successfully');
      setShowEditDialog(false);
      fetchCustomerData();

    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customer) return;
    
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id);

      if (error) throw error;

      toast.success('Customer deleted successfully');
      navigate('/admin/crm');

    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const getHealthScoreColor = (score: string) => {
    switch (score) {
      case 'Green': return 'bg-green-500';
      case 'Yellow': return 'bg-yellow-500';
      case 'Red': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'Call': return <PhoneCall className="h-4 w-4" />;
      case 'Email': return <Mail className="h-4 w-4" />;
      case 'Meeting': return <Video className="h-4 w-4" />;
      case 'Note': return <FileText className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
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

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Customer not found</p>
            <Button onClick={() => navigate('/admin/crm')} className="mt-4">
              Back to CRM
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold">{customer.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                  {customer.status}
                </Badge>
                <Badge variant="outline">{customer.customer_type}</Badge>
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${getHealthScoreColor(customer.health_score)}`} />
                  <span className="text-sm text-muted-foreground">{customer.health_score} Health</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDeleteCustomer}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Customer Profile */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Customer Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.email && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${customer.email}`} className="text-primary hover:underline text-sm">
                      {customer.email}
                    </a>
                  </div>
                </div>
              )}

              {customer.phone && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${customer.phone}`} className="text-primary hover:underline text-sm">
                      {customer.phone}
                    </a>
                  </div>
                </div>
              )}

              {customer.address && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{customer.address}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Registration Date</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{new Date(customer.registration_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Lifetime Value</div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xl font-bold">₹{customer.lifetime_value.toLocaleString()}</span>
                </div>
              </div>

              {customer.tags && customer.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {customer.notes && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline & Tickets */}
          <div className="md:col-span-2 space-y-6">
            {/* Recent Tickets */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                {tickets.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No tickets found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map(ticket => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/tickets`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">#{ticket.ticket_id}</span>
                            <Badge variant="outline">{ticket.status}</Badge>
                            <Badge variant="secondary">{ticket.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{ticket.subject}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interaction Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Interaction Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {interactions.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No interactions recorded
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interactions.map(interaction => (
                      <div key={interaction.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {getInteractionIcon(interaction.interaction_type)}
                          </div>
                          <div className="w-px h-full bg-border mt-2" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{interaction.interaction_type}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(interaction.interaction_date).toLocaleString()}
                            </span>
                          </div>
                          {interaction.interaction_data && typeof interaction.interaction_data === 'object' && 'subject' in interaction.interaction_data && (
                            <p className="text-sm font-medium mt-1">{String(interaction.interaction_data.subject)}</p>
                          )}
                          {interaction.interaction_data && typeof interaction.interaction_data === 'object' && 'notes' in interaction.interaction_data && (
                            <p className="text-sm text-muted-foreground mt-1">{String(interaction.interaction_data.notes)}</p>
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

        {/* Edit Customer Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Customer Type</Label>
                  <Select
                    value={editForm.customer_type}
                    onValueChange={(value) => setEditForm({ ...editForm, customer_type: value as 'Individual' | 'Business' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value as 'Active' | 'Inactive' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCustomer}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Download,
  Filter,
  Save,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
} from 'lucide-react';
import type { Customer, CustomerSegment } from '@/types';

export default function CustomerSegmentation() {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewCustomers, setPreviewCustomers] = useState<Customer[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);

  const [newSegment, setNewSegment] = useState({
    segment_name: '',
    customer_type: 'all',
    amc_status: 'all',
    min_tickets: '',
    max_tickets: '',
    last_service_days: '',
    min_lifetime_value: '',
    tags: '',
    registration_from: '',
    registration_to: '',
    min_engagement_score: '',
    max_engagement_score: '',
    product_purchases: [] as string[],
    ticket_categories: [] as string[],
    country: '',
    state: '',
    city: ''
  });

  const predefinedSegments = [
    {
      name: 'Active AMC Customers',
      description: 'Customers with active AMC subscriptions',
      count: 0,
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      name: 'Expired AMC Customers',
      description: 'Customers with expired AMC subscriptions',
      count: 0,
      icon: TrendingDown,
      color: 'text-red-500'
    },
    {
      name: 'High-Value Customers',
      description: 'Customers with lifetime value > $5000',
      count: 0,
      icon: DollarSign,
      color: 'text-primary'
    },
    {
      name: 'Inactive Customers',
      description: 'No activity in the last 90 days',
      count: 0,
      icon: Users,
      color: 'text-muted-foreground'
    },
    {
      name: 'New Customers',
      description: 'Registered in the last 30 days',
      count: 0,
      icon: Calendar,
      color: 'text-blue-500'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: segmentsData, error: segmentsError } = await (supabase
        .from('customer_segments') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (segmentsError) throw segmentsError;

      const { data: customersData, error: customersError } = await (supabase
        .from('customers') as any)
        .select('*');

      if (customersError) throw customersError;

      setSegments(Array.isArray(segmentsData) ? segmentsData : []);
      setCustomers(Array.isArray(customersData) ? customersData : []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load segments');
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = (criteria: Record<string, unknown>) => {
    return customers.filter(customer => {
      // Apply filters based on criteria
      if (criteria.customer_type && criteria.customer_type !== 'all') {
        if (customer.customer_type !== criteria.customer_type) return false;
      }

      if (criteria.min_lifetime_value) {
        if (customer.lifetime_value < Number(criteria.min_lifetime_value)) return false;
      }

      if (criteria.registration_from) {
        if (new Date(customer.registration_date) < new Date(criteria.registration_from as string)) return false;
      }

      if (criteria.registration_to) {
        if (new Date(customer.registration_date) > new Date(criteria.registration_to as string)) return false;
      }

      // New filters
      if (criteria.min_engagement_score && customer.engagement_score) {
        if (customer.engagement_score < Number(criteria.min_engagement_score)) return false;
      }

      if (criteria.max_engagement_score && customer.engagement_score) {
        if (customer.engagement_score > Number(criteria.max_engagement_score)) return false;
      }

      if (criteria.country && customer.country) {
        if (customer.country !== criteria.country) return false;
      }

      if (criteria.state && customer.state) {
        if (customer.state !== criteria.state) return false;
      }

      if (criteria.city && customer.city) {
        if (customer.city !== criteria.city) return false;
      }

      return true;
    });
  };

  const handleCreateSegment = async () => {
    try {
      if (!newSegment.segment_name) {
        toast.error('Please enter a segment name');
        return;
      }

      const criteria = {
        customer_type: newSegment.customer_type,
        amc_status: newSegment.amc_status,
        min_tickets: newSegment.min_tickets,
        max_tickets: newSegment.max_tickets,
        last_service_days: newSegment.last_service_days,
        min_lifetime_value: newSegment.min_lifetime_value,
        tags: newSegment.tags,
        registration_from: newSegment.registration_from,
        registration_to: newSegment.registration_to
      };

      const matchingCustomers = filterCustomers(criteria);

      const { error } = await (supabase.from('customer_segments') as any).insert([{
        segment_name: newSegment.segment_name,
        segment_criteria: criteria,
        customer_count: matchingCustomers.length
      }]);

      if (error) throw error;

      toast.success('Segment created successfully');
      setShowCreateDialog(false);
      setNewSegment({
        segment_name: '',
        customer_type: 'all',
        amc_status: 'all',
        min_tickets: '',
        max_tickets: '',
        last_service_days: '',
        min_lifetime_value: '',
        tags: '',
        registration_from: '',
        registration_to: '',
        min_engagement_score: '',
        max_engagement_score: '',
        product_purchases: [],
        ticket_categories: [],
        country: '',
        state: '',
        city: ''
      });
      fetchData();

    } catch (error) {
      console.error('Error creating segment:', error);
      toast.error('Failed to create segment');
    }
  };

  const handlePreviewSegment = () => {
    const criteria = {
      customer_type: newSegment.customer_type,
      amc_status: newSegment.amc_status,
      min_tickets: newSegment.min_tickets,
      max_tickets: newSegment.max_tickets,
      last_service_days: newSegment.last_service_days,
      min_lifetime_value: newSegment.min_lifetime_value,
      tags: newSegment.tags,
      registration_from: newSegment.registration_from,
      registration_to: newSegment.registration_to
    };

    const matchingCustomers = filterCustomers(criteria);
    setPreviewCustomers(matchingCustomers);
    setShowPreviewDialog(true);
  };

  const handleDeleteSegment = async (segmentId: string) => {
    try {
      const { error } = await (supabase.from('customer_segments') as any)
        .delete()
        .eq('id', segmentId);

      if (error) throw error;

      toast.success('Segment deleted successfully');
      fetchData();

    } catch (error) {
      console.error('Error deleting segment:', error);
      toast.error('Failed to delete segment');
    }
  };

  const exportSegmentToCSV = (segment: CustomerSegment) => {
    const matchingCustomers = filterCustomers(segment.segment_criteria);
    const headers = ['Name', 'Email', 'Phone', 'Customer Type', 'Status', 'Lifetime Value', 'Registration Date'];
    const rows = matchingCustomers.map(c => [
      c.name,
      c.email || '',
      c.phone || '',
      c.customer_type,
      c.status,
      c.lifetime_value.toString(),
      new Date(c.registration_date).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${segment.segment_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPredefinedSegmentCount = (segmentName: string) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    switch (segmentName) {
      case 'Active AMC Customers':
        return customers.filter(c => c.status === 'Active').length;
      case 'Expired AMC Customers':
        return customers.filter(c => c.status === 'Inactive').length;
      case 'High-Value Customers':
        return customers.filter(c => c.lifetime_value > 5000).length;
      case 'Inactive Customers':
        return customers.filter(c => new Date(c.updated_at) < ninetyDaysAgo).length;
      case 'New Customers':
        return customers.filter(c => new Date(c.registration_date) > thirtyDaysAgo).length;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64 bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-muted" />
          ))}
        </div>
        <Skeleton className="h-96 bg-muted" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Segmentation</h1>
          <p className="text-muted-foreground">Organize and analyze customer groups</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Segment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="segmentName">Segment Name *</Label>
                <Input
                  id="segmentName"
                  value={newSegment.segment_name}
                  onChange={(e) => setNewSegment({ ...newSegment, segment_name: e.target.value })}
                  placeholder="Enter segment name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerType">Customer Type</Label>
                  <Select
                    value={newSegment.customer_type}
                    onValueChange={(value) => setNewSegment({ ...newSegment, customer_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amcStatus">AMC Status</Label>
                  <Select
                    value={newSegment.amc_status}
                    onValueChange={(value) => setNewSegment({ ...newSegment, amc_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="None">No AMC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minTickets">Min Tickets Raised</Label>
                  <Input
                    id="minTickets"
                    type="number"
                    value={newSegment.min_tickets}
                    onChange={(e) => setNewSegment({ ...newSegment, min_tickets: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTickets">Max Tickets Raised</Label>
                  <Input
                    id="maxTickets"
                    type="number"
                    value={newSegment.max_tickets}
                    onChange={(e) => setNewSegment({ ...newSegment, max_tickets: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastService">Last Service (Days Ago)</Label>
                <Input
                  id="lastService"
                  type="number"
                  value={newSegment.last_service_days}
                  onChange={(e) => setNewSegment({ ...newSegment, last_service_days: e.target.value })}
                  placeholder="e.g., 30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minLifetimeValue">Min Lifetime Value ($)</Label>
                <Input
                  id="minLifetimeValue"
                  type="number"
                  value={newSegment.min_lifetime_value}
                  onChange={(e) => setNewSegment({ ...newSegment, min_lifetime_value: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newSegment.tags}
                  onChange={(e) => setNewSegment({ ...newSegment, tags: e.target.value })}
                  placeholder="e.g., premium, enterprise"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationFrom">Registration From</Label>
                  <Input
                    id="registrationFrom"
                    type="date"
                    value={newSegment.registration_from}
                    onChange={(e) => setNewSegment({ ...newSegment, registration_from: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationTo">Registration To</Label>
                  <Input
                    id="registrationTo"
                    type="date"
                    value={newSegment.registration_to}
                    onChange={(e) => setNewSegment({ ...newSegment, registration_to: e.target.value })}
                  />
                </div>
              </div>

              {/* New Enhanced Filters */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-4">Enhanced Segmentation Filters</h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="minEngagement">Min Engagement Score (0-100)</Label>
                    <Input
                      id="minEngagement"
                      type="number"
                      min="0"
                      max="100"
                      value={newSegment.min_engagement_score}
                      onChange={(e) => setNewSegment({ ...newSegment, min_engagement_score: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxEngagement">Max Engagement Score (0-100)</Label>
                    <Input
                      id="maxEngagement"
                      type="number"
                      min="0"
                      max="100"
                      value={newSegment.max_engagement_score}
                      onChange={(e) => setNewSegment({ ...newSegment, max_engagement_score: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label>Product Purchase History</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Hardware Repair', 'Software Development', 'IT Support', 'Network Setup', 'AMC Services', 'Cloud Solutions'].map((product) => (
                      <label key={product} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
                        <input
                          type="checkbox"
                          checked={newSegment.product_purchases.includes(product)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewSegment({
                                ...newSegment,
                                product_purchases: [...newSegment.product_purchases, product]
                              });
                            } else {
                              setNewSegment({
                                ...newSegment,
                                product_purchases: newSegment.product_purchases.filter(p => p !== product)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{product}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label>Support Ticket Categories</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Hardware Issue', 'Software Bug', 'Network Problem', 'Performance Issue', 'Security Concern', 'General Inquiry'].map((category) => (
                      <label key={category} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
                        <input
                          type="checkbox"
                          checked={newSegment.ticket_categories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewSegment({
                                ...newSegment,
                                ticket_categories: [...newSegment.ticket_categories, category]
                              });
                            } else {
                              setNewSegment({
                                ...newSegment,
                                ticket_categories: newSegment.ticket_categories.filter(c => c !== category)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={newSegment.country}
                      onValueChange={(value) => setNewSegment({ ...newSegment, country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="UK">UK</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={newSegment.state}
                      onChange={(e) => setNewSegment({ ...newSegment, state: e.target.value })}
                      placeholder="e.g., California"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newSegment.city}
                      onChange={(e) => setNewSegment({ ...newSegment, city: e.target.value })}
                      placeholder="e.g., San Francisco"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handlePreviewSegment}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSegment}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Segment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Predefined Segments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Predefined Segments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {predefinedSegments.map((segment, index) => {
            const Icon = segment.icon;
            const count = getPredefinedSegmentCount(segment.name);
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${segment.color}`} />
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-sm mb-1">{segment.name}</h3>
                  <p className="text-xs text-muted-foreground">{segment.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Segments */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Segments</CardTitle>
        </CardHeader>
        <CardContent>
          {segments.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No custom segments created yet</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Segment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {segments.map((segment) => (
                <div key={segment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{segment.segment_name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {segment.customer_count} customers
                      </span>
                      <span>Created {new Date(segment.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportSegmentToCSV(segment)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSegment(segment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Segment Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {previewCustomers.length} customers match this criteria
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const headers = ['Name', 'Email', 'Phone', 'Customer Type', 'Status'];
                  const rows = previewCustomers.map(c => [
                    c.name,
                    c.email || '',
                    c.phone || '',
                    c.customer_type,
                    c.status
                  ]);
                  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `segment_preview_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Preview
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Name</th>
                    <th className="text-left p-3 text-sm font-medium">Email</th>
                    <th className="text-left p-3 text-sm font-medium">Type</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Lifetime Value</th>
                  </tr>
                </thead>
                <tbody>
                  {previewCustomers.slice(0, 50).map((customer) => (
                    <tr key={customer.id} className="border-t">
                      <td className="p-3 text-sm">{customer.name}</td>
                      <td className="p-3 text-sm">{customer.email || 'N/A'}</td>
                      <td className="p-3 text-sm">{customer.customer_type}</td>
                      <td className="p-3 text-sm">
                        <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                          {customer.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">${customer.lifetime_value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewCustomers.length > 50 && (
                <div className="p-3 text-center text-sm text-muted-foreground border-t">
                  Showing first 50 of {previewCustomers.length} customers
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

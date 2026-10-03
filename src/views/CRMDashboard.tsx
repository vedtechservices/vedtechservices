import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/next-router';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Download,
  ArrowLeft,
  Building2,
  Tag,
  CheckSquare,
  FileText,
  BarChart3,
  MessageSquare,
  PieChart,
  ShieldCheck
} from 'lucide-react';
import type { Customer, CustomerSegment } from '@/types';

export default function CRMDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      const customers = (customersData || []) as Customer[];
      setCustomers(customers);

      // Calculate metrics
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const total = customers.length;
      const active = customers.filter(c => c.status === 'Active').length;
      const inactive = customers.filter(c => c.status === 'Inactive').length;
      const newThisMonth = customers.filter(c => 
        new Date(c.created_at) >= firstDayOfMonth
      ).length;

      setMetrics({ total, active, inactive, newThisMonth });

      // Fetch segments
      const { data: segmentsData, error: segmentsError } = await supabase
        .from('customer_segments')
        .select('*')
        .order('is_predefined', { ascending: false });

      if (segmentsError) throw segmentsError;

      setSegments((segmentsData || []) as CustomerSegment[]);

    } catch (error) {
      console.error('Error fetching CRM data:', error);
      toast.error('Failed to load CRM data');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery);
    
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Type', 'Status', 'Lifetime Value', 'Registration Date'];
    const rows = filteredCustomers.map(c => [
      c.name,
      c.email || '',
      c.phone || '',
      c.customer_type,
      c.status,
      c.lifetime_value,
      new Date(c.registration_date).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Customer data exported successfully');
  };

  const getHealthScoreColor = (score: string) => {
    switch (score) {
      case 'Green': return 'bg-green-500';
      case 'Yellow': return 'bg-yellow-500';
      case 'Red': return 'bg-red-500';
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
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">CRM Dashboard</h1>
              <p className="text-muted-foreground">Manage customer relationships and interactions</p>
            </div>
          </div>
          <Button onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.total}</div>
                  <p className="text-xs text-muted-foreground">All registered customers</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.active}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Customers</CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.inactive}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <UserPlus className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.newThisMonth}</div>
                  <p className="text-xs text-muted-foreground">Recent additions</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/admin/crm/leads')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Manage Leads
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/admin/crm/pipeline')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Sales Pipeline
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/admin/crm/campaigns')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Campaigns
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/admin/crm/calls')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Logs
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/admin/crm/meetings')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Meetings
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/admin/crm/segments')}
              >
                <Tag className="h-4 w-4 mr-2" />
                Customer Segments
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/admin/crm/tasks')}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Task Management
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/admin/crm/reports')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Advanced Reports
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/admin/crm/analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/admin/crm/feedback')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback & Surveys
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/admin/crm/customer-reports')}
              >
                <PieChart className="h-4 w-4 mr-2" />
                Customer Reports
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/admin/crm/audit-logs')}
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                CRM Audit Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer List</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No customers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCustomers.map(customer => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/crm/customers/${customer.id}`)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-3 h-3 rounded-full ${getHealthScoreColor(customer.health_score)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{customer.name}</h3>
                          <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                            {customer.status}
                          </Badge>
                          <Badge variant="outline">{customer.customer_type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </span>
                          )}
                          {customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(customer.registration_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          ₹{customer.lifetime_value.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Lifetime Value</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {segments.map(segment => (
                  <Card key={segment.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{segment.segment_name}</CardTitle>
                        {segment.is_predefined && (
                          <Badge variant="secondary">Predefined</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{segment.customer_count}</div>
                      <p className="text-xs text-muted-foreground">customers</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

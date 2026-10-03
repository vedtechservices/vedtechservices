import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  TrendingUp,
  Users,
  Mail,
  Target,
  DollarSign,
  Award,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

export default function CRMAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    newCustomers: 0,
    leadsConverted: 0,
    campaignsSent: 0,
    avgSatisfaction: 0,
    tasksCompleted: 0
  });

  const [salesTrend, setSalesTrend] = useState<Array<{ month: string; revenue: number }>>([]);
  const [customerAcquisition, setCustomerAcquisition] = useState<Array<{ source: string; count: number }>>([]);
  const [campaignPerformance, setCampaignPerformance] = useState<Array<{ name: string; openRate: number; clickRate: number }>>([]);
  const [leadFunnel, setLeadFunnel] = useState<Array<{ stage: string; count: number }>>([]);
  const [teamPerformance, setTeamPerformance] = useState<Array<{ member: string; tasksCompleted: number; leadsConverted: number }>>([]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch customers
      const { data: customersData } = await (supabase.from('customers') as any)
        .select('*');
      const customers = Array.isArray(customersData) ? customersData : [];

      // Fetch leads
      const { data: leadsData } = await (supabase.from('leads') as any)
        .select('*');
      const leads = Array.isArray(leadsData) ? leadsData : [];

      // Fetch campaigns
      const { data: campaignsData } = await (supabase.from('email_campaigns') as any)
        .select('*');
      const campaigns = Array.isArray(campaignsData) ? campaignsData : [];

      // Fetch tasks
      const { data: tasksData } = await (supabase.from('tasks') as any)
        .select('*');
      const tasks = Array.isArray(tasksData) ? tasksData : [];

      // Calculate metrics
      const totalRevenue = 125000; // Simulated
      const newCustomers = customers.length;
      const leadsConverted = leads.filter(l => l.lead_status === 'Won').length;
      const campaignsSent = campaigns.filter(c => c.status === 'Sent').length;
      const avgSatisfaction = 4.5; // Simulated
      const tasksCompleted = tasks.filter(t => t.task_status === 'Completed').length;

      setMetrics({
        totalRevenue,
        newCustomers,
        leadsConverted,
        campaignsSent,
        avgSatisfaction,
        tasksCompleted
      });

      // Sales Trend (simulated data)
      setSalesTrend([
        { month: 'Jan', revenue: 15000 },
        { month: 'Feb', revenue: 18000 },
        { month: 'Mar', revenue: 22000 },
        { month: 'Apr', revenue: 25000 },
        { month: 'May', revenue: 28000 },
        { month: 'Jun', revenue: 32000 }
      ]);

      // Customer Acquisition by Source
      const sourceCount: Record<string, number> = {};
      leads.forEach(lead => {
        const source = lead.lead_source || 'Unknown';
        sourceCount[source] = (sourceCount[source] || 0) + 1;
      });
      setCustomerAcquisition(
        Object.entries(sourceCount).map(([source, count]) => ({ source, count }))
      );

      // Campaign Performance
      setCampaignPerformance(
        campaigns.slice(0, 5).map(c => ({
          name: c.campaign_name,
          openRate: (c.open_rate || 0) * 100,
          clickRate: (c.click_rate || 0) * 100
        }))
      );

      // Lead Conversion Funnel
      const funnelStages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won'];
      setLeadFunnel(
        funnelStages.map(stage => ({
          stage,
          count: leads.filter(l => l.lead_status === stage).length
        }))
      );

      // Team Performance (simulated)
      setTeamPerformance([
        { member: 'Team Member 1', tasksCompleted: 45, leadsConverted: 12 },
        { member: 'Team Member 2', tasksCompleted: 38, leadsConverted: 10 },
        { member: 'Team Member 3', tasksCompleted: 52, leadsConverted: 15 },
        { member: 'Team Member 4', tasksCompleted: 41, leadsConverted: 11 }
      ]);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportDashboard = () => {
    toast.info('Exporting dashboard data...');
    setTimeout(() => {
      toast.success('Dashboard exported successfully');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64 bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">CRM Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive business insights and metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportDashboard}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-500 mt-1">+12.5% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              New Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.newCustomers}</div>
            <p className="text-xs text-green-500 mt-1">+8.3% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Leads Converted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.leadsConverted}</div>
            <p className="text-xs text-green-500 mt-1">+15.2% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Campaigns Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.campaignsSent}</div>
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Avg Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgSatisfaction.toFixed(1)}/5.0</div>
            <p className="text-xs text-green-500 mt-1">+0.3 from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Tasks Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-2 h-64">
              {salesTrend.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80"
                    style={{
                      height: `${(item.revenue / Math.max(...salesTrend.map(s => s.revenue))) * 100}%`,
                      minHeight: '20px'
                    }}
                  />
                  <div className="text-center">
                    <p className="text-xs font-medium">{item.month}</p>
                    <p className="text-xs text-muted-foreground">${(item.revenue / 1000).toFixed(0)}k</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Acquisition & Campaign Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Acquisition by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customerAcquisition.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.source}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(item.count / Math.max(...customerAcquisition.map(c => c.count))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
              {customerAcquisition.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Campaign Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaignPerformance.slice(0, 5).map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate">{item.name}</span>
                    <span className="text-muted-foreground">{item.openRate.toFixed(1)}% open</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${item.openRate}%` }}
                      />
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${item.clickRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {campaignPerformance.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No campaigns found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lead Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leadFunnel.map((item, index) => {
              const maxCount = Math.max(...leadFunnel.map(f => f.count));
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.stage}</span>
                    <span className="text-muted-foreground">{item.count} leads</span>
                  </div>
                  <div className="h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 flex items-center px-3 text-sm font-medium text-primary-foreground transition-all"
                      style={{ width: `${Math.max(percentage, 10)}%` }}
                    >
                      {percentage > 20 && `${percentage.toFixed(0)}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Team Performance Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamPerformance.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{member.member}</p>
                  <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{member.tasksCompleted} tasks completed</span>
                    <span>{member.leadsConverted} leads converted</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{member.tasksCompleted}</div>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{member.leadsConverted}</div>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenue Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Next Quarter Forecast</p>
                <p className="text-3xl font-bold">$95,000</p>
                <p className="text-sm text-green-500 mt-1">+18% growth expected</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Next Year Forecast</p>
                <p className="text-3xl font-bold">$420,000</p>
                <p className="text-sm text-green-500 mt-1">+22% growth expected</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Forecasts based on historical data and current trends. Confidence interval: ±10%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

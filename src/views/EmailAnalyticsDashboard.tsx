import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/next-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/db/supabase';
import { ArrowLeft, Mail, MailOpen, MousePointerClick, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface EmailMetrics {
  total_sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  spam_reports: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

interface EmailEvent {
  id: string;
  email_id: string;
  recipient: string;
  event_type: string;
  campaign_type: string;
  report_name: string | null;
  timestamp: string;
  metadata: any;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function EmailAnalyticsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('month');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<EmailEvent[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [eventDistribution, setEventDistribution] = useState<any[]>([]);

  useEffect(() => {
    fetchEmailAnalytics();
  }, [timePeriod, campaignFilter]);

  const fetchEmailAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      const startDate = new Date();

      switch (timePeriod) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Build query
      let query = supabase
        .from('email_delivery_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', now.toISOString())
        .order('timestamp', { ascending: false });

      if (campaignFilter !== 'all') {
        query = query.eq('campaign_type', campaignFilter);
      }

      const { data: events, error } = await (query as any);

      if (error) throw error;

      // Calculate metrics
      const uniqueEmailIds = new Set(events?.map((e: EmailEvent) => e.email_id) || []);
      const totalSent = uniqueEmailIds.size;

      const delivered = events?.filter((e: EmailEvent) => e.event_type === 'delivered').length || 0;
      const opened = events?.filter((e: EmailEvent) => e.event_type === 'open').length || 0;
      const clicked = events?.filter((e: EmailEvent) => e.event_type === 'click').length || 0;
      const bounced = events?.filter((e: EmailEvent) => e.event_type === 'bounce').length || 0;
      const spamReports = events?.filter((e: EmailEvent) => e.event_type === 'spam_report').length || 0;

      const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
      const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
      const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
      const bounceRate = totalSent > 0 ? (bounced / totalSent) * 100 : 0;

      setMetrics({
        total_sent: totalSent,
        delivered,
        opened,
        clicked,
        bounced,
        spam_reports: spamReports,
        delivery_rate: deliveryRate,
        open_rate: openRate,
        click_rate: clickRate,
        bounce_rate: bounceRate,
      });

      // Set recent events (limit to 50)
      setRecentEvents((events || []).slice(0, 50));

      // Generate trend data (group by day)
      const trendMap = new Map<string, any>();
      events?.forEach((event: EmailEvent) => {
        const date = new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!trendMap.has(date)) {
          trendMap.set(date, { date, sent: 0, delivered: 0, opened: 0, clicked: 0 });
        }
        const trend = trendMap.get(date);
        if (event.event_type === 'delivered') trend.delivered++;
        if (event.event_type === 'open') trend.opened++;
        if (event.event_type === 'click') trend.clicked++;
      });

      // Add sent count (unique email_ids per day)
      const sentByDay = new Map<string, Set<string>>();
      events?.forEach((event: EmailEvent) => {
        const date = new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!sentByDay.has(date)) {
          sentByDay.set(date, new Set());
        }
        sentByDay.get(date)?.add(event.email_id);
      });

      sentByDay.forEach((emailIds, date) => {
        if (trendMap.has(date)) {
          trendMap.get(date).sent = emailIds.size;
        }
      });

      const trends = Array.from(trendMap.values()).slice(-30); // Last 30 days
      setTrendData(trends);

      // Event distribution for pie chart
      const distribution = [
        { name: 'Delivered', value: delivered, color: '#10b981' },
        { name: 'Opened', value: opened, color: '#3b82f6' },
        { name: 'Clicked', value: clicked, color: '#f59e0b' },
        { name: 'Bounced', value: bounced, color: '#ef4444' },
        { name: 'Spam Reports', value: spamReports, color: '#8b5cf6' },
      ].filter(item => item.value > 0);

      setEventDistribution(distribution);

    } catch (error: any) {
      console.error('Error fetching email analytics:', error);
      toast.error('Failed to fetch email analytics');
    } finally {
      setLoading(false);
    }
  };

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case 'delivered':
        return 'default';
      case 'open':
        return 'secondary';
      case 'click':
        return 'default';
      case 'bounce':
        return 'destructive';
      case 'spam_report':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'delivered':
        return <Mail className="h-4 w-4" />;
      case 'open':
        return <MailOpen className="h-4 w-4" />;
      case 'click':
        return <MousePointerClick className="h-4 w-4" />;
      case 'bounce':
      case 'spam_report':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
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
                <h1 className="text-2xl font-bold text-white">Email Analytics Dashboard</h1>
                <p className="text-sm text-purple-200">Track email delivery and engagement metrics</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="scheduled_report">Scheduled Reports</SelectItem>
                  <SelectItem value="email_campaign">Email Campaigns</SelectItem>
                  <SelectItem value="manual_email">Manual Emails</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-white/10" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Sent</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Mail className="h-6 w-6 text-blue-600" />
                    {metrics?.total_sent || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Unique emails sent
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Delivery Rate</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    {metrics?.delivery_rate.toFixed(1) || 0}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {metrics?.delivered || 0} delivered
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Open Rate</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <MailOpen className="h-6 w-6 text-blue-600" />
                    {metrics?.open_rate.toFixed(1) || 0}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {metrics?.opened || 0} opened
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Click Rate</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <MousePointerClick className="h-6 w-6 text-orange-600" />
                    {metrics?.click_rate.toFixed(1) || 0}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {metrics?.clicked || 0} clicked
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Performance Trends</CardTitle>
                  <CardDescription>Track email metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sent" stroke="#8b5cf6" name="Sent" />
                      <Line type="monotone" dataKey="delivered" stroke="#10b981" name="Delivered" />
                      <Line type="monotone" dataKey="opened" stroke="#3b82f6" name="Opened" />
                      <Line type="monotone" dataKey="clicked" stroke="#f59e0b" name="Clicked" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Event Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Distribution</CardTitle>
                  <CardDescription>Breakdown of email events</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={eventDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {eventDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bounce Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {metrics?.bounce_rate.toFixed(1) || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {metrics?.bounced || 0} bounced emails
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Spam Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {metrics?.spam_reports || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Marked as spam
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {((metrics?.open_rate || 0) + (metrics?.click_rate || 0)) / 2 > 0
                      ? (((metrics?.open_rate || 0) + (metrics?.click_rate || 0)) / 2).toFixed(1)
                      : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Average of open & click rates
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Events Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Email Events</CardTitle>
                <CardDescription>Latest email delivery and engagement events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full max-w-full overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 whitespace-nowrap">Event</th>
                        <th className="text-left p-2 whitespace-nowrap">Recipient</th>
                        <th className="text-left p-2 whitespace-nowrap">Campaign</th>
                        <th className="text-left p-2 whitespace-nowrap">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center p-8 text-muted-foreground">
                            No email events found for the selected period
                          </td>
                        </tr>
                      ) : (
                        recentEvents.map((event) => (
                          <tr key={event.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 whitespace-nowrap">
                              <Badge variant={getEventBadgeVariant(event.event_type)} className="flex items-center gap-1 w-fit">
                                {getEventIcon(event.event_type)}
                                {event.event_type}
                              </Badge>
                            </td>
                            <td className="p-2 whitespace-nowrap text-sm">{event.recipient}</td>
                            <td className="p-2 whitespace-nowrap text-sm">
                              {event.report_name || event.campaign_type}
                            </td>
                            <td className="p-2 whitespace-nowrap text-sm text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

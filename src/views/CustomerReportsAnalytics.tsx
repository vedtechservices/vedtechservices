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
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Star,
  Wrench,
  Calendar,
  Download,
  FileText,
  BarChart3,
  PieChart,
  Clock,
  Mail,
  Play,
  Edit,
  Trash2,
} from 'lucide-react';
import type { Customer, ReportSchedule } from '@/types';

export default function CustomerReportsAnalytics() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null);
  const [testingEngagement, setTestingEngagement] = useState(false);
  const [testingReport, setTestingReport] = useState(false);
  const [engagementScoreData, setEngagementScoreData] = useState<Array<{ range: string; count: number }>>([]);
  const [decliningCustomers, setDecliningCustomers] = useState<Customer[]>([]);

  const [newSchedule, setNewSchedule] = useState({
    report_name: '',
    report_type: 'customer_growth',
    frequency: 'Weekly' as 'Daily' | 'Weekly' | 'Monthly',
    day_of_week: 'Monday',
    day_of_month: 1,
    time_of_day: '09:00',
    export_format: 'Excel' as 'PDF' | 'Excel' | 'Both',
    email_recipients: '',
    email_subject: '',
    email_body: '',
    date_range: '30',
    is_active: true
  });

  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    activeCustomers: 0,
    churnedCustomers: 0,
    retentionRate: 0,
    churnRate: 0,
    avgLifetimeValue: 0,
    totalRevenue: 0,
    avgSatisfaction: 0,
    nps: 0,
    activeAMC: 0,
    expiredAMC: 0,
    amcRenewalRate: 0
  });

  const [growthData, setGrowthData] = useState<Array<{ month: string; customers: number }>>([]);
  const [clvBySegment, setClvBySegment] = useState<Array<{ segment: string; avgClv: number; count: number }>>([]);
  const [serviceUsage, setServiceUsage] = useState<Array<{ service: string; count: number; revenue: number }>>([]);

  useEffect(() => {
    fetchData();
    fetchSchedules();
    calculateEngagementAnalytics();
  }, [dateRange, dateFrom, dateTo]);

  const calculateEngagementAnalytics = () => {
    // Calculate engagement score distribution
    const ranges = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 }
    ];

    customers.forEach(customer => {
      const score = customer.engagement_score || 0;
      if (score <= 20) ranges[0].count++;
      else if (score <= 40) ranges[1].count++;
      else if (score <= 60) ranges[2].count++;
      else if (score <= 80) ranges[3].count++;
      else ranges[4].count++;
    });

    setEngagementScoreData(ranges);

    // Find customers with declining engagement (score < 40)
    const declining = customers
      .filter(c => (c.engagement_score || 0) < 40)
      .sort((a, b) => (a.engagement_score || 0) - (b.engagement_score || 0))
      .slice(0, 10);

    setDecliningCustomers(declining);
  };

  const fetchSchedules = async () => {
    try {
      const { data, error } = await (supabase
        .from('report_schedules') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: customersData, error: customersError } = await (supabase
        .from('customers') as any)
        .select('*');

      if (customersError) throw customersError;

      const customersList = Array.isArray(customersData) ? customersData : [];
      setCustomers(customersList);

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      if (dateRange === 'custom' && dateFrom && dateTo) {
        startDate = new Date(dateFrom);
      } else {
        startDate = new Date(now.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000);
      }

      // Calculate metrics
      const totalCustomers = customersList.length;
      const newCustomers = customersList.filter(c =>
        new Date(c.registration_date) >= startDate
      ).length;
      const activeCustomers = customersList.filter(c => c.status === 'Active').length;
      const churnedCustomers = customersList.filter(c => c.status === 'Inactive').length;

      const retentionRate = totalCustomers > 0
        ? ((activeCustomers / totalCustomers) * 100)
        : 0;
      const churnRate = totalCustomers > 0
        ? ((churnedCustomers / totalCustomers) * 100)
        : 0;

      const avgLifetimeValue = totalCustomers > 0
        ? customersList.reduce((sum, c) => sum + c.lifetime_value, 0) / totalCustomers
        : 0;
      const totalRevenue = customersList.reduce((sum, c) => sum + c.lifetime_value, 0);

      // Simulated satisfaction and NPS (in real app, fetch from feedback table)
      const avgSatisfaction = 4.2;
      const nps = 45;

      // AMC metrics (simulated based on customer status)
      const activeAMC = activeCustomers;
      const expiredAMC = churnedCustomers;
      const amcRenewalRate = (activeAMC + expiredAMC) > 0
        ? (activeAMC / (activeAMC + expiredAMC)) * 100
        : 0;

      setMetrics({
        totalCustomers,
        newCustomers,
        activeCustomers,
        churnedCustomers,
        retentionRate,
        churnRate,
        avgLifetimeValue,
        totalRevenue,
        avgSatisfaction,
        nps,
        activeAMC,
        expiredAMC,
        amcRenewalRate
      });

      // Generate growth data (last 6 months)
      const monthlyGrowth: Array<{ month: string; customers: number }> = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const count = customersList.filter(c =>
          new Date(c.registration_date) <= monthEnd
        ).length;
        monthlyGrowth.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          customers: count
        });
      }
      setGrowthData(monthlyGrowth);

      // CLV by segment
      const segments = [
        { segment: 'Individual', customers: customersList.filter(c => c.customer_type === 'Individual') },
        { segment: 'Business', customers: customersList.filter(c => c.customer_type === 'Business') },
        { segment: 'High-Value', customers: customersList.filter(c => c.lifetime_value > 5000) },
        { segment: 'Active AMC', customers: customersList.filter(c => c.status === 'Active') },
        { segment: 'New Customers', customers: customersList.filter(c => new Date(c.registration_date) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) }
      ];

      const clvData = segments.map(seg => ({
        segment: seg.segment,
        avgClv: seg.customers.length > 0
          ? seg.customers.reduce((sum, c) => sum + c.lifetime_value, 0) / seg.customers.length
          : 0,
        count: seg.customers.length
      }));
      setClvBySegment(clvData);

      // Service usage (simulated data)
      const services = [
        { service: 'Hardware Repair', count: 145, revenue: 28500 },
        { service: 'Software Development', count: 89, revenue: 125000 },
        { service: 'IT Support', count: 234, revenue: 45000 },
        { service: 'Network Setup', count: 67, revenue: 32000 },
        { service: 'AMC Services', count: activeAMC, revenue: activeAMC * 7999 }
      ];
      setServiceUsage(services);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const exportReportToPDF = () => {
    toast.info('PDF export functionality would be implemented here');
  };

  const exportReportToExcel = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Customers', metrics.totalCustomers.toString()],
      ['New Customers', metrics.newCustomers.toString()],
      ['Active Customers', metrics.activeCustomers.toString()],
      ['Retention Rate', `${metrics.retentionRate.toFixed(1)}%`],
      ['Churn Rate', `${metrics.churnRate.toFixed(1)}%`],
      ['Avg Lifetime Value', `$${metrics.avgLifetimeValue.toFixed(2)}`],
      ['Total Revenue', `$${metrics.totalRevenue.toFixed(2)}`],
      ['Avg Satisfaction', metrics.avgSatisfaction.toFixed(1)],
      ['NPS', metrics.nps.toString()],
      ['Active AMC', metrics.activeAMC.toString()],
      ['AMC Renewal Rate', `${metrics.amcRenewalRate.toFixed(1)}%`]
    ];

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer_reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateSchedule = async () => {
    try {
      const emailRecipients = newSchedule.email_recipients.split(',').map(e => e.trim()).filter(e => e);

      const nextRunAt = calculateNextRunTime(
        newSchedule.frequency,
        newSchedule.day_of_week,
        newSchedule.day_of_month,
        newSchedule.time_of_day
      );

      const { error } = await (supabase
        .from('report_schedules') as any)
        .insert({
          report_name: newSchedule.report_name,
          report_type: newSchedule.report_type,
          frequency: newSchedule.frequency,
          day_of_week: newSchedule.frequency === 'Weekly' ? newSchedule.day_of_week : null,
          day_of_month: newSchedule.frequency === 'Monthly' ? newSchedule.day_of_month : null,
          time_of_day: newSchedule.time_of_day,
          export_format: newSchedule.export_format,
          email_recipients: emailRecipients,
          email_subject: newSchedule.email_subject,
          email_body: newSchedule.email_body || null,
          date_range: newSchedule.date_range,
          is_active: newSchedule.is_active,
          next_run_at: nextRunAt.toISOString()
        });

      if (error) throw error;

      toast.success('Report schedule created successfully');
      setShowScheduleDialog(false);
      setNewSchedule({
        report_name: '',
        report_type: 'customer_growth',
        frequency: 'Weekly',
        day_of_week: 'Monday',
        day_of_month: 1,
        time_of_day: '09:00',
        export_format: 'Excel',
        email_recipients: '',
        email_subject: '',
        email_body: '',
        date_range: '30',
        is_active: true
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error('Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('report_schedules') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const handleRunNow = async (schedule: ReportSchedule) => {
    try {
      toast.info('Generating report...');
      const { error } = await supabase.functions.invoke('generate-scheduled-reports');

      if (error) throw error;

      toast.success('Report generated and sent successfully');
    } catch (error) {
      console.error('Error running report:', error);
      toast.error('Failed to generate report');
    }
  };

  const calculateNextRunTime = (
    frequency: 'Daily' | 'Weekly' | 'Monthly',
    dayOfWeek: string,
    dayOfMonth: number,
    timeOfDay: string
  ): Date => {
    const now = new Date();
    const [hours, minutes] = timeOfDay.split(':');
    const next = new Date(now);
    next.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (frequency === 'Daily') {
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
    } else if (frequency === 'Weekly') {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDay = daysOfWeek.indexOf(dayOfWeek);
      const currentDay = next.getDay();
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      next.setDate(next.getDate() + daysToAdd);
    } else if (frequency === 'Monthly') {
      next.setDate(dayOfMonth);
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
    }

    return next;
  };

  const handleTestEngagementCalculation = async () => {
    try {
      setTestingEngagement(true);
      toast.info('Calculating engagement scores for all customers...');

      const { data, error } = await supabase.functions.invoke('calculate-engagement-scores');

      if (error) throw error;

      toast.success(`Engagement scores updated successfully! ${data.updated_count} customers processed.`);
      
      // Refresh data to show updated scores
      await fetchData();
      calculateEngagementAnalytics();
    } catch (error) {
      console.error('Error calculating engagement scores:', error);
      toast.error('Failed to calculate engagement scores');
    } finally {
      setTestingEngagement(false);
    }
  };

  const handleTestReportGeneration = async () => {
    try {
      setTestingReport(true);
      toast.info('Generating and sending scheduled reports...');

      const { data, error } = await supabase.functions.invoke('generate-scheduled-reports');

      if (error) throw error;

      if (data.reports && data.reports.length > 0) {
        toast.success(`Successfully generated ${data.reports.length} report(s): ${data.reports.join(', ')}`);
      } else {
        toast.info('No reports were due for generation at this time.');
      }

      if (data.errors && data.errors.length > 0) {
        toast.error(`Some reports failed: ${data.errors.join(', ')}`);
      }

      // Refresh schedules
      await fetchSchedules();
    } catch (error) {
      console.error('Error generating reports:', error);
      toast.error('Failed to generate reports');
    } finally {
      setTestingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64 bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">Customer Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive customer insights and trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportReportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger id="dateRange">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="365">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateRange === 'custom' && (
              <>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="dateFrom">From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="dateTo">To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduled Reports
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleTestReportGeneration}
                disabled={testingReport}
              >
                {testingReport ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test Report Generation
                  </>
                )}
              </Button>
              <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule New Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule Automated Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input
                      id="reportName"
                      placeholder="Monthly Customer Growth Report"
                      value={newSchedule.report_name}
                      onChange={(e) => setNewSchedule({ ...newSchedule, report_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select
                      value={newSchedule.report_type}
                      onValueChange={(value) => setNewSchedule({ ...newSchedule, report_type: value })}
                    >
                      <SelectTrigger id="reportType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer_growth">Customer Growth</SelectItem>
                        <SelectItem value="retention_churn">Retention & Churn</SelectItem>
                        <SelectItem value="lifetime_value">Lifetime Value</SelectItem>
                        <SelectItem value="satisfaction">Customer Satisfaction</SelectItem>
                        <SelectItem value="service_usage">Service Usage</SelectItem>
                        <SelectItem value="amc_subscriptions">AMC Subscriptions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={newSchedule.frequency}
                        onValueChange={(value: 'Daily' | 'Weekly' | 'Monthly') => setNewSchedule({ ...newSchedule, frequency: value })}
                      >
                        <SelectTrigger id="frequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newSchedule.frequency === 'Weekly' && (
                      <div className="space-y-2">
                        <Label htmlFor="dayOfWeek">Day of Week</Label>
                        <Select
                          value={newSchedule.day_of_week}
                          onValueChange={(value) => setNewSchedule({ ...newSchedule, day_of_week: value })}
                        >
                          <SelectTrigger id="dayOfWeek">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                            <SelectItem value="Saturday">Saturday</SelectItem>
                            <SelectItem value="Sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {newSchedule.frequency === 'Monthly' && (
                      <div className="space-y-2">
                        <Label htmlFor="dayOfMonth">Day of Month</Label>
                        <Input
                          id="dayOfMonth"
                          type="number"
                          min="1"
                          max="31"
                          value={newSchedule.day_of_month}
                          onChange={(e) => setNewSchedule({ ...newSchedule, day_of_month: parseInt(e.target.value) })}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="timeOfDay">Time of Day</Label>
                      <Input
                        id="timeOfDay"
                        type="time"
                        value={newSchedule.time_of_day}
                        onChange={(e) => setNewSchedule({ ...newSchedule, time_of_day: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exportFormat">Export Format</Label>
                      <Select
                        value={newSchedule.export_format}
                        onValueChange={(value: 'PDF' | 'Excel' | 'Both') => setNewSchedule({ ...newSchedule, export_format: value })}
                      >
                        <SelectTrigger id="exportFormat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="Excel">Excel</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailRecipients">Email Recipients (comma-separated)</Label>
                    <Input
                      id="emailRecipients"
                      placeholder="admin@vedtech.com, manager@vedtech.com"
                      value={newSchedule.email_recipients}
                      onChange={(e) => setNewSchedule({ ...newSchedule, email_recipients: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailSubject">Email Subject</Label>
                    <Input
                      id="emailSubject"
                      placeholder="Your Weekly Customer Report"
                      value={newSchedule.email_subject}
                      onChange={(e) => setNewSchedule({ ...newSchedule, email_subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailBody">Email Body (Optional)</Label>
                    <Textarea
                      id="emailBody"
                      placeholder="Please find attached your scheduled customer report..."
                      value={newSchedule.email_body}
                      onChange={(e) => setNewSchedule({ ...newSchedule, email_body: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateRangeSchedule">Data Date Range</Label>
                    <Select
                      value={newSchedule.date_range}
                      onValueChange={(value) => setNewSchedule({ ...newSchedule, date_range: value })}
                    >
                      <SelectTrigger id="dateRangeSchedule">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 Days</SelectItem>
                        <SelectItem value="30">Last 30 Days</SelectItem>
                        <SelectItem value="90">Last 90 Days</SelectItem>
                        <SelectItem value="365">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSchedule}>
                      Create Schedule
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No scheduled reports yet. Create your first automated report schedule.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{schedule.report_name}</h3>
                      <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                        {schedule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {schedule.frequency} • {schedule.export_format} • {schedule.email_recipients.length} recipient(s)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Next run: {schedule.next_run_at ? new Date(schedule.next_run_at).toLocaleString() : 'Not scheduled'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunNow(schedule)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
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

      {/* Tabs */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">Customer Growth</TabsTrigger>
          <TabsTrigger value="retention">Retention & Churn</TabsTrigger>
          <TabsTrigger value="clv">Lifetime Value</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          <TabsTrigger value="services">Service Usage</TabsTrigger>
          <TabsTrigger value="amc">AMC Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
        </TabsList>

        {/* Customer Growth Tab */}
        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  New Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{metrics.newCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Active Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{metrics.activeCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently active</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Customer Acquisition Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end gap-2 h-64">
                  {growthData.map((item, index) => {
                    const maxCustomers = Math.max(...growthData.map(d => d.customers));
                    const height = maxCustomers > 0 ? (item.customers / maxCustomers) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80"
                          style={{
                            height: `${height}%`,
                            minHeight: '20px'
                          }}
                        />
                        <div className="text-center">
                          <p className="text-xs font-medium">{item.month}</p>
                          <p className="text-xs text-muted-foreground">{item.customers}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retention & Churn Tab */}
        <TabsContent value="retention" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{metrics.retentionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Active customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{metrics.churnRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Inactive customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Churned Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.churnedCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">Inactive</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Retention Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Strong Retention</p>
                    <p className="text-sm text-muted-foreground">
                      {metrics.retentionRate.toFixed(1)}% of customers remain active, indicating strong customer satisfaction and engagement
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Churn Analysis</p>
                    <p className="text-sm text-muted-foreground">
                      {metrics.churnedCustomers} customers have become inactive. Consider re-engagement campaigns
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lifetime Value Tab */}
        <TabsContent value="clv" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Avg Lifetime Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.avgLifetimeValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Per customer</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">All customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">Contributing to revenue</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                CLV Distribution by Segment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clvBySegment.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.segment}</span>
                      <span className="text-muted-foreground">${item.avgClv.toFixed(2)} avg | {item.count} customers</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${Math.min((item.avgClv / metrics.avgLifetimeValue) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Satisfaction Tab */}
        <TabsContent value="satisfaction" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Avg Satisfaction Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avgSatisfaction.toFixed(1)} / 5.0</div>
                <p className="text-xs text-muted-foreground mt-1">Based on customer feedback</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Net Promoter Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.nps}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.nps > 50 ? 'Excellent' : metrics.nps > 0 ? 'Good' : 'Needs Improvement'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Satisfaction Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Overall Satisfaction</p>
                    <p className="text-sm text-muted-foreground">
                      Average rating of {metrics.avgSatisfaction.toFixed(1)} out of 5.0 indicates strong customer satisfaction
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Net Promoter Score</p>
                    <p className="text-sm text-muted-foreground">
                      NPS of {metrics.nps} suggests {metrics.nps > 50 ? 'excellent' : metrics.nps > 0 ? 'good' : 'room for improvement'} customer loyalty and likelihood to recommend
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Usage Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Most Requested Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceUsage.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{service.service}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.count} requests | ${service.revenue.toLocaleString()} revenue
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{service.count}</div>
                      <p className="text-xs text-muted-foreground">requests</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AMC Subscriptions Tab */}
        <TabsContent value="amc" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Active AMC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{metrics.activeAMC}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expired AMC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{metrics.expiredAMC}</div>
                <p className="text-xs text-muted-foreground mt-1">Needs renewal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Renewal Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.amcRenewalRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">AMC renewal success</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AMC Subscription Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Active Subscriptions</p>
                    <p className="text-sm text-muted-foreground">
                      {metrics.activeAMC} customers have active AMC subscriptions, generating recurring revenue
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Renewal Performance</p>
                    <p className="text-sm text-muted-foreground">
                      {metrics.amcRenewalRate.toFixed(1)}% renewal rate indicates strong customer retention and satisfaction with AMC services
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Renewal Opportunities</p>
                    <p className="text-sm text-muted-foreground">
                      {metrics.expiredAMC} customers with expired AMC subscriptions represent renewal opportunities
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Dashboard Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Engagement Analytics Dashboard</h2>
              <p className="text-muted-foreground">Monitor customer engagement scores and identify at-risk customers</p>
            </div>
            <Button
              onClick={handleTestEngagementCalculation}
              disabled={testingEngagement}
            >
              {testingEngagement ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Recalculate All Scores
                </>
              )}
            </Button>
          </div>

          {/* Engagement Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Engagement Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engagementScoreData.map((item, index) => {
                  const maxCount = Math.max(...engagementScoreData.map(d => d.count));
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Score {item.range}</span>
                        <span className="text-muted-foreground">{item.count} customers</span>
                      </div>
                      <div className="h-8 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[index]} transition-all duration-500 flex items-center justify-end pr-3`}
                          style={{ width: `${percentage}%` }}
                        >
                          {item.count > 0 && (
                            <span className="text-xs font-semibold text-white">
                              {item.count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Score Interpretation:</strong> 0-20 (Critical), 21-40 (At Risk), 41-60 (Moderate), 61-80 (Good), 81-100 (Excellent)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Engagement Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customers.length > 0
                    ? (customers.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / customers.length).toFixed(1)
                    : '0'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Across all customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">High Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {customers.filter(c => (c.engagement_score || 0) >= 80).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Score 80-100</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">At Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {customers.filter(c => (c.engagement_score || 0) >= 21 && (c.engagement_score || 0) <= 40).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Score 21-40</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {customers.filter(c => (c.engagement_score || 0) <= 20).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Score 0-20</p>
              </CardContent>
            </Card>
          </div>

          {/* Customers with Declining Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Customers Requiring Attention (Low Engagement)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {decliningCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50 text-green-500" />
                  <p>Great news! No customers with critically low engagement scores.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {decliningCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold">{customer.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {customer.email || 'No email'} • {customer.customer_type}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <div className="text-2xl font-bold text-red-500">
                                {customer.engagement_score || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">/ 100</div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Registered: {new Date(customer.registration_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Recommended Actions:</h4>
                <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 list-disc list-inside">
                  <li>Send personalized re-engagement email campaigns</li>
                  <li>Offer special promotions or discounts</li>
                  <li>Schedule follow-up calls to understand concerns</li>
                  <li>Provide additional training or support resources</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Trends Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Engagement Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Overall Engagement Health</p>
                    <p className="text-sm text-muted-foreground">
                      {customers.filter(c => (c.engagement_score || 0) >= 60).length} customers ({((customers.filter(c => (c.engagement_score || 0) >= 60).length / Math.max(customers.length, 1)) * 100).toFixed(0)}%) have good to excellent engagement scores
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Proactive Monitoring</p>
                    <p className="text-sm text-muted-foreground">
                      Engagement scores are automatically recalculated daily based on customer activity, ticket frequency, AMC renewals, and email interactions
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

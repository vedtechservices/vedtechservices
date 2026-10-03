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
  FileText,
  Plus,
  Download,
  Play,
  Edit,
  Trash2,
  Calendar,
  Mail,
  BarChart3,
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  report_name: string;
  data_source: string;
  chart_type: string;
  created_at: string;
  updated_at: string;
}

interface ReportHistory {
  id: string;
  report_name: string;
  file_format: string;
  generated_at: string;
}

export default function CRMAdvancedReporting() {
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [newReport, setNewReport] = useState({
    report_name: '',
    data_source: 'Customers' as 'Customers' | 'Leads' | 'Tickets' | 'Sales' | 'Campaigns' | 'Tasks',
    chart_type: 'Bar' as 'Line' | 'Bar' | 'Pie' | 'Donut' | 'Table' | 'Heatmap'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: templatesData, error: templatesError } = await (supabase
        .from('report_templates') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;

      const { data: historyData, error: historyError } = await (supabase
        .from('report_history') as any)
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(10);

      if (historyError) throw historyError;

      setReportTemplates(Array.isArray(templatesData) ? templatesData : []);
      setReportHistory(Array.isArray(historyData) ? historyData : []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      if (!newReport.report_name) {
        toast.error('Please enter a report name');
        return;
      }

      const reportData = {
        report_name: newReport.report_name,
        data_source: newReport.data_source,
        chart_type: newReport.chart_type,
        metrics: [],
        dimensions: [],
        filters: {}
      };

      const { error } = await (supabase.from('report_templates') as any).insert([reportData]);

      if (error) throw error;

      toast.success('Report template created successfully');
      setShowCreateDialog(false);
      setNewReport({
        report_name: '',
        data_source: 'Customers',
        chart_type: 'Bar'
      });
      fetchData();

    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to create report template');
    }
  };

  const handleRunReport = async (template: ReportTemplate) => {
    try {
      toast.info('Generating report...');

      // Simulate report generation
      const historyData = {
        report_template_id: template.id,
        report_name: template.report_name,
        file_format: 'PDF'
      };

      const { error } = await (supabase.from('report_history') as any).insert([historyData]);

      if (error) throw error;

      toast.success('Report generated successfully');
      fetchData();

    } catch (error) {
      console.error('Error running report:', error);
      toast.error('Failed to generate report');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await (supabase.from('report_templates') as any)
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Report template deleted');
      fetchData();

    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const exportReport = (format: 'PDF' | 'Excel' | 'CSV') => {
    toast.info(`Exporting report as ${format}...`);
    // Simulate export
    setTimeout(() => {
      toast.success(`Report exported as ${format}`);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64 bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">Advanced Reporting</h1>
          <p className="text-muted-foreground">Create and manage custom reports</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Report Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Report Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name *</Label>
                <Input
                  id="reportName"
                  value={newReport.report_name}
                  onChange={(e) => setNewReport({ ...newReport, report_name: e.target.value })}
                  placeholder="Enter report name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataSource">Data Source</Label>
                <Select
                  value={newReport.data_source}
                  onValueChange={(value) => setNewReport({ ...newReport, data_source: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customers">Customers</SelectItem>
                    <SelectItem value="Leads">Leads</SelectItem>
                    <SelectItem value="Tickets">Tickets</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Campaigns">Campaigns</SelectItem>
                    <SelectItem value="Tasks">Tasks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chartType">Chart Type</Label>
                <Select
                  value={newReport.chart_type}
                  onValueChange={(value) => setNewReport({ ...newReport, chart_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Line">Line Chart</SelectItem>
                    <SelectItem value="Bar">Bar Chart</SelectItem>
                    <SelectItem value="Pie">Pie Chart</SelectItem>
                    <SelectItem value="Donut">Donut Chart</SelectItem>
                    <SelectItem value="Table">Table</SelectItem>
                    <SelectItem value="Heatmap">Heatmap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReport}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportTemplates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reports Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportHistory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Export Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">PDF, Excel, CSV</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportReport('PDF')}>
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="outline" onClick={() => exportReport('Excel')}>
              <Download className="h-4 w-4 mr-2" />
              Export as Excel
            </Button>
            <Button variant="outline" onClick={() => exportReport('CSV')}>
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportTemplates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No report templates found</p>
                <p className="text-sm">Create your first report template to get started</p>
              </div>
            ) : (
              reportTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{template.report_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline">{template.data_source}</Badge>
                      <Badge variant="outline">{template.chart_type}</Badge>
                      <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunReport(template)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reports generated yet</p>
              </div>
            ) : (
              reportHistory.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{report.report_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Generated {new Date(report.generated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{report.file_format}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure automated report generation and email delivery
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email Recipients</Label>
                <Input placeholder="Enter email addresses" />
              </div>
            </div>
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

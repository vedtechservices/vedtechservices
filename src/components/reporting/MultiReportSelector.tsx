import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Database } from 'lucide-react';
import { format } from 'date-fns';

interface ReportTemplate {
  id: string;
  name: string;
  dataSource: string;
  lastRunDate?: Date;
  estimatedTime: string;
  description: string;
  thumbnail?: string;
}

interface MultiReportSelectorProps {
  selectedReports: string[];
  onChange: (selectedIds: string[]) => void;
}

const AVAILABLE_REPORTS: ReportTemplate[] = [
  {
    id: 'customer-growth',
    name: 'Customer Growth Report',
    dataSource: 'Customers',
    lastRunDate: new Date(2026, 0, 28),
    estimatedTime: '2-3 minutes',
    description: 'Customer acquisition trends over time with line chart'
  },
  {
    id: 'customer-retention',
    name: 'Customer Retention Report',
    dataSource: 'Customers',
    lastRunDate: new Date(2026, 0, 28),
    estimatedTime: '2-3 minutes',
    description: 'Customer retention rate and churn rate with trend analysis'
  },
  {
    id: 'customer-lifetime-value',
    name: 'Customer Lifetime Value Report',
    dataSource: 'Customers',
    lastRunDate: new Date(2026, 0, 27),
    estimatedTime: '3-4 minutes',
    description: 'Average CLV and CLV distribution by customer segment'
  },
  {
    id: 'customer-satisfaction',
    name: 'Customer Satisfaction Report',
    dataSource: 'Feedback',
    lastRunDate: new Date(2026, 0, 28),
    estimatedTime: '1-2 minutes',
    description: 'Average satisfaction rating, NPS, and satisfaction trends'
  },
  {
    id: 'service-usage',
    name: 'Service Usage Report',
    dataSource: 'Tickets',
    lastRunDate: new Date(2026, 0, 28),
    estimatedTime: '2-3 minutes',
    description: 'Most requested services, service frequency, and revenue breakdown'
  },
  {
    id: 'amc-subscription',
    name: 'AMC Subscription Report',
    dataSource: 'AMC',
    lastRunDate: new Date(2026, 0, 27),
    estimatedTime: '2-3 minutes',
    description: 'AMC subscription trends, renewal rates, and revenue breakdown'
  },
  {
    id: 'sales-trends',
    name: 'Sales Trends Report',
    dataSource: 'Sales',
    lastRunDate: new Date(2026, 0, 28),
    estimatedTime: '3-4 minutes',
    description: 'Revenue trends over time with comparison to previous period'
  },
  {
    id: 'lead-conversion',
    name: 'Lead Conversion Report',
    dataSource: 'Leads',
    lastRunDate: new Date(2026, 0, 26),
    estimatedTime: '2-3 minutes',
    description: 'Visual funnel chart showing leads at each stage with conversion rates'
  },
  {
    id: 'campaign-performance',
    name: 'Campaign Performance Report',
    dataSource: 'Campaigns',
    lastRunDate: new Date(2026, 0, 27),
    estimatedTime: '2-3 minutes',
    description: 'Email campaign metrics: open rate, click rate, conversion rate, and ROI'
  },
  {
    id: 'team-performance',
    name: 'Team Performance Report',
    dataSource: 'Employees',
    lastRunDate: new Date(2026, 0, 28),
    estimatedTime: '3-4 minutes',
    description: 'Metrics per team member: tasks completed, leads converted, tickets resolved'
  }
];

export default function MultiReportSelector({ selectedReports, onChange }: MultiReportSelectorProps) {
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      onChange(AVAILABLE_REPORTS.map(r => r.id));
    } else {
      onChange([]);
    }
  };

  const handleSelectReport = (reportId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedReports, reportId]);
    } else {
      onChange(selectedReports.filter(id => id !== reportId));
      setSelectAll(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Select Reports</CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={handleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium cursor-pointer"
            >
              Select All
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_REPORTS.map((report) => {
            const isSelected = selectedReports.includes(report.id);
            return (
              <div
                key={report.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleSelectReport(report.id, !isSelected)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectReport(report.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm text-balance">{report.name}</h4>
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground text-pretty">{report.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        <span>{report.dataSource}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{report.estimatedTime}</span>
                      </div>
                    </div>
                    {report.lastRunDate && (
                      <div className="text-xs text-muted-foreground">
                        Last run: {format(report.lastRunDate, 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedReports.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">
              {selectedReports.length} report{selectedReports.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All selected reports will be generated and included in the email
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

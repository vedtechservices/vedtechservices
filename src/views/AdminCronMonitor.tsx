import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/next-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/db/supabase';
import { ArrowLeft, RefreshCw, Play, Clock, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';

interface CronLog {
  id: string;
  job_name: string;
  executed_at: string;
  status: 'success' | 'failure' | 'running';
  details: string | null;
  created_at: string;
}

interface JobStats {
  total: number;
  success: number;
  failure: number;
  successRate: number;
}

export default function AdminCronMonitor() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [filterJob, setFilterJob] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState<Record<string, JobStats>>({});

  const jobDefinitions = [
    {
      name: 'calculate-engagement-scores',
      displayName: 'Daily Engagement Score Calculation',
      description: 'Recalculates customer engagement scores based on recent interactions',
      schedule: 'Daily at 2:00 AM UTC',
    },
    {
      name: 'generate-scheduled-reports',
      displayName: 'Hourly Scheduled Report Check',
      description: 'Checks for due scheduled reports and generates/sends them via email',
      schedule: 'Every hour',
    },
  ];

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    calculateStats();
  }, [logs]);

  const fetchLogs = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('cron_execution_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching cron logs:', error);
      toast.error('Failed to fetch cron logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = () => {
    const statsMap: Record<string, JobStats> = {};

    jobDefinitions.forEach((job) => {
      const jobLogs = logs.filter((log) => log.job_name === job.name);
      const total = jobLogs.length;
      const success = jobLogs.filter((log) => log.status === 'success').length;
      const failure = jobLogs.filter((log) => log.status === 'failure').length;
      const successRate = total > 0 ? (success / total) * 100 : 0;

      statsMap[job.name] = { total, success, failure, successRate };
    });

    setStats(statsMap);
  };

  const triggerJob = async (jobName: string) => {
    try {
      setTriggering(jobName);
      toast.info(`Triggering ${jobName}...`);

      const { data, error } = await supabase.functions.invoke(jobName, {
        method: 'POST',
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || error.message);
      }

      toast.success(`Successfully triggered ${jobName}`);
      
      // Refresh logs after a short delay
      setTimeout(fetchLogs, 2000);
    } catch (error: any) {
      console.error(`Error triggering ${jobName}:`, error);
      toast.error(`Failed to trigger ${jobName}: ${error.message}`);
    } finally {
      setTriggering(null);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterJob !== 'all' && log.job_name !== filterJob) return false;
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Success</Badge>;
      case 'failure':
        return <Badge className="bg-red-500 text-white"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'running':
        return <Badge className="bg-blue-500 text-white"><Activity className="h-3 w-3 mr-1" />Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="container pt-4"><AdminRoleWarning /></div>
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-bold text-white">Cron Job Monitor</h1>
                <p className="text-sm text-blue-200">Monitor automated job execution and performance</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white border border-white/20 hover:bg-white/10"
              onClick={fetchLogs}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Job Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {jobDefinitions.map((job) => {
              const jobStats = stats[job.name] || { total: 0, success: 0, failure: 0, successRate: 0 };
              const recentFailures = logs
                .filter((log) => log.job_name === job.name && log.status === 'failure')
                .slice(0, 3);

              return (
                <Card key={job.name} className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg text-balance">{job.displayName}</CardTitle>
                        <CardDescription className="text-pretty">{job.description}</CardDescription>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => triggerJob(job.name)}
                        disabled={triggering === job.name}
                        className="shrink-0 ml-2"
                      >
                        {triggering === job.name ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Trigger
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Schedule */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{job.schedule}</span>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Runs</p>
                        <p className="text-2xl font-bold">{jobStats.total}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Success</p>
                        <p className="text-2xl font-bold text-green-600">{jobStats.success}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{jobStats.failure}</p>
                      </div>
                    </div>

                    {/* Success Rate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-medium flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {jobStats.successRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${jobStats.successRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Recent Failures Alert */}
                    {recentFailures.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-red-900">Recent Failures</p>
                            <p className="text-xs text-red-700 mt-1">
                              {recentFailures.length} failure(s) in recent executions
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Execution History */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Execution History</CardTitle>
                  <CardDescription>Recent cron job execution logs</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={filterJob} onValueChange={setFilterJob}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by job" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Jobs</SelectItem>
                      {jobDefinitions.map((job) => (
                        <SelectItem key={job.name} value={job.name}>
                          {job.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failed</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-muted" />
                  ))}
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No execution logs found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Trigger a job manually or wait for scheduled execution
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-full overflow-x-auto">
                  <Table className="[&>div]:max-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Job Name</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Executed At</TableHead>
                        <TableHead className="whitespace-nowrap">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap font-medium">
                            {jobDefinitions.find((j) => j.name === log.job_name)?.displayName || log.job_name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{getStatusBadge(log.status)}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(log.executed_at)}</TableCell>
                          <TableCell className="whitespace-nowrap max-w-md">
                            <span className="truncate block" title={log.details || 'No details'}>
                              {log.details || 'No details'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

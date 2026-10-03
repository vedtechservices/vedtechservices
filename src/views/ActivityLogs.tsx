import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, Search, RefreshCw, Calendar, User, 
  Shield, Download, Filter, ArrowLeft, Clock, 
  Tag, Info, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useNavigate } from '@/lib/next-router';
import { LoadingSpinner } from '@/components/common/Loader';
import { useToast } from '@/hooks/use-toast';
import { canPerformAction } from '@/db/api';

interface LogEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  target_id: string;
  target_type: string;
  details: any;
  created_at: string;
}

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleArchiveLogs = async () => {
    if (!confirm('Move logs older than 90 days to the archive? This will clear up space and improve dashboard performance.')) return;
    
    setIsArchiving(true);
    try {
      const { data, error } = await supabase.functions.invoke('archive-logs');
      if (error) throw error;
      
      toast({
        title: "Archival Complete",
        description: data.message || "Successfully archived old logs."
      });
      fetchLogs();
    } catch (err: any) {
      console.error('Archival failed:', err);
      toast({
        title: "Archival Error",
        description: "Failed to move old records.",
        variant: "destructive"
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase
        .from('activity_logs') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
      setFilteredLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching logs:', err);
      toast({
        title: "Fetch Failed",
        description: "Could not load activity logs.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('vts_admin_role');
    if (!canPerformAction(role, 'super')) {
      navigate('/admin/dashboard');
      return;
    }
    fetchLogs();
  }, []);

  useEffect(() => {
    let result = logs;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.user_name?.toLowerCase().includes(term) ||
        log.action?.toLowerCase().includes(term) ||
        log.target_id?.toLowerCase().includes(term) ||
        log.target_type?.toLowerCase().includes(term)
      );
    }

    if (filterAction !== 'all') {
      result = result.filter(log => log.action === filterAction);
    }

    if (filterRole !== 'all') {
      result = result.filter(log => log.user_role === filterRole);
    }

    setFilteredLogs(result);
  }, [searchTerm, filterAction, filterRole, logs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadge = (action: string) => {
    const colorMap: Record<string, string> = {
      'CREATE_ADMIN': 'bg-green-100 text-green-800 border-green-200',
      'UPDATE_ADMIN': 'bg-blue-100 text-blue-800 border-blue-200',
      'DELETE_ADMIN': 'bg-red-100 text-red-800 border-red-200',
      'UPDATE_TICKET': 'bg-orange-100 text-orange-800 border-orange-200',
      'LOGIN': 'bg-slate-100 text-slate-800 border-slate-200'
    };
    return colorMap[action] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const exportLogs = () => {
    const headers = ['Date', 'User', 'Role', 'Action', 'Target Type', 'Target ID', 'Details'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        formatDate(log.created_at),
        log.user_name,
        log.user_role,
        log.action,
        log.target_type,
        log.target_id,
        JSON.stringify(log.details).replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `vedtech_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="text-white border-white/20 hover:bg-white/10" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Shield className="h-8 w-8 text-blue-400" />
                  System Activity Logs
                </h1>
                <p className="text-slate-400">Audit trail for security and compliance monitoring</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleArchiveLogs} disabled={isArchiving || isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isArchiving ? 'animate-spin' : ''}`} />
                {isArchiving ? 'Archiving...' : 'Archive Old Logs (90d+)'}
              </Button>
              <Button variant="secondary" onClick={exportLogs} disabled={filteredLogs.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={fetchLogs}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search logs by user, action, or target..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Action Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE_ADMIN">Create Admin</SelectItem>
                <SelectItem value="UPDATE_ADMIN">Update Admin</SelectItem>
                <SelectItem value="DELETE_ADMIN">Delete Admin</SelectItem>
                <SelectItem value="UPDATE_TICKET">Update Ticket</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="User Role" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="support_admin">Support Admin</SelectItem>
                <SelectItem value="billing_admin">Billing Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="flex-1 py-8">
        <div className="container">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-dashed border-slate-200">
              <LoadingSpinner size={48} />
              <p className="mt-4 text-slate-500 animate-pulse">Loading audit trail...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="py-20 text-center">
                <Info className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">No logs found</h3>
                <p className="text-slate-500">Try adjusting your filters or search terms.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-700">Timestamp</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">User</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Action</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Target</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{formatDate(log.created_at).split(',')[0]}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(log.created_at).split(',')[1]}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                              {log.user_name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900">{log.user_name}</span>
                              <Badge variant="outline" className="text-[10px] py-0 h-4 w-fit bg-slate-50">
                                {log.user_role}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${getActionBadge(log.action)} border font-semibold`}>
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{log.target_type}</span>
                            <span className="text-slate-900 font-mono text-xs">{log.target_id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                            {JSON.stringify(log.details)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50 border-t text-xs text-slate-500 text-right">
                Showing {filteredLogs.length} of {logs.length} system events
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ActivityLogs;

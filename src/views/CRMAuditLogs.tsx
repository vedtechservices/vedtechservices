import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@/lib/next-router';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  RefreshCw,
  Download,
  Eye,
  Plus,
  Edit,
  Trash2,
  Filter,
  ClipboardList
} from 'lucide-react';

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  admin_id: string | null;
  admin_email: string | null;
  admin_role: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changes: Record<string, { from: unknown; to: unknown }> | null;
  ip_address: string | null;
  created_at: string;
}

const TABLE_LABELS: Record<string, string> = {
  leads: 'Leads',
  meetings: 'Meetings',
  call_logs: 'Call Logs',
  tasks: 'Tasks',
  email_campaigns: 'Email Campaigns',
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800 border-green-200',
  UPDATE: 'bg-blue-100 text-blue-800 border-blue-200',
  DELETE: 'bg-red-100 text-reded-800 border-red-200',
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATE: <Plus className="h-3 w-3" />,
  UPDATE: <Edit className="h-3 w-3" />,
  DELETE: <Trash2 className="h-3 w-3" />,
};

function getRecordSummary(log: AuditLog): string {
  const d = log.new_data ?? log.old_data;
  if (!d) return log.record_id ?? '—';
  const name = (d.name ?? d.task_title ?? d.meeting_title ?? d.campaign_name) as string | undefined;
  const email = d.email as string | undefined;
  if (name) return email ? `${name} (${email})` : name;
  if (email) return email;
  return log.record_id ?? '—';
}

export default function CRMAuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTable, setFilterTable] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [metrics, setMetrics] = useState({ total: 0, creates: 0, updates: 0, deletes: 0 });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase
        .from('crm_audit_logs') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      const rows = (data ?? []) as AuditLog[];
      setLogs(rows);
      setMetrics({
        total: rows.length,
        creates: rows.filter(r => r.action === 'CREATE').length,
        updates: rows.filter(r => r.action === 'UPDATE').length,
        deletes: rows.filter(r => r.action === 'DELETE').length,
      });
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter(log => {
    const matchTable  = filterTable  === 'all' || log.table_name === filterTable;
    const matchAction = filterAction === 'all' || log.action     === filterAction;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      log.admin_email?.toLowerCase().includes(q) ||
      log.table_name.toLowerCase().includes(q) ||
      log.record_id?.toLowerCase().includes(q) ||
      getRecordSummary(log).toLowerCase().includes(q);
    return matchTable && matchAction && matchSearch;
  });

  const exportCSV = () => {
    const headers = ['Date', 'Table', 'Action', 'Record', 'Admin', 'Role'];
    const rows = filtered.map(l => [
      new Date(l.created_at).toLocaleString(),
      TABLE_LABELS[l.table_name] ?? l.table_name,
      l.action,
      getRecordSummary(l),
      l.admin_email ?? '—',
      l.admin_role ?? '—',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `crm_audit_${new Date().toISOString().split('T')[0]}.csv`,
    });
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-4 md:p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate('/admin/crm')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-7 w-7 text-primary" />
                CRM Audit Logs
              </h1>
              <p className="text-sm text-muted-foreground">Full change history for all CRM operations</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" onClick={fetchLogs} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportCSV} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Total Events', value: metrics.total, color: 'text-foreground' },
            { label: 'Created', value: metrics.creates, color: 'text-green-600' },
            { label: 'Updated', value: metrics.updates, color: 'text-blue-600' },
            { label: 'Deleted', value: metrics.deletes, color: 'text-destructive' },
          ].map(m => (
            <Card key={m.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">{m.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${m.color}`}>{loading ? '—' : m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by admin, table, or record…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterTable} onValueChange={setFilterTable}>
                <SelectTrigger className="w-full md:w-44 shrink-0">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  {Object.entries(TABLE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-full md:w-40 shrink-0">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Timestamp</th>
                    <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Table</th>
                    <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Action</th>
                    <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Record</th>
                    <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Admin</th>
                    <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Role</th>
                    <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-full bg-muted" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground">
                        No audit events found
                      </td>
                    </tr>
                  ) : (
                    filtered.map(log => (
                      <tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="outline" className="text-xs">
                            {TABLE_LABELS[log.table_name] ?? log.table_name}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${ACTION_COLORS[log.action] ?? 'bg-muted text-foreground'}`}>
                            {ACTION_ICONS[log.action]}
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[180px] truncate text-xs">
                          {getRecordSummary(log)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                          {log.admin_email ?? '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {log.admin_role ? (
                            <Badge variant="secondary" className="text-xs capitalize">
                              {log.admin_role.replace('_', ' ')}
                            </Badge>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="h-7 px-2 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Audit Event Detail
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Timestamp', value: new Date(selectedLog.created_at).toLocaleString() },
                  { label: 'Table', value: TABLE_LABELS[selectedLog.table_name] ?? selectedLog.table_name },
                  { label: 'Action', value: selectedLog.action },
                  { label: 'Record ID', value: selectedLog.record_id ?? '—' },
                  { label: 'Admin', value: selectedLog.admin_email ?? '—' },
                  { label: 'Role', value: selectedLog.admin_role ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium break-all">{value}</p>
                  </div>
                ))}
              </div>

              {/* Field Changes */}
              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Field Changes</p>
                  <div className="rounded-md border divide-y">
                    {Object.entries(selectedLog.changes).map(([field, change]) => (
                      <div key={field} className="px-3 py-2 grid grid-cols-3 gap-2 text-xs">
                        <span className="font-medium text-muted-foreground capitalize">{field.replace(/_/g, ' ')}</span>
                        <span className="text-destructive line-through truncate">{String(change.from ?? '—')}</span>
                        <span className="text-green-600 font-medium truncate">{String(change.to ?? '—')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Data (CREATE) */}
              {selectedLog.action === 'CREATE' && selectedLog.new_data && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Created Record</p>
                  <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(selectedLog.new_data, null, 2)}
                  </pre>
                </div>
              )}

              {/* Old Data (DELETE) */}
              {selectedLog.action === 'DELETE' && selectedLog.old_data && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Deleted Record</p>
                  <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(selectedLog.old_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShieldAlert, ShieldCheck, Shield, 
  ArrowLeft, Search, RefreshCw, 
  Monitor, Smartphone, Globe, AlertCircle, Info 
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useNavigate } from '@/lib/next-router';
import { LoadingSpinner } from '@/components/common/Loader';
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';

interface LoginAuditLog {
  id: string;
  email: string;
  action: string;
  status: string;
  ip_address: string;
  user_agent: string;
  device_info: any;
  failure_reason: string | null;
  created_at: string;
}

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<LoginAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('login_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('vts_admin_auth');
    const role = localStorage.getItem('vts_admin_role');
    if (!isAuth || role !== 'super_admin') {
      navigate('/admin/dashboard');
      return;
    }
    fetchLogs();
  }, [navigate]);

  const filteredLogs = logs.filter(log => 
    log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <Badge className="bg-green-100 text-green-700">SUCCESS</Badge>;
      case 'FAILURE': return <Badge className="bg-red-100 text-red-700">FAILURE</Badge>;
      case 'PENDING_2FA': return <Badge className="bg-blue-100 text-blue-700">PENDING 2FA</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN_ATTEMPT': return <Shield className="h-4 w-4 text-slate-400" />;
      case '2FA_VERIFY': return <Smartphone className="h-4 w-4 text-blue-500" />;
      case 'LOGIN_SUCCESS': return <ShieldCheck className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      <div className="container pt-4"><AdminRoleWarning /></div>
      <section className="bg-slate-900 text-white py-12">
        <div className="container">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="text-white border-white/20 hover:bg-white/10" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldAlert className="h-8 w-8 text-orange-400" />
                Security Audit Logs
              </h1>
              <p className="text-slate-400">Track 2FA authentication attempts and login history</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b sticky top-0 z-10">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by email or action..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Logs
            </Button>
          </div>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size={48} />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <Card key={log.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            {getActionIcon(log.action)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{log.email}</p>
                            <p className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</p>
                          </div>
                          <div className="ml-auto md:ml-4">
                            {getStatusBadge(log.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t text-xs">
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Action</span>
                            <p className="font-medium text-slate-700">{log.action}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Device</span>
                            <p className="font-medium text-slate-700">{log.device_info?.os} • {log.device_info?.browser}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">IP Address</span>
                            <p className="font-medium text-slate-700">{log.ip_address || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Type</span>
                            <p className="font-medium text-slate-700">{log.device_info?.device}</p>
                          </div>
                        </div>

                        {log.failure_reason && (
                          <div className="bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2 mt-2">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-700">Reason: {log.failure_reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredLogs.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
                  <p className="text-slate-500">No security logs found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminAuditLogs;

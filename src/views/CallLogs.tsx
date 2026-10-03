import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/next-router';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  PhoneCall, 
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Search,
  Download,
  Plus,
  User
} from 'lucide-react';
import type { CallLog, Customer, Lead } from '@/types';
import { crmOperation } from '@/lib/crmOperations';

export default function CallLogs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOutcome, setFilterOutcome] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [metrics, setMetrics] = useState({
    total: 0,
    successful: 0,
    missed: 0,
    avgDuration: 0
  });

  const [newCall, setNewCall] = useState({
    customer_id: '',
    lead_id: '',
    call_type: 'Outbound' as 'Inbound' | 'Outbound',
    call_outcome: 'Answered',
    call_duration: 0,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch call logs
      const { data: callsData, error: callsError } = await supabase
        .from('call_logs')
        .select('*')
        .order('call_date', { ascending: false });

      if (callsError) throw callsError;

      const calls = (callsData || []) as CallLog[];
      setCallLogs(calls);

      // Calculate metrics
      const total = calls.length;
      const successful = calls.filter(c => c.call_outcome === 'Answered').length;
      const missed = calls.filter(c => c.call_outcome === 'No Answer' || c.call_outcome === 'Busy').length;
      const avgDuration = calls.length > 0
        ? calls.reduce((sum, c) => sum + (c.call_duration || 0), 0) / calls.length
        : 0;

      setMetrics({ total, successful, missed, avgDuration });

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');

      if (customersError) throw customersError;

      setCustomers((customersData || []) as Customer[]);

      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, name')
        .order('name');

      if (leadsError) throw leadsError;

      setLeads((leadsData || []) as Lead[]);

    } catch (error) {
      console.error('Error fetching call logs:', error);
      toast.error('Failed to load call logs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCall = async () => {
    if (!newCall.customer_id && !newCall.lead_id) {
      toast.error('Please select a customer or lead');
      return;
    }
    if (newCall.call_duration < 0) {
      toast.error('Call duration must be 0 or greater.');
      return;
    }

    try {
      const result = await crmOperation({
        table: 'call_logs',
        action: 'CREATE',
        data: {
          customer_id: newCall.customer_id || null,
          lead_id: newCall.lead_id || null,
          call_type: newCall.call_type,
          call_outcome: newCall.call_outcome,
          call_duration: newCall.call_duration,
          notes: newCall.notes || null,
          call_date: new Date().toISOString()
        }
      });

      if (!result.success) {
        (result.errors ?? [result.error ?? 'Failed to add call log.']).forEach(e => toast.error(e));
        return;
      }

      toast.success('Call log added and audited successfully');
      setShowAddDialog(false);
      setNewCall({
        customer_id: '',
        lead_id: '',
        call_type: 'Outbound',
        call_outcome: 'Answered',
        call_duration: 0,
        notes: ''
      });
      fetchData();

    } catch (error) {
      console.error('Error adding call log:', error);
      toast.error('Failed to add call log');
    }
  };

  const filteredCalls = callLogs.filter(call => {
    const matchesOutcome = filterOutcome === 'all' || call.call_outcome === filterOutcome;
    const matchesSearch = searchQuery === '' || 
      call.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesOutcome && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Outcome', 'Duration (min)', 'Notes'];
    const rows = filteredCalls.map(c => [
      new Date(c.call_date).toLocaleString(),
      c.call_type,
      c.call_outcome,
      c.call_duration || 0,
      c.notes || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Call logs exported successfully');
  };

  const getCallIcon = (type: string, outcome: string) => {
    if (outcome === 'No Answer' || outcome === 'Busy') {
      return <PhoneMissed className="h-4 w-4 text-red-500" />;
    }
    return type === 'Inbound' 
      ? <PhoneIncoming className="h-4 w-4 text-green-500" />
      : <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Answered': return 'default';
      case 'No Answer': return 'secondary';
      case 'Busy': return 'secondary';
      case 'Voicemail': return 'outline';
      default: return 'secondary';
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
              onClick={() => navigate('/admin/crm')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Call Logs</h1>
              <p className="text-muted-foreground">Track and manage customer call history</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Call
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Log New Call</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer</Label>
                      <Select
                        value={newCall.customer_id}
                        onValueChange={(value) => setNewCall({ ...newCall, customer_id: value, lead_id: '' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead">Lead</Label>
                      <Select
                        value={newCall.lead_id}
                        onValueChange={(value) => setNewCall({ ...newCall, lead_id: value, customer_id: '' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {leads.map(lead => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Call Type</Label>
                      <Select
                        value={newCall.call_type}
                        onValueChange={(value) => setNewCall({ ...newCall, call_type: value as 'Inbound' | 'Outbound' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inbound">Inbound</SelectItem>
                          <SelectItem value="Outbound">Outbound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outcome">Call Outcome</Label>
                      <Select
                        value={newCall.call_outcome}
                        onValueChange={(value) => setNewCall({ ...newCall, call_outcome: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Answered">Answered</SelectItem>
                          <SelectItem value="No Answer">No Answer</SelectItem>
                          <SelectItem value="Busy">Busy</SelectItem>
                          <SelectItem value="Voicemail">Voicemail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newCall.call_duration}
                      onChange={(e) => setNewCall({ ...newCall, call_duration: parseInt(e.target.value) || 0 })}
                      placeholder="15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newCall.notes}
                      onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                      placeholder="Call summary and key points discussed..."
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCall}>
                    Log Call
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.total}</div>
                  <p className="text-xs text-muted-foreground">All logged calls</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Answered</CardTitle>
              <PhoneIncoming className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.successful}</div>
                  <p className="text-xs text-muted-foreground">Connected calls</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missed</CardTitle>
              <PhoneMissed className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.missed}</div>
                  <p className="text-xs text-muted-foreground">No answer/busy</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.avgDuration.toFixed(1)} min</div>
                  <p className="text-xs text-muted-foreground">Per call</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call Logs List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Call History</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={filterOutcome} onValueChange={setFilterOutcome}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Outcomes</SelectItem>
                    <SelectItem value="Answered">Answered</SelectItem>
                    <SelectItem value="No Answer">No Answer</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="Voicemail">Voicemail</SelectItem>
                  </SelectContent>
                </Select>
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
            ) : filteredCalls.length === 0 ? (
              <div className="text-center py-12">
                <PhoneCall className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No call logs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCalls.map(call => (
                  <div
                    key={call.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="mt-1">
                      {getCallIcon(call.call_type, call.call_outcome)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{call.call_type} Call</span>
                        <Badge variant={getOutcomeColor(call.call_outcome)}>
                          {call.call_outcome}
                        </Badge>
                        {call.call_duration && call.call_duration > 0 && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {call.call_duration} min
                          </span>
                        )}
                      </div>
                      {call.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{call.notes}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{new Date(call.call_date).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

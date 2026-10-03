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
  Calendar,
  Video,
  MapPin,
  Clock,
  Users,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import type { Meeting, Customer, Lead } from '@/types';
import { crmOperation } from '@/lib/crmOperations';

export default function MeetingScheduler() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [metrics, setMetrics] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });

  const [newMeeting, setNewMeeting] = useState({
    customer_id: '',
    lead_id: '',
    meeting_title: '',
    meeting_date: '',
    meeting_time: '',
    location: '',
    meeting_type: 'In-Person' as 'In-Person' | 'Phone' | 'Video Call',
    notes: '',
    meeting_status: 'Scheduled' as const
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .order('meeting_date', { ascending: true });

      if (meetingsError) throw meetingsError;

      const meetings = (meetingsData || []) as Meeting[];
      setMeetings(meetings);

      // Calculate metrics
      const now = new Date();
      const total = meetings.length;
      const upcoming = meetings.filter(m => 
        m.meeting_status === 'Scheduled' && new Date(m.meeting_date) > now
      ).length;
      const completed = meetings.filter(m => m.meeting_status === 'Completed').length;
      const cancelled = meetings.filter(m => m.meeting_status === 'Cancelled').length;

      setMetrics({ total, upcoming, completed, cancelled });

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
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeeting = async () => {
    const errors: string[] = [];
    if (!newMeeting.meeting_title.trim()) errors.push('Meeting title is required.');
    if (!newMeeting.meeting_date) errors.push('Meeting date is required.');
    if (!newMeeting.meeting_time) errors.push('Meeting time is required.');
    if (!newMeeting.customer_id && !newMeeting.lead_id) errors.push('Please select a customer or lead.');

    if (errors.length > 0) {
      errors.forEach(e => toast.error(e));
      return;
    }

    try {
      const meetingDateTime = `${newMeeting.meeting_date}T${newMeeting.meeting_time}:00`;

      const result = await crmOperation({
        table: 'meetings',
        action: 'CREATE',
        data: {
          customer_id: newMeeting.customer_id || null,
          lead_id: newMeeting.lead_id || null,
          meeting_title: newMeeting.meeting_title,
          meeting_date: meetingDateTime,
          meeting_type: newMeeting.meeting_type,
          meeting_status: newMeeting.meeting_status,
          notes: newMeeting.notes || null
        }
      });

      if (!result.success) {
        (result.errors ?? [result.error ?? 'Failed to schedule meeting.']).forEach(e => toast.error(e));
        return;
      }

      toast.success('Meeting scheduled successfully');
      setShowAddDialog(false);
      setNewMeeting({
        customer_id: '',
        lead_id: '',
        meeting_title: '',
        meeting_date: '',
        meeting_time: '',
        location: '',
        meeting_type: 'In-Person',
        notes: '',
        meeting_status: 'Scheduled'
      });
      fetchData();

    } catch (error) {
      console.error('Error adding meeting:', error);
      toast.error('Failed to schedule meeting');
    }
  };

  const handleUpdateStatus = async (meetingId: string, newStatus: Meeting['meeting_status']) => {
    try {
      const result = await crmOperation({
        table: 'meetings',
        action: 'UPDATE',
        record_id: meetingId,
        data: { meeting_status: newStatus }
      });

      if (!result.success) {
        toast.error(result.errors?.[0] ?? 'Failed to update meeting status');
        return;
      }

      toast.success(`Meeting ${newStatus.toLowerCase()} successfully`);
      fetchData();

    } catch (error) {
      console.error('Error updating meeting status:', error);
      toast.error('Failed to update meeting status');
    }
  };

  const filteredMeetings = filterStatus === 'all' 
    ? meetings 
    : meetings.filter(m => m.meeting_status === filterStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Scheduled': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'default';
      case 'Completed': return 'outline';
      case 'Cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'Video Call': return <Video className="h-4 w-4" />;
      case 'In-Person': return <MapPin className="h-4 w-4" />;
      case 'Phone': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
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
              <h1 className="text-3xl font-bold">Meeting Scheduler</h1>
              <p className="text-muted-foreground">Schedule and manage customer meetings</p>
            </div>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title *</Label>
                  <Input
                    id="title"
                    value={newMeeting.meeting_title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meeting_title: e.target.value })}
                    placeholder="Product Demo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select
                      value={newMeeting.customer_id}
                      onValueChange={(value) => setNewMeeting({ ...newMeeting, customer_id: value, lead_id: '' })}
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
                      value={newMeeting.lead_id}
                      onValueChange={(value) => setNewMeeting({ ...newMeeting, lead_id: value, customer_id: '' })}
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
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newMeeting.meeting_date}
                      onChange={(e) => setNewMeeting({ ...newMeeting, meeting_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newMeeting.meeting_time}
                      onChange={(e) => setNewMeeting({ ...newMeeting, meeting_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Meeting Type</Label>
                  <Select
                    value={newMeeting.meeting_type}
                    onValueChange={(value) => setNewMeeting({ ...newMeeting, meeting_type: value as 'In-Person' | 'Phone' | 'Video Call' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-Person">In-Person</SelectItem>
                      <SelectItem value="Video Call">Video Call</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newMeeting.notes}
                    onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
                    placeholder="Meeting notes and discussion points..."
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMeeting}>
                  Schedule Meeting
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.total}</div>
                  <p className="text-xs text-muted-foreground">All meetings</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.upcoming}</div>
                  <p className="text-xs text-muted-foreground">Scheduled</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.completed}</div>
                  <p className="text-xs text-muted-foreground">Finished</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.cancelled}</div>
                  <p className="text-xs text-muted-foreground">Not held</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Meetings List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Meetings</CardTitle>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full bg-muted" />
                ))}
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No meetings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMeetings.map(meeting => (
                  <div
                    key={meeting.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(meeting.meeting_status)}
                          <h3 className="font-semibold">{meeting.meeting_title}</h3>
                          <Badge variant={getStatusColor(meeting.meeting_status)}>
                            {meeting.meeting_status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(meeting.meeting_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(meeting.meeting_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getMeetingTypeIcon(meeting.meeting_type)}
                            <span>{meeting.meeting_type}</span>
                          </div>
                        </div>

                        {meeting.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{meeting.notes}</p>
                        )}
                      </div>

                      {meeting.meeting_status === 'Scheduled' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(meeting.id, 'Completed')}
                          >
                            Complete
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(meeting.id, 'Cancelled')}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
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

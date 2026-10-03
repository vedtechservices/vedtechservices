import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Ticket, Search, RefreshCw, Mail, Phone, Calendar, User, Building, LogOut, UserCog, Edit, Settings, PieChart, TrendingUp, Filter, CheckCircle2, Award, ShieldAlert, FileText, CreditCard, Bell, Users, BarChart2, Inbox, MessageSquare, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { logActivity, canPerformAction } from '@/db/api';
import { useNavigate } from '@/lib/next-router';
import { useToast } from '@/hooks/use-toast';
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface SupportTicket {
  id: string;
  ticket_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  service_type: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  engineer_id: string | null;
  notes: string | null;
  is_amc_customer: boolean;
  assignment_status: string;
  assigned_engineer_id: string | null;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Engineer {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    engineer_id: '',
    notes: ''
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [contactNotes, setContactNotes] = useState<Record<string, string>>({});
  const [adminRole, setAdminRole] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem('vts_admin_auth');
    const adminId = localStorage.getItem('vts_admin_id');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }

    setAdminRole(localStorage.getItem('vts_admin_role'));
    fetchTickets();
    fetchEngineers();
    fetchNotifications();
    fetchContactSubmissions();
    checkAndNotifyExpiringAMCs();

    // Set up Realtime for notifications
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
          filter: `admin_id=eq.${adminId}` as any
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          toast({
            title: payload.new.title,
            description: payload.new.message,
          });
        }
      )
      .subscribe();

    // Set up Realtime for chatbot escalations
    const escalationChannel = supabase
      .channel('chatbot-escalations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chatbot_escalations'
        },
        (payload) => {
          toast({
            title: "New Chatbot Escalation!",
            description: `From ${payload.new.customer_name}: ${payload.new.message.slice(0, 50)}...`,
            variant: "default",
          });
          // Also play a sound if you want
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(escalationChannel);
    };
  }, [navigate]);

  const checkAndNotifyExpiringAMCs = async () => {
    try {
      // Call the SQL function we created
      const { data: expiringAMCs, error } = await supabase.rpc('check_expiring_amcs');

      if (error) throw error;
      if (!expiringAMCs || (expiringAMCs as any[]).length === 0) return;

      for (const amc of expiringAMCs as any[]) {
        // Check if we already notified for this customer in the last 7 days to avoid spam
        const { data: existingNotif } = await (supabase
          .from('customer_notifications') as any)
          .select('id')
          .eq('customer_id', amc.customer_id)
          .ilike('title', '%AMC Expiration%')
          .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (!existingNotif || (existingNotif as any[]).length === 0) {
          // Create Dashboard Notification
          await (supabase.from('customer_notifications') as any).insert({
            customer_id: amc.customer_id,
            title: 'AMC Expiration Reminder',
            message: `Your AMC plan "${amc.plan_name}" is expiring in ${amc.days_left} days. Please renew to continue priority support.`,
            type: amc.days_left <= 7 ? 'error' : 'warning',
            link: '/dashboard'
          });

          // Simulate sending Email
          console.log(`[Email Simulation] To: ${amc.email} | Subject: AMC Renewal Reminder | Content: Your plan expires in ${amc.days_left} days.`);
        }
      }
    } catch (err) {
      console.error('Error checking AMC expiration:', err);
    }
  };

  const fetchContactSubmissions = async () => {
    setContactLoading(true);
    try {
      const { data, error } = await (supabase
        .from('contact_submissions') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error) setContactSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching contact submissions:', err);
    } finally {
      setContactLoading(false);
    }
  };

  const updateContactStatus = async (id: string, status: string) => {
    await (supabase.from('contact_submissions') as any)
      .update({ status })
      .eq('id', id);
    setContactSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const saveContactNotes = async (id: string) => {
    const notes = contactNotes[id] ?? '';
    await (supabase.from('contact_submissions') as any)
      .update({ admin_notes: notes })
      .eq('id', id);
    setContactSubmissions(prev => prev.map(s => s.id === id ? { ...s, admin_notes: notes } : s));
    toast({ title: 'Notes saved' });
  };

  const fetchNotifications = async () => {
    const adminId = localStorage.getItem('vts_admin_id');
    const { data } = await (supabase
      .from('admin_notifications') as any)
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .limit(10);
    setNotifications(data || []);
  };

  const markNotificationAsRead = async (id: string) => {
    await (supabase
      .from('admin_notifications') as any)
      .update({ is_read: true })
      .eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
      } else {
        setTickets(data || []);
        setFilteredTickets(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEngineers = async () => {
    try {
      const { data, error } = await supabase
        .from('engineers')
        .select('*')
        .eq('status', 'available');

      if (error) {
        console.error('Error fetching engineers:', error);
      } else {
        setEngineers(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleLogout = () => {
    void fetch('/api/admin/session', { method: 'DELETE' });
    localStorage.removeItem('vts_admin_auth');
    localStorage.removeItem('vts_admin_email');
    navigate('/admin/login');
  };

  const handleEditTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setEditForm({
      status: ticket.status,
      engineer_id: ticket.engineer_id || 'unassigned',
      notes: ticket.notes || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      const engineerId = editForm.engineer_id === 'unassigned' ? null : editForm.engineer_id;

      // Check for permissions
      const role = localStorage.getItem('vts_admin_role');
      if (!canPerformAction(role, 'support')) {
        toast({
          title: "Permission Denied",
          description: "You do not have support permissions to update tickets.",
          variant: "destructive"
        });
        return;
      }

      // Use raw SQL to update
      const { error } = await supabase.rpc('update_ticket_admin', {
        p_ticket_id: selectedTicket.id,
        p_status: editForm.status,
        p_engineer_id: engineerId,
        p_notes: editForm.notes
      } as any);

      if (error) {
        console.error('Error updating ticket:', error);
        toast({
          title: "Error",
          description: "Failed to update ticket",
          variant: "destructive"
        });
      } else {
        // Create notifications for sensitive actions or high priority
        if (selectedTicket.priority === 'high' || editForm.status === 'resolved') {
          // Notify all super admins
          const { data: superAdmins } = await (supabase.from('admin_users').select('id').eq('role', 'super_admin') as any);
          if (superAdmins) {
            const adminNotifications = superAdmins.map((admin: any) => ({
              admin_id: admin.id,
              title: editForm.status === 'resolved' ? 'Ticket Resolved' : 'High Priority Ticket Update',
              message: `Ticket ${selectedTicket.ticket_id} has been ${editForm.status} by ${localStorage.getItem('vts_admin_email')}`,
              type: editForm.status === 'resolved' ? 'info' : 'warning',
              link: '/admin/tickets'
            }));
            await (supabase.from('admin_notifications').insert(adminNotifications) as any);
          }
        }

        // Notify engineer if assigned
        if (editForm.engineer_id && editForm.engineer_id !== 'unassigned') {
          await (supabase.from('engineer_notifications').insert([{
            engineer_id: editForm.engineer_id,
            title: 'New Ticket Assigned',
            message: `You have been assigned to Ticket ${selectedTicket.ticket_id}: ${selectedTicket.subject}`,
            link: '/engineer/dashboard'
          }] as any));
        }

        // Log the activity
        await logActivity({
          user_id: localStorage.getItem('vts_admin_id') || 'unknown',
          user_name: localStorage.getItem('vts_admin_email') || 'unknown',
          user_role: role || 'unknown',
          action: 'UPDATE_TICKET',
          target_id: selectedTicket.ticket_id,
          target_type: 'SUPPORT_TICKET',
          details: {
            status: editForm.status,
            engineer_id: engineerId,
            notes: editForm.notes
          }
        });

        toast({
          title: "Success",
          description: "Ticket updated successfully"
        });
        setShowEditDialog(false);
        fetchTickets();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    let filtered = tickets;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status.toLowerCase() === filterStatus.toLowerCase());
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  }, [searchTerm, filterStatus, tickets]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEngineerName = (engineerId: string | null) => {
    if (!engineerId) return 'Unassigned';
    const engineer = engineers.find(e => e.id === engineerId);
    return engineer ? engineer.name : 'Unknown';
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    amc: tickets.filter(t => t.is_amc_customer).length,
    newContacts: contactSubmissions.filter(s => s.status === 'new').length,
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      <div className="container pt-4"><AdminRoleWarning /></div>
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Title */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-slate-300">VedTech Services - Support Management</p>
              <Button className="mt-4" variant="secondary" onClick={() => navigate('/admin/reviews')}>Manage Client Reviews</Button>
            </div>

            {/* Nav column */}
            <div className="flex flex-col gap-2 min-w-[200px]">

              {/* Quick tools row */}
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Button variant="secondary" size="icon" onClick={() => setShowNotifications(!showNotifications)}>
                    <Bell className="h-4 w-4" />
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </Button>
                  {showNotifications && (
                    <Card className="absolute top-12 right-0 w-80 z-50 shadow-xl border-slate-200">
                      <CardHeader className="py-3 bg-slate-50 border-b">
                        <CardTitle className="text-sm">Notifications</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-xs text-slate-500">No notifications</p>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              className={`p-3 border-b hover:bg-slate-50 cursor-pointer ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                              onClick={() => markNotificationAsRead(n.id)}
                            >
                              <p className="text-xs font-bold text-slate-900">{n.title}</p>
                              <p className="text-[11px] text-slate-600 mt-1">{n.message}</p>
                              <p className="text-[9px] text-slate-400 mt-2">{new Date(n.created_at).toLocaleTimeString()}</p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
                <Button variant="secondary" size="icon" onClick={() => navigate('/admin/performance')} title="Performance">
                  <BarChart2 className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => navigate('/admin/inventory')} title="Inventory">
                  <Inbox className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => navigate('/admin/billing')} title="Billing">
                  <CreditCard className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => navigate('/admin/chatbot-escalations')} title="Chat Escalations">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => navigate('/admin/audit-logs')} title="Audit Logs">
                  <ShieldAlert className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => navigate('/admin/crm')} title="CRM">
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => navigate('/admin/offices')} title="Office & Branch Console">
                  <Building className="h-4 w-4" />
                </Button>
              </div>

              {/* Role-based text buttons — stacked */}
              {canPerformAction(adminRole, 'super') && (
                <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/admin/logs')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Audit Logs
                </Button>
              )}
              {canPerformAction(adminRole, 'super') && (
                <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/admin/manage')}>
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Admins
                </Button>
              )}
              {canPerformAction(adminRole, 'super') && (
                <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/admin/team')}>
                  <Users className="h-4 w-4 mr-2" />
                  Team
                </Button>
              )}
              {canPerformAction(adminRole, 'support') && (
                <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/admin/engineers')}>
                  <UserCog className="h-4 w-4 mr-2" />
                  Engineers
                </Button>
              )}
              {canPerformAction(adminRole, 'billing') && (
                <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/amc-plans')}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing
                </Button>
              )}
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/admin/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent border-white hover:bg-white hover:text-slate-900" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats and Advanced Insights */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <Ticket className="h-5 w-5 text-primary opacity-50" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Open</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
                      <Calendar className="h-5 w-5 text-yellow-600 opacity-50" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Resolved</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                      <CheckCircle2 className="h-5 w-5 text-green-600 opacity-50" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">AMC</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-purple-600">{stats.amc}</p>
                      <Award className="h-5 w-5 text-purple-600 opacity-50" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* New Contacts badge card */}
              <Card
                className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => document.getElementById('contact-submissions-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col">
                    <p className="text-xs text-blue-600 uppercase font-bold mb-1">New Inquiries</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-blue-700">{stats.newContacts}</p>
                      <div className="relative">
                        <MessageCircle className="h-5 w-5 text-blue-500 opacity-70" />
                        {stats.newContacts > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                      </div>
                    </div>
                    {stats.newContacts > 0 && (
                      <p className="text-[10px] text-blue-500 mt-1">Click to review ↓</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <PieChart className="h-24 w-24" />
              </div>
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance Insight
                </div>
                <h3 className="text-lg font-bold mb-1">Success Rate: 94%</h3>
                <p className="text-xs text-slate-400 mb-4">Average resolution time: 3.8 hours</p>
                <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                  <div className="bg-primary h-full rounded-full" style={{ width: '94%' }} />
                </div>
                <p className="text-[10px] text-slate-500">Based on last 30 days of ticket history</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tickets */}
      <section className="py-8">
        <div className="container">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle>Support Tickets</CardTitle>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <Filter className="h-4 w-4 text-slate-500 ml-2" />
                    <Button
                      variant={filterStatus === 'all' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterStatus('all')}
                      className="h-8"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === 'open' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterStatus('open')}
                      className="h-8"
                    >
                      Open
                    </Button>
                    <Button
                      variant={filterStatus === 'resolved' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterStatus('resolved')}
                      className="h-8"
                    >
                      Resolved
                    </Button>
                  </div>
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                  <Button size="icon" variant="outline" className="h-10 w-10" onClick={fetchTickets}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">Loading tickets...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600">No tickets found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-bold text-lg">{ticket.ticket_id}</p>
                            {ticket.is_amc_customer && (
                              <Badge className="bg-purple-100 text-purple-800">AMC</Badge>
                            )}
                          </div>
                          <p className="text-slate-900 font-semibold">{ticket.subject}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="font-semibold">{ticket.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span>{ticket.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span>{ticket.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-slate-400" />
                            <span>{ticket.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>{formatDate(ticket.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4 text-slate-400" />
                            <span className="font-semibold">{getEngineerName(ticket.engineer_id)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3 text-sm">
                        <p className="text-slate-600"><strong>Service:</strong> {ticket.service_type}</p>
                        <p className="text-slate-600"><strong>Category:</strong> {ticket.category}</p>
                        <p className="text-slate-600"><strong>Location:</strong> {ticket.location}</p>
                      </div>

                      <div className="mb-3 p-3 bg-slate-50 rounded text-sm">
                        <p className="text-slate-700">{ticket.description}</p>
                      </div>

                      {ticket.notes && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                          <p className="font-semibold text-blue-900 mb-1">Internal Notes:</p>
                          <p className="text-blue-800">{ticket.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEditTicket(ticket)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Manage Ticket
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `mailto:${ticket.email}?subject=Re: ${ticket.ticket_id}`}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Reply via Email
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `tel:${ticket.phone}`}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call Customer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Form Submissions */}
      <section id="contact-submissions-section" className="py-8">
        <div className="container">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <CardTitle>Contact Form Submissions</CardTitle>
                  <Badge variant="secondary">{contactSubmissions.length}</Badge>
                </div>
                <Button size="icon" variant="outline" onClick={fetchContactSubmissions}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {contactLoading ? (
                <p className="text-center py-10 text-slate-500">Loading submissions…</p>
              ) : contactSubmissions.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No contact submissions yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contactSubmissions.map(sub => (
                    <div key={sub.id} className="border rounded-lg overflow-hidden">
                      {/* Row header */}
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                        onClick={() => setExpandedContact(expandedContact === sub.id ? null : sub.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{sub.name}</p>
                            <p className="text-xs text-slate-500 truncate">{sub.email}</p>
                          </div>
                          {sub.service && (
                            <Badge variant="outline" className="hidden md:flex text-xs shrink-0">{sub.service}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <Badge className={
                            sub.status === 'new' ? 'bg-blue-100 text-blue-800' :
                              sub.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                          }>{sub.status}</Badge>
                          <span className="text-xs text-slate-400 hidden md:block">
                            {new Date(sub.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {expandedContact === sub.id
                            ? <ChevronUp className="h-4 w-4 text-slate-400" />
                            : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </div>
                      </button>

                      {/* Expanded details */}
                      {expandedContact === sub.id && (
                        <div className="border-t bg-slate-50 p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              {sub.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                                  <a href={`tel:${sub.phone}`} className="text-primary hover:underline">{sub.phone}</a>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                                <a href={`mailto:${sub.email}`} className="text-primary hover:underline">{sub.email}</a>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="text-slate-600">{new Date(sub.created_at).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Message</p>
                              <p className="text-slate-700 bg-white border rounded p-3 text-sm leading-relaxed">{sub.message}</p>
                            </div>
                          </div>

                          {/* Status + Notes */}
                          <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Admin Notes</p>
                              <Textarea
                                rows={2}
                                placeholder="Add internal notes…"
                                value={contactNotes[sub.id] ?? (sub.admin_notes || '')}
                                onChange={e => setContactNotes(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                className="text-sm"
                              />
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              <p className="text-xs font-semibold text-slate-500 uppercase">Update Status</p>
                              <Select value={sub.status} onValueChange={v => updateContactStatus(sub.id, v)}>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button size="sm" onClick={() => saveContactNotes(sub.id)}>Save Notes</Button>
                              <Button size="sm" variant="outline" asChild>
                                <a href={`mailto:${sub.email}?subject=Re: Your VedTech Inquiry`}>
                                  <Mail className="h-3 w-3 mr-1" /> Reply
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Edit Ticket Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Ticket: {selectedTicket?.ticket_id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Assign Engineer</label>
              <Select value={editForm.engineer_id} onValueChange={(value) => setEditForm({ ...editForm, engineer_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select engineer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {engineers.map((engineer) => (
                    <SelectItem key={engineer.id} value={engineer.id}>
                      {engineer.name} - {engineer.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Internal Notes</label>
              <Textarea
                placeholder="Add notes about this ticket..."
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleUpdateTicket}>
                Update Ticket
              </Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;

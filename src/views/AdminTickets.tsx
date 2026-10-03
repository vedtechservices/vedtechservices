import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Ticket, Search, RefreshCw, Mail, Phone, Calendar, User, Building } from 'lucide-react';
import { supabase } from '@/db/supabase';

import { LoadingSpinner } from '@/components/common/Loader';
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';

interface SupportTicket {
  id: string;
  ticket_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    let filtered = tickets;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filterStatus);
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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'closed':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      <div className="container pt-4"><AdminRoleWarning /></div>
      {/* Header */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-primary text-white py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Support Tickets Admin</h1>
              <p className="text-blue-100">Manage and view all customer support requests</p>
            </div>
            <Button
              onClick={fetchTickets}
              variant="secondary"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by ticket ID, name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All ({tickets.length})
              </Button>
              <Button
                variant={filterStatus === 'open' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('open')}
                size="sm"
              >
                Open ({tickets.filter(t => t.status === 'open').length})
              </Button>
              <Button
                variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('resolved')}
                size="sm"
              >
                Resolved ({tickets.filter(t => t.status === 'resolved').length})
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tickets List */}
      <section className="py-8">
        <div className="container">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <LoadingSpinner size={48} />
              <p className="text-slate-500 font-medium animate-pulse mt-4">Fetching support tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600">No tickets found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl">{ticket.ticket_id}</CardTitle>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-lg font-semibold text-slate-900">{ticket.subject}</p>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(ticket.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <div>
                          <div className="text-xs text-slate-500">Name</div>
                          <div className="font-medium">{ticket.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <div>
                          <div className="text-xs text-slate-500">Email</div>
                          <div className="font-medium text-sm">{ticket.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <div>
                          <div className="text-xs text-slate-500">Phone</div>
                          <div className="font-medium">{ticket.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-slate-500" />
                        <div>
                          <div className="text-xs text-slate-500">Company</div>
                          <div className="font-medium">{ticket.company}</div>
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <span className="text-sm font-semibold text-slate-700">Category: </span>
                      <span className="text-sm text-slate-600">{ticket.category}</span>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-2">Description:</div>
                      <div className="text-sm text-slate-600 bg-white p-4 rounded border">
                        {ticket.description}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `mailto:${ticket.email}?subject=Re: ${ticket.ticket_id} - ${ticket.subject}`}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Reply via Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `tel:${ticket.phone}`}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Customer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminTickets;

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wrench, LogOut, Ticket, Clock, CheckCircle2, User, Mail, Phone, Bell, Monitor, Package, ChevronRight, Save, Camera, Plus, Trash2, LayoutDashboard, Settings, ShoppingCart } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useNavigate } from '@/lib/next-router';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common/Loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Engineer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  status: string;
}

interface AssignedTicket {
  id: string;
  ticket_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service_type: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

interface HardwareRepair {
  id: string;
  device_name: string;
  serial_number: string;
  issue_description: string;
  status: string;
  progress_percent: number;
  technician_notes: string;
  estimated_completion: string;
  photos: string[];
  created_at: string;
  customer_id: string;
  parts_cost: number;
  labor_cost: number;
  service_charge: number;
  total_price: number;
}


interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  stock_level: number;
  unit_price: number;
}

interface PartRequest {
  id: string;
  engineer_id: string;
  repair_id: string;
  item_id: string;
  quantity: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
  inventory_items: {
    name: string;
  };
}

const EngineerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [tickets, setTickets] = useState<AssignedTicket[]>([]);
  const [repairs, setRepairs] = useState<HardwareRepair[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [partRequests, setPartRequests] = useState<PartRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<HardwareRepair | null>(null);
  
  // Part Request State
  const [showPartRequest, setShowPartRequest] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [requestQty, setRequestQty] = useState(1);
  const [requestRepairId, setRequestRepairId] = useState<string>('');

  const [repairForm, setRepairForm] = useState({
    status: '',
    progress: 0,
    notes: '',
    parts_cost: 0,
    labor_cost: 0,
    service_charge: 0
  });
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const isAuth = localStorage.getItem('vts_engineer_auth');
    const engineerId = localStorage.getItem('vts_engineer_id');
    
    if (!isAuth || !engineerId) {
      navigate('/employee/login');
      return;
    }

    fetchEngineerData(engineerId);

    // Notification subscription
    const channel = supabase
      .channel('engineer-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'engineer_notifications',
          filter: `engineer_id=eq.${engineerId}` as any
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

    fetchNotifications(engineerId);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const fetchEngineerData = async (id: string) => {
    setIsLoading(true);
    try {
      // Fetch engineer details
      const { data: engineerData, error: engineerError } = await (supabase
        .from('engineers') as any)
        .select('*')
        .eq('id', id)
        .single();

      if (engineerError || !engineerData) {
        handleLogout();
        return;
      }

      setEngineer(engineerData);
      setIsLoggedIn(true);

      // Fetch assigned tickets
      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('engineer_id', id)
        .order('created_at', { ascending: false });

      setTickets(ticketsData || []);

      // Fetch repairs (since engineers might not be directly assigned to repairs in the current schema, 
      // we'll assume they see all or we need to add an assigned_engineer_id to hardware_repairs.
      // For now, I'll add assigned_engineer_id to hardware_repairs to make it more professional.)
      const { data: repairsData } = await supabase
        .from('hardware_repairs')
        .select('*')
        .eq('assigned_engineer_id', id)
        .order('created_at', { ascending: false });

      setRepairs(repairsData || []);

      // Fetch Inventory
      const { data: inventoryData } = await (supabase
        .from("inventory_items") as any)
        .select("*")
        .gt("stock_level", 0)
        .order("name");
      
      setInventory(inventoryData || []);

      // Fetch My Part Requests
      const { data: requestsData } = await (supabase
        .from("part_requests") as any)
        .select(`
          *,
          inventory_items (name)
        `)
        .eq("engineer_id", id)
        .order("created_at", { ascending: false });
      
      setPartRequests(requestsData || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartRequest = async () => {
    if (!selectedItem || !requestRepairId || !engineer) return;
    
    setIsUpdating(true);
    try {
      const { error } = await (supabase
        .from("part_requests") as any)
        .insert({
          engineer_id: engineer.id,
          repair_id: requestRepairId,
          item_id: selectedItem,
          quantity: requestQty,
          status: "pending"
        });

      if (error) throw error;

      toast({ title: "Request Sent", description: "Your part request has been submitted for approval." });
      setShowPartRequest(false);
      fetchEngineerData(engineer.id);
    } catch (err) {
      console.error("Request failed:", err);
      toast({ title: "Request Failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchNotifications = async (engineerId: string) => {
    const { data } = await (supabase
      .from('engineer_notifications') as any)
      .select('*')
      .eq('engineer_id', engineerId)
      .order('created_at', { ascending: false })
      .limit(10);
    setNotifications(data || []);
  };

  const markNotificationAsRead = async (id: string) => {
    await (supabase
      .from('engineer_notifications') as any)
      .update({ is_read: true })
      .eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleLogin = async () => {
    navigate('/employee/login');
  };

  const handleLogout = () => {
    void fetch('/api/employee/session', { method: 'DELETE' });
    localStorage.removeItem('vts_engineer_auth');
    localStorage.removeItem('vts_engineer_id');
    localStorage.removeItem('vts_engineer_name');
    setIsLoggedIn(false);
    setEngineer(null);
    setTickets([]);
    setRepairs([]);
    navigate('/employee/login');
  };

  const handleRepairUpdate = async () => {
    if (!selectedRepair) return;
    setIsUpdating(true);
    try {
      const { error } = await (supabase
        .from('hardware_repairs') as any)
        .update({
          status: repairForm.status,
          progress_percent: repairForm.progress,
          technician_notes: repairForm.notes,
          parts_cost: repairForm.parts_cost,
          labor_cost: repairForm.labor_cost,
          service_charge: repairForm.service_charge,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRepair.id);

      if (error) throw error;

      toast({
        title: "Repair Updated",
        description: "Status and progress have been successfully saved.",
      });
      setSelectedRepair(null);
      fetchEngineerData(engineer?.id || '');
    } catch (err) {
      console.error('Error updating repair:', err);
      toast({
        title: "Update Failed",
        description: "There was an error saving your changes.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedRepair || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('repairId', selectedRepair.id);
      const response = await fetch('/api/storage/upload', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok || !result.publicUrl) throw new Error(result.error || 'Photo upload failed.');

      const updatedPhotos = [...(selectedRepair.photos || []), result.publicUrl];

      setSelectedRepair({ ...selectedRepair, photos: updatedPhotos });
      toast({
        title: "Photo Uploaded",
        description: "The photo has been added to the repair log.",
      });
    } catch (err) {
      console.error('Error uploading photo:', err);
      toast({
        title: "Upload Failed",
        description: "Could not upload photo. Please check your connection.",
        variant: "destructive"
      });
    }
  };

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

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col w-full min-h-screen">
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-32">
          <div className="container text-center">
            <Wrench className="h-16 w-16 mx-auto mb-4 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Engineer Dashboard</h1>
            <p className="text-xl text-slate-300">VedTech Services - Engineer Portal</p>
          </div>
        </section>

        <section className="flex-1 flex items-center justify-center py-20 md:py-32">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-center">Engineer Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Engineer Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button className="w-full" onClick={handleLogin} disabled={!email}>
                Access Dashboard
              </Button>
              <div className="text-sm text-slate-600 text-center pt-4 border-t">
                <p className="font-semibold mb-2">Demo Engineer Accounts:</p>
                <p>rajesh@vedtechservices.in</p>
                <p>priya@vedtechservices.in</p>
                <p>amit@vedtechservices.in</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    repairs: repairs.filter(r => r.status !== 'delivered').length
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {engineer?.name}!</h1>
              <p className="text-slate-300">{engineer?.specialization}</p>
              <p className="text-sm text-slate-400">{engineer?.email}</p>
            </div>
            <div className="flex gap-2">
              <div className="relative mr-2">
                <Button variant="outline" size="icon" className="bg-transparent border-white hover:bg-white/10" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell className="h-4 w-4" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </Button>
                {showNotifications && (
                  <Card className="absolute top-12 right-0 w-80 z-50 shadow-xl border-slate-200 text-slate-900">
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
              <Button variant="outline" className="bg-transparent border-white hover:bg-white hover:text-slate-900" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Tickets</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Ticket className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Tickets In Progress</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Repairs</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.repairs}</p>
                  </div>
                  <Monitor className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container">
          <Tabs defaultValue="tickets" className="space-y-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="tickets" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Ticket className="h-4 w-4 mr-2" />
                Assigned Tickets
              </TabsTrigger>
              <TabsTrigger value="repairs" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Wrench className="h-4 w-4 mr-2" />
                Hardware Repairs
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Inventory & Parts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets">
              <Card>
                <CardHeader>
                  <CardTitle>My Assigned Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center py-12">
                      <Ticket className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600">No tickets assigned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div key={ticket.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold text-lg mb-1">{ticket.ticket_id}</p>
                              <p className="text-slate-900 font-semibold">{ticket.subject}</p>
                            </div>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              {ticket.name}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-primary" />
                              {ticket.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-primary" />
                              {ticket.phone}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              {formatDate(ticket.created_at)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t">
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority.toUpperCase()} Priority
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/admin/tickets`)}>
                              View Details
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="repairs">
              <Card>
                <CardHeader>
                  <CardTitle>Hardware Repair Tasks</CardTitle>
                  <CardDescription>Update repair status, progress and upload photos from site.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : repairs.length === 0 ? (
                    <div className="text-center py-12">
                      <Monitor className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600">No active repair tasks assigned.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {repairs.map((repair) => (
                        <Card key={repair.id} className="overflow-hidden border-2 border-slate-100 hover:border-primary/20 transition-all">
                          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Monitor className="h-5 w-5 text-blue-400" />
                              <span className="font-bold">{repair.device_name}</span>
                            </div>
                            <Badge className={
                              repair.status === 'ready' || repair.status === 'delivered' ? 'bg-green-500' : 
                              repair.status === 'delivering' ? 'bg-blue-500' :
                              'bg-orange-500'
                            }>
                              {repair.status.toUpperCase()}
                            </Badge>
                          </div>
                          <CardContent className="p-4 space-y-4">
                            <div className="text-sm text-slate-600 space-y-1">
                              <p><span className="font-bold">S/N:</span> {repair.serial_number}</p>
                              <p className="line-clamp-2"><span className="font-bold">Issue:</span> {repair.issue_description}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-bold uppercase text-slate-400">
                                <span>Progress</span>
                                <span>{repair.progress_percent}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary transition-all duration-500" 
                                  style={{ width: `${repair.progress_percent}%` }}
                                />
                              </div>
                            </div>

                            {repair.photos && repair.photos.length > 0 && (
                              <div className="flex gap-2 overflow-x-auto py-2">
                                {repair.photos.map((photo, i) => (
                                  <img 
                                    key={i} 
                                    src={photo} 
                                    alt="Repair" 
                                    className="h-12 w-12 object-cover rounded border"
                                  />
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button 
                                className="flex-1 gap-2" 
                                onClick={() => {
                                  setSelectedRepair(repair);
                                  setRepairForm({
                                    status: repair.status,
                                    progress: repair.progress_percent,
                                    notes: repair.technician_notes || '',
                                    parts_cost: repair.parts_cost || 0,
                                    labor_cost: repair.labor_cost || 0,
                                    service_charge: repair.service_charge || 0
                                  });
                                }}
                              >
                                <Save className="h-4 w-4" />
                                Update Status
                              </Button>
                              <Button variant="outline" className="gap-2" onClick={() => document.getElementById(`photo-upload-${repair.id}`)?.click()}>
                                <Camera className="h-4 w-4" />
                                <input 
                                  id={`photo-upload-${repair.id}`}
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={handlePhotoUpload}
                                />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="inventory">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Spare Parts Inventory</CardTitle>
                    <CardDescription>Available parts in stock for repairs.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {inventory.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-bold">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={item.stock_level < 5 ? "destructive" : "secondary"}>
                              {item.stock_level} In Stock
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>My Part Requests</CardTitle>
                      <Dialog open={showPartRequest} onOpenChange={setShowPartRequest}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" /> New Request
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Spare Part</DialogTitle>
                            <DialogDescription>Select a part and the repair task it's for.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-bold">Select Part</label>
                              <Select onValueChange={setSelectedItem}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an item" />
                                </SelectTrigger>
                                <SelectContent>
                                  {inventory.map(item => (
                                    <SelectItem key={item.id} value={item.id}>
                                      {item.name} ({item.stock_level} left)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold">Select Repair Task</label>
                              <Select onValueChange={setRequestRepairId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select repair task" />
                                </SelectTrigger>
                                <SelectContent>
                                  {repairs.map(repair => (
                                    <SelectItem key={repair.id} value={repair.id}>
                                      {repair.device_name} (S/N: {repair.serial_number})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold">Quantity</label>
                              <Input 
                                type="number" 
                                min="1" 
                                value={requestQty} 
                                onChange={(e) => setRequestQty(parseInt(e.target.value))} 
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handlePartRequest} disabled={isUpdating}>
                              {isUpdating ? <LoadingSpinner size={16} className="mr-2" /> : "Submit Request"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {partRequests.length === 0 ? (
                        <p className="text-center py-8 text-slate-500">No requests made yet.</p>
                      ) : (
                        partRequests.map(req => (
                          <div key={req.id} className="p-3 border rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-bold">{req.inventory_items?.name}</h5>
                              <Badge className={
                                req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                req.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                req.status === 'issued' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {req.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-500 flex justify-between">
                              <span>Qty: {req.quantity}</span>
                              <span>{formatDate(req.created_at)}</span>
                            </div>
                            {req.admin_notes && (
                              <p className="text-xs mt-2 p-2 bg-slate-50 rounded italic">"{req.admin_notes}"</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Edit Repair Dialog */}
      <Dialog open={!!selectedRepair} onOpenChange={(open) => !open && setSelectedRepair(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Repair Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-slate-400">Status</label>
              <Select value={repairForm.status} onValueChange={(val) => setRepairForm({...repairForm, status: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diagnosing">Diagnosing</SelectItem>
                  <SelectItem value="repairing">Repairing</SelectItem>
                  <SelectItem value="parts-ordered">Parts Ordered</SelectItem>
                  <SelectItem value="ready">Ready for Collection</SelectItem>
                  <SelectItem value="delivering">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-bold uppercase text-slate-400">Progress (%)</label>
                <span className="text-sm font-bold text-primary">{repairForm.progress}%</span>
              </div>
              <Slider 
                value={[repairForm.progress]} 
                max={100} 
                step={5} 
                onValueChange={(val) => setRepairForm({...repairForm, progress: val[0]})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-slate-400">Technician Notes</label>
              <Textarea 
                placeholder="Details of repair work done..." 
                className="min-h-[100px]"
                value={repairForm.notes}
                onChange={(e) => setRepairForm({...repairForm, notes: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-slate-400">Parts Cost (₹)</label>
                <Input 
                  type="number" 
                  value={repairForm.parts_cost}
                  onChange={(e) => setRepairForm({...repairForm, parts_cost: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-slate-400">Labor Cost (₹)</label>
                <Input 
                  type="number" 
                  value={repairForm.labor_cost}
                  onChange={(e) => setRepairForm({...repairForm, labor_cost: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-slate-400">Service Charge to Client (₹)</label>
              <Input 
                type="number" 
                value={repairForm.service_charge}
                onChange={(e) => setRepairForm({...repairForm, service_charge: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRepair(null)}>Cancel</Button>
            <Button onClick={handleRepairUpdate} disabled={isUpdating}>
              {isUpdating ? <LoadingSpinner size={16} className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EngineerDashboard;

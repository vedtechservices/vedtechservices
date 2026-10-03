import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Edit, Trash2, Search, RefreshCw, LogOut, Mail, Phone, Briefcase } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useNavigate } from '@/lib/next-router';
import { useToast } from '@/hooks/use-toast';

interface Engineer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  employee_id: string | null;
  department: string;
  status: string;
  assigned_tickets_count: number;
  resolved_tickets_count: number;
  joining_date: string;
  created_at: string;
}

const EngineerManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [filteredEngineers, setFilteredEngineers] = useState<Engineer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    employee_id: '',
    department: 'Technical',
    status: 'available'
  });

  useEffect(() => {
    const isAuth = localStorage.getItem('vts_admin_auth');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }

    fetchEngineers();
  }, [navigate]);

  const fetchEngineers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('engineers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching engineers:', error);
      } else {
        setEngineers(data || []);
        setFilteredEngineers(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = engineers.filter(eng =>
        eng.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eng.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eng.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eng.employee_id && eng.employee_id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredEngineers(filtered);
    } else {
      setFilteredEngineers(engineers);
    }
  }, [searchTerm, engineers]);

  const handleLogout = () => {
    void fetch('/api/admin/session', { method: 'DELETE' });
    localStorage.removeItem('vts_admin_auth');
    localStorage.removeItem('vts_admin_email');
    navigate('/admin/login');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      employee_id: '',
      department: 'Technical',
      status: 'available'
    });
  };

  const handleAddEngineer = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.specialization) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('add_engineer', {
        p_name: formData.name,
        p_email: formData.email,
        p_phone: formData.phone,
        p_specialization: formData.specialization,
        p_employee_id: formData.employee_id || null,
        p_department: formData.department
      } as any);

      if (error) {
        console.error('Error adding engineer:', error);
        toast({
          title: "Error",
          description: "Failed to add engineer. Email might already exist.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Engineer added successfully"
        });
        setShowAddDialog(false);
        resetForm();
        fetchEngineers();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEditEngineer = async () => {
    if (!selectedEngineer || !formData.name || !formData.email || !formData.phone || !formData.specialization) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('update_engineer', {
        p_engineer_id: selectedEngineer.id,
        p_name: formData.name,
        p_email: formData.email,
        p_phone: formData.phone,
        p_specialization: formData.specialization,
        p_status: formData.status,
        p_department: formData.department
      } as any);

      if (error) {
        console.error('Error updating engineer:', error);
        toast({
          title: "Error",
          description: "Failed to update engineer",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Engineer updated successfully"
        });
        setShowEditDialog(false);
        setSelectedEngineer(null);
        resetForm();
        fetchEngineers();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleDeleteEngineer = async (engineerId: string, engineerName: string) => {
    if (!confirm(`Are you sure you want to delete ${engineerName}? All assigned tickets will be unassigned.`)) {
      return;
    }

    try {
      const { error } = await supabase.rpc('delete_engineer', {
        p_engineer_id: engineerId
      } as any);

      if (error) {
        console.error('Error deleting engineer:', error);
        toast({
          title: "Error",
          description: "Failed to delete engineer",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Engineer deleted successfully"
        });
        fetchEngineers();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const openEditDialog = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
    setFormData({
      name: engineer.name,
      email: engineer.email,
      phone: engineer.phone,
      specialization: engineer.specialization,
      employee_id: engineer.employee_id || '',
      department: engineer.department,
      status: engineer.status
    });
    setShowEditDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Engineer Management</h1>
              <p className="text-slate-300">Manage your technical team</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-transparent border-white hover:bg-white hover:text-slate-900" onClick={() => navigate('/admin/dashboard')}>
                Back to Dashboard
              </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600">Total Engineers</p>
                  <p className="text-3xl font-bold">{engineers.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600">Available</p>
                  <p className="text-3xl font-bold text-green-600">
                    {engineers.filter(e => e.status === 'available').length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600">Busy</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {engineers.filter(e => e.status === 'busy').length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600">Total Resolved</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {engineers.reduce((sum, e) => sum + (e.resolved_tickets_count || 0), 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engineers List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle>Team Members</CardTitle>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search engineers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={fetchEngineers}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => { resetForm(); setShowAddDialog(true); }}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Engineer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">Loading engineers...</p>
                </div>
              ) : filteredEngineers.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600">No engineers found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEngineers.map((engineer) => (
                    <div key={engineer.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-bold text-lg">{engineer.name}</p>
                            <Badge className={getStatusColor(engineer.status)}>
                              {engineer.status}
                            </Badge>
                            {engineer.employee_id && (
                              <Badge variant="outline">ID: {engineer.employee_id}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            <Briefcase className="inline h-4 w-4 mr-1" />
                            {engineer.specialization} • {engineer.department}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(engineer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteEngineer(engineer.id, engineer.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span>{engineer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span>{engineer.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p><strong>Assigned Tickets:</strong> {engineer.assigned_tickets_count || 0}</p>
                          <p><strong>Resolved Tickets:</strong> {engineer.resolved_tickets_count || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Add Engineer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Engineer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name *</label>
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email *</label>
              <Input
                type="email"
                placeholder="engineer@vedtechservices.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Phone *</label>
              <Input
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Specialization *</label>
              <Input
                placeholder="e.g., Hardware & Networking"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Employee ID</label>
              <Input
                placeholder="e.g., EMP001"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleAddEngineer}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Engineer
              </Button>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Engineer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Engineer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name *</label>
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email *</label>
              <Input
                type="email"
                placeholder="engineer@vedtechservices.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Phone *</label>
              <Input
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Specialization *</label>
              <Input
                placeholder="e.g., Hardware & Networking"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleEditEngineer}>
                <Edit className="h-4 w-4 mr-2" />
                Update Engineer
              </Button>
              <Button variant="outline" onClick={() => { setShowEditDialog(false); setSelectedEngineer(null); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EngineerManagement;

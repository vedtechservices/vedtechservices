import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Search, RefreshCw, Mail, Phone, 
  Trash2, Edit, CheckCircle2, XCircle, Briefcase, 
  UserPlus, Shield, Info, LogOut, ArrowLeft, Key, Copy, Check, Download
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { logActivity } from '@/db/api';
import { useNavigate } from '@/lib/next-router';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/Loader';
import { downloadBulkIDCards } from '@/lib/idCardUtils';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  employee_id: string;
  department: string;
  is_active: boolean;
  status: string;
  joining_date: string;
  assigned_tickets?: number;
  resolved_tickets?: number;
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState({
    is_active: true,
    status: 'available',
    department: ''
  });
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    roles: [] as string[],
    password: ''
  });
  const [generatedCreds, setGeneratedCreds] = useState<{ id: string, pass: string } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase
        .from('engineers') as any)
        .select('*')
        .order('joining_date', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
      setFilteredEmployees(data || []);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      toast({
        title: "Fetch Failed",
        description: "Could not load employee records.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('vts_admin_role');
    if (role !== 'super_admin') {
      navigate('/admin/dashboard');
      return;
    }
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(e => 
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleUpdateEmployee = async () => {
    if (!currentEmployee) return;

    try {
      const { error } = await (supabase
        .from('engineers') as any)
        .update({
          is_active: form.is_active,
          status: form.status,
          department: form.department
        })
        .eq('id', currentEmployee.id);

      if (error) throw error;

      await logActivity({
        user_id: localStorage.getItem('vts_admin_id') || 'unknown',
        user_name: localStorage.getItem('vts_admin_email') || 'unknown',
        user_role: 'super_admin',
        action: 'UPDATE_EMPLOYEE',
        target_id: currentEmployee.employee_id,
        target_type: 'EMPLOYEE',
        details: { ...form }
      });

      toast({
        title: "Updated",
        description: `Account for ${currentEmployee.name} has been updated.`
      });
      setShowEditDialog(false);
      fetchEmployees();
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "Could not update employee record.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEmployee = async (id: string, name: string, employeeId: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

    try {
      const { error } = await (supabase
        .from('engineers') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity({
        user_id: localStorage.getItem('vts_admin_id') || 'unknown',
        user_name: localStorage.getItem('vts_admin_email') || 'unknown',
        user_role: 'super_admin',
        action: 'DELETE_EMPLOYEE',
        target_id: employeeId,
        target_type: 'EMPLOYEE'
      });

      toast({
        title: "Deleted",
        description: "Employee record removed."
      });
      fetchEmployees();
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: "Could not remove record.",
        variant: "destructive"
      });
    }
  };

  const handleBulkDownload = async () => {
    if (selectedEmployees.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one employee to download ID cards.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress({ current: 0, total: selectedEmployees.size * 2 });

      const selectedEmployeeData = employees.filter(emp => selectedEmployees.has(emp.id));
      
      await downloadBulkIDCards(
        selectedEmployeeData.map(emp => ({
          ...emp,
          role: emp.department,
          photo_url: undefined,
        })),
        (current, total) => {
          setDownloadProgress({ current, total });
        }
      );

      toast({
        title: "Success",
        description: `Downloaded ${selectedEmployees.size} employee ID cards as ZIP file.`
      });

      // Clear selection after download
      setSelectedEmployees(new Set());
    } catch (error) {
      console.error('Error downloading ID cards:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate ID cards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(emp => emp.id)));
    }
  };

  const handleRegisterEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    
    // Generate credentials
    const pass = Math.random().toString(36).slice(-8).toUpperCase() + '@' + Math.floor(Math.random() * 100);
    const empId = 'VTS' + Math.floor(1000 + Math.random() * 9000);
    
    try {
      const { error } = await (supabase
        .from('engineers') as any)
        .insert({
          name: regForm.name,
          email: regForm.email,
          phone: regForm.phone,
          department: regForm.department,
          role: regForm.roles.join(','),
          employee_id: empId,
          password_hash: pass, // In a real app, hash this!
          is_active: true,
          status: 'available',
          joining_date: new Date().toISOString()
        });

      if (error) throw error;

      await logActivity({
        user_id: localStorage.getItem('vts_admin_id') || 'unknown',
        user_name: localStorage.getItem('vts_admin_email') || 'unknown',
        user_role: 'super_admin',
        action: 'REGISTER_EMPLOYEE',
        target_id: empId,
        target_type: 'EMPLOYEE',
        details: { roles: regForm.roles }
      });

      setGeneratedCreds({ id: empId, pass: pass });
      fetchEmployees();
      toast({
        title: "Registration Success",
        description: "Employee record created and credentials generated."
      });
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message || "Could not register employee.",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard."
    });
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="border-white/20 hover:bg-white/10" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 text-white" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
                  <Users className="h-8 w-8 text-blue-400" />
                  Employee Management
                </h1>
                <p className="text-slate-400">Manage VedTech Engineering Team access and profiles</p>
              </div>
            </div>
            <div className="flex gap-2">
              {selectedEmployees.size > 0 && (
                <Button 
                  variant="ghost"
                  className="border border-white/20 hover:bg-white/10 text-white"
                  onClick={handleBulkDownload}
                  disabled={isDownloading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download {selectedEmployees.size} ID Card{selectedEmployees.size > 1 ? 's' : ''}
                </Button>
              )}
              <Button variant="ghost" className="border border-white/20 hover:bg-white/10 text-white" onClick={() => setShowRegisterDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
              <Button variant="ghost" className="border border-white/20 hover:bg-white/10 text-white" onClick={fetchEmployees}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container">
          <div className="space-y-4">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name, email, employee ID, or department..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {filteredEmployees.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="select-all"
                  checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All ({filteredEmployees.length} employees)
                </label>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="flex-1 py-8">
        <div className="container">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <LoadingSpinner size={48} />
              <p className="mt-4 text-slate-500 animate-pulse font-medium">Loading team records...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="py-20 text-center">
                <Info className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">No employees found</h3>
                <p className="text-slate-500">No records match your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEmployees.map((e) => (
                <Card key={e.id} className="hover:shadow-md transition-shadow bg-white overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Checkbox 
                          checked={selectedEmployees.has(e.id)}
                          onCheckedChange={() => toggleEmployeeSelection(e.id)}
                          className="shrink-0"
                        />
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                          {e.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 text-balance">
                            {e.name}
                            {!e.is_active && (
                              <Badge variant="destructive" className="text-[10px] py-0 h-4">Pending Approval</Badge>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Briefcase className="h-3 w-3" />
                            {e.department} • <span className="font-mono">{e.employee_id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => {
                          setCurrentEmployee(e);
                          setForm({ is_active: e.is_active, status: e.status, department: e.department });
                          setShowEditDialog(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDeleteEmployee(e.id, e.name, e.employee_id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Email</span>
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                          <Mail className="h-3 w-3" />
                          {e.email}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Phone</span>
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                          <Phone className="h-3 w-3" />
                          {e.phone || 'N/A'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Current Status</span>
                        <div className="flex items-center gap-2">
                          <Badge className={e.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                            {e.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Update Employee Account
            </DialogTitle>
            <DialogDescription>
              Modify access permissions and department for {currentEmployee?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input 
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Status</label>
                <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy / On-site</SelectItem>
                    <SelectItem value="leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Access Permission</label>
                <Select value={form.is_active ? 'active' : 'inactive'} onValueChange={(val) => setForm({ ...form, is_active: val === 'active' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Approved)</SelectItem>
                    <SelectItem value="inactive">Inactive / Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateEmployee}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-500" />
              Register New Employee
            </DialogTitle>
            <DialogDescription>
              Create a new account for engineering and support staff.
            </DialogDescription>
          </DialogHeader>

          {generatedCreds ? (
            <div className="space-y-6 py-6 text-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Credentials Generated!</h3>
                <p className="text-slate-500">Please provide these to the employee immediately. This password will not be shown again.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Employee ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg">{generatedCreds.id}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(generatedCreds.id)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Temporary Password</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg">{generatedCreds.pass}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(generatedCreds.pass)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-4">
                <Button className="w-full" onClick={() => {
                  setGeneratedCreds(null);
                  setShowRegisterDialog(false);
                  setRegForm({ name: '', email: '', phone: '', department: '', roles: [], password: '' });
                }}>
                  Close and Continue
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterEmployee} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input required value={regForm.name} onChange={(e) => setRegForm({...regForm, name: e.target.value})} placeholder="Ex: John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input required type="email" value={regForm.email} onChange={(e) => setRegForm({...regForm, email: e.target.value})} placeholder="john@vedtechservices.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input required value={regForm.phone} onChange={(e) => setRegForm({...regForm, phone: e.target.value})} placeholder="+91 00000 00000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Input required value={regForm.department} onChange={(e) => setRegForm({...regForm, department: e.target.value})} placeholder="Ex: Hardware Repair" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Multiple Roles Assignment</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Site Engineer', 'Software Dev', 'Hardware Tech', 'Network Admin', 'Support Helpdesk'].map(role => (
                    <div key={role} className="flex items-center gap-2 border rounded-md p-2 hover:bg-slate-50 cursor-pointer" onClick={() => {
                      const roles = regForm.roles.includes(role) 
                        ? regForm.roles.filter(r => r !== role)
                        : [...regForm.roles, role];
                      setRegForm({...regForm, roles});
                    }}>
                      <div className={`h-4 w-4 rounded border flex items-center justify-center ${regForm.roles.includes(role) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                        {regForm.roles.includes(role) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-xs">{role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowRegisterDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={isRegistering || regForm.roles.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">
                  {isRegistering ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                  Register and Generate ID
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Download Progress Dialog */}
      <Dialog open={isDownloading} onOpenChange={() => {}}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>Generating ID Cards</DialogTitle>
            <DialogDescription>
              Please wait while we generate and package the ID cards...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {downloadProgress.current} / {downloadProgress.total}
                </span>
              </div>
              <Progress 
                value={(downloadProgress.current / downloadProgress.total) * 100} 
                className="h-2"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Generating {Math.ceil(downloadProgress.total / 2)} employee ID cards (front and back)
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;

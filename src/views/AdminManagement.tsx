import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Shield, ShieldAlert, Mail, Trash2, Edit, CheckCircle2, XCircle, LogOut, Ticket, Settings, UserCog, AlertCircle, Briefcase, ShieldOff, ShieldCheck, Loader2, Bell, Send } from 'lucide-react';
import { useNavigate } from '@/lib/next-router';
import { supabase } from '@/db/supabase';
import { logActivity } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/Loader';
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';
import { Textarea } from '@/components/ui/textarea';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const AdminManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'admin',
    is_active: true
  });

  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  // Broadcast notification state
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    try {
      // Fetch all active engineer IDs
      const { data: engineers, error } = await (supabase
        .from('engineers') as any)
        .select('id')
        .eq('is_active', true);
      if (error) throw error;
      if (!engineers || engineers.length === 0) {
        toast({ title: 'No Employees', description: 'No active employees found to notify.', variant: 'destructive' });
        return;
      }
      const rows = engineers.map((e: { id: string }) => ({
        engineer_id: e.id,
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        link: '/engineer/dashboard',
        is_read: false,
      }));
      const { error: insertError } = await (supabase.from('engineer_notifications') as any).insert(rows);
      if (insertError) throw insertError;
      toast({ title: '✅ Notification Sent', description: `Broadcast sent to ${engineers.length} employee(s) successfully.` });
      setBroadcastTitle('');
      setBroadcastMessage('');
      setShowBroadcastDialog(false);
    } catch (err: any) {
      toast({ title: 'Broadcast Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsBroadcasting(false);
    }
  };

  // AlertDialog confirmation state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    mode: 'deactivate' | 'reactivate';
    admin: AdminUser | null;
  }>({ open: false, mode: 'deactivate', admin: null });

  useEffect(() => {
    setCurrentUserRole(localStorage.getItem('vts_admin_role'));
    setCurrentUserId(localStorage.getItem('vts_admin_id'));
    setAuthLoaded(true);
  }, []);

  useEffect(() => {
    if (!authLoaded) return;

    // Auth check
    const isAuth = localStorage.getItem('vts_admin_auth');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }

    // Role check - only super_admin can access this
    if (currentUserRole !== 'super_admin') {
      toast({
        title: "Access Denied",
        description: "Only super administrators can manage other admin accounts.",
        variant: "destructive"
      });
      navigate('/admin/dashboard');
      return;
    }

    fetchAdmins();
  }, [navigate, currentUserRole, authLoaded]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase
        .from('admin_users') as any)
        .select('id,email,full_name,role,is_active,created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
      setFilteredAdmins(data || []);
    } catch (err) {
      console.error('Error fetching admins:', err);
      toast({
        title: "Error",
        description: "Failed to load administrator accounts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filtered = admins.filter(admin =>
      admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(filtered);
  }, [searchTerm, admins]);

  const handleAddAdmin = async () => {
    if (!form.full_name || !form.email || !form.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await (supabase
        .from('admin_users') as any)
        .insert([{
          full_name: form.full_name,
          email: form.email,
          password_hash: form.password, // Simple for demo
          role: form.role,
          is_active: form.is_active
        }]);

      if (error) throw error;

      // Log activity
      await logActivity({
        user_id: localStorage.getItem('vts_admin_id') || 'unknown',
        user_name: localStorage.getItem('vts_admin_email') || 'unknown',
        user_role: localStorage.getItem('vts_admin_role') || 'unknown',
        action: 'CREATE_ADMIN',
        target_id: form.email,
        target_type: 'ADMIN_USER',
        details: { full_name: form.full_name, role: form.role }
      });

      toast({
        title: "Success",
        description: "New administrator account created successfully."
      });
      setShowAddDialog(false);
      setForm({ full_name: '', email: '', password: '', role: 'admin', is_active: true });
      fetchAdmins();
    } catch (err) {
      console.error('Error creating admin:', err);
      toast({
        title: "Creation Failed",
        description: "Could not create the administrator account. Email might already exist.",
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (admin: AdminUser) => {
    setCurrentAdmin(admin);
    setForm({
      full_name: admin.full_name,
      email: admin.email,
      password: '', // Don't show password
      role: admin.role,
      is_active: admin.is_active
    });
    setShowEditDialog(true);
  };

  const handleUpdateAdmin = async () => {
    if (!currentAdmin) return;

    try {
      const updateData: any = {
        full_name: form.full_name,
        email: form.email,
        role: form.role,
        is_active: form.is_active,
        updated_at: new Date().toISOString()
      };

      if (form.password) {
        updateData.password_hash = form.password;
      }

      const { error } = await (supabase
        .from('admin_users') as any)
        .update(updateData)
        .eq('id', currentAdmin.id);

      if (error) throw error;

      // Log activity
      await logActivity({
        user_id: localStorage.getItem('vts_admin_id') || 'unknown',
        user_name: localStorage.getItem('vts_admin_email') || 'unknown',
        user_role: localStorage.getItem('vts_admin_role') || 'unknown',
        action: 'UPDATE_ADMIN',
        target_id: currentAdmin.email,
        target_type: 'ADMIN_USER',
        details: { role: form.role, is_active: form.is_active }
      });

      toast({
        title: "Updated",
        description: "Administrator account updated successfully."
      });
      setShowEditDialog(false);
      fetchAdmins();
    } catch (err) {
      console.error('Error updating admin:', err);
      toast({
        title: "Update Failed",
        description: "Could not update the administrator account.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (id === localStorage.getItem('vts_admin_id')) {
      toast({
        title: "Operation Restricted",
        description: "You cannot delete your own account.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this administrator account? This action cannot be undone.')) return;

    try {
      const { error } = await (supabase
        .from('admin_users') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log activity
      const adminToDelete = admins.find(a => a.id === id);
      await logActivity({
        user_id: localStorage.getItem('vts_admin_id') || 'unknown',
        user_name: localStorage.getItem('vts_admin_email') || 'unknown',
        user_role: localStorage.getItem('vts_admin_role') || 'unknown',
        action: 'DELETE_ADMIN',
        target_id: adminToDelete?.email || id,
        target_type: 'ADMIN_USER'
      });

      toast({
        title: "Deleted",
        description: "Administrator account has been removed."
      });
      fetchAdmins();
    } catch (err) {
      console.error('Error deleting admin:', err);
      toast({
        title: "Delete Failed",
        description: "Could not delete the account.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    void fetch('/api/admin/session', { method: 'DELETE' });
    localStorage.removeItem('vts_admin_auth');
    localStorage.removeItem('vts_admin_email');
    localStorage.removeItem('vts_admin_id');
    localStorage.removeItem('vts_admin_role');
    navigate('/admin/login');
  };

  const handleReactivateAdmin = async (admin: AdminUser) => {
    setConfirmDialog({ open: true, mode: 'reactivate', admin });
  };

  const doReactivateAdmin = async (admin: AdminUser) => {
    setReactivatingId(admin.id);
    try {
      const { error } = await (supabase.from('admin_users') as any)
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', admin.id);
      if (error) throw error;

      await logActivity({
        user_id: currentUserId || 'unknown',
        user_name: localStorage.getItem('vts_admin_email') || 'unknown',
        user_role: currentUserRole || 'unknown',
        action: 'REACTIVATE_ADMIN',
        target_id: admin.email,
        target_type: 'ADMIN_USER',
        details: { full_name: admin.full_name }
      });

      toast({ title: 'Admin Re-activated', description: `${admin.full_name} can now log in again.` });
      fetchAdmins();
    } catch (err: any) {
      toast({ title: 'Reactivation Failed', description: err.message, variant: 'destructive' });
    } finally {
      setReactivatingId(null);
    }
  };

  const handleDeactivateAdmin = async (admin: AdminUser) => {
    if (admin.id === currentUserId) {
      toast({ title: 'Not Allowed', description: 'You cannot deactivate your own account.', variant: 'destructive' });
      return;
    }
    setConfirmDialog({ open: true, mode: 'deactivate', admin });
  };

  const doDeactivateAdmin = async (admin: AdminUser) => {
    setDeactivatingId(admin.id);
    try {
      const { error } = await (supabase.from('admin_users') as any)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', admin.id);
      if (error) {
        const msg = await error?.context?.text?.();
        throw new Error(msg || error.message);
      }

      await logActivity({
        user_id: currentUserId || 'unknown',
        user_name: localStorage.getItem('vts_admin_email') || 'unknown',
        user_role: currentUserRole || 'unknown',
        action: 'DEACTIVATE_ADMIN',
        target_id: admin.email,
        target_type: 'ADMIN_USER',
        details: { full_name: admin.full_name }
      });

      toast({ title: 'Admin Deactivated', description: `${admin.full_name} has been deactivated and signed out.` });
      fetchAdmins();
    } catch (err: any) {
      toast({ title: 'Deactivation Failed', description: err.message, variant: 'destructive' });
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      <div className="container pt-4"><AdminRoleWarning /></div>
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-400/30">
                <ShieldAlert className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Admin Management</h1>
                <p className="text-slate-300">Manage VedTech Services platform administrators</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowBroadcastDialog(true)}>
                <Bell className="h-4 w-4 mr-2" />
                Notify All Employees
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
                <Ticket className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/engineers')}>
                <UserCog className="h-4 w-4 mr-2" />
                Engineers
              </Button>
              <Button variant="outline" className="bg-transparent border-white hover:bg-white hover:text-slate-900" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="py-8">
        <div className="container">
          <Card className="mb-8 border-none shadow-sm bg-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Shield className="h-32 w-32" />
            </div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Security Note
                  </h2>
                  <p className="text-blue-100 text-sm max-w-2xl">
                    As a super administrator, you have the authority to grant or revoke system access.
                    Please ensure that new administrators are trained on security protocols and that
                    inactive accounts are disabled promptly.
                  </p>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="bg-white text-blue-600 hover:bg-blue-50 whitespace-nowrap">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New Admin
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="border-b bg-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Administrator Accounts</CardTitle>
                  <CardDescription>Total {admins.length} administrators registered in system</CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Full Name</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4 text-right">Actions <span className="text-[10px] font-normal text-slate-400">(Edit / Deactivate / Delete)</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <LoadingSpinner className="mx-auto mb-2" />
                          <p className="text-slate-500">Loading administrator accounts...</p>
                        </td>
                      </tr>
                    ) : filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          No administrator accounts found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredAdmins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border-2 border-white shadow-sm">
                                {admin.full_name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-900">{admin.full_name}</span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {admin.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'} className="capitalize font-medium">
                              {admin.role.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            {admin.is_active ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                Disabled
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(admin.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" onClick={() => handleEditClick(admin)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {admin.is_active && admin.id !== currentUserId && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeactivateAdmin(admin)}
                                  disabled={deactivatingId === admin.id}
                                  title="Force deactivate & sign out"
                                  className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                >
                                  {deactivatingId === admin.id
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <ShieldOff className="h-4 w-4" />}
                                </Button>
                              )}
                              {!admin.is_active && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReactivateAdmin(admin)}
                                  disabled={reactivatingId === admin.id}
                                  title="Re-activate account"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  {reactivatingId === admin.id
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <ShieldCheck className="h-4 w-4" />}
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteAdmin(admin.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
      </main>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Administrator</DialogTitle>
            <DialogDescription>Create a new access account for the VedTech platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="john@vedtechservices.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Secure password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="support_admin">Support Admin</SelectItem>
                    <SelectItem value="billing_admin">Billing Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={form.is_active ? 'active' : 'inactive'} onValueChange={(val) => setForm({ ...form, is_active: val === 'active' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddAdmin}>Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Administrator</DialogTitle>
            <DialogDescription>Modify existing platform access permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="john@vedtechservices.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password (leave blank to keep current)</label>
              <Input
                type="password"
                placeholder="New secure password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="support_admin">Support Admin</SelectItem>
                    <SelectItem value="billing_admin">Billing Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={form.is_active ? 'active' : 'inactive'} onValueChange={(val) => setForm({ ...form, is_active: val === 'active' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateAdmin}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate / Re-activate Confirmation AlertDialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.mode === 'deactivate'
                ? `Deactivate ${confirmDialog.admin?.full_name}?`
                : `Re-activate ${confirmDialog.admin?.full_name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.mode === 'deactivate'
                ? 'This will immediately revoke their access and invalidate all active sessions. You can re-activate the account at any time.'
                : 'This will restore their login access. They will be able to sign in immediately after re-activation.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmDialog.mode === 'deactivate'
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'}
              onClick={() => {
                const admin = confirmDialog.admin;
                if (!admin) return;
                setConfirmDialog(prev => ({ ...prev, open: false }));
                if (confirmDialog.mode === 'deactivate') {
                  doDeactivateAdmin(admin);
                } else {
                  doReactivateAdmin(admin);
                }
              }}
            >
              {confirmDialog.mode === 'deactivate' ? 'Yes, Deactivate' : 'Yes, Re-activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Broadcast Notification Dialog */}
      <Dialog open={showBroadcastDialog} onOpenChange={setShowBroadcastDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Send Notification to All Employees
            </DialogTitle>
            <DialogDescription>
              This message will be delivered to all active employees instantly in their dashboard notification bell.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Notification Title</label>
              <Input
                placeholder="e.g. Office closed tomorrow"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Message</label>
              <Textarea
                placeholder="Type your message here..."
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-slate-400 text-right">{broadcastMessage.length}/500</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowBroadcastDialog(false)} disabled={isBroadcasting}>
              Cancel
            </Button>
            <Button
              onClick={handleBroadcast}
              disabled={isBroadcasting || !broadcastTitle.trim() || !broadcastMessage.trim()}
            >
              {isBroadcasting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Send to All Employees</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;

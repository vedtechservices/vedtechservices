import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Building2, Plus, RefreshCw, Search, Pencil, Trash2,
  MapPin, Phone, Mail, User, CalendarDays, ArrowLeft,
  CheckCircle2, XCircle, Clock, Ticket, MessageSquare, Map,
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useNavigate } from '@/lib/next-router';
import { useToast } from '@/hooks/use-toast';
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';
import dynamic from 'next/dynamic';



const OfficeMap = dynamic(
  () => import('@/components/admin/OfficeMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        Loading map...
      </div>
    ),
  }
);

interface Office {
  id: string;
  name: string;
  branch_code: string;
  address: string;
  city: string;
  state: string;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  manager_phone: string | null;
  office_type: 'headquarters' | 'branch' | 'service_center' | 'remote';
  status: 'active' | 'inactive' | 'coming_soon';
  opened_at: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

interface OfficeStat {
  office_id: string;
  ticket_count: number;
  open_tickets: number;
  escalation_count: number;
  open_escalations: number;
}

type OfficeForm = Omit<Office, 'id' | 'created_at' | 'updated_at'>;

const BLANK_FORM: OfficeForm = {
  name: '', branch_code: '', address: '', city: '', state: 'Bihar',
  pincode: '', phone: '', email: '', manager_name: '', manager_phone: '',
  office_type: 'branch', status: 'active', opened_at: '', notes: '',
  latitude: null, longitude: null,
};

const TYPE_LABELS: Record<Office['office_type'], string> = {
  headquarters: 'HQ', branch: 'Branch', service_center: 'Service Centre', remote: 'Remote',
};
const TYPE_COLORS: Record<Office['office_type'], string> = {
  headquarters: 'bg-purple-100 text-purple-800 border-purple-200',
  branch: 'bg-blue-100 text-blue-800 border-blue-200',
  service_center: 'bg-orange-100 text-orange-800 border-orange-200',
  remote: 'bg-slate-100 text-slate-700 border-slate-200',
};
const STATUS_CONFIG: Record<Office['status'], { label: string; icon: React.ReactNode; cls: string }> = {
  active: { label: 'Active', icon: <CheckCircle2 className="h-3.5 w-3.5" />, cls: 'bg-green-100 text-green-800 border-green-200' },
  inactive: { label: 'Inactive', icon: <XCircle className="h-3.5 w-3.5" />, cls: 'bg-red-100 text-red-800 border-red-200' },
  coming_soon: { label: 'Coming Soon', icon: <Clock className="h-3.5 w-3.5" />, cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
};

const AdminOffices: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [officeStats, setOfficeStats] = useState<Record<string, OfficeStat>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Office['status']>('all');
  const [filterType, setFilterType] = useState<'all' | Office['office_type']>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OfficeForm>({ ...BLANK_FORM });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Office | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Data ────────────────────────────────────────────────────────────────────
  const fetchOffices = useCallback(async () => {
    setIsLoading(true);
    try {
      const [{ data: offData, error: offErr }, { data: statsData }] = await Promise.all([
        (supabase.from('offices') as any)
          .select('*')
          .order('office_type', { ascending: true })
          .order('created_at', { ascending: true }),
        (supabase.rpc as any)('get_office_stats'),
      ]);
      if (offErr) throw offErr;
      setOffices(offData || []);
      const statsMap: Record<string, OfficeStat> = {};
      (statsData || []).forEach((s: OfficeStat) => { statsMap[s.office_id] = s; });
      setOfficeStats(statsMap);
    } catch (err) {
      console.error('Failed to fetch offices:', err);
      toast({ title: 'Error loading offices', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchOffices(); }, [fetchOffices]);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const filtered = offices.filter((o) => {
    const q = search.toLowerCase();
    return (
      (!q || o.name.toLowerCase().includes(q) || o.city.toLowerCase().includes(q) ||
        o.branch_code.toLowerCase().includes(q) || (o.manager_name ?? '').toLowerCase().includes(q)) &&
      (filterStatus === 'all' || o.status === filterStatus) &&
      (filterType === 'all' || o.office_type === filterType)
    );
  });

  const stats = {
    total: offices.length,
    active: offices.filter(o => o.status === 'active').length,
    branches: offices.filter(o => o.office_type === 'branch').length,
    comingSoon: offices.filter(o => o.status === 'coming_soon').length,
  };

  const mappableOffices = offices.filter(o => o.latitude && o.longitude && o.status === 'active');

  // ── Form ────────────────────────────────────────────────────────────────────
  const openAdd = () => { setEditingId(null); setForm({ ...BLANK_FORM }); setIsFormOpen(true); };
  const openEdit = (o: Office) => {
    setEditingId(o.id);
    setForm({
      name: o.name, branch_code: o.branch_code, address: o.address, city: o.city, state: o.state,
      pincode: o.pincode ?? '', phone: o.phone ?? '', email: o.email ?? '',
      manager_name: o.manager_name ?? '', manager_phone: o.manager_phone ?? '',
      office_type: o.office_type, status: o.status,
      opened_at: o.opened_at ?? '', notes: o.notes ?? '',
      latitude: o.latitude, longitude: o.longitude,
    });
    setIsFormOpen(true);
  };
  const f = (field: keyof OfficeForm, value: string | number | null) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const saveOffice = async () => {
    if (!form.name.trim() || !form.branch_code.trim() || !form.address.trim() || !form.city.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' }); return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        pincode: form.pincode || null, phone: form.phone || null, email: form.email || null,
        manager_name: form.manager_name || null, manager_phone: form.manager_phone || null,
        opened_at: form.opened_at || null, notes: form.notes || null,
        latitude: form.latitude || null, longitude: form.longitude || null,
        updated_at: new Date().toISOString(),
      };
      if (editingId) {
        const { error } = await (supabase.from('offices') as any).update(payload).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Office updated successfully' });
      } else {
        const { error } = await (supabase.from('offices') as any).insert(payload);
        if (error) throw error;
        toast({ title: 'New office added successfully' });
      }
      setIsFormOpen(false); fetchOffices();
    } catch (err: any) {
      toast({ title: err?.message || 'Failed to save office', variant: 'destructive' });
    } finally { setIsSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { error } = await (supabase.from('offices') as any).delete().eq('id', deleteTarget.id);
      if (error) throw error;
      toast({ title: `Office "${deleteTarget.name}" removed` });
      setDeleteTarget(null); fetchOffices();
    } catch (err: any) {
      toast({ title: err?.message || 'Failed to delete', variant: 'destructive' });
    } finally { setIsDeleting(false); }
  };

  // ── Office Card ─────────────────────────────────────────────────────────────
  const OfficeCard = ({ office }: { office: Office }) => {
    const sc = STATUS_CONFIG[office.status];
    const stat = officeStats[office.id];
    return (
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold text-slate-800 text-balance">{office.name}</CardTitle>
              <CardDescription className="text-xs font-mono mt-0.5">{office.branch_code}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant="outline" className={cn('text-xs flex items-center gap-1', sc.cls)}>
                {sc.icon}{sc.label}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', TYPE_COLORS[office.office_type])}>
                {TYPE_LABELS[office.office_type]}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-3 flex-1 space-y-2 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
            <span className="min-w-0 text-pretty">{office.address}, {office.city}, {office.state}{office.pincode ? ` — ${office.pincode}` : ''}</span>
          </div>
          {office.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span>{office.phone}</span></div>}
          {office.email && <div className="flex items-center gap-2 min-w-0"><Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{office.email}</span></div>}
          {office.manager_name && <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span>{office.manager_name}{office.manager_phone ? ` · ${office.manager_phone}` : ''}</span></div>}
          {office.opened_at && <div className="flex items-center gap-2 text-xs text-slate-400"><CalendarDays className="h-3 w-3 shrink-0" />Opened {format(new Date(office.opened_at), 'dd MMM yyyy')}</div>}

          {/* ── Per-branch stats ── */}
          {stat && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
              <div className="bg-blue-50 rounded-md p-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Ticket className="h-3 w-3 text-blue-600" />
                  <span className="text-[10px] text-blue-700 font-medium">Tickets</span>
                </div>
                <p className="text-xl font-bold text-blue-700">{stat.ticket_count}</p>
                <p className="text-[10px] text-blue-500">{stat.open_tickets} open</p>
              </div>
              <div className="bg-orange-50 rounded-md p-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <MessageSquare className="h-3 w-3 text-orange-600" />
                  <span className="text-[10px] text-orange-700 font-medium">Escalations</span>
                </div>
                <p className="text-xl font-bold text-orange-700">{stat.escalation_count}</p>
                <p className="text-[10px] text-orange-500">{stat.open_escalations} open</p>
              </div>
            </div>
          )}

          {office.notes && <p className="text-xs text-slate-400 italic text-pretty border-t pt-2">{office.notes}</p>}
        </CardContent>

        <div className="px-5 pb-4 mt-auto flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => openEdit(office)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          {office.office_type !== 'headquarters' && (
            <Button variant="outline" size="sm" className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(office)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </Card>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminRoleWarning />

      {/* Page header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight text-balance">Office &amp; Branch Console</h1>
              <p className="text-xs text-slate-500">Manage all VedTech office locations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchOffices} disabled={isLoading}>
              <RefreshCw className={cn('h-4 w-4 mr-1.5', isLoading && 'animate-spin')} /> Refresh
            </Button>
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Office
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Offices', value: stats.total, color: 'text-slate-800' },
            { label: 'Active', value: stats.active, color: 'text-green-700' },
            { label: 'Branches', value: stats.branches, color: 'text-blue-700' },
            { label: 'Coming Soon', value: stats.comingSoon, color: 'text-yellow-700' },
          ].map(s => (
            <Card key={s.label} className="h-full">
              <CardContent className="py-4 px-5">
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                <p className={cn('text-3xl font-bold mt-0.5', s.color)}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input placeholder="Search by name, city, branch code, manager…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
              </div>
              <Select value={filterStatus} onValueChange={v => setFilterStatus(v as typeof filterStatus)}>
                <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={v => setFilterType(v as typeof filterType)}>
                <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="headquarters">Headquarters</SelectItem>
                  <SelectItem value="branch">Branch</SelectItem>
                  <SelectItem value="service_center">Service Centre</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Cards | Map | Table */}
        <Tabs defaultValue="cards">
          <TabsList className="mb-4">
            <TabsTrigger value="cards"><Building2 className="h-3.5 w-3.5 mr-1.5" />Cards</TabsTrigger>
            <TabsTrigger value="map"><Map className="h-3.5 w-3.5 mr-1.5" />Map</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          {/* ── CARDS TAB ────────────────────────────────────────────── */}
          <TabsContent value="cards">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="h-full animate-pulse">
                    <CardContent className="py-5 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                  <Building2 className="h-10 w-10" />
                  <p className="font-medium">No offices found</p>
                  <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1.5" />Add Office</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(o => <OfficeCard key={o.id} office={o} />)}
              </div>
            )}
          </TabsContent>

          {/* ── MAP TAB ──────────────────────────────────────────────── */}
          <TabsContent value="map">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Active Office Locations
                </CardTitle>
                {mappableOffices.length === 0 && (
                  <CardDescription className="text-xs text-slate-400">
                    No offices have coordinates set yet. Edit an office and add Latitude/Longitude to show it on the map.
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-0 rounded-b-lg overflow-hidden">
                <div className="h-[500px] w-full">
                  <OfficeMap offices={offices} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TABLE TAB ────────────────────────────────────────────── */}
          <TabsContent value="table">
            <Card>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Code</TableHead>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">Type</TableHead>
                      <TableHead className="whitespace-nowrap">City</TableHead>
                      <TableHead className="whitespace-nowrap">Manager</TableHead>
                      <TableHead className="whitespace-nowrap">Tickets</TableHead>
                      <TableHead className="whitespace-nowrap">Escalations</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Opened</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={10} className="text-center text-slate-400 py-8">No offices to display</TableCell></TableRow>
                    ) : filtered.map(o => {
                      const sc = STATUS_CONFIG[o.status];
                      const st = officeStats[o.id];
                      return (
                        <TableRow key={o.id}>
                          <TableCell className="whitespace-nowrap font-mono text-xs">{o.branch_code}</TableCell>
                          <TableCell className="whitespace-nowrap font-medium">{o.name}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className={cn('text-xs', TYPE_COLORS[o.office_type])}>{TYPE_LABELS[o.office_type]}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{o.city}</TableCell>
                          <TableCell className="whitespace-nowrap">{o.manager_name || <span className="text-slate-400">—</span>}</TableCell>
                          <TableCell className="whitespace-nowrap text-center">
                            <span className="font-semibold text-blue-700">{st?.ticket_count ?? 0}</span>
                            <span className="text-xs text-slate-400 ml-1">({st?.open_tickets ?? 0} open)</span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center">
                            <span className="font-semibold text-orange-700">{st?.escalation_count ?? 0}</span>
                            <span className="text-xs text-slate-400 ml-1">({st?.open_escalations ?? 0} open)</span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className={cn('text-xs flex items-center gap-1 w-fit', sc.cls)}>{sc.icon}{sc.label}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-slate-500">
                            {o.opened_at ? format(new Date(o.opened_at), 'dd MMM yyyy') : '—'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(o)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              {o.office_type !== 'headquarters' && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(o)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Office' : 'Add New Office'}</DialogTitle>
            <DialogDescription>{editingId ? 'Update office details below.' : 'Fill in the details for the new office or branch.'}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Office Name <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. VedTech Muzaffarpur Branch" value={form.name} onChange={e => f('name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Branch Code <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. VTS-MFP" value={form.branch_code} onChange={e => f('branch_code', e.target.value.toUpperCase())} />
              </div>
              <div className="space-y-1.5">
                <Label>Office Type</Label>
                <Select value={form.office_type} onValueChange={v => f('office_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="headquarters">Headquarters</SelectItem>
                    <SelectItem value="branch">Branch</SelectItem>
                    <SelectItem value="service_center">Service Centre</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Address <span className="text-red-500">*</span></Label>
                <Textarea placeholder="Full street address" value={form.address} onChange={e => f('address', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>City <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. Patna" value={form.city} onChange={e => f('city', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={form.state ?? ''} onChange={e => f('state', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Pincode</Label>
                <Input placeholder="e.g. 842001" value={form.pincode ?? ''} onChange={e => f('pincode', e.target.value)} maxLength={6} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => f('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Office Phone</Label>
                <Input placeholder="+91 XXXXX XXXXX" value={form.phone ?? ''} onChange={e => f('phone', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Office Email</Label>
                <Input type="email" placeholder="branch@vedtechservices.com" value={form.email ?? ''} onChange={e => f('email', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Manager Name</Label>
                <Input placeholder="Full name" value={form.manager_name ?? ''} onChange={e => f('manager_name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Manager Phone</Label>
                <Input placeholder="+91 XXXXX XXXXX" value={form.manager_phone ?? ''} onChange={e => f('manager_phone', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Opened On</Label>
                <Input type="date" value={form.opened_at ?? ''} onChange={e => f('opened_at', e.target.value)} />
              </div>
              {/* Map coordinates */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />Map Coordinates <span className="text-xs text-slate-400 font-normal ml-1">(for map pin)</span></Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Latitude e.g. 25.8741"
                    type="number" step="0.0001"
                    value={form.latitude ?? ''}
                    onChange={e => f('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                  <Input
                    placeholder="Longitude e.g. 85.7817"
                    type="number" step="0.0001"
                    value={form.longitude ?? ''}
                    onChange={e => f('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <p className="text-xs text-slate-400">Find coordinates at maps.google.com → right-click location → copy lat/lng</p>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Notes</Label>
                <Textarea placeholder="Optional internal notes…" value={form.notes ?? ''} onChange={e => f('notes', e.target.value)} rows={2} />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={saveOffice} disabled={isSaving}>{isSaving ? 'Saving…' : editingId ? 'Update Office' : 'Add Office'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700">Remove Office</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently remove <strong>{deleteTarget?.name}</strong> ({deleteTarget?.branch_code})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
              {isDeleting ? 'Removing…' : 'Yes, Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOffices;

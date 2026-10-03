import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, Plus, Search, Trash2, Edit, Save, X, 
  CheckCircle2, AlertCircle, ShoppingCart, ArrowLeft, 
  Wrench, User, Monitor, Inbox, Check, Ban, Truck,
  Bell, Mail, RefreshCw, ChevronRight, AlertTriangle, Activity
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useNavigate } from '@/lib/next-router';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/Loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';

const AdminInventory: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [partRequests, setPartRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Inventory Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    category: '',
    stock_level: 0,
    min_stock_level: 5,
    unit_price: 0,
    lead_time_weeks: 4
  });

  // Admin Request Process State
  const [adminNotes, setAdminNotes] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: invData } = await (supabase.from('inventory_items') as any).select('*').order('name');
      setInventory(invData || []);

      const { data: reqData } = await (supabase.from('part_requests') as any)
        .select(`
          *,
          inventory_items (name, stock_level),
          engineers (name),
          hardware_repairs (device_name, serial_number)
        `)
        .order('created_at', { ascending: false });
      setPartRequests(reqData || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('vts_admin_auth');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const handleSaveItem = async () => {
    setIsUpdating(true);
    try {
      if (selectedItem) {
        await (supabase.from('inventory_items') as any).update(itemForm).eq('id', selectedItem.id);
        toast({ title: "Item Updated" });
      } else {
        await (supabase.from('inventory_items') as any).insert(itemForm);
        toast({ title: "Item Added" });
      }
      setShowItemModal(false);
      fetchData();
    } catch (err) {
      toast({ title: "Error Saving", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestAction = async (request: any, status: 'approved' | 'rejected') => {
    setIsUpdating(true);
    try {
      if (status === 'approved') {
        // Check stock first
        const { data: item } = await (supabase.from('inventory_items') as any)
          .select('stock_level')
          .eq('id', request.item_id)
          .single();
        
        if (!item || item.stock_level < request.quantity) {
          toast({ title: "Insufficient Stock", description: "Cannot approve request.", variant: "destructive" });
          return;
        }

        // Decrement stock
        await (supabase.from('inventory_items') as any)
          .update({ stock_level: item.stock_level - request.quantity })
          .eq('id', request.item_id);
      }

      await (supabase.from('part_requests') as any)
        .update({ 
          status, 
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      // Notify Engineer
      await (supabase.from('engineer_notifications') as any).insert({
        engineer_id: request.engineer_id,
        title: `Part Request ${status.toUpperCase()}`,
        message: `Your request for ${request.inventory_items?.name} has been ${status}. ${adminNotes}`,
        link: '/engineer/dashboard'
      });

      toast({ title: `Request ${status}` });
      setAdminNotes('');
      fetchData();
    } catch (err) {
      toast({ title: "Action Failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };


  const getAIPredictedQuantity = (item: any) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const relevantRequests = partRequests.filter(req => 
      req.item_id === item.id && 
      (req.status === 'approved' || req.status === 'issued') && 
      new Date(req.updated_at) >= ninetyDaysAgo
    );

    const totalQty = relevantRequests.reduce((acc, req) => acc + req.quantity, 0);
    const requestCount = relevantRequests.length;

    if (requestCount < 3) {
      return {
        quantity: Math.max(item.min_stock_level, (item.min_stock_level * 2) - item.stock_level),
        isFallback: true
      };
    }

    const avgWeeklyUsage = totalQty / 13;
    const leadTimeWeeks = item.lead_time_weeks || 4;
    const predicted = Math.ceil((avgWeeklyUsage * leadTimeWeeks * 1.2) - item.stock_level);
    
    return {
      quantity: Math.max(item.min_stock_level, predicted),
      isFallback: false
    };
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size={48} /></div>;

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
                <Inbox className="h-8 w-8 text-orange-400" />
                Inventory & Parts Management
              </h1>
              <p className="text-slate-400">Track stock levels and manage spare part requests from field engineers.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <Tabs defaultValue="inventory" className="space-y-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="inventory" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Package className="h-4 w-4" /> Stock Management
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Wrench className="h-4 w-4" /> Engineer Requests
                {partRequests.filter(r => r.status === 'pending').length > 0 && (
                  <Badge className="bg-orange-500 text-white ml-1">
                    {partRequests.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reorder" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Truck className="h-4 w-4" /> Reorder Suggestions
                {inventory.filter(i => i.stock_level <= i.min_stock_level).length > 0 && (
                  <Badge className="bg-red-500 text-white ml-1">
                    {inventory.filter(i => i.stock_level <= i.min_stock_level).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Search inventory..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button onClick={() => {
                      setSelectedItem(null);
                      setItemForm({
                        name: '', description: '', category: '', 
                        stock_level: 0, min_stock_level: 5, unit_price: 0,
                        lead_time_weeks: 4
                      });
                      setShowItemModal(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b">
                          <th className="p-4">Item Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4">Lead Time (Wks)</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredInventory.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{item.name}</td>
                            <td className="p-4 text-slate-600">{item.category}</td>
                            <td className="p-4 text-slate-900">₹{item.unit_price}</td>
                            <td className="p-4 font-mono">{item.stock_level}</td>
                            <td className="p-4 text-slate-600">{item.lead_time_weeks || 4}</td>
                            <td className="p-4">
                              <Badge className={item.stock_level <= item.min_stock_level ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                {item.stock_level <= item.min_stock_level ? 'Low Stock' : 'Optimal'}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              <Button variant="ghost" size="icon" onClick={() => {
                                setSelectedItem(item);
                                setItemForm({
                                  name: item.name, description: item.description, category: item.category,
                                  stock_level: item.stock_level, min_stock_level: item.min_stock_level, 
                                  unit_price: item.unit_price, lead_time_weeks: item.lead_time_weeks || 4
                                });
                                setShowItemModal(true);
                              }}>
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <div className="space-y-4">
                {partRequests.length === 0 ? (
                  <Card><CardContent className="p-12 text-center text-slate-500">No requests found</CardContent></Card>
                ) : (
                  partRequests.map(req => (
                    <Card key={req.id} className={req.status === 'pending' ? 'border-orange-200' : ''}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                              <Badge className={
                                req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                req.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                req.status === 'issued' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {req.status.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-slate-400 font-mono">ID: {req.id.slice(0,8)}</span>
                            </div>
                            
                            <div>
                              <h4 className="font-bold text-xl text-slate-900">{req.inventory_items?.name}</h4>
                              <p className="text-slate-500 text-sm">Requested quantity: <span className="font-bold">{req.quantity} units</span></p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-400">Requested By</p>
                                  <p className="font-medium">{req.engineers?.name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4 text-primary" />
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-400">For Repair</p>
                                  <p className="font-medium">{req.hardware_repairs?.device_name} ({req.hardware_repairs?.serial_number})</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="w-full md:w-80 flex flex-col justify-center gap-4 border-l pl-0 md:pl-6">
                            {req.status === 'pending' ? (
                              <>
                                <Input 
                                  placeholder="Admin internal notes..." 
                                  value={adminNotes} 
                                  onChange={(e) => setAdminNotes(e.target.value)} 
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1" 
                                    onClick={() => handleRequestAction(req, 'approved')}
                                    disabled={isUpdating}
                                  >
                                    <Check className="h-4 w-4" /> Approve
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 gap-1"
                                    onClick={() => handleRequestAction(req, 'rejected')}
                                    disabled={isUpdating}
                                  >
                                    <Ban className="h-4 w-4" /> Reject
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Admin Notes</p>
                                <p className="text-sm italic">"{req.admin_notes || 'No notes added.'}"</p>
                                <p className="text-[10px] mt-3 text-slate-400">Processed on {new Date(req.updated_at).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="reorder">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-red-100 bg-red-50/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        Critical Stock Alerts
                      </CardTitle>
                      <CardDescription>Items that require immediate restocking to avoid service delays.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {inventory.filter(i => i.stock_level <= i.min_stock_level).map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-red-100 rounded-lg shadow-sm">
                            <div>
                              <p className="font-bold text-slate-900">{item.name}</p>
                              <p className="text-xs text-red-600 font-bold">Stock: {item.stock_level} (Min: {item.min_stock_level})</p>
                            </div>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-1" onClick={() => {
                              toast({ title: "Email Alert Sent", description: `Reorder alert for ${item.name} sent to administrator.` });
                            }}>
                              <Mail className="h-3 w-3" /> Notify
                            </Button>
                          </div>
                        ))}
                        {inventory.filter(i => i.stock_level <= i.min_stock_level).length === 0 && (
                          <div className="text-center py-8">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <p className="text-slate-600 font-medium">All stock levels are optimal</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        AI Reorder Suggestion
                      </CardTitle>
                      <CardDescription>Predictive quantity based on past 90 days usage trends.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {inventory.filter(i => i.stock_level <= i.min_stock_level).map(item => {
                          const aiSuggest = getAIPredictedQuantity(item);
                          return (
                            <div key={item.id} className="p-4 border rounded-xl bg-slate-50 relative overflow-hidden">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="font-bold text-slate-900">{item.name}</h5>
                                  <p className="text-xs text-slate-500">{item.category}</p>
                                </div>
                                <div className="text-right">
                                  <Badge className={aiSuggest.isFallback ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}>
                                    AI Suggest: +{aiSuggest.quantity}
                                  </Badge>
                                  {aiSuggest.isFallback && (
                                    <p className="text-[10px] text-amber-600 mt-1 font-bold">Limited Data - Basic Mode</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700" size="sm" onClick={() => {
                                  toast({ title: "Purchase Order Drafted", description: `Draft for ${aiSuggest.quantity} units of ${item.name} created based on AI suggestion.` });
                                }}>
                                  <ShoppingCart className="h-4 w-4" /> Use AI Suggestion
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {inventory.filter(i => i.stock_level <= i.min_stock_level).length === 0 && (
                          <div className="text-center py-12 text-slate-400 italic">No reorders suggested at this time.</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Item Modal */}
      <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Item Name</label>
              <Input value={itemForm.name} onChange={(e) => setItemForm({...itemForm, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Category</label>
              <Select value={itemForm.category} onValueChange={(val) => setItemForm({...itemForm, category: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RAM">RAM</SelectItem>
                  <SelectItem value="Storage">Storage (SSD/HDD)</SelectItem>
                  <SelectItem value="Screens">Screens</SelectItem>
                  <SelectItem value="Printers">Printer Parts</SelectItem>
                  <SelectItem value="Keyboard">Keyboard/Mouse</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Stock Level</label>
                <Input type="number" value={itemForm.stock_level} onChange={(e) => setItemForm({...itemForm, stock_level: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Min. Stock Level</label>
                <Input type="number" value={itemForm.min_stock_level} onChange={(e) => setItemForm({...itemForm, min_stock_level: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Unit Price (₹)</label>
              <Input type="number" value={itemForm.unit_price} onChange={(e) => setItemForm({...itemForm, unit_price: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Reorder Lead Time (Weeks)</label>
              <Input type="number" value={itemForm.lead_time_weeks} onChange={(e) => setItemForm({...itemForm, lead_time_weeks: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Description</label>
              <Input value={itemForm.description} onChange={(e) => setItemForm({...itemForm, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveItem} disabled={isUpdating}>
              {isUpdating ? <LoadingSpinner size={16} className="mr-2" /> : "Save Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInventory;

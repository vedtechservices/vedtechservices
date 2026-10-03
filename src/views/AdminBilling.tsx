import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, Search, ArrowLeft, Filter, 
  Download, FileText, IndianRupee, DollarSign, Euro,
  ChevronRight, Calendar, User, RefreshCw
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useNavigate } from '@/lib/next-router';
import { LoadingSpinner } from '@/components/common/Loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';

const AdminBilling: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data } = await (supabase
        .from('service_invoices') as any)
        .select(`
          *,
          customers (name, email)
        `)
        .order('created_at', { ascending: false });
      
      setInvoices(data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
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
    fetchInvoices();
  }, [navigate]);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCurrency = filterCurrency === 'all' || inv.currency === filterCurrency;
    return matchesSearch && matchesCurrency;
  });

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'USD': return <DollarSign className="h-4 w-4" />;
      case 'EUR': return <Euro className="h-4 w-4" />;
      case 'INR': return <IndianRupee className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

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
                <CreditCard className="h-8 w-8 text-green-400" />
                Billing & Multi-Currency Invoices
              </h1>
              <p className="text-slate-400">Track international payments and generate financial records.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search by invoice # or customer..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterCurrency} onValueChange={setFilterCurrency}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Currencies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Currencies</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="AED">AED (د.إ)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchInvoices}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b">
                      <th className="p-4">Invoice Details</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-500 italic">No invoices found.</td>
                      </tr>
                    ) : (
                      filteredInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{inv.invoice_number}</p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(inv.created_at).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{inv.customers?.name}</p>
                                <p className="text-[10px] text-slate-500">{inv.customers?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 font-bold text-slate-900">
                              {getCurrencyIcon(inv.currency)}
                              {Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              <span className="text-[10px] text-slate-400 font-normal ml-1">{inv.currency}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {inv.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4 text-blue-600" />
                            </Button>
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
      </section>
    </div>
  );
};

export default AdminBilling;

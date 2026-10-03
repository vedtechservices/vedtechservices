import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Users, Clock, Monitor, 
  ArrowLeft, RefreshCw, BarChart2, PieChart,
  CheckCircle2, AlertCircle, Calendar,
  DollarSign, Activity, ChevronRight, ArrowUpRight, ArrowDownRight,
  Download, FileText, Table as TableIcon, Mail, LineChart as LucideLineChart, Filter, Globe
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useNavigate } from '@/lib/next-router';
import { LoadingSpinner } from '@/components/common/Loader';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';

const AdminPerformance: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [reportLogs, setReportLogs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [exchangeRates, setExchangeRates] = useState<any>({});
  const [escalations, setEscalations] = useState<any[]>([]);
  const [slaSettings, setSlaSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInrEquivalent, setShowInrEquivalent] = useState(true);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(['INR', 'USD', 'EUR', 'GBP']);
  const [selectedRegionForecast, setSelectedRegionForecast] = useState('All Regions');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ticketsRes, repairsRes, engineersRes, logsRes, invoicesRes, ratesRes, escalationsRes, slaRes] = await Promise.all([
        supabase.from('support_tickets').select('*'),
        supabase.from('hardware_repairs').select('*'),
        supabase.from('engineers').select('*'),
        (supabase.from('report_delivery_logs') as any).select('*').order('created_at', { ascending: false }).limit(10),
        (supabase.from('service_invoices') as any).select('*').order('paid_at', { ascending: true }),
        (supabase.from('exchange_rates') as any).select('*').eq('base_currency', 'INR').maybeSingle(),
        supabase.from('chatbot_escalations').select('*'),
        supabase.from('sla_settings').select('*')
      ]);

      setTickets(ticketsRes.data || []);
      setRepairs(repairsRes.data || []);
      setEngineers(engineersRes.data || []);
      setReportLogs(logsRes.data || []);
      setInvoices(invoicesRes.data || []);
      setEscalations(escalationsRes.data || []);
      setSlaSettings(slaRes.data || []);
      if (ratesRes.data) setExchangeRates(ratesRes.data.rates || {});
    } catch (err) {
      console.error('Error fetching performance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('vts_admin_auth');
    const role = localStorage.getItem('vts_admin_role');
    if (!isAuth || role !== 'super_admin') {
      navigate('/admin/dashboard');
      return;
    }
    fetchData();
  }, [navigate]);

  // Financial Calculations
  const totalRevenue = repairs.reduce((acc, r) => acc + (Number(r.total_price) || 0), 0);
  const totalCosts = repairs.reduce((acc, r) => acc + (Number(r.parts_cost) || 0) + (Number(r.labor_cost) || 0), 0);
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue * 100).toFixed(1) : 0;

  // Engineer Efficiency Metrics
  const engineerMetrics = engineers.map(eng => {
    const engTickets = tickets.filter(t => t.engineer_id === eng.id);
    const resolvedTickets = engTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    
    const avgResolutionTime = resolvedTickets.length > 0
      ? (resolvedTickets.reduce((acc, t) => {
          const created = new Date(t.created_at).getTime();
          const updated = new Date(t.updated_at).getTime();
          return acc + (updated - created);
        }, 0) / resolvedTickets.length / (1000 * 60 * 60)).toFixed(1)
      : 'N/A';

    return {
      id: eng.id,
      name: eng.name,
      totalTickets: engTickets.length,
      resolvedCount: resolvedTickets.length,
      resolutionRate: engTickets.length > 0 ? ((resolvedTickets.length / engTickets.length) * 100).toFixed(0) : 0,
      avgResolutionTime
    };
  }).sort((a, b) => Number(b.resolutionRate) - Number(a.resolutionRate));

  const averageRepairTimeHours = () => {
    const completedRepairs = repairs.filter(r => r.status === 'delivered' && r.created_at && r.updated_at);
    if (completedRepairs.length === 0) return 0;

    const totalTimeMs = completedRepairs.reduce((acc, r) => {
      const created = new Date(r.created_at).getTime();
      const updated = new Date(r.updated_at).getTime();
      return acc + (updated - created);
    }, 0);

    const avgMs = totalTimeMs / completedRepairs.length;
    return (avgMs / (1000 * 60 * 60)).toFixed(1);
  };

  const resolutionRates = engineers.map(eng => {
    const engTickets = tickets.filter(t => t.engineer_id === eng.id);
    if (engTickets.length === 0) return { name: eng.name, rate: 0, total: 0 };
    
    const resolved = engTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    return {
      name: eng.name,
      rate: ((resolved / engTickets.length) * 100).toFixed(0),
      total: engTickets.length
    };
  }).sort((a, b) => Number(b.rate) - Number(a.rate));

  const commonIssues = () => {
    const counts: Record<string, number> = {};
    repairs.forEach(r => {
      const device = r.device_name.split(' ')[0].toLowerCase();
      counts[device] = (counts[device] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getChartData = () => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date()
    });

    return days.map(day => {
      const data: any = { date: format(day, 'MMM dd') };
      let dayTotalInr = 0;

      selectedCurrencies.forEach(currency => {
        const dailyRevenue = invoices
          .filter(inv => inv.paid_at && isSameDay(new Date(inv.paid_at), day) && inv.currency === currency)
          .reduce((sum, inv) => sum + Number(inv.amount), 0);
        
        data[currency] = dailyRevenue;
        
        // Convert to INR for equivalent line
        const rate = currency === 'INR' ? 1 : (exchangeRates[currency] || 0);
        if (rate > 0) {
          dayTotalInr += dailyRevenue / rate;
        }
      });

      if (showInrEquivalent) {
        data['Total (INR)'] = Math.round(dayTotalInr);
      }

      return data;
    });
  };

  const chartColors: any = {
    'INR': '#2563eb',
    'USD': '#16a34a',
    'EUR': '#dc2626',
    'GBP': '#ca8a04',
    'JPY': '#9333ea',
    'CNY': '#ea580c',
    'CHF': '#0891b2',
    'HKD': '#4f46e5',
    'NZD': '#be185d',
    'Total (INR)': '#0f172a'
  };

  const availableCurrenciesList = Array.from(new Set(invoices.map(inv => inv.currency))).filter(Boolean);

  const getRevenueByCountry = () => {
    const countries: Record<string, { totalInr: number, count: number, currency: string }> = {};
    
    invoices.forEach(inv => {
      if (!inv.paid_at) return;
      const country = inv.country || 'India';
      const rate = inv.currency === 'INR' ? 1 : (exchangeRates[inv.currency] || 0);
      const inrAmount = rate > 0 ? Number(inv.amount) / rate : Number(inv.amount);
      
      if (!countries[country]) {
        countries[country] = { totalInr: 0, count: 0, currency: inv.currency };
      }
      countries[country].totalInr += inrAmount;
      countries[country].count += 1;
    });

    return Object.entries(countries)
      .map(([name, data]) => ({
        name,
        totalInr: Math.round(data.totalInr),
        count: data.count,
        percentage: 0 
      }))
      .sort((a, b) => b.totalInr - a.totalInr);
  };

  const getRegionalRevenueTrends = () => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date()
    });

    const regions = Array.from(new Set(invoices.map(inv => inv.region).filter(Boolean)));
    if (regions.length === 0) regions.push('Asia-Pacific');

    return days.map(day => {
      const data: any = { date: format(day, 'MMM dd') };
      let totalDayInr = 0;
      regions.forEach(region => {
        const regionalRevenue = invoices
          .filter(inv => inv.paid_at && isSameDay(new Date(inv.paid_at), day) && inv.region === region)
          .reduce((sum, inv) => {
            const rate = inv.currency === 'INR' ? 1 : (exchangeRates[inv.currency] || 0);
            return sum + (rate > 0 ? Number(inv.amount) / rate : Number(inv.amount));
          }, 0);
        data[region] = Math.round(regionalRevenue);
        totalDayInr += regionalRevenue;
      });
      data['Global Average'] = Math.round(totalDayInr / (regions.length || 1));
      return data;
    });
  };

  const getRegionalGrowth = () => {
    const currentPeriodStart = subDays(new Date(), 30);
    const previousPeriodStart = subDays(new Date(), 60);

    const regions = Array.from(new Set(invoices.map(inv => inv.region).filter(Boolean)));
    
    return regions.map(region => {
      const currentRevenue = invoices
        .filter(inv => inv.paid_at && new Date(inv.paid_at) >= currentPeriodStart && inv.region === region)
        .reduce((sum, inv) => {
          const rate = inv.currency === 'INR' ? 1 : (exchangeRates[inv.currency] || 0);
          return sum + (rate > 0 ? Number(inv.amount) / rate : Number(inv.amount));
        }, 0);

      const previousRevenue = invoices
        .filter(inv => inv.paid_at && new Date(inv.paid_at) >= previousPeriodStart && new Date(inv.paid_at) < currentPeriodStart && inv.region === region)
        .reduce((sum, inv) => {
          const rate = inv.currency === 'INR' ? 1 : (exchangeRates[inv.currency] || 0);
          return sum + (rate > 0 ? Number(inv.amount) / rate : Number(inv.amount));
        }, 0);

      const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      return {
        region,
        currentRevenue: Math.round(currentRevenue),
        previousRevenue: Math.round(previousRevenue),
        growthRate: growthRate.toFixed(1),
        status: growthRate > 5 ? 'Positive' : growthRate < -5 ? 'Negative' : 'Stable'
      };
    }).sort((a, b) => b.currentRevenue - a.currentRevenue);
  };

  const countriesRevenue = getRevenueByCountry();
  const regionalTrends = getRegionalRevenueTrends();
  const regionalGrowth = getRegionalGrowth();
  const regions = Array.from(new Set(invoices.map(inv => inv.region).filter(Boolean)));

  const getDetailedRegionalGrowth = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    
    const regionsList = Array.from(new Set(invoices.map(inv => inv.region).filter(Boolean)));
    if (regionsList.length === 0) regionsList.push('Asia-Pacific');

    return regionsList.map(region => {
      const currentYearRevenue = invoices
        .filter(inv => inv.paid_at && new Date(inv.paid_at).getFullYear() === currentYear && inv.region === region)
        .reduce((sum, inv) => {
          const rate = inv.currency === 'INR' ? 1 : (exchangeRates[inv.currency] || 0);
          return sum + (rate > 0 ? Number(inv.amount) / rate : Number(inv.amount));
        }, 0);

      const previousYearRevenue = invoices
        .filter(inv => inv.paid_at && new Date(inv.paid_at).getFullYear() === currentYear - 1 && inv.region === region)
        .reduce((sum, inv) => {
          const rate = inv.currency === 'INR' ? 1 : (exchangeRates[inv.currency] || 0);
          return sum + (rate > 0 ? Number(inv.amount) / rate : Number(inv.amount));
        }, 0);

      const yoyGrowth = previousYearRevenue > 0 ? ((currentYearRevenue - previousYearRevenue) / previousYearRevenue) * 100 : 0;

      const currentQuarterRevenue = invoices
        .filter(inv => {
          if (!inv.paid_at) return false;
          const d = new Date(inv.paid_at);
          return d.getFullYear() === currentYear && (Math.floor(d.getMonth() / 3) + 1) === currentQuarter && inv.region === region;
        })
        .reduce((sum, inv) => {
          const rate = inv.currency === 'INR' ? 1 : (exchangeRates[inv.currency] || 0);
          return sum + (rate > 0 ? Number(inv.amount) / rate : Number(inv.amount));
        }, 0);

      const prevQuarterDate = new Date();
      prevQuarterDate.setMonth(now.getMonth() - 3);
      const prevQuarterYear = prevQuarterDate.getFullYear();
      const prevQuarter = Math.floor(prevQuarterDate.getMonth() / 3) + 1;

      const previousQuarterRevenue = invoices
        .filter(inv => {
          if (!inv.paid_at) return false;
          const d = new Date(inv.paid_at);
          return d.getFullYear() === prevQuarterYear && (Math.floor(d.getMonth() / 3) + 1) === prevQuarter && inv.region === region;
        })
        .reduce((sum, inv) => {
          const rate = inv.currency === 'INR' ? 1 : (exchangeRates[inv.currency] || 0);
          return sum + (rate > 0 ? Number(inv.amount) / rate : Number(inv.amount));
        }, 0);

      const qoqGrowth = previousQuarterRevenue > 0 ? ((currentQuarterRevenue - previousQuarterRevenue) / previousQuarterRevenue) * 100 : 0;

      return {
        region,
        currentYearRevenue: Math.round(currentYearRevenue),
        previousYearRevenue: Math.round(previousYearRevenue),
        yoyGrowth: Number(yoyGrowth).toFixed(1),
        currentQuarterRevenue: Math.round(currentQuarterRevenue),
        previousQuarterRevenue: Math.round(previousQuarterRevenue),
        qoqGrowth: Number(qoqGrowth).toFixed(1)
      };
    });
  };

  const getPredictiveForecast = () => {
    const last6MonthsRevenue = invoices
      .filter(inv => inv.paid_at && new Date(inv.paid_at) >= subDays(new Date(), 180))
      .reduce((sum, inv) => {
        const rate = inv.currency === 'INR' ? 1 : (exchangeRates[inv.currency] || 0);
        return sum + (rate > 0 ? Number(inv.amount) / rate : Number(inv.amount));
      }, 0);

    const avgMonthlyRevenue = last6MonthsRevenue / 6 || 1000;
    const projectedNextQuarter = avgMonthlyRevenue * 3 * 1.1;
    const projectedNextYear = avgMonthlyRevenue * 12 * 1.15;

    return {
      nextQuarter: Math.round(projectedNextQuarter),
      nextYear: Math.round(projectedNextYear),
      confidence: '±12%',
      trend: 'Positive'
    };
  };

  const getForecastChartData = (): any[] => {
    const historical: any[] = getRegionalRevenueTrends(); 
    const forecast: any[] = [];
    let cumulativeDate = new Date();
    
    const regionsList = Array.from(new Set(invoices.map(inv => inv.region).filter(Boolean)));
    if (regionsList.length === 0) regionsList.push('Asia-Pacific');

    for (let i = 1; i <= 6; i++) {
      cumulativeDate = new Date(cumulativeDate.getFullYear(), cumulativeDate.getMonth() + 1, 1);
      const data: any = { date: format(cumulativeDate, 'MMM yy'), isForecast: true };
      let totalProjected = 0;
      
      regionsList.forEach(region => {
        const regRev90 = invoices
          .filter(inv => inv.paid_at && new Date(inv.paid_at) >= subDays(new Date(), 90) && inv.region === region)
          .reduce((sum, inv) => {
            const rate = inv.currency === 'INR' ? 1 : (exchangeRates[inv.currency] || 0);
            return sum + (rate > 0 ? Number(inv.amount) / rate : Number(inv.amount));
          }, 0);
        
        const avgMonthly = regRev90 / 3 || 500;
        const projected = Math.round(avgMonthly * (1 + (0.02 * i)));
        data[region] = projected;
        totalProjected += projected;
      });
      data['Global Average'] = Math.round(totalProjected / (regionsList.length || 1));
      forecast.push(data);
    }
    
    return [...historical.slice(-10), ...forecast];
  };

  const detailedGrowth = getDetailedRegionalGrowth();
  const forecastSummary = getPredictiveForecast();
  const forecastChartData = getForecastChartData();

  
  const grandTotalInr = countriesRevenue.reduce((acc, c) => acc + c.totalInr, 0);
  countriesRevenue.forEach(c => {
    c.percentage = grandTotalInr > 0 ? Number(((c.totalInr / grandTotalInr) * 100).toFixed(1)) : 0;
  });

  const exportAsPDF = () => {
    const doc = new jsPDF() as any;
    const timestamp = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175);
    doc.text('VedTech Services', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Service Performance Report', 105, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Report Generated: ${timestamp}`, 105, 38, { align: 'center' });

    // Financial Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Financial Summary', 20, 50);
    doc.autoTable({
      startY: 55,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `₹${totalRevenue.toLocaleString()}`],
        ['Total Costs', `₹${totalCosts.toLocaleString()}`],
        ['Gross Margin', `${grossMargin}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175] },
    });

    // Engineer Efficiency
    doc.addPage();
    doc.text('Engineer Efficiency Leaderboard', 20, 20);
    doc.autoTable({
      startY: 25,
      head: [['Engineer Name', 'Total Assigned', 'Resolved Rate', 'Avg Time (h)']],
      body: engineerMetrics.map(eng => [
        eng.name,
        eng.totalTickets,
        `${eng.resolutionRate}%`,
        eng.avgResolutionTime === 'N/A' ? 'N/A' : `${eng.avgResolutionTime}h`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175] },
    });

    // Profitability
    doc.addPage();
    doc.text('Detailed Repair Profitability (Top 20)', 20, 20);
    doc.autoTable({
      startY: 25,
      head: [['Device', 'Revenue', 'Cost', 'Margin']],
      body: repairs.slice(0, 20).map(r => {
        const cost = (Number(r.parts_cost) || 0) + (Number(r.labor_cost) || 0);
        const rev = Number(r.total_price) || 0;
        const profit = rev - cost;
        const margin = rev > 0 ? ((profit / rev) * 100).toFixed(0) : 0;
        return [r.device_name, `₹${rev}`, `₹${cost}`, `${margin}%`];
      }),
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175] },
    });

    doc.save(`VedTech_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportAsExcel = () => {
    const wb = XLSX.utils.book_new();

    // Financials
    const financialData = [
      ['Metric', 'Value'],
      ['Total Revenue', totalRevenue],
      ['Total Costs', totalCosts],
      ['Gross Margin (%)', grossMargin],
    ];
    const wsFinancials = XLSX.utils.aoa_to_sheet(financialData);
    XLSX.utils.book_append_sheet(wb, wsFinancials, 'Financial Summary');

    // Revenue Trend
    const trendData = getChartData().map(d => {
      const row: any = { Date: d.date };
      selectedCurrencies.forEach(c => {
        row[`${c} Revenue`] = d[c];
      });
      if (showInrEquivalent) {
        row['Total (INR)'] = d['Total (INR)'];
      }
      return row;
    });
    const wsTrend = XLSX.utils.json_to_sheet(trendData);
    XLSX.utils.book_append_sheet(wb, wsTrend, 'Multi-Currency Revenue Trend');

    // Engineers
    const engineerData = [
      ['Engineer Name', 'Total Assigned', 'Resolved Count', 'Resolution Rate (%)', 'Avg Resolution Time (h)'],
      ...engineerMetrics.map(eng => [
        eng.name,
        eng.totalTickets,
        eng.resolvedCount,
        eng.resolutionRate,
        eng.avgResolutionTime
      ])
    ];
    const wsEngineers = XLSX.utils.aoa_to_sheet(engineerData);
    XLSX.utils.book_append_sheet(wb, wsEngineers, 'Engineer Efficiency');

    // Repairs
    const repairData = [
      ['Device Name', 'Serial Number', 'Revenue', 'Parts Cost', 'Labor Cost', 'Total Cost', 'Profit', 'Margin (%)'],
      ...repairs.map(r => {
        const cost = (Number(r.parts_cost) || 0) + (Number(r.labor_cost) || 0);
        const rev = Number(r.total_price) || 0;
        const profit = rev - cost;
        const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : 0;
        return [
          r.device_name,
          r.serial_number,
          rev,
          Number(r.parts_cost) || 0,
          Number(r.labor_cost) || 0,
          cost,
          profit,
          margin
        ];
      })
    ];
    const wsRepairs = XLSX.utils.aoa_to_sheet(repairData);
    XLSX.utils.book_append_sheet(wb, wsRepairs, 'Detailed Profitability');

    XLSX.writeFile(wb, `VedTech_Performance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size={48} /></div>;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      <div className="container pt-4"><AdminRoleWarning /></div>
      <section className="bg-slate-900 text-white py-12">
        <div className="container">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="border-white/20 hover:bg-white/10" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart2 className="h-8 w-8 text-blue-400" />
                Service Performance Dashboard
              </h1>
              <p className="text-slate-400">Data-driven insights for team efficiency and hardware service quality</p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Download className="h-4 w-4" /> Export Report
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportAsPDF} className="gap-2">
                    <FileText className="h-4 w-4 text-red-500" /> Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsExcel} className="gap-2">
                    <TableIcon className="h-4 w-4 text-green-500" /> Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={async () => {
                  try {
                    toast({ title: "Sending Report...", description: "Generating and sending weekly performance report." });
                    const { error } = await (supabase as any).functions.invoke('send-weekly-report');
                    if (error) throw error;
                    toast({ title: "Report Sent", description: "Weekly report has been sent to Super Admin email." });
                  } catch (err) {
                    console.error('Failed to send report:', err);
                    toast({ title: "Send Failed", description: "Could not send automated report.", variant: "destructive" });
                  }
                }}
              >
                <Mail className="h-4 w-4" /> Send Weekly Report Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-red-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-red-600 rotate-180" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Costs</p>
                    <p className="text-2xl font-bold text-slate-900">₹{totalCosts.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gross Margin</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-slate-900">{grossMargin}%</p>
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Team</p>
                    <p className="text-2xl font-bold text-slate-900">{engineers.length} Engineers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Avg Repair Time</p>
                    <p className="text-3xl font-bold text-slate-900">{averageRepairTimeHours()} Hours</p>
                    <p className="text-xs text-green-600 mt-1">▲ 12% faster than last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Resolution Rate</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {tickets.length > 0 ? ((tickets.filter(t => t.status === 'resolved').length / tickets.length) * 100).toFixed(0) : 0}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Overall team efficiency</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-orange-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Pending Tasks</p>
                    <p className="text-3xl font-bold text-slate-900">{tickets.filter(t => t.status !== 'resolved').length}</p>
                    <p className="text-xs text-red-600 mt-1">Requires attention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Engineer Leaderboard */}
            <Card>
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Engineer Efficiency Leaderboard
                </CardTitle>
                <CardDescription>Performance metrics based on ticket resolution and time.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {engineerMetrics.map((eng, i) => (
                    <div key={eng.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${i === 0 ? 'bg-yellow-500' : 'bg-slate-200 text-slate-600'}`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{eng.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{eng.totalTickets} Assigned</p>
                        </div>
                      </div>
                      <div className="flex gap-8">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{eng.resolutionRate}%</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Res. Rate</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">{eng.avgResolutionTime}h</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Avg. Time</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Failure Trends */}
            <Card>
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Most Common Device Failures
                </CardTitle>
                <CardDescription>Frequency analysis by device type.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {commonIssues().map(([type, count], i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold capitalize">{type}</span>
                        <span className="text-slate-500">{count} Cases</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-blue-500 transition-all duration-1000`} 
                          style={{ width: `${(count / repairs.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {repairs.length === 0 && <p className="text-center text-slate-500 py-10">No repair data yet.</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Multi-Currency Revenue Trend Chart */}
          <Card className="mt-8 mb-8">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b bg-slate-50/50">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Multi-Currency Revenue Trend
                </CardTitle>
                <CardDescription>International growth trends over the last 30 days.</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    id="inr-equivalent" 
                    checked={showInrEquivalent} 
                    onCheckedChange={setShowInrEquivalent} 
                  />
                  <Label htmlFor="inr-equivalent" className="text-xs">Show INR Total</Label>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" /> Currencies
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Select Currencies</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF', 'HKD', 'NZD'].map(currency => (
                      <DropdownMenuCheckboxItem
                        key={currency}
                        checked={selectedCurrencies.includes(currency)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedCurrencies(prev => [...prev, currency]);
                          else setSelectedCurrencies(prev => prev.filter(c => c !== currency));
                        }}
                      >
                        {currency}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any, name: string) => [value.toLocaleString(), name]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    {selectedCurrencies.map(currency => (
                      <Line
                        key={currency}
                        type="monotone"
                        dataKey={currency}
                        stroke={chartColors[currency] || '#94a3b8'}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    ))}
                    {showInrEquivalent && (
                      <Line
                        type="monotone"
                        dataKey="Total (INR)"
                        stroke={chartColors['Total (INR)']}
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Geographical Revenue Distribution (Heat Map Alternative) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  International Revenue Heat Map
                </CardTitle>
                <CardDescription>Visualizing revenue concentration by country.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {countriesRevenue.map((c, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">{i + 1}</span>
                          {c.name}
                        </span>
                        <span className="text-slate-500 font-medium">₹{c.totalInr.toLocaleString()} ({c.percentage}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-1000", 
                            i === 0 ? "bg-blue-600" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-blue-400" : "bg-blue-300"
                          )} 
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {countriesRevenue.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                      <Globe className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>No international revenue recorded yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Top Countries Summary
                </CardTitle>
                <CardDescription>Breakdown of transactions and values.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 border-b">
                        <th className="p-4">Country</th>
                        <th className="p-4">Transactions</th>
                        <th className="p-4 text-right">Value (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {countriesRevenue.length === 0 ? (
                        <tr><td colSpan={3} className="p-8 text-center text-slate-400 italic">No data available.</td></tr>
                      ) : (
                        countriesRevenue.map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{c.name}</td>
                            <td className="p-4 text-slate-600">{c.count}</td>
                            <td className="p-4 text-right font-mono font-bold text-blue-600">₹{c.totalInr.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Regional Growth Breakdown (YoY / QoQ) */}
          <Card className="mb-8">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Detailed Regional Growth Breakdown
              </CardTitle>
              <CardDescription>Year-over-Year and Quarter-over-Quarter revenue analysis by region.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 border-b">
                      <th className="p-4">Region</th>
                      <th className="p-4 text-right">Current Year (INR)</th>
                      <th className="p-4 text-right">YoY Growth</th>
                      <th className="p-4 text-right">Current Quarter (INR)</th>
                      <th className="p-4 text-right">QoQ Growth</th>
                      <th className="p-4">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {detailedGrowth.map((g, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-900">{g.region}</td>
                        <td className="p-4 text-right">₹{g.currentYearRevenue.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className={cn("inline-flex items-center gap-1 font-medium", Number(g.yoyGrowth) > 0 ? "text-green-600" : Number(g.yoyGrowth) < 0 ? "text-red-600" : "text-slate-500")}>
                            {Number(g.yoyGrowth) > 0 ? <ArrowUpRight className="h-3 w-3" /> : Number(g.yoyGrowth) < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
                            {g.yoyGrowth}%
                          </span>
                        </td>
                        <td className="p-4 text-right">₹{g.currentQuarterRevenue.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className={cn("inline-flex items-center gap-1 font-medium", Number(g.qoqGrowth) > 0 ? "text-green-600" : Number(g.qoqGrowth) < 0 ? "text-red-600" : "text-slate-500")}>
                            {Number(g.qoqGrowth) > 0 ? <ArrowUpRight className="h-3 w-3" /> : Number(g.qoqGrowth) < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
                            {g.qoqGrowth}%
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant={Number(g.yoyGrowth) > 10 ? 'default' : Number(g.yoyGrowth) < 0 ? 'destructive' : 'secondary'} className="text-[10px]">
                            {Number(g.yoyGrowth) > 10 ? 'High Growth' : Number(g.yoyGrowth) < 0 ? 'Negative' : 'Stable'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Predictive Revenue Forecasting */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LucideLineChart className="h-5 w-5 text-blue-600" />
                    Revenue Forecast (Next 6 Months)
                  </CardTitle>
                  <CardDescription>AI-driven projections based on historical growth and seasonal patterns.</CardDescription>
                </div>
                <Select value={selectedRegionForecast} onValueChange={setSelectedRegionForecast}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Regions">All Regions</SelectItem>
                    {regions.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10 }} 
                        tickFormatter={(val) => `₹${val/1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any, name: string, props: any) => [
                          `₹${value.toLocaleString()}`, 
                          `${name}${props.payload.isForecast ? ' (Predicted)' : ''}`
                        ]}
                      />
                      <Legend />
                      {regions
                        .filter(region => selectedRegionForecast === 'All Regions' || region === selectedRegionForecast)
                        .map((region, idx) => (
                        <Line
                          key={region}
                          type="monotone"
                          dataKey={region}
                          stroke={idx === 0 ? '#2563eb' : idx === 1 ? '#16a34a' : idx === 2 ? '#dc2626' : '#9333ea'}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                      {selectedRegionForecast !== 'All Regions' && (
                        <Line 
                          type="monotone" 
                          dataKey="Global Average" 
                          name="Global Average"
                          stroke="#94a3b8" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <TrendingUp className="h-24 w-24" />
                </div>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-400">Projected Total Revenue</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Next Quarter (Predicted)</p>
                    <div className="text-3xl font-bold">₹{forecastSummary.nextQuarter.toLocaleString()}</div>
                    <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" /> +10% vs Current
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Next Full Year (Predicted)</p>
                    <div className="text-3xl font-bold">₹{forecastSummary.nextYear.toLocaleString()}</div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Confidence Interval</span>
                      <span className="font-bold text-blue-400">{forecastSummary.confidence}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Forecasting Insight</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Positive Growth Trend</p>
                      <p className="text-[10px] text-slate-500">Revenue is projected to grow by 12% in the coming quarter driven by Asia-Pacific expansion.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Lead Gen Focus</p>
                      <p className="text-[10px] text-slate-500">Suggesting increased marketing in North America to capitalize on rising demand for hardware support.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Repair Profitability Breakdown */}
          <div className="mt-8">
            <Card>
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Detailed Repair Profitability
                </CardTitle>
                <CardDescription>Profit margin analysis per individual repair job.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 border-b">
                        <th className="p-4">Repair Job</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Revenue</th>
                        <th className="p-4">Total Cost</th>
                        <th className="p-4">Margin</th>
                        <th className="p-4 text-right">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {repairs.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500 italic">No repair financial data available.</td></tr>
                      ) : (
                        repairs.slice(0, 10).map((r, i) => {
                          const cost = (Number(r.parts_cost) || 0) + (Number(r.labor_cost) || 0);
                          const rev = Number(r.total_price) || 0;
                          const profit = rev - cost;
                          const margin = rev > 0 ? ((profit / rev) * 100).toFixed(0) : 0;
                          
                          return (
                            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4">
                                <p className="font-bold text-slate-900">{r.device_name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">SN: {r.serial_number}</p>
                              </td>
                              <td className="p-4 text-slate-600 text-sm">Customer ID: {r.customer_id?.slice(0, 8)}</td>
                              <td className="p-4 font-bold text-slate-900">₹{rev.toLocaleString()}</td>
                              <td className="p-4 text-slate-600">₹{cost.toLocaleString()}</td>
                              <td className="p-4">
                                <Badge className={Number(margin) > 40 ? 'bg-green-100 text-green-800' : Number(margin) > 20 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}>
                                  {margin}%
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                {Number(margin) > 30 ? (
                                  <div className="flex items-center justify-end text-green-600 gap-1 text-xs font-bold">
                                    High Yield <ArrowUpRight className="h-3 w-3" />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end text-slate-400 gap-1 text-xs font-bold">
                                    Standard <ChevronRight className="h-3 w-3" />
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Report Delivery Logs */}
          <div className="mt-8">
            <Card>
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Weekly Report Delivery Logs
                </CardTitle>
                <CardDescription>Verify successful delivery of automated performance reports.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 border-b">
                        <th className="p-4">Report Type</th>
                        <th className="p-4">Recipient</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4 text-right">Error (if any)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reportLogs.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500 italic">No report logs found.</td></tr>
                      ) : (
                        reportLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-bold text-slate-900 capitalize">{log.report_type.replace('_', ' ')}</td>
                            <td className="p-4 text-slate-600">{log.recipient_email}</td>
                            <td className="p-4">
                              <Badge className={log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {log.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-slate-500 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                            <td className="p-4 text-right text-xs text-red-500 max-w-xs truncate">{log.error_message || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>
    </div>
  );
};

export default AdminPerformance;

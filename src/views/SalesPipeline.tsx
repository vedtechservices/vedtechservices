import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/next-router';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2,
  DollarSign,
  TrendingUp,
  Download
} from 'lucide-react';
import type { Lead } from '@/types';

const PIPELINE_STAGES = [
  { id: 'New', label: 'New', color: 'bg-blue-500' },
  { id: 'Contacted', label: 'Contacted', color: 'bg-purple-500' },
  { id: 'Qualified', label: 'Qualified', color: 'bg-yellow-500' },
  { id: 'Proposal Sent', label: 'Proposal Sent', color: 'bg-orange-500' },
  { id: 'Negotiation', label: 'Negotiation', color: 'bg-pink-500' },
  { id: 'Won', label: 'Won', color: 'bg-green-500' },
  { id: 'Lost', label: 'Lost', color: 'bg-red-500' }
];

export default function SalesPipeline() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [filterSource, setFilterSource] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeads((data || []) as Lead[]);

    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus: string) => {
    if (!draggedLead) return;

    try {
      const { error } = await (supabase.from('leads') as any).update({ lead_status: newStatus as Lead['lead_status'] }).eq('id', draggedLead.id);

      if (error) throw error;

      toast.success(`Lead moved to ${newStatus}`);
      fetchLeads();

    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
    } finally {
      setDraggedLead(null);
    }
  };

  const filteredLeads = filterSource === 'all' 
    ? leads 
    : leads.filter(l => l.lead_source === filterSource);

  const getLeadsByStage = (stage: string) => {
    return filteredLeads.filter(l => l.lead_status === stage);
  };

  const calculatePipelineValue = () => {
    return filteredLeads.reduce((sum, lead) => sum + lead.estimated_deal_value, 0);
  };

  const calculateAverageDealSize = () => {
    if (filteredLeads.length === 0) return 0;
    return calculatePipelineValue() / filteredLeads.length;
  };

  const calculateWinRate = () => {
    const total = filteredLeads.length;
    if (total === 0) return 0;
    const won = filteredLeads.filter(l => l.lead_status === 'Won').length;
    return (won / total) * 100;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Deal Value'];
    const rows = filteredLeads.map(l => [
      l.name,
      l.email || '',
      l.phone || '',
      l.company_name || '',
      l.lead_status,
      l.estimated_deal_value
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Pipeline data exported successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/admin/crm')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Sales Pipeline</h1>
              <p className="text-muted-foreground">Drag and drop leads to update their status</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Website Form">Website Form</SelectItem>
                <SelectItem value="Phone Call">Phone Call</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Pipeline Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">₹{calculatePipelineValue().toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{filteredLeads.length} leads</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Deal Size</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">₹{calculateAverageDealSize().toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Per lead</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{calculateWinRate().toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Conversion rate</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {filteredLeads.filter(l => !['Won', 'Lost'].includes(l.lead_status)).length}
                  </div>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
            {PIPELINE_STAGES.map(stage => {
              const stageLeads = getLeadsByStage(stage.id);
              const stageValue = stageLeads.reduce((sum, lead) => sum + lead.estimated_deal_value, 0);

              return (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-80"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(stage.id)}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                          <CardTitle className="text-base">{stage.label}</CardTitle>
                        </div>
                        <Badge variant="secondary">{stageLeads.length}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ₹{stageValue.toLocaleString()}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {loading ? (
                        <div className="space-y-3">
                          {[1, 2].map(i => (
                            <Skeleton key={i} className="h-32 bg-muted" />
                          ))}
                        </div>
                      ) : stageLeads.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No leads in this stage
                        </div>
                      ) : (
                        stageLeads.map(lead => (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={() => handleDragStart(lead)}
                            className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-move"
                            onClick={() => navigate(`/admin/crm/leads/${lead.id}`)}
                          >
                            <div className="space-y-2">
                              <h3 className="font-semibold text-sm">{lead.name}</h3>
                              
                              {lead.company_name && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Building2 className="h-3 w-3" />
                                  <span className="truncate">{lead.company_name}</span>
                                </div>
                              )}

                              {lead.email && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">{lead.email}</span>
                                </div>
                              )}

                              {lead.phone && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span>{lead.phone}</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="text-sm font-medium">
                                  ₹{lead.estimated_deal_value.toLocaleString()}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {lead.lead_source}
                                </Badge>
                              </div>

                              {lead.lead_score > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Score</span>
                                    <span className="font-medium">{lead.lead_score}/100</span>
                                  </div>
                                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${
                                        lead.lead_score >= 70 ? 'bg-green-500' : 
                                        lead.lead_score >= 40 ? 'bg-yellow-500' : 
                                        'bg-blue-500'
                                      }`}
                                      style={{ width: `${lead.lead_score}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

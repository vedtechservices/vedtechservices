import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/next-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/db/supabase';
import { ArrowLeft, Trophy, TrendingUp, Clock, Star, Users, Target, Award, Medal } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EmployeeMetrics {
  employee_id: string;
  employee_name: string;
  tickets_resolved: number;
  avg_resolution_time: number;
  satisfaction_score: number;
  productivity_score: number;
}

interface TeamMetrics {
  total_tickets: number;
  avg_resolution_time: number;
  avg_satisfaction: number;
  team_productivity: number;
}

export default function EmployeePerformanceDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('month');
  const [employeeMetrics, setEmployeeMetrics] = useState<EmployeeMetrics[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    fetchPerformanceData();
  }, [timePeriod]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);

      // Calculate date range based on time period
      const now = new Date();
      const startDate = new Date();

      switch (timePeriod) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch tickets data
      const { data: tickets, error: ticketsError } = await (supabase
        .from('support_tickets') as any)
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

      if (ticketsError) throw ticketsError;

      // Fetch engineers data
      const { data: engineers, error: engineersError } = await (supabase
        .from('engineers') as any)
        .select('*');

      if (engineersError) throw engineersError;

      // Fetch customer feedback data
      const { data: feedbackData, error: feedbackError } = await (supabase
        .from('customer_feedback') as any)
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

      if (feedbackError) throw feedbackError;

      // Calculate metrics for each employee
      const metricsMap = new Map<string, EmployeeMetrics>();

      engineers.forEach((engineer: any) => {
        const employeeTickets = tickets?.filter((t: any) => t.assigned_engineer === engineer.employee_id) || [];
        const resolvedTickets = employeeTickets.filter((t: any) => t.status === 'Resolved' || t.status === 'Closed');

        // Calculate average resolution time (in hours)
        let totalResolutionTime = 0;
        resolvedTickets.forEach((ticket: any) => {
          if (ticket.created_at && ticket.updated_at) {
            const created = new Date(ticket.created_at).getTime();
            const resolved = new Date(ticket.updated_at).getTime();
            totalResolutionTime += (resolved - created) / (1000 * 60 * 60); // Convert to hours
          }
        });

        const avgResolutionTime = resolvedTickets.length > 0
          ? totalResolutionTime / resolvedTickets.length
          : 0;

        // Calculate satisfaction score from real feedback data
        const employeeFeedback = feedbackData?.filter((f: any) => f.employee_id === engineer.employee_id) || [];
        const satisfactionScore = employeeFeedback.length > 0
          ? employeeFeedback.reduce((sum: number, f: any) => sum + f.rating, 0) / employeeFeedback.length
          : 0;

        // Calculate productivity score (tickets resolved per day)
        const daysSinceStart = Math.max(1, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const productivityScore = resolvedTickets.length / daysSinceStart;

        metricsMap.set(engineer.employee_id, {
          employee_id: engineer.employee_id,
          employee_name: engineer.name,
          tickets_resolved: resolvedTickets.length,
          avg_resolution_time: avgResolutionTime,
          satisfaction_score: satisfactionScore,
          productivity_score: productivityScore,
        });
      });

      const metrics = Array.from(metricsMap.values());
      setEmployeeMetrics(metrics);

      // Calculate team metrics
      const totalTickets = tickets?.length || 0;
      const totalResolved = tickets?.filter((t: any) => t.status === 'Resolved' || t.status === 'Closed').length || 0;
      const avgResTime = metrics.reduce((sum, m) => sum + m.avg_resolution_time, 0) / Math.max(1, metrics.length);
      const avgSat = metrics.reduce((sum, m) => sum + m.satisfaction_score, 0) / Math.max(1, metrics.length);
      const teamProd = metrics.reduce((sum, m) => sum + m.productivity_score, 0);

      setTeamMetrics({
        total_tickets: totalTickets,
        avg_resolution_time: avgResTime,
        avg_satisfaction: avgSat,
        team_productivity: teamProd,
      });

      // Generate trend data (mock - would be calculated from historical data)
      const trendDays = timePeriod === 'today' ? 24 : timePeriod === 'week' ? 7 : 30;
      const trends: any[] = [];
      for (let i = 0; i < Math.min(trendDays, 30); i++) {
        trends.push({
          date: new Date(now.getTime() - (trendDays - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          tickets: Math.floor(Math.random() * 20) + 10,
          satisfaction: 4.0 + Math.random() * 1.0,
        });
      }
      setTrendData(trends);

    } catch (error: any) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  const getLeaderboard = () => {
    return [...employeeMetrics]
      .sort((a, b) => b.tickets_resolved - a.tickets_resolved)
      .slice(0, 10);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white border border-white/20 hover:bg-white/10"
                onClick={() => navigate('/admin/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Employee Performance Dashboard</h1>
                <p className="text-sm text-blue-200">Track individual and team performance metrics</p>
              </div>
            </div>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-white/10" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Team Overview Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Tickets</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    {teamMetrics?.total_tickets || 0}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Avg Resolution Time</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Clock className="h-6 w-6 text-orange-600" />
                    {teamMetrics?.avg_resolution_time.toFixed(1) || 0}h
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Avg Satisfaction</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                    {teamMetrics?.avg_satisfaction.toFixed(1) || 0}/5
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Team Productivity</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    {teamMetrics?.team_productivity.toFixed(1) || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Tabs for Different Views */}
            <Tabs defaultValue="trends" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                <TabsTrigger value="individual">Individual</TabsTrigger>
              </TabsList>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Track team performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="tickets" stroke="#3b82f6" name="Tickets Resolved" />
                        <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#eab308" name="Satisfaction Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Employee Comparison</CardTitle>
                    <CardDescription>Compare tickets resolved by employee</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={employeeMetrics.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="employee_name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="tickets_resolved" fill="#3b82f6" name="Tickets Resolved" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Top Performers
                    </CardTitle>
                    <CardDescription>Ranked by tickets resolved</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getLeaderboard().map((employee, index) => (
                        <div
                          key={employee.employee_id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${index === 0 ? 'bg-yellow-50 border-yellow-200' :
                              index === 1 ? 'bg-gray-50 border-gray-200' :
                                index === 2 ? 'bg-amber-50 border-amber-200' :
                                  'bg-white border-gray-200'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 flex items-center justify-center">
                              {getRankIcon(index + 1)}
                            </div>
                            <div>
                              <p className="font-semibold">{employee.employee_name}</p>
                              <p className="text-sm text-muted-foreground">{employee.employee_id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{employee.tickets_resolved}</p>
                            <p className="text-xs text-muted-foreground">tickets resolved</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Individual Tab */}
              <TabsContent value="individual">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {employeeMetrics.map((employee) => (
                    <Card key={employee.employee_id}>
                      <CardHeader>
                        <CardTitle className="text-lg text-balance">{employee.employee_name}</CardTitle>
                        <CardDescription>{employee.employee_id}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tickets Resolved</span>
                            <span className="font-bold text-blue-600">{employee.tickets_resolved}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Avg Resolution Time</span>
                            <span className="font-bold">{employee.avg_resolution_time.toFixed(1)}h</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Satisfaction Score</span>
                            <span className="font-bold text-yellow-600 flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              {employee.satisfaction_score.toFixed(1)}/5
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Productivity</span>
                            <span className="font-bold text-green-600">{employee.productivity_score.toFixed(2)}/day</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

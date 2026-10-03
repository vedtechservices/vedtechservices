import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/next-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/db/supabase';
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, Minus, TrendingUp, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Feedback {
  id: string;
  ticket_id: string;
  customer_id: string;
  employee_id: string;
  rating: number;
  review_text: string;
  sentiment_score: number;
  sentiment_label: string;
  created_at: string;
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#ef4444',
};

export default function CustomerFeedbackDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('month');
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [sentimentDistribution, setSentimentDistribution] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    fetchFeedbackData();
  }, [timePeriod]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      const startDate = new Date();

      switch (timePeriod) {
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

      const { data, error } = await (supabase
        .from('customer_feedback') as any)
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFeedbackList(data || []);

      // Calculate average rating
      if (data && data.length > 0) {
        const avg = data.reduce((sum: number, f: Feedback) => sum + f.rating, 0) / data.length;
        setAvgRating(avg);
      } else {
        setAvgRating(0);
      }

      // Calculate sentiment distribution
      const sentimentCounts = {
        positive: data?.filter((f: Feedback) => f.sentiment_label === 'positive').length || 0,
        neutral: data?.filter((f: Feedback) => f.sentiment_label === 'neutral').length || 0,
        negative: data?.filter((f: Feedback) => f.sentiment_label === 'negative').length || 0,
      };

      setSentimentDistribution([
        { name: 'Positive', value: sentimentCounts.positive, color: SENTIMENT_COLORS.positive },
        { name: 'Neutral', value: sentimentCounts.neutral, color: SENTIMENT_COLORS.neutral },
        { name: 'Negative', value: sentimentCounts.negative, color: SENTIMENT_COLORS.negative },
      ].filter(item => item.value > 0));

      // Generate trend data (group by day/week)
      const trendMap = new Map<string, any>();
      data?.forEach((feedback: Feedback) => {
        const date = new Date(feedback.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!trendMap.has(date)) {
          trendMap.set(date, { date, avgRating: 0, count: 0, totalRating: 0 });
        }
        const trend = trendMap.get(date);
        trend.count++;
        trend.totalRating += feedback.rating;
        trend.avgRating = trend.totalRating / trend.count;
      });

      const trends = Array.from(trendMap.values()).slice(-30);
      setTrendData(trends);

    } catch (error: any) {
      console.error('Error fetching feedback data:', error);
      toast.error('Failed to fetch feedback data');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-orange-600" />;
    }
  };

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'default';
      case 'negative':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-900 via-green-800 to-green-900">
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
                <h1 className="text-2xl font-bold text-white">Customer Feedback Dashboard</h1>
                <p className="text-sm text-green-200">Track customer satisfaction and sentiment</p>
              </div>
            </div>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
            {/* Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Average Rating</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500 fill-current" />
                    {avgRating.toFixed(1)}/5
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Based on {feedbackList.length} reviews
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Feedback</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                    {feedbackList.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Customer responses
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Positive Sentiment</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <ThumbsUp className="h-6 w-6 text-green-600" />
                    {feedbackList.filter(f => f.sentiment_label === 'positive').length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {feedbackList.length > 0
                      ? ((feedbackList.filter(f => f.sentiment_label === 'positive').length / feedbackList.length) * 100).toFixed(1)
                      : 0}% of total
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Satisfaction Trend</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    {avgRating >= 4 ? 'High' : avgRating >= 3 ? 'Good' : 'Low'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Overall satisfaction level
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Rating Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Trends</CardTitle>
                  <CardDescription>Average rating over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="avgRating" stroke="#10b981" name="Avg Rating" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sentiment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Distribution</CardTitle>
                  <CardDescription>Breakdown of customer sentiment</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sentimentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sentimentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
                <CardDescription>Latest customer reviews and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbackList.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No feedback received yet
                    </div>
                  ) : (
                    feedbackList.slice(0, 10).map((feedback) => (
                      <div
                        key={feedback.id}
                        className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                      >
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < feedback.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                          <Badge variant={getSentimentBadgeVariant(feedback.sentiment_label)} className="flex items-center gap-1">
                            {getSentimentIcon(feedback.sentiment_label)}
                            {feedback.sentiment_label}
                          </Badge>
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          {feedback.review_text && (
                            <p className="text-sm text-pretty">{feedback.review_text}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(feedback.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

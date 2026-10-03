import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  MessageSquare,
  Plus,
  Download,
  Star,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  FileText,
  BarChart3,
  Mail,
  Edit,
  Trash2,
  Copy,
} from 'lucide-react';
import type { CustomerFeedback, Survey, SurveyEmailTemplate } from '@/types';

export default function CustomerFeedbackSurveys() {
  const [feedback, setFeedback] = useState<CustomerFeedback[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [templates, setTemplates] = useState<SurveyEmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSurveyDialog, setShowCreateSurveyDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const [newSurvey, setNewSurvey] = useState({
    survey_name: '',
    survey_description: '',
    survey_status: 'Draft' as 'Draft' | 'Active' | 'Closed',
    email_template_id: ''
  });

  const [newTemplate, setNewTemplate] = useState({
    template_name: '',
    template_type: 'Survey Invitation' as 'Survey Invitation' | 'Follow-Up' | 'Thank You',
    subject_line: '',
    message_body: ''
  });

  const [analytics, setAnalytics] = useState({
    avgRating: 0,
    nps: 0,
    totalFeedback: 0,
    positiveSentiment: 0,
    neutralSentiment: 0,
    negativeSentiment: 0
  });

  useEffect(() => {
    fetchData();
    fetchTemplates();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: feedbackData, error: feedbackError } = await (supabase
        .from('customer_feedback') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      const { data: surveysData, error: surveysError } = await (supabase
        .from('surveys') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (surveysError) throw surveysError;

      const feedbackList = Array.isArray(feedbackData) ? feedbackData : [];
      const surveysList = Array.isArray(surveysData) ? surveysData : [];

      setFeedback(feedbackList);
      setSurveys(surveysList);

      // Calculate analytics
      const totalFeedback = feedbackList.length;
      const avgRating = totalFeedback > 0
        ? feedbackList.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedback
        : 0;

      const positiveSentiment = feedbackList.filter(f => f.sentiment === 'Positive').length;
      const neutralSentiment = feedbackList.filter(f => f.sentiment === 'Neutral').length;
      const negativeSentiment = feedbackList.filter(f => f.sentiment === 'Negative').length;

      // Calculate NPS (simplified: % positive - % negative)
      const nps = totalFeedback > 0
        ? ((positiveSentiment - negativeSentiment) / totalFeedback) * 100
        : 0;

      setAnalytics({
        avgRating,
        nps,
        totalFeedback,
        positiveSentiment,
        neutralSentiment,
        negativeSentiment
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load feedback and surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async () => {
    try {
      if (!newSurvey.survey_name) {
        toast.error('Please enter a survey name');
        return;
      }

      const { error } = await (supabase.from('surveys') as any).insert([{
        survey_name: newSurvey.survey_name,
        survey_description: newSurvey.survey_description || null,
        survey_status: newSurvey.survey_status
      }]);

      if (error) throw error;

      toast.success('Survey created successfully');
      setShowCreateSurveyDialog(false);
      setNewSurvey({
        survey_name: '',
        survey_description: '',
        survey_status: 'Draft',
        email_template_id: ''
      });
      fetchData();

    } catch (error) {
      console.error('Error creating survey:', error);
      toast.error('Failed to create survey');
    }
  };

  const handleUpdateSurveyStatus = async (surveyId: string, newStatus: 'Draft' | 'Active' | 'Closed') => {
    try {
      const { error } = await (supabase.from('surveys') as any)
        .update({ survey_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', surveyId);

      if (error) throw error;

      toast.success('Survey status updated');
      fetchData();

    } catch (error) {
      console.error('Error updating survey status:', error);
      toast.error('Failed to update survey status');
    }
  };

  const exportFeedbackToCSV = () => {
    const filteredFeedback = filterType === 'all'
      ? feedback
      : feedback.filter(f => f.feedback_type === filterType);

    const headers = ['Customer ID', 'Feedback Type', 'Rating', 'Feedback Text', 'Sentiment', 'Date'];
    const rows = filteredFeedback.map(f => [
      f.customer_id || 'N/A',
      f.feedback_type,
      f.rating?.toString() || 'N/A',
      f.feedback_text || '',
      f.sentiment || 'N/A',
      new Date(f.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await (supabase
        .from('survey_email_templates') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      if (!newTemplate.template_name || !newTemplate.subject_line || !newTemplate.message_body) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { error } = await (supabase
        .from('survey_email_templates') as any)
        .insert({
          template_name: newTemplate.template_name,
          template_type: newTemplate.template_type,
          subject_line: newTemplate.subject_line,
          message_body: newTemplate.message_body
        });

      if (error) throw error;

      toast.success('Email template created successfully');
      setShowTemplateDialog(false);
      setNewTemplate({
        template_name: '',
        template_type: 'Survey Invitation',
        subject_line: '',
        message_body: ''
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('survey_email_templates') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const insertMergeTag = (tag: string) => {
    setNewTemplate({
      ...newTemplate,
      message_body: newTemplate.message_body + ` {{${tag}}}`
    });
  };

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case 'Positive':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'Neutral':
        return <Meh className="h-5 w-5 text-yellow-500" />;
      case 'Negative':
        return <Frown className="h-5 w-5 text-red-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSurveyStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Closed':
        return 'secondary';
      case 'Draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filteredFeedback = filterType === 'all'
    ? feedback
    : feedback.filter(f => f.feedback_type === filterType);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64 bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-muted" />
          ))}
        </div>
        <Skeleton className="h-96 bg-muted" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Feedback & Surveys</h1>
          <p className="text-muted-foreground">Collect and analyze customer feedback</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportFeedbackToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export Feedback
          </Button>
          <Dialog open={showCreateSurveyDialog} onOpenChange={setShowCreateSurveyDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Survey
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Survey</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="surveyName">Survey Name *</Label>
                  <Input
                    id="surveyName"
                    value={newSurvey.survey_name}
                    onChange={(e) => setNewSurvey({ ...newSurvey, survey_name: e.target.value })}
                    placeholder="Enter survey name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surveyDescription">Description</Label>
                  <Textarea
                    id="surveyDescription"
                    value={newSurvey.survey_description}
                    onChange={(e) => setNewSurvey({ ...newSurvey, survey_description: e.target.value })}
                    placeholder="Enter survey description"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surveyStatus">Status</Label>
                  <Select
                    value={newSurvey.survey_status}
                    onValueChange={(value) => setNewSurvey({ ...newSurvey, survey_status: value as 'Draft' | 'Active' | 'Closed' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailTemplate">Email Template (Optional)</Label>
                  <Select
                    value={newSurvey.email_template_id}
                    onValueChange={(value) => setNewSurvey({ ...newSurvey, email_template_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.template_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateSurveyDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSurvey}>
                    Create Survey
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Avg Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgRating.toFixed(1)} / 5.0</div>
            <p className="text-xs text-muted-foreground mt-1">Based on {analytics.totalFeedback} responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Net Promoter Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.nps.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.nps > 50 ? 'Excellent' : analytics.nps > 0 ? 'Good' : 'Needs Improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Smile className="h-4 w-4" />
              Positive Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{analytics.positiveSentiment}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.totalFeedback > 0 ? ((analytics.positiveSentiment / analytics.totalFeedback) * 100).toFixed(0) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Frown className="h-4 w-4" />
              Negative Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{analytics.negativeSentiment}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.totalFeedback > 0 ? ((analytics.negativeSentiment / analytics.totalFeedback) * 100).toFixed(0) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Template Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Survey Email Templates
            </CardTitle>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Template Name *</Label>
                    <Input
                      id="templateName"
                      placeholder="Welcome Survey Email"
                      value={newTemplate.template_name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, template_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateType">Template Type *</Label>
                    <Select
                      value={newTemplate.template_type}
                      onValueChange={(value: 'Survey Invitation' | 'Follow-Up' | 'Thank You') => setNewTemplate({ ...newTemplate, template_type: value })}
                    >
                      <SelectTrigger id="templateType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Survey Invitation">Survey Invitation</SelectItem>
                        <SelectItem value="Follow-Up">Follow-Up</SelectItem>
                        <SelectItem value="Thank You">Thank You</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subjectLine">Subject Line *</Label>
                    <Input
                      id="subjectLine"
                      placeholder="We'd love your feedback!"
                      value={newTemplate.subject_line}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject_line: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="messageBody">Message Body *</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertMergeTag('customer_name')}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Customer Name
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertMergeTag('survey_link')}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Survey Link
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertMergeTag('company_name')}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Company Name
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertMergeTag('survey_name')}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Survey Name
                      </Button>
                    </div>
                    <Textarea
                      id="messageBody"
                      placeholder="Dear {{customer_name}}, we would appreciate your feedback on our services. Please click here to complete our survey: {{survey_link}}"
                      value={newTemplate.message_body}
                      onChange={(e) => setNewTemplate({ ...newTemplate, message_body: e.target.value })}
                      rows={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use merge tags like {`{{customer_name}}`} and {`{{survey_link}}`} to personalize emails
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTemplate}>
                      Create Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No email templates yet. Create your first template to streamline survey communications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{template.template_name}</h3>
                      <Badge variant="outline">{template.template_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Subject:</strong> {template.subject_line}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.message_body}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Feedback</CardTitle>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Ticket Feedback">Ticket Feedback</SelectItem>
                    <SelectItem value="Service Feedback">Service Feedback</SelectItem>
                    <SelectItem value="General Feedback">General Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredFeedback.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No feedback submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFeedback.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.feedback_type}</Badge>
                          {item.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < item.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(item.sentiment)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {item.feedback_text && (
                        <p className="text-sm">{item.feedback_text}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Surveys Tab */}
        <TabsContent value="surveys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              {surveys.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No surveys created yet</p>
                  <Button onClick={() => setShowCreateSurveyDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Survey
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {surveys.map((survey) => (
                    <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{survey.survey_name}</h3>
                        {survey.survey_description && (
                          <p className="text-sm text-muted-foreground mt-1">{survey.survey_description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getSurveyStatusColor(survey.survey_status)}>
                            {survey.survey_status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(survey.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {survey.survey_status === 'Draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateSurveyStatus(survey.id, 'Active')}
                          >
                            Activate
                          </Button>
                        )}
                        {survey.survey_status === 'Active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateSurveyStatus(survey.id, 'Closed')}
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Smile className="h-4 w-4 text-green-500" />
                      Positive
                    </span>
                    <span className="font-medium">{analytics.positiveSentiment}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: analytics.totalFeedback > 0
                          ? `${(analytics.positiveSentiment / analytics.totalFeedback) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Meh className="h-4 w-4 text-yellow-500" />
                      Neutral
                    </span>
                    <span className="font-medium">{analytics.neutralSentiment}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{
                        width: analytics.totalFeedback > 0
                          ? `${(analytics.neutralSentiment / analytics.totalFeedback) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Frown className="h-4 w-4 text-red-500" />
                      Negative
                    </span>
                    <span className="font-medium">{analytics.negativeSentiment}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{
                        width: analytics.totalFeedback > 0
                          ? `${(analytics.negativeSentiment / analytics.totalFeedback) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Overall Satisfaction</p>
                    <p className="text-sm text-muted-foreground">
                      Average rating of {analytics.avgRating.toFixed(1)} out of 5.0 based on {analytics.totalFeedback} responses
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Net Promoter Score</p>
                    <p className="text-sm text-muted-foreground">
                      NPS of {analytics.nps.toFixed(0)} indicates {analytics.nps > 50 ? 'excellent' : analytics.nps > 0 ? 'good' : 'room for improvement'} customer loyalty
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Smile className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Sentiment Distribution</p>
                    <p className="text-sm text-muted-foreground">
                      {analytics.totalFeedback > 0 ? ((analytics.positiveSentiment / analytics.totalFeedback) * 100).toFixed(0) : 0}% positive,{' '}
                      {analytics.totalFeedback > 0 ? ((analytics.neutralSentiment / analytics.totalFeedback) * 100).toFixed(0) : 0}% neutral,{' '}
                      {analytics.totalFeedback > 0 ? ((analytics.negativeSentiment / analytics.totalFeedback) * 100).toFixed(0) : 0}% negative
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, Plus, Search, Filter, 
  MoreVertical, Edit, Trash2, Globe, 
  Lock, Eye, ArrowLeft, BarChart3,
  CheckCircle2, AlertCircle, X, Save
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useNavigate } from '@/lib/next-router';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/Loader';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import AdminRoleWarning from '@/components/admin/AdminRoleWarning';

const AdminKnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Article Dialog State
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any>({ 
    title: '', 
    content: '', 
    excerpt: '', 
    category: 'General', 
    is_published: true,
    tags: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isAITopicModalOpen, setIsAITopicModalOpen] = useState(false);
  const [aiTopics, setAiTopics] = useState<any[]>([]);

  const handleAISuggestTopics = async () => {
    setIsAIGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-kb-assistant', {
        body: { action: 'suggest-topics' }
      });
      if (error) throw error;
      setAiTopics(data);
      setIsAITopicModalOpen(true);
    } catch (err: any) {
      toast({ title: "AI Generation Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleAIGenerateArticle = async (topic: any) => {
    setIsAIGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-kb-assistant', {
        body: { action: 'generate-article', payload: topic }
      });
      if (error) throw error;
      
      setCurrentArticle({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        is_published: false,
        tags: typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) : []
      });
      setIsEditing(false);
      setIsArticleDialogOpen(true);
      setIsAITopicModalOpen(false);
    } catch (err: any) {
      toast({ title: "AI Generation Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleAISuggestCategory = async () => {
    if (!currentArticle.content) {
      toast({ title: "Missing Content", description: "Write some content first so AI can categorize it.", variant: "destructive" });
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('ai-kb-assistant', {
        body: { action: 'categorize', payload: { text: currentArticle.content } }
      });
      if (error) throw error;
      setCurrentArticle({ ...currentArticle, category: data.category });
      toast({ title: "Category Suggested", description: `Suggested category: ${data.category}` });
    } catch (err) {
      console.error(err);
    }
  };

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [articlesRes, metricsRes] = await Promise.all([
        supabase.from('knowledge_base_articles').select('*').order('updated_at', { ascending: false }),
        supabase.from('article_suggestion_metrics').select('*, knowledge_base_articles(title)')
      ]);

      if (articlesRes.error) throw articlesRes.error;
      setArticles(articlesRes.data || []);
      setMetrics(metricsRes.data || []);
    } catch (err: any) {
      toast({ title: "Fetch Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveArticle = async () => {
    if (!currentArticle.title || !currentArticle.content || !currentArticle.category) {
      toast({ title: "Validation Error", description: "Title, content, and category are required.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        const { error } = await (supabase
          .from('knowledge_base_articles') as any)
          .update({
            title: currentArticle.title,
            content: currentArticle.content,
            excerpt: currentArticle.excerpt || currentArticle.content.slice(0, 150) + '...',
            category: currentArticle.category,
            is_published: currentArticle.is_published,
            updated_at: new Date()
          })
          .eq('id', currentArticle.id);
        if (error) throw error;
        toast({ title: "Article Updated" });
      } else {
        const { error } = await (supabase
          .from('knowledge_base_articles') as any)
          .insert({
            title: currentArticle.title,
            content: currentArticle.content,
            excerpt: currentArticle.excerpt || currentArticle.content.slice(0, 150) + '...',
            category: currentArticle.category,
            is_published: currentArticle.is_published
          });
        if (error) throw error;
        toast({ title: "Article Created" });
      }
      setIsArticleDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Save Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const { error } = await supabase.from('knowledge_base_articles').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Article Deleted" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Delete Failed", variant: "destructive" });
    }
  };

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         art.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || art.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(articles.map(a => a.category)));

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size={48} /></div>;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      <div className="container pt-4"><AdminRoleWarning /></div>
      <section className="bg-slate-900 text-white py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="border-white/20 hover:bg-white/10" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <BookOpen className="h-8 w-8 text-blue-400" />
                  Knowledge Base Management
                </h1>
                <p className="text-slate-400">Manage support articles and analyze chatbot suggestion performance.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="bg-blue-900/50 hover:bg-blue-800 text-blue-100 gap-2 border-blue-700" 
                onClick={handleAISuggestTopics}
                disabled={isAIGenerating}
              >
                {isAIGenerating ? <LoadingSpinner size={16} /> : <BarChart3 className="h-4 w-4" />}
                AI Generate from Queries
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={() => {
                setCurrentArticle({ title: '', content: '', excerpt: '', category: 'General', is_published: true, tags: [] });
                setIsEditing(false);
                setIsArticleDialogOpen(true);
              }}>
                <Plus className="h-4 w-4" /> Add New Article
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Article List */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <CardTitle>Published Articles ({filteredArticles.length})</CardTitle>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Search articles..." 
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No articles found matching your criteria.</p>
                    </div>
                  ) : (
                    filteredArticles.map(art => (
                      <div key={art.id} className="flex items-start justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-all group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50">{art.category}</Badge>
                            {!art.is_published && <Badge variant="secondary" className="text-[10px] uppercase">Draft</Badge>}
                            <span className="text-[10px] text-slate-400">• Updated {new Date(art.updated_at).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-bold text-slate-900 truncate">{art.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-1">{art.excerpt}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => {
                            setCurrentArticle(art);
                            setIsEditing(true);
                            setIsArticleDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDeleteArticle(art.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Analytics */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5" />
                  Overall Performance
                </CardTitle>
                <CardDescription className="text-blue-100">Bot vs Human resolution efficiency.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-blue-100 mb-1">Overall Resolution Rate</p>
                  <div className="text-4xl font-bold">
                    {metrics.length > 0 
                      ? Math.round((metrics.reduce((acc, m) => acc + m.resolved_queries, 0) / 
                         metrics.reduce((acc, m) => acc + Math.max(1, m.times_suggested), 0)) * 100)
                      : 0}%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <p className="text-[10px] text-blue-100 uppercase tracking-wider mb-1">Total Suggestions</p>
                    <div className="text-xl font-bold">{metrics.reduce((acc, m) => acc + m.times_suggested, 0)}</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <p className="text-[10px] text-blue-100 uppercase tracking-wider mb-1">Total Resolved</p>
                    <div className="text-xl font-bold">{metrics.reduce((acc, m) => acc + m.resolved_queries, 0)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Performing Articles</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="divide-y">
                    {metrics.sort((a, b) => b.resolved_queries - a.resolved_queries).map((m, i) => (
                      <div key={i} className="p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-900 line-clamp-1">{m.knowledge_base_articles?.title}</span>
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                            {Math.round((m.resolved_queries / Math.max(1, m.times_suggested)) * 100)}% Res.
                          </span>
                        </div>
                        <div className="flex gap-4 text-[10px] text-slate-500">
                          <span>Suggestions: <strong>{m.times_suggested}</strong></span>
                          <span>Read: <strong>{m.times_read}</strong></span>
                        </div>
                        {m.escalations_after_suggestion > 0 && (
                          <div className="text-[10px] text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {m.escalations_after_suggestion} escalations after suggestion
                          </div>
                        )}
                      </div>
                    ))}
                    {metrics.length === 0 && (
                      <div className="p-8 text-center text-slate-400 italic text-sm">No analytics data yet.</div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Article Editor Dialog */}
      <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>{isEditing ? 'Edit Article' : 'Create New Article'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Article Title</Label>
                  <Input 
                    placeholder="How to..." 
                    value={currentArticle.title}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Category</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-600 gap-1 px-1" onClick={handleAISuggestCategory}>
                      <BarChart3 className="h-3 w-3" /> AI Suggest
                    </Button>
                  </div>
                  <Select 
                    value={currentArticle.category} 
                    onValueChange={(val) => setCurrentArticle({ ...currentArticle, category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Billing">Billing</SelectItem>
                      <SelectItem value="Account">Account</SelectItem>
                      <SelectItem value="Troubleshooting">Troubleshooting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Article Excerpt (Brief Summary)</Label>
                <Textarea 
                  placeholder="Summarize the article in 1-2 sentences..." 
                  className="h-20"
                  value={currentArticle.excerpt}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, excerpt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Full Content</Label>
                <Textarea 
                  placeholder="Write the full article content here..." 
                  className="min-h-[300px]"
                  value={currentArticle.content}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, content: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Status:</Label>
                  <Badge variant={currentArticle.is_published ? 'default' : 'secondary'}>
                    {currentArticle.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[10px]"
                    onClick={() => setCurrentArticle({ ...currentArticle, is_published: !currentArticle.is_published })}
                  >
                    Change to {currentArticle.is_published ? 'Draft' : 'Publish'}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 border-t bg-slate-50">
            <Button variant="outline" onClick={() => setIsArticleDialogOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={handleSaveArticle} disabled={isSaving}>
              {isSaving ? <LoadingSpinner size={16} /> : <Save className="h-4 w-4" />}
              {isEditing ? 'Update Article' : 'Create Article'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Topics Modal */}
      <Dialog open={isAITopicModalOpen} onOpenChange={setIsAITopicModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              AI-Identified Common Support Topics
            </DialogTitle>
            <DialogDescription>
              We analyzed recent customer queries and identified these recurring themes. Select a topic to generate a full Knowledge Base article.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {aiTopics.map((topic, idx) => (
              <Card key={idx} className="hover:bg-slate-50 transition-colors cursor-pointer border-slate-200" onClick={() => handleAIGenerateArticle(topic)}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <CardDescription className="mt-1">{topic.summary}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 shrink-0">Generate <Plus className="ml-2 h-4 w-4" /></Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
            {aiTopics.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                No new topics identified at this time.
              </div>
            )}
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsAITopicModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKnowledgeBase;


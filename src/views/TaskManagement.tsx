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
import { toast } from 'sonner';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Download,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { Task } from '@/types/index';
import { crmOperation } from '@/lib/crmOperations';

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  const [newTask, setNewTask] = useState({
    task_title: '',
    task_description: '',
    assigned_to: '',
    due_date: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    task_status: 'To Do' as 'To Do' | 'In Progress' | 'Completed',
    related_customer_id: '',
    related_lead_id: ''
  });

  const [metrics, setMetrics] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: tasksData, error: tasksError } = await (supabase
        .from('tasks') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      const tasksList = Array.isArray(tasksData) ? tasksData : [];
      setTasks(tasksList);

      // Calculate metrics
      const now = new Date();
      const total = tasksList.length;
      const todo = tasksList.filter(t => t.task_status === 'To Do').length;
      const inProgress = tasksList.filter(t => t.task_status === 'In Progress').length;
      const completed = tasksList.filter(t => t.task_status === 'Completed').length;
      const overdue = tasksList.filter(t => 
        t.task_status !== 'Completed' && 
        t.due_date && 
        new Date(t.due_date) < now
      ).length;

      setMetrics({ total, todo, inProgress, completed, overdue });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.task_title.trim()) {
      toast.error('Task title is required.');
      return;
    }
    if (newTask.task_title.trim().length < 3) {
      toast.error('Task title must be at least 3 characters.');
      return;
    }

    try {
      const result = await crmOperation({
        table: 'tasks',
        action: 'CREATE',
        data: {
          task_title: newTask.task_title,
          task_description: newTask.task_description || null,
          assigned_to: newTask.assigned_to || null,
          due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
          priority: newTask.priority,
          task_status: newTask.task_status,
          related_customer_id: newTask.related_customer_id || null,
          related_lead_id: newTask.related_lead_id || null
        }
      });

      if (!result.success) {
        (result.errors ?? [result.error ?? 'Failed to create task.']).forEach(e => toast.error(e));
        return;
      }

      toast.success('Task created and audited successfully');
      setShowCreateDialog(false);
      setNewTask({
        task_title: '',
        task_description: '',
        assigned_to: '',
        due_date: '',
        priority: 'Medium',
        task_status: 'To Do',
        related_customer_id: '',
        related_lead_id: ''
      });
      fetchData();

    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['task_status']) => {
    try {
      const result = await crmOperation({
        table: 'tasks',
        action: 'UPDATE',
        record_id: taskId,
        data: { task_status: newStatus, updated_at: new Date().toISOString() }
      });

      if (!result.success) {
        toast.error(result.errors?.[0] ?? 'Failed to update task status');
        return;
      }

      toast.success('Task status updated');
      fetchData();

    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await crmOperation({
        table: 'tasks',
        action: 'DELETE',
        record_id: taskId
      });

      if (!result.success) {
        toast.error(result.errors?.[0] ?? 'Failed to delete task');
        return;
      }

      toast.success('Task deleted successfully');
      fetchData();

    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'In Progress': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'To Do': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  const isOverdue = (task: Task) => {
    if (task.task_status === 'Completed' || !task.due_date) return false;
    return new Date(task.due_date) < new Date();
  };

  const filteredTasks = tasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && task.task_status !== filterStatus) return false;
    if (filterAssignee !== 'all' && task.assigned_to !== filterAssignee) return false;
    return true;
  });

  const exportToCSV = () => {
    const headers = ['Task Title', 'Description', 'Priority', 'Status', 'Due Date', 'Assigned To'];
    const rows = filteredTasks.map(t => [
      t.task_title,
      t.task_description || '',
      t.priority,
      t.task_status,
      t.due_date ? new Date(t.due_date).toLocaleDateString() : '',
      t.assigned_to || 'Unassigned'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64 bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">Manage and track team tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={newTask.task_title}
                    onChange={(e) => setNewTask({ ...newTask, task_title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.task_description}
                    onChange={(e) => setNewTask({ ...newTask, task_description: e.target.value })}
                    placeholder="Enter task description"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value as 'High' | 'Medium' | 'Low' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newTask.task_status}
                      onValueChange={(value) => setNewTask({ ...newTask, task_status: value as 'To Do' | 'In Progress' | 'Completed' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask}>
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{metrics.todo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{metrics.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{metrics.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{metrics.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks found</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(task.task_status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{task.task_title}</h3>
                          {task.task_description && (
                            <p className="text-sm text-muted-foreground mb-2">{task.task_description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Badge variant={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            {task.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span className={isOverdue(task) ? 'text-red-500 font-medium' : ''}>
                                  {new Date(task.due_date).toLocaleDateString()}
                                  {isOverdue(task) && ' (Overdue)'}
                                </span>
                              </div>
                            )}
                            {task.assigned_to && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>Assigned</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {task.task_status !== 'Completed' && (
                            <Select
                              value={task.task_status}
                              onValueChange={(value) => handleUpdateStatus(task.id, value as Task['task_status'])}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="To Do">To Do</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['To Do', 'In Progress', 'Completed'].map((status) => (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="text-lg">{status}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTasks
                    .filter(task => task.task_status === status)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3 border rounded-lg bg-card hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-semibold mb-2">{task.task_title}</h4>
                        {task.task_description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {task.task_description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          {task.due_date && (
                            <span className={`text-xs ${isOverdue(task) ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  {filteredTasks.filter(task => task.task_status === status).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No tasks
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

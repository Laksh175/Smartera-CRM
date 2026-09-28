import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckSquare,
  Plus,
  Clock,
  MessageSquare,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Send
} from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import type { Task } from '../types';

export const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [commentText, setCommentText] = useState('');

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    client_id: '',
    assigned_to: '66666666-6666-6666-6666-666666666666',
    priority: 'Medium' as const,
    due_date: new Date().toISOString().split('T')[0],
    status: 'To Do' as const,
    category: 'General',
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: () => api.getTasks({ status: statusFilter === 'All' ? undefined : statusFilter }),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.getClients(),
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.getStaff(),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => api.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setAddTaskOpen(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (params: { id: string; data: any }) => api.updateTask(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (params: { taskId: string; comment: string }) =>
      api.addTaskComment(params.taskId, params.comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setCommentText('');
      if (selectedTask) {
        api.getTaskById(selectedTask.id).then(setSelectedTask);
      }
    },
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.task_id.toLowerCase().includes(q) ||
      t.client_name?.toLowerCase().includes(q) ||
      t.assigned_to_name?.toLowerCase().includes(q)
    );
  });

  const tabs = ['All', 'To Do', 'In Progress', 'Waiting', 'Completed'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-600" />
            General Agency Task Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign, track, and collaborate on strategy, design, script reviews, shoot preparation, and deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddTaskOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-base p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search tasks, staff, client..."
          className="w-full md:w-72"
        />
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="card-base p-16 text-center text-slate-400 text-xs">No tasks found.</div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = task.due_date < todayStr && task.status !== 'Completed';
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="card-base p-5 card-hover cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400">{task.task_id}</span>
                    <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                    <StatusBadge status={task.status} size="sm" />
                    {isOverdue && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-600 line-clamp-1">{task.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                    {task.client_name && (
                      <span>Client: <strong className="text-slate-800">{task.client_name}</strong></span>
                    )}
                    <span>Assigned: <strong className="text-brand-600">{task.assigned_to_name || 'Unassigned'}</strong></span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Due: <strong className={isOverdue ? 'text-rose-600' : 'text-slate-700'}>{task.due_date}</strong>
                    </span>
                    <span className={`font-bold ${task.priority === 'Urgent' ? 'text-rose-600' : 'text-slate-600'}`}>
                      Priority: {task.priority}
                    </span>
                  </div>
                </div>

                {/* Status Toggle buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      const nextStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
                      updateTaskMutation.mutate({ id: task.id, data: { status: nextStatus } });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      task.status === 'Completed'
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {task.status === 'Completed' ? 'Reopen' : 'Complete'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TASK DETAIL & COMMENTS MODAL */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          subtitle={`Task ID: ${selectedTask.task_id} • Category: ${selectedTask.category}`}
          maxWidth="lg"
        >
          <div className="space-y-6 text-xs">
            {/* Meta details */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Assigned To</span>
                <span className="font-bold text-slate-800">{selectedTask.assigned_to_name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Due Date</span>
                <span className="font-bold text-slate-800">{selectedTask.due_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Priority</span>
                <span className="font-bold text-rose-600">{selectedTask.priority}</span>
              </div>
            </div>

            {selectedTask.description && (
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-1">Description & Specs</h4>
                <p className="p-3 rounded-lg bg-white border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedTask.description}
                </p>
              </div>
            )}

            {/* Comments Thread */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                Team Comments & Activity Thread
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                  selectedTask.comments.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{c.user_name}</span>
                        <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700">{c.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No comments yet. Leave a note below.</p>
                )}
              </div>

              {/* Add Comment Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add a comment or update for the team..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && commentText.trim()) {
                      addCommentMutation.mutate({ taskId: selectedTask.id, comment: commentText });
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  onClick={() => addCommentMutation.mutate({ taskId: selectedTask.id, comment: commentText })}
                  className="px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE TASK MODAL */}
      <Modal
        isOpen={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        title="Create New Agency Task"
        subtitle="Assign responsibility and set hard deadlines."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createTaskMutation.mutate(taskForm);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Color grade 4K lookbook footage"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Detailed instructions..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Client (Optional)</label>
              <select
                value={taskForm.client_id}
                onChange={(e) => setTaskForm({ ...taskForm, client_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">General (No specific client)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.business_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Staff *</label>
              <select
                required
                value={taskForm.assigned_to}
                onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {staff.map((st) => (
                  <option key={st.user_id} value={st.user_id}>
                    {st.name} ({st.role_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddTaskOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm"
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import { db } from '../db/connection.js';
import type { Task, TaskComment } from '../types/index.js';

export class TasksService {
  static getTasks(filter?: { assignedTo?: string; status?: string; clientId?: string }) {
    return db.getAllTasks(filter);
  }

  static getTaskById(id: string) {
    const task = db.getAllTasks().find((t) => t.id === id || t.task_id === id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }
    return task;
  }

  static createTask(data: any, createdByUserId?: string) {
    const nextNum = db.tasks.length + 4001;
    const taskIdStr = `TSK-${nextNum}`;
    const id = `tsk-${Date.now()}`;

    const newTask: Task = {
      id,
      task_id: taskIdStr,
      title: data.title,
      description: data.description,
      client_id: data.client_id,
      assigned_to: data.assigned_to,
      created_by: createdByUserId || '11111111-1111-1111-1111-111111111111',
      priority: data.priority || 'Medium',
      start_date: data.start_date,
      due_date: data.due_date,
      status: data.status || 'To Do',
      category: data.category || 'General',
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    db.tasks.unshift(newTask);

    // Notify assigned staff
    if (newTask.assigned_to) {
      db.createNotification({
        user_id: newTask.assigned_to,
        title: `📌 New Task Assigned: ${newTask.title}`,
        message: `Due on ${newTask.due_date} | Priority: ${newTask.priority}`,
        type: 'task',
        priority: newTask.priority === 'Urgent' ? 'urgent' : 'info',
        link: `/tasks`,
      });
    }

    return db.getAllTasks().find((t) => t.id === id);
  }

  static updateTask(id: string, data: any) {
    const task = db.tasks.find((t) => t.id === id || t.task_id === id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }

    Object.assign(task, data, { updated_at: new Date().toISOString() });
    return db.getAllTasks().find((t) => t.id === task.id);
  }

  static addComment(taskId: string, comment: string, userId: string, userName: string, avatarUrl?: string) {
    const task = db.tasks.find((t) => t.id === taskId || t.task_id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const newComment: TaskComment = {
      id: `tc-${Date.now()}`,
      task_id: task.id,
      user_id: userId,
      user_name: userName,
      user_avatar: avatarUrl,
      comment,
      created_at: new Date().toISOString(),
    };

    if (!task.comments) task.comments = [];
    task.comments.push(newComment);
    return newComment;
  }

  static deleteTask(id: string) {
    const index = db.tasks.findIndex((t) => t.id === id || t.task_id === id);
    if (index === -1) {
      throw new Error(`Task ${id} not found`);
    }
    const [deleted] = db.tasks.splice(index, 1);
    return deleted;
  }
}

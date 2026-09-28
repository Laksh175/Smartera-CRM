import type { Response, NextFunction } from 'express';
import { TasksService } from '../services/tasks.service.js';
import { TaskSchema } from '../validators/schemas.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class TasksController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assignedTo = req.query.assignedTo && req.query.assignedTo !== 'undefined' ? (req.query.assignedTo as string) : undefined;
      const status = req.query.status && req.query.status !== 'undefined' && req.query.status !== 'All' ? (req.query.status as string) : undefined;
      const clientId = req.query.clientId && req.query.clientId !== 'undefined' ? (req.query.clientId as string) : undefined;
      const tasks = TasksService.getTasks({
        assignedTo,
        status,
        clientId,
      });
      return res.status(200).json({ success: true, data: tasks });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = TasksService.getTaskById(req.params.id);
      return res.status(200).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = TaskSchema.parse(req.body);
      const task = TasksService.createTask(validated, req.user?.id);
      return res.status(201).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = TaskSchema.partial().parse(req.body);
      const updated = TasksService.updateTask(req.params.id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { comment } = req.body;
      if (!comment) {
        return res.status(400).json({ success: false, message: 'Comment text is required' });
      }
      const newComment = TasksService.addComment(
        req.params.id,
        comment,
        req.user?.id || '11111111-1111-1111-1111-111111111111',
        req.user?.name || 'Staff Member',
        req.user?.avatar_url
      );
      return res.status(201).json({ success: true, data: newComment });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const deleted = TasksService.deleteTask(req.params.id);
      return res.status(200).json({ success: true, data: deleted });
    } catch (err) {
      next(err);
    }
  }
}

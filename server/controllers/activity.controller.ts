import type { Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class ActivityController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const logs = ActivityService.getActivityLogs();
      return res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }
}

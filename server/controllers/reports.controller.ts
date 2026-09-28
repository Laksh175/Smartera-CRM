import type { Response, NextFunction } from 'express';
import { ReportsService } from '../services/reports.service.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class ReportsController {
  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = ReportsService.getDashboardMetrics();
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = ReportsService.getFullReports();
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

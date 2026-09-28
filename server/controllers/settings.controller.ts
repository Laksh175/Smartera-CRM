import type { Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings.service.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class SettingsController {
  static async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = SettingsService.getSettings();
      return res.status(200).json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = SettingsService.updateSettings(req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}

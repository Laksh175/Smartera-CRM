import type { Response, NextFunction } from 'express';
import { StaffService } from '../services/staff.service.js';
import { StaffProfileSchema } from '../validators/schemas.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class StaffController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staff = StaffService.getAllStaff();
      return res.status(200).json({ success: true, data: staff });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staff = StaffService.getStaffById(req.params.id);
      return res.status(200).json({ success: true, data: staff });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = StaffProfileSchema.parse(req.body);
      const staff = StaffService.createStaff(validated);
      return res.status(201).json({ success: true, data: staff });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = StaffProfileSchema.partial().parse(req.body);
      const updated = StaffService.updateStaff(req.params.id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}

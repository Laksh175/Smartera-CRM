import type { Response, NextFunction } from 'express';
import { ShootsService } from '../services/shoots.service.js';
import { ShootSchema } from '../validators/schemas.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class ShootsController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shoots = ShootsService.getShoots();
      return res.status(200).json({ success: true, data: shoots });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shoot = ShootsService.getShootById(req.params.id);
      return res.status(200).json({ success: true, data: shoot });
    } catch (err) {
      next(err);
    }
  }

  static async checkConflicts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { shootIdToIgnore, date, start_time, end_time, cameraman_id, model_id } = req.body;
      const result = ShootsService.checkConflicts({
        shootIdToIgnore,
        date,
        start_time,
        end_time,
        cameraman_id,
        model_id,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = ShootSchema.parse(req.body);
      const force = req.query.force === 'true';
      const shoot = ShootsService.createShoot(validated, force);
      return res.status(201).json({ success: true, data: shoot });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = ShootSchema.partial().parse(req.body);
      const force = req.query.force === 'true';
      const updated = ShootsService.updateShoot(req.params.id, validated, force);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const deleted = ShootsService.deleteShoot(req.params.id);
      return res.status(200).json({ success: true, data: deleted });
    } catch (err) {
      next(err);
    }
  }
}

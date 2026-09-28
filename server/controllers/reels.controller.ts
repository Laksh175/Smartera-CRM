import type { Response, NextFunction } from 'express';
import { ReelsService } from '../services/reels.service.js';
import { ReelSchema } from '../validators/schemas.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class ReelsController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clientId = req.query.clientId && req.query.clientId !== 'undefined' ? (req.query.clientId as string) : undefined;
      const editorId = req.query.editorId && req.query.editorId !== 'undefined' ? (req.query.editorId as string) : undefined;
      const status = req.query.status && req.query.status !== 'undefined' && req.query.status !== 'All' ? (req.query.status as string) : undefined;
      const reels = ReelsService.getReels({
        clientId,
        editorId,
        status,
      });
      return res.status(200).json({ success: true, data: reels });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reel = ReelsService.getReelById(req.params.id);
      return res.status(200).json({ success: true, data: reel });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = ReelSchema.parse(req.body);
      const reel = ReelsService.createReel(validated);
      return res.status(201).json({ success: true, data: reel });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = ReelSchema.partial().parse(req.body);
      const updated = ReelsService.updateReel(req.params.id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const deleted = ReelsService.deleteReel(req.params.id);
      return res.status(200).json({ success: true, data: deleted });
    } catch (err) {
      next(err);
    }
  }
}

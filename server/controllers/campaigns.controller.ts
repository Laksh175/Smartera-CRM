import type { Response, NextFunction } from 'express';
import { CampaignsService } from '../services/campaigns.service.js';
import { CampaignSchema } from '../validators/schemas.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class CampaignsController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaigns = CampaignsService.getCampaigns();
      return res.status(200).json({ success: true, data: campaigns });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = CampaignsService.getCampaignById(req.params.id);
      return res.status(200).json({ success: true, data: campaign });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = CampaignSchema.parse(req.body);
      const campaign = CampaignsService.createCampaign(validated);
      return res.status(201).json({ success: true, data: campaign });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = CampaignSchema.partial().parse(req.body);
      const updated = CampaignsService.updateCampaign(req.params.id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const deleted = CampaignsService.deleteCampaign(req.params.id);
      return res.status(200).json({ success: true, data: deleted });
    } catch (err) {
      next(err);
    }
  }
}

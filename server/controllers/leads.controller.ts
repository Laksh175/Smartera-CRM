import type { Response, NextFunction } from 'express';
import { LeadsService } from '../services/leads.service.js';
import { LeadSchema, FollowupSchema, ConvertLeadSchema } from '../validators/schemas.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class LeadsController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status && req.query.status !== 'undefined' && req.query.status !== 'All' ? (req.query.status as string) : undefined;
      const salesId = req.query.salesId && req.query.salesId !== 'undefined' ? (req.query.salesId as string) : undefined;
      const search = req.query.search && req.query.search !== 'undefined' ? (req.query.search as string) : undefined;
      const leads = LeadsService.getLeads({
        status,
        salesId,
        search,
      });
      return res.status(200).json({ success: true, data: leads });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const lead = LeadsService.getLeadById(req.params.id);
      return res.status(200).json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = LeadSchema.parse(req.body);
      const lead = LeadsService.createLead(validated, req.user?.id);
      return res.status(201).json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = LeadSchema.partial().parse(req.body);
      const updated = LeadsService.updateLead(req.params.id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const deleted = LeadsService.deleteLead(req.params.id);
      return res.status(200).json({ success: true, data: deleted });
    } catch (err) {
      next(err);
    }
  }

  static async addFollowup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = FollowupSchema.parse(req.body);
      const followup = LeadsService.addFollowup(validated);
      return res.status(201).json({ success: true, data: followup });
    } catch (err) {
      next(err);
    }
  }

  static async updateFollowup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = LeadsService.updateFollowup(req.params.id, req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async convert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = ConvertLeadSchema.parse(req.body);
      const result = LeadsService.convertToClient(validated, req.user?.id);
      return res.status(200).json({
        success: true,
        message: 'Lead successfully converted to Client!',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

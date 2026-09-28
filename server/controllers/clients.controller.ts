import type { Response, NextFunction } from 'express';
import { ClientsService } from '../services/clients.service.js';
import { ClientSchema, ClientBusinessProfileSchema } from '../validators/schemas.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class ClientsController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status && req.query.status !== 'undefined' && req.query.status !== 'All' ? (req.query.status as string) : undefined;
      const managerId = req.query.managerId && req.query.managerId !== 'undefined' ? (req.query.managerId as string) : undefined;
      const search = req.query.search && req.query.search !== 'undefined' ? (req.query.search as string) : undefined;
      const clients = ClientsService.getClients({
        status,
        managerId,
        search,
      });
      return res.status(200).json({ success: true, data: clients });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = ClientsService.getClientById(req.params.id);
      return res.status(200).json({ success: true, data: client });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = ClientSchema.parse(req.body);
      const client = ClientsService.createClient(validated);
      return res.status(201).json({ success: true, data: client });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = ClientSchema.partial().parse(req.body);
      const updated = ClientsService.updateClient(req.params.id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async updateBusinessProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = ClientBusinessProfileSchema.partial().parse(req.body);
      const updated = ClientsService.updateBusinessProfile(req.params.id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async getWorkBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workBoard = ClientsService.getClientWorkBoard(req.params.id);
      return res.status(200).json({ success: true, data: workBoard });
    } catch (err) {
      next(err);
    }
  }
}

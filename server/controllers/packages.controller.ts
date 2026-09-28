import type { Response, NextFunction } from 'express';
import { PackagesService } from '../services/packages.service.js';
import { PackageTemplateSchema, ClientPackageSchema } from '../validators/schemas.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class PackagesController {
  static async getTemplates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const templates = PackagesService.getTemplates();
      return res.status(200).json({ success: true, data: templates });
    } catch (err) {
      next(err);
    }
  }

  static async createTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = PackageTemplateSchema.parse(req.body);
      const template = PackagesService.createTemplate(validated);
      return res.status(201).json({ success: true, data: template });
    } catch (err) {
      next(err);
    }
  }

  static async updateTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = PackageTemplateSchema.partial().parse(req.body);
      const updated = PackagesService.updateTemplate(req.params.id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async getClientPackages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const packages = PackagesService.getAllClientPackages();
      return res.status(200).json({ success: true, data: packages });
    } catch (err) {
      next(err);
    }
  }

  static async getClientPackageById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pkg = PackagesService.getClientPackageById(req.params.id);
      return res.status(200).json({ success: true, data: pkg });
    } catch (err) {
      next(err);
    }
  }

  static async createClientPackage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = ClientPackageSchema.parse(req.body);
      const pkg = PackagesService.createClientPackage(validated);
      return res.status(201).json({ success: true, data: pkg });
    } catch (err) {
      next(err);
    }
  }

  static async updateClientPackage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = ClientPackageSchema.partial().parse(req.body);
      const updated = PackagesService.updateClientPackage(req.params.id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async updateUsage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = PackagesService.updatePackageUsage(req.params.id, req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async renew(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = PackagesService.renewPackage(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Package renewed successfully!',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

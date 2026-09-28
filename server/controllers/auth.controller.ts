import type { Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { LoginSchema } from '../validators/schemas.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class AuthController {
  static async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = LoginSchema.parse(req.body);
      const result = AuthService.login(validated.email, validated.password);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
      const user = AuthService.getProfile(req.user.id);
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
      const updated = AuthService.updateProfile(req.user.id, req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}

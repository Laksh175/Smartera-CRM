import type { Response, NextFunction } from 'express';
import { PaymentsService } from '../services/payments.service.js';
import { PaymentSchema } from '../validators/schemas.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class PaymentsController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payments = PaymentsService.getPayments();
      return res.status(200).json({ success: true, data: payments });
    } catch (err) {
      next(err);
    }
  }

  static async record(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = PaymentSchema.parse(req.body);
      const result = PaymentsService.recordPayment(validated, req.user?.id);
      return res.status(201).json({
        success: true,
        message: 'Payment recorded successfully!',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = PaymentsService.getFinancialSummary();
      return res.status(200).json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }
}

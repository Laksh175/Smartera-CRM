import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import { db } from '../db/connection.js';

export function auditLog(action: string, entity: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.json;

    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = body?.data?.id || body?.data?.lead_id || body?.data?.client_id || req.params.id || 'N/A';
        db.logActivity({
          user_id: req.user?.id,
          user_name: req.user?.name || 'System User',
          action,
          entity,
          entity_id: entityId,
          new_value: body?.data || req.body,
          ip_address: req.ip || req.socket.remoteAddress,
        });
      }
      return originalSend.call(this, body);
    };

    next();
  };
}

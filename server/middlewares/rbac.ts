import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import type { UserRole } from '../types/index.js';

// Granular RBAC Permissions Map
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'Super Admin': [
    'all',
    'leads.view', 'leads.create', 'leads.update', 'leads.delete', 'leads.convert',
    'clients.view', 'clients.create', 'clients.update', 'clients.delete',
    'packages.view', 'packages.create', 'packages.update', 'packages.delete',
    'payments.view', 'payments.create', 'payments.update', 'payments.delete',
    'tasks.view', 'tasks.create', 'tasks.update', 'tasks.delete',
    'shoots.view', 'shoots.create', 'shoots.update', 'shoots.delete',
    'reels.view', 'reels.create', 'reels.update', 'reels.delete',
    'campaigns.view', 'campaigns.create', 'campaigns.update',
    'staff.view', 'staff.create', 'staff.update', 'staff.delete',
    'reports.view', 'activity.view', 'settings.manage'
  ],
  'Admin / Operations': [
    'leads.view', 'leads.create', 'leads.update', 'leads.delete', 'leads.convert',
    'clients.view', 'clients.create', 'clients.update',
    'packages.view', 'packages.create', 'packages.update',
    'payments.view', 'payments.create', 'payments.update',
    'tasks.view', 'tasks.create', 'tasks.update', 'tasks.delete',
    'shoots.view', 'shoots.create', 'shoots.update',
    'reels.view', 'reels.create', 'reels.update',
    'campaigns.view', 'campaigns.create', 'campaigns.update',
    'staff.view', 'reports.view'
  ],
  'Sales Person': [
    'leads.view', 'leads.create', 'leads.update', 'leads.convert',
    'clients.view', 'packages.view', 'packages.create',
    'payments.view', 'payments.create',
    'tasks.view', 'tasks.create', 'tasks.update'
  ],
  'Social Media Manager': [
    'clients.view',
    'reels.view', 'reels.create', 'reels.update',
    'shoots.view', 'shoots.create', 'shoots.update',
    'tasks.view', 'tasks.create', 'tasks.update'
  ],
  'Video Editor': [
    'reels.view', 'reels.update',
    'tasks.view', 'tasks.update'
  ],
  'Camera Man': [
    'shoots.view', 'shoots.update',
    'tasks.view', 'tasks.update'
  ],
  'Model': [
    'shoots.view',
    'tasks.view', 'tasks.update'
  ],
  'Ads / Campaign Manager': [
    'clients.view',
    'campaigns.view', 'campaigns.create', 'campaigns.update',
    'tasks.view', 'tasks.create', 'tasks.update'
  ]
};

export function requirePermission(permissionCode: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }

    const userRole = req.user.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    if (permissions.includes('all') || permissions.includes(permissionCode)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Role "${userRole}" lacks "${permissionCode}" permission.`
    });
  };
}

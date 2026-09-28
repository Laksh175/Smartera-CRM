import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import { auditLog } from '../middlewares/audit.js';

import { AuthController } from '../controllers/auth.controller.js';
import { LeadsController } from '../controllers/leads.controller.js';
import { ClientsController } from '../controllers/clients.controller.js';
import { PackagesController } from '../controllers/packages.controller.js';
import { PaymentsController } from '../controllers/payments.controller.js';
import { TasksController } from '../controllers/tasks.controller.js';
import { ReelsController } from '../controllers/reels.controller.js';
import { ShootsController } from '../controllers/shoots.controller.js';
import { StaffController } from '../controllers/staff.controller.js';
import { CampaignsController } from '../controllers/campaigns.controller.js';
import { ReportsController } from '../controllers/reports.controller.js';
import { NotificationsController } from '../controllers/notifications.controller.js';
import { ActivityController } from '../controllers/activity.controller.js';
import { SettingsController } from '../controllers/settings.controller.js';

export const apiRouter = Router();

// 1. Auth Routes
apiRouter.post('/auth/login', AuthController.login);
apiRouter.get('/auth/me', authenticate, AuthController.me);
apiRouter.put('/auth/profile', authenticate, AuthController.updateProfile);

// 2. Leads Routes
apiRouter.get('/leads', authenticate, requirePermission('leads.view'), LeadsController.getAll);
apiRouter.get('/leads/:id', authenticate, requirePermission('leads.view'), LeadsController.getById);
apiRouter.post('/leads', authenticate, requirePermission('leads.create'), auditLog('Created Lead', 'Lead'), LeadsController.create);
apiRouter.put('/leads/:id', authenticate, requirePermission('leads.update'), auditLog('Updated Lead', 'Lead'), LeadsController.update);
apiRouter.delete('/leads/:id', authenticate, requirePermission('leads.delete'), auditLog('Deleted Lead', 'Lead'), LeadsController.delete);
apiRouter.post('/leads/followups', authenticate, requirePermission('leads.update'), LeadsController.addFollowup);
apiRouter.put('/leads/followups/:id', authenticate, requirePermission('leads.update'), LeadsController.updateFollowup);
apiRouter.post('/leads/convert', authenticate, requirePermission('leads.convert'), auditLog('Converted Lead', 'Client'), LeadsController.convert);

// 3. Clients Routes
apiRouter.get('/clients', authenticate, requirePermission('clients.view'), ClientsController.getAll);
apiRouter.get('/clients/:id', authenticate, requirePermission('clients.view'), ClientsController.getById);
apiRouter.post('/clients', authenticate, requirePermission('clients.create'), auditLog('Created Client', 'Client'), ClientsController.create);
apiRouter.put('/clients/:id', authenticate, requirePermission('clients.update'), auditLog('Updated Client', 'Client'), ClientsController.update);
apiRouter.put('/clients/:id/business-profile', authenticate, requirePermission('clients.update'), auditLog('Updated Business Profile', 'Client'), ClientsController.updateBusinessProfile);
apiRouter.get('/clients/:id/work-board', authenticate, requirePermission('clients.view'), ClientsController.getWorkBoard);

// 4. Packages Routes
apiRouter.get('/packages/templates', authenticate, requirePermission('packages.view'), PackagesController.getTemplates);
apiRouter.post('/packages/templates', authenticate, requirePermission('packages.create'), auditLog('Created Package Template', 'PackageTemplate'), PackagesController.createTemplate);
apiRouter.put('/packages/templates/:id', authenticate, requirePermission('packages.update'), auditLog('Updated Package Template', 'PackageTemplate'), PackagesController.updateTemplate);

apiRouter.get('/packages/client-packages', authenticate, requirePermission('packages.view'), PackagesController.getClientPackages);
apiRouter.get('/packages/client-packages/:id', authenticate, requirePermission('packages.view'), PackagesController.getClientPackageById);
apiRouter.post('/packages/client-packages', authenticate, requirePermission('packages.create'), auditLog('Created Client Package', 'ClientPackage'), PackagesController.createClientPackage);
apiRouter.put('/packages/client-packages/:id', authenticate, requirePermission('packages.update'), auditLog('Updated Client Package', 'ClientPackage'), PackagesController.updateClientPackage);
apiRouter.put('/packages/client-packages/:id/usage', authenticate, requirePermission('packages.update'), PackagesController.updateUsage);
apiRouter.post('/packages/client-packages/:id/renew', authenticate, requirePermission('packages.create'), auditLog('Renewed Client Package', 'ClientPackage'), PackagesController.renew);

// 5. Payments Routes
apiRouter.get('/payments', authenticate, requirePermission('payments.view'), PaymentsController.getAll);
apiRouter.post('/payments', authenticate, requirePermission('payments.create'), auditLog('Recorded Payment', 'Payment'), PaymentsController.record);
apiRouter.get('/payments/summary', authenticate, requirePermission('payments.view'), PaymentsController.getSummary);

// 6. Tasks Routes
apiRouter.get('/tasks', authenticate, requirePermission('tasks.view'), TasksController.getAll);
apiRouter.get('/tasks/:id', authenticate, requirePermission('tasks.view'), TasksController.getById);
apiRouter.post('/tasks', authenticate, requirePermission('tasks.create'), auditLog('Created Task', 'Task'), TasksController.create);
apiRouter.put('/tasks/:id', authenticate, requirePermission('tasks.update'), auditLog('Updated Task', 'Task'), TasksController.update);
apiRouter.post('/tasks/:id/comments', authenticate, requirePermission('tasks.update'), TasksController.addComment);
apiRouter.delete('/tasks/:id', authenticate, requirePermission('tasks.delete'), auditLog('Deleted Task', 'Task'), TasksController.delete);

// 7. Reels / Content Workflow Routes
apiRouter.get('/reels', authenticate, requirePermission('reels.view'), ReelsController.getAll);
apiRouter.get('/reels/:id', authenticate, requirePermission('reels.view'), ReelsController.getById);
apiRouter.post('/reels', authenticate, requirePermission('reels.create'), auditLog('Created Reel', 'Reel'), ReelsController.create);
apiRouter.put('/reels/:id', authenticate, requirePermission('reels.update'), auditLog('Updated Reel', 'Reel'), ReelsController.update);
apiRouter.delete('/reels/:id', authenticate, requirePermission('reels.delete'), auditLog('Deleted Reel', 'Reel'), ReelsController.delete);

// 8. Shoots Routes (with Conflict detection)
apiRouter.get('/shoots', authenticate, requirePermission('shoots.view'), ShootsController.getAll);
apiRouter.get('/shoots/:id', authenticate, requirePermission('shoots.view'), ShootsController.getById);
apiRouter.post('/shoots/check-conflicts', authenticate, requirePermission('shoots.view'), ShootsController.checkConflicts);
apiRouter.post('/shoots', authenticate, requirePermission('shoots.create'), auditLog('Created Shoot', 'Shoot'), ShootsController.create);
apiRouter.put('/shoots/:id', authenticate, requirePermission('shoots.update'), auditLog('Updated Shoot', 'Shoot'), ShootsController.update);
apiRouter.delete('/shoots/:id', authenticate, requirePermission('shoots.delete'), auditLog('Deleted Shoot', 'Shoot'), ShootsController.delete);

// 9. Staff Routes
apiRouter.get('/staff', authenticate, requirePermission('staff.view'), StaffController.getAll);
apiRouter.get('/staff/:id', authenticate, requirePermission('staff.view'), StaffController.getById);
apiRouter.post('/staff', authenticate, requirePermission('staff.create'), auditLog('Created Staff', 'Staff'), StaffController.create);
apiRouter.put('/staff/:id', authenticate, requirePermission('staff.update'), auditLog('Updated Staff', 'Staff'), StaffController.update);

// 10. Campaigns Routes
apiRouter.get('/campaigns', authenticate, requirePermission('campaigns.view'), CampaignsController.getAll);
apiRouter.get('/campaigns/:id', authenticate, requirePermission('campaigns.view'), CampaignsController.getById);
apiRouter.post('/campaigns', authenticate, requirePermission('campaigns.create'), auditLog('Created Campaign', 'Campaign'), CampaignsController.create);
apiRouter.put('/campaigns/:id', authenticate, requirePermission('campaigns.update'), auditLog('Updated Campaign', 'Campaign'), CampaignsController.update);
apiRouter.delete('/campaigns/:id', authenticate, requirePermission('campaigns.delete'), auditLog('Deleted Campaign', 'Campaign'), CampaignsController.delete);

// 11. Reports & Dashboard Metrics
apiRouter.get('/reports/dashboard', authenticate, ReportsController.getDashboard);
apiRouter.get('/reports/full', authenticate, requirePermission('reports.view'), ReportsController.getReports);

// 12. Notifications
apiRouter.get('/notifications', authenticate, NotificationsController.getAll);
apiRouter.put('/notifications/:id/read', authenticate, NotificationsController.markAsRead);
apiRouter.post('/notifications/read-all', authenticate, NotificationsController.markAllAsRead);

// 13. Activity Logs
apiRouter.get('/activity-logs', authenticate, requirePermission('activity.view'), ActivityController.getAll);

// 14. App Settings
apiRouter.get('/settings', authenticate, SettingsController.get);
apiRouter.put('/settings', authenticate, requirePermission('settings.manage'), auditLog('Updated App Settings', 'Settings'), SettingsController.update);

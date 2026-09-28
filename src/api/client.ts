import type {
  Profile,
  StaffProfile,
  Lead,
  LeadFollowup,
  Client,
  ClientBusinessProfile,
  PackageTemplate,
  ClientPackage,
  Payment,
  Task,
  Reel,
  Shoot,
  Campaign,
  Notification,
  ActivityLog,
  AppSettings,
  DashboardMetrics,
} from '../types';

const API_BASE = '/api';

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'undefined' && value !== 'null') {
      clean[key] = String(value);
    }
  }
  const str = new URLSearchParams(clean).toString();
  return str ? `?${str}` : '';
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('smartera_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    const errorMsg = data?.message || data?.errors?.[0]?.message || 'Request failed';
    const err = new Error(errorMsg) as any;
    err.status = res.status;
    err.conflict = data?.conflict;
    throw err;
  }

  return data.data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password?: string }) =>
    fetchJson<{ user: Profile; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => fetchJson<Profile>('/auth/me'),
  updateProfile: (data: Partial<Profile>) =>
    fetchJson<Profile>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Dashboard & Reports
  getDashboardMetrics: () => fetchJson<DashboardMetrics>('/reports/dashboard'),
  getFullReports: () => fetchJson<DashboardMetrics>('/reports/full'),

  // Leads
  getLeads: (params?: { status?: string; salesId?: string; search?: string }) => {
    const query = buildQueryString(params);
    return fetchJson<Lead[]>(`/leads${query}`);
  },
  getLeadById: (id: string) => fetchJson<Lead>(`/leads/${id}`),
  createLead: (data: any) =>
    fetchJson<Lead>('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id: string, data: any) =>
    fetchJson<Lead>(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLead: (id: string) =>
    fetchJson<Lead>(`/leads/${id}`, { method: 'DELETE' }),
  addFollowup: (data: any) =>
    fetchJson<LeadFollowup>('/leads/followups', { method: 'POST', body: JSON.stringify(data) }),
  updateFollowup: (id: string, data: any) =>
    fetchJson<LeadFollowup>(`/leads/followups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  convertLead: (data: any) =>
    fetchJson<{ client: Client; package?: ClientPackage }>('/leads/convert', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Clients
  getClients: (params?: { status?: string; managerId?: string; search?: string }) => {
    const query = buildQueryString(params);
    return fetchJson<Client[]>(`/clients${query}`);
  },
  getClientById: (id: string) => fetchJson<Client>(`/clients/${id}`),
  createClient: (data: any) =>
    fetchJson<Client>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: string, data: any) =>
    fetchJson<Client>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateBusinessProfile: (clientId: string, data: Partial<ClientBusinessProfile>) =>
    fetchJson<ClientBusinessProfile>(`/clients/${clientId}/business-profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getClientWorkBoard: (clientId: string) =>
    fetchJson<any>(`/clients/${clientId}/work-board`),

  // Packages
  getPackageTemplates: () => fetchJson<PackageTemplate[]>('/packages/templates'),
  createPackageTemplate: (data: any) =>
    fetchJson<PackageTemplate>('/packages/templates', { method: 'POST', body: JSON.stringify(data) }),
  updatePackageTemplate: (id: string, data: any) =>
    fetchJson<PackageTemplate>(`/packages/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getClientPackages: () => fetchJson<ClientPackage[]>('/packages/client-packages'),
  getClientPackageById: (id: string) => fetchJson<ClientPackage>(`/packages/client-packages/${id}`),
  createClientPackage: (data: any) =>
    fetchJson<ClientPackage>('/packages/client-packages', { method: 'POST', body: JSON.stringify(data) }),
  updateClientPackage: (id: string, data: any) =>
    fetchJson<ClientPackage>(`/packages/client-packages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  renewPackage: (id: string, data: any) =>
    fetchJson<ClientPackage>(`/packages/client-packages/${id}/renew`, { method: 'POST', body: JSON.stringify(data) }),

  // Payments
  getPayments: () => fetchJson<Payment[]>('/payments'),
  recordPayment: (data: any) =>
    fetchJson<any>('/payments', { method: 'POST', body: JSON.stringify(data) }),
  getFinancialSummary: () => fetchJson<any>('/payments/summary'),

  // Tasks
  getTasks: (params?: { assignedTo?: string; status?: string; clientId?: string }) => {
    const query = buildQueryString(params);
    return fetchJson<Task[]>(`/tasks${query}`);
  },
  getTaskById: (id: string) => fetchJson<Task>(`/tasks/${id}`),
  createTask: (data: any) =>
    fetchJson<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) =>
    fetchJson<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addTaskComment: (taskId: string, comment: string) =>
    fetchJson<any>(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ comment }) }),
  deleteTask: (id: string) =>
    fetchJson<Task>(`/tasks/${id}`, { method: 'DELETE' }),

  // Reels Workflow
  getReels: (params?: { clientId?: string; editorId?: string; status?: string }) => {
    const query = buildQueryString(params);
    return fetchJson<Reel[]>(`/reels${query}`);
  },
  getReelById: (id: string) => fetchJson<Reel>(`/reels/${id}`),
  createReel: (data: any) =>
    fetchJson<Reel>('/reels', { method: 'POST', body: JSON.stringify(data) }),
  updateReel: (id: string, data: any) =>
    fetchJson<Reel>(`/reels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReel: (id: string) =>
    fetchJson<Reel>(`/reels/${id}`, { method: 'DELETE' }),

  // Shoots
  getShoots: () => fetchJson<Shoot[]>('/shoots'),
  getShootById: (id: string) => fetchJson<Shoot>(`/shoots/${id}`),
  checkShootConflicts: (data: any) =>
    fetchJson<{ hasConflict: boolean; message?: string; conflictingShoot?: Shoot }>('/shoots/check-conflicts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createShoot: (data: any, force = false) =>
    fetchJson<Shoot>(`/shoots${force ? '?force=true' : ''}`, { method: 'POST', body: JSON.stringify(data) }),
  updateShoot: (id: string, data: any, force = false) =>
    fetchJson<Shoot>(`/shoots/${id}${force ? '?force=true' : ''}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteShoot: (id: string) =>
    fetchJson<Shoot>(`/shoots/${id}`, { method: 'DELETE' }),

  // Staff
  getStaff: () => fetchJson<StaffProfile[]>('/staff'),
  getStaffById: (id: string) => fetchJson<StaffProfile>(`/staff/${id}`),
  createStaff: (data: any) =>
    fetchJson<StaffProfile>('/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id: string, data: any) =>
    fetchJson<StaffProfile>(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Campaigns
  getCampaigns: () => fetchJson<Campaign[]>('/campaigns'),
  getCampaignById: (id: string) => fetchJson<Campaign>(`/campaigns/${id}`),
  createCampaign: (data: any) =>
    fetchJson<Campaign>('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id: string, data: any) =>
    fetchJson<Campaign>(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCampaign: (id: string) =>
    fetchJson<Campaign>(`/campaigns/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => fetchJson<Notification[]>('/notifications'),
  markNotificationRead: (id: string) =>
    fetchJson<Notification>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    fetchJson<{ success: boolean }>('/notifications/read-all', { method: 'POST' }),

  // Activity Logs
  getActivityLogs: () => fetchJson<ActivityLog[]>('/activity-logs'),

  // Settings
  getSettings: () => fetchJson<AppSettings>('/settings'),
  updateSettings: (data: Partial<AppSettings>) =>
    fetchJson<AppSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

import 'dotenv/config';
import pg from 'pg';
import {
  SEED_PROFILES,
  SEED_STAFF_PROFILES,
  SEED_PACKAGE_TEMPLATES,
  SEED_LEADS,
  SEED_FOLLOWUPS,
  SEED_CLIENTS,
  SEED_BUSINESS_PROFILES,
  SEED_CLIENT_PACKAGES,
  SEED_PACKAGE_USAGE,
  SEED_PAYMENTS,
  SEED_SHOOTS,
  SEED_REELS,
  SEED_TASKS,
  SEED_CAMPAIGNS,
  SEED_NOTIFICATIONS,
  SEED_ACTIVITY_LOGS,
  DEFAULT_APP_SETTINGS
} from './seedData.js';
import {
  seedPostgresIfEmpty,
  loadDataFromPostgres,
  pgInsertLead,
  pgUpdateLead,
  pgDeleteLead,
  pgInsertFollowup,
  pgInsertClient,
  pgInsertClientPackage,
  pgInsertPayment,
} from './postgresSync.js';
import type {
  Profile,
  StaffProfile,
  Lead,
  LeadFollowup,
  Client,
  ClientBusinessProfile,
  PackageTemplate,
  ClientPackage,
  PackageUsage,
  Payment,
  Task,
  Reel,
  Shoot,
  Campaign,
  Notification,
  ActivityLog,
  AppSettings
} from '../types/index.js';

const { Pool } = pg;

export class RelationalDatabaseStore {
  public profiles: Profile[] = [...SEED_PROFILES];
  public staffProfiles: StaffProfile[] = [...SEED_STAFF_PROFILES];
  public packageTemplates: PackageTemplate[] = [...SEED_PACKAGE_TEMPLATES];
  public leads: Lead[] = [...SEED_LEADS];
  public followups: LeadFollowup[] = [...SEED_FOLLOWUPS];
  public clients: Client[] = [...SEED_CLIENTS];
  public businessProfiles: ClientBusinessProfile[] = [...SEED_BUSINESS_PROFILES];
  public clientPackages: ClientPackage[] = [...SEED_CLIENT_PACKAGES];
  public packageUsages: PackageUsage[] = [...SEED_PACKAGE_USAGE];
  public payments: Payment[] = [...SEED_PAYMENTS];
  public tasks: Task[] = [...SEED_TASKS];
  public shoots: Shoot[] = [...SEED_SHOOTS];
  public reels: Reel[] = [...SEED_REELS];
  public campaigns: Campaign[] = [...SEED_CAMPAIGNS];
  public notifications: Notification[] = [...SEED_NOTIFICATIONS];
  public activityLogs: ActivityLog[] = [...SEED_ACTIVITY_LOGS];
  public settings: AppSettings = { ...DEFAULT_APP_SETTINGS };

  private pool: pg.Pool | null = null;
  public isPgConnected: boolean = false;
  private isReadyPromise: Promise<void> | null = null;

  constructor() {
    this.isReadyPromise = this.initPostgres();
  }

  public getPool(): pg.Pool | null {
    return this.pool;
  }

  public async whenReady() {
    if (this.isReadyPromise) {
      await this.isReadyPromise;
    }
  }

  private async initPostgres() {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString && connectionString.trim() !== '') {
      try {
        this.pool = new Pool({
          connectionString,
          ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? false : { rejectUnauthorized: false },
          max: 3,
          idleTimeoutMillis: 5000,
          connectionTimeoutMillis: 10000,
        });



        const client = await this.pool.connect();
        client.release();
        this.isPgConnected = true;
        console.log('✅ PostgreSQL Database connected successfully.');

        // 1. Seed PostgreSQL if tables are empty
        await seedPostgresIfEmpty(this.pool);

        // 2. Load latest data from PostgreSQL into memory store
        const pgData = await loadDataFromPostgres(this.pool);
        if (pgData) {
          if (pgData.profiles.length > 0) this.profiles = pgData.profiles;
          if (pgData.staffProfiles.length > 0) this.staffProfiles = pgData.staffProfiles;
          if (pgData.packageTemplates.length > 0) this.packageTemplates = pgData.packageTemplates;
          if (pgData.leads.length > 0) this.leads = pgData.leads;
          if (pgData.followups.length > 0) this.followups = pgData.followups;
          if (pgData.clients.length > 0) this.clients = pgData.clients;
          if (pgData.businessProfiles.length > 0) this.businessProfiles = pgData.businessProfiles;
          if (pgData.clientPackages.length > 0) this.clientPackages = pgData.clientPackages;
          if (pgData.packageUsages.length > 0) this.packageUsages = pgData.packageUsages;
          if (pgData.payments.length > 0) this.payments = pgData.payments;
          if (pgData.shoots.length > 0) this.shoots = pgData.shoots;
          if (pgData.reels.length > 0) this.reels = pgData.reels;
          if (pgData.tasks.length > 0) this.tasks = pgData.tasks;
          if (pgData.campaigns.length > 0) this.campaigns = pgData.campaigns;
          if (pgData.notifications.length > 0) this.notifications = pgData.notifications;
          if (pgData.activityLogs.length > 0) this.activityLogs = pgData.activityLogs;
          console.log(`🚀 Loaded ${this.leads.length} leads and ${this.clients.length} clients directly from PostgreSQL/Supabase.`);
        }
      } catch (err: any) {
        console.warn('⚠️ PostgreSQL connection failed, operating with in-memory relational store:', err.message);
        this.isPgConnected = false;
      }
    } else {
      console.log('ℹ️ Operating in resilient in-memory relational mode with pre-seeded agency demo data.');
    }
  }

  // --- Real-Time Persistent Mutation Handlers ---

  public async saveLead(lead: Lead) {
    if (this.pool && this.isPgConnected) {
      await pgInsertLead(this.pool, lead);
    }
  }

  public async modifyLead(id: string, data: Partial<Lead>) {
    if (this.pool && this.isPgConnected) {
      await pgUpdateLead(this.pool, id, data);
    }
  }

  public async removeLead(id: string) {
    if (this.pool && this.isPgConnected) {
      await pgDeleteLead(this.pool, id);
    }
  }

  public async saveFollowup(f: LeadFollowup) {
    if (this.pool && this.isPgConnected) {
      await pgInsertFollowup(this.pool, f);
    }
  }

  public async saveClient(client: Client, bp?: ClientBusinessProfile) {
    if (this.pool && this.isPgConnected) {
      await pgInsertClient(this.pool, client, bp);
    }
  }

  public async saveClientPackage(cp: ClientPackage, u?: PackageUsage) {
    if (this.pool && this.isPgConnected) {
      await pgInsertClientPackage(this.pool, cp, u);
    }
  }

  public async savePayment(payment: Payment) {
    if (this.pool && this.isPgConnected) {
      await pgInsertPayment(this.pool, payment);
    }
  }

  // --- Helper Methods & Relational Joins ---

  public getProfileById(id: string): Profile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  public getProfileByEmail(email: string): Profile | undefined {
    return this.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  }

  public getAllLeads(filter?: { status?: string; salesId?: string; search?: string }): Lead[] {
    let list = this.leads.map((lead) => {
      const sales = lead.assigned_sales_id ? this.getProfileById(lead.assigned_sales_id) : undefined;
      const leadFollowups = this.followups.filter((f) => f.lead_id === lead.id);
      return {
        ...lead,
        assigned_sales_name: sales ? sales.name : undefined,
        followups: leadFollowups,
      };
    });

    if (filter?.status) {
      list = list.filter((l) => l.status.toLowerCase() === filter.status!.toLowerCase());
    }
    if (filter?.salesId) {
      list = list.filter((l) => l.assigned_sales_id === filter.salesId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.company_name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.email && l.email.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getLeadById(id: string): Lead | undefined {
    const lead = this.leads.find((l) => l.id === id || l.lead_id === id);
    if (!lead) return undefined;
    const sales = lead.assigned_sales_id ? this.getProfileById(lead.assigned_sales_id) : undefined;
    const leadFollowups = this.followups.filter((f) => f.lead_id === lead.id);
    return {
      ...lead,
      assigned_sales_name: sales ? sales.name : undefined,
      followups: leadFollowups,
    };
  }

  public getAllClients(filter?: { status?: string; managerId?: string; search?: string }): Client[] {
    let list = this.clients.map((client) => {
      const manager = client.assigned_manager_id ? this.getProfileById(client.assigned_manager_id) : undefined;
      const businessProfile = this.businessProfiles.find((bp) => bp.client_id === client.id);
      const activePkg = this.clientPackages.find((cp) => cp.client_id === client.id && cp.status === 'Active') ||
        this.clientPackages.find((cp) => cp.client_id === client.id && cp.status === 'Expiring') ||
        this.clientPackages.find((cp) => cp.client_id === client.id);

      const clientPayments = this.payments.filter((p) => p.client_id === client.id);
      const clientReels = this.reels.filter((r) => r.client_id === client.id);
      const postedReels = clientReels.filter((r) => r.posting_status === 'Posted').length;
      const editingReels = clientReels.filter((r) => r.editing_status === 'In Progress' || r.editing_status === 'Internal Review').length;
      const scriptingReels = clientReels.filter((r) => r.script_status === 'In Progress' || r.script_status === 'Ready').length;
      const shootScheduledReels = clientReels.filter((r) => r.shoot_status === 'Scheduled').length;
      const approvalPendingReels = clientReels.filter((r) => r.client_approval_status === 'Pending' || r.client_approval_status === 'Changes Requested').length;

      return {
        ...client,
        assigned_manager_name: manager ? manager.name : undefined,
        business_profile: businessProfile,
        active_package: activePkg ? this.enrichClientPackage(activePkg) : undefined,
        payments: clientPayments,
        work_progress: {
          total_reels: clientReels.length,
          completed_reels: postedReels,
          in_progress_reels: editingReels,
          scripting_reels: scriptingReels,
          shoot_scheduled_reels: shootScheduledReels,
          approval_pending_reels: approvalPendingReels,
          posted_reels: postedReels,
          total_posts: 12,
          completed_posts: 6,
        }
      };
    });

    if (filter?.status) {
      list = list.filter((c) => c.status.toLowerCase() === filter.status!.toLowerCase());
    }
    if (filter?.managerId) {
      list = list.filter((c) => c.assigned_manager_id === filter.managerId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.business_name.toLowerCase().includes(q) ||
          c.owner_name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getClientById(id: string): Client | undefined {
    const client = this.clients.find((c) => c.id === id || c.client_id === id);
    if (!client) return undefined;
    const manager = client.assigned_manager_id ? this.getProfileById(client.assigned_manager_id) : undefined;
    const businessProfile = this.businessProfiles.find((bp) => bp.client_id === client.id);
    const packages = this.clientPackages
      .filter((cp) => cp.client_id === client.id)
      .map((pkg) => this.enrichClientPackage(pkg));
    const activePkg = packages.find((p) => p.status === 'Active') || packages.find((p) => p.status === 'Expiring') || packages[0];
    const clientPayments = this.payments.filter((p) => p.client_id === client.id);
    const clientReels = this.reels.filter((r) => r.client_id === client.id);
    const postedReels = clientReels.filter((r) => r.posting_status === 'Posted').length;
    const editingReels = clientReels.filter((r) => r.editing_status === 'In Progress' || r.editing_status === 'Internal Review').length;
    const scriptingReels = clientReels.filter((r) => r.script_status === 'In Progress' || r.script_status === 'Ready').length;
    const shootScheduledReels = clientReels.filter((r) => r.shoot_status === 'Scheduled').length;
    const approvalPendingReels = clientReels.filter((r) => r.client_approval_status === 'Pending' || r.client_approval_status === 'Changes Requested').length;

    return {
      ...client,
      assigned_manager_name: manager ? manager.name : undefined,
      business_profile: businessProfile,
      packages,
      active_package: activePkg,
      payments: clientPayments,
      work_progress: {
        total_reels: clientReels.length,
        completed_reels: postedReels,
        in_progress_reels: editingReels,
        scripting_reels: scriptingReels,
        shoot_scheduled_reels: shootScheduledReels,
        approval_pending_reels: approvalPendingReels,
        posted_reels: postedReels,
        total_posts: 12,
        completed_posts: 6,
      }
    };
  }

  public enrichClientPackage(pkg: ClientPackage): ClientPackage {
    const client = this.clients.find((c) => c.id === pkg.client_id);
    const manager = pkg.assigned_manager_id ? this.getProfileById(pkg.assigned_manager_id) : undefined;
    const usage = this.packageUsages.find((u) => u.client_package_id === pkg.id);
    const payments = this.payments.filter((p) => p.client_package_id === pkg.id);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remainingBalance = Math.max(0, Number(pkg.final_price) - totalPaid);

    const endDate = new Date(pkg.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...pkg,
      client_name: client?.business_name,
      assigned_manager_name: manager?.name,
      total_paid: totalPaid,
      remaining_balance: remainingBalance,
      days_remaining: daysRemaining,
      usage,
    };
  }

  public getAllClientPackages(): ClientPackage[] {
    return this.clientPackages.map((pkg) => this.enrichClientPackage(pkg));
  }

  public getAllPayments(): Payment[] {
    return this.payments.map((p) => {
      const client = this.clients.find((c) => c.id === p.client_id);
      const pkg = this.clientPackages.find((cp) => cp.id === p.client_package_id);
      const recorder = p.recorded_by ? this.getProfileById(p.recorded_by) : undefined;
      return {
        ...p,
        client_name: client?.business_name,
        package_name: pkg?.package_name,
        recorded_by_name: recorder?.name,
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAllTasks(filter?: { assignedTo?: string; status?: string; clientId?: string }): Task[] {
    let list = this.tasks.map((t) => {
      const client = t.client_id ? this.clients.find((c) => c.id === t.client_id) : undefined;
      const assignee = t.assigned_to ? this.getProfileById(t.assigned_to) : undefined;
      const creator = t.created_by ? this.getProfileById(t.created_by) : undefined;
      return {
        ...t,
        client_name: client?.business_name,
        assigned_to_name: assignee?.name,
        assigned_to_avatar: assignee?.avatar_url,
        created_by_name: creator?.name,
      };
    });

    if (filter?.assignedTo) {
      list = list.filter((t) => t.assigned_to === filter.assignedTo);
    }
    if (filter?.status) {
      list = list.filter((t) => t.status.toLowerCase() === filter.status!.toLowerCase());
    }
    if (filter?.clientId) {
      list = list.filter((t) => t.client_id === filter.clientId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAllShoots(): Shoot[] {
    return this.shoots.map((s) => {
      const client = this.clients.find((c) => c.id === s.client_id);
      const cam = s.cameraman_id ? this.getProfileById(s.cameraman_id) : undefined;
      const model = s.model_id ? this.getProfileById(s.model_id) : undefined;
      const editor = s.editor_id ? this.getProfileById(s.editor_id) : undefined;
      const manager = s.manager_id ? this.getProfileById(s.manager_id) : undefined;
      const linked_reels = this.reels.filter((r) => r.shoot_id === s.id || (s.reel_ids && s.reel_ids.includes(r.id)));
      return {
        ...s,
        client_name: client?.business_name,
        cameraman_name: cam?.name,
        cameraman_phone: cam?.phone,
        model_name: model?.name,
        model_phone: model?.phone,
        editor_name: editor?.name,
        manager_name: manager?.name,
        linked_reels,
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public checkShootConflicts(params: {
    shootIdToIgnore?: string;
    date: string;
    start_time: string;
    end_time: string;
    cameraman_id?: string | null;
    model_id?: string | null;
  }): { hasConflict: boolean; message?: string; conflictingShoot?: Shoot } {
    const activeShoots = this.shoots.filter(
      (s) =>
        s.id !== params.shootIdToIgnore &&
        s.date === params.date &&
        s.status !== 'Cancelled'
    );

    for (const shoot of activeShoots) {
      if (params.cameraman_id && shoot.cameraman_id === params.cameraman_id) {
        const cam = this.getProfileById(params.cameraman_id);
        const client = this.clients.find((c) => c.id === shoot.client_id);
        return {
          hasConflict: true,
          message: `Camera Man ${cam?.name || 'Assigned'} already has a confirmed shoot on ${params.date} from ${shoot.start_time} to ${shoot.end_time} for "${client?.business_name || 'Client'}"!`,
          conflictingShoot: shoot,
        };
      }

      if (params.model_id && shoot.model_id === params.model_id) {
        const model = this.getProfileById(params.model_id);
        const client = this.clients.find((c) => c.id === shoot.client_id);
        return {
          hasConflict: true,
          message: `Model ${model?.name || 'Assigned'} already has a scheduled shoot on ${params.date} from ${shoot.start_time} to ${shoot.end_time} for "${client?.business_name || 'Client'}"!`,
          conflictingShoot: shoot,
        };
      }
    }

    return { hasConflict: false };
  }

  public getAllReels(filter?: { clientId?: string; editorId?: string; status?: string }): Reel[] {
    let list = this.reels.map((r) => {
      const client = this.clients.find((c) => c.id === r.client_id);
      const smm = r.assigned_smm_id ? this.getProfileById(r.assigned_smm_id) : undefined;
      const editor = r.assigned_editor_id ? this.getProfileById(r.assigned_editor_id) : undefined;
      const cam = r.assigned_cameraman_id ? this.getProfileById(r.assigned_cameraman_id) : undefined;
      const model = r.assigned_model_id ? this.getProfileById(r.assigned_model_id) : undefined;

      return {
        ...r,
        client_name: client?.business_name,
        assigned_smm_name: smm?.name,
        assigned_editor_name: editor?.name,
        assigned_cameraman_name: cam?.name,
        assigned_model_name: model?.name,
      };
    });

    if (filter?.clientId) {
      list = list.filter((r) => r.client_id === filter.clientId);
    }
    if (filter?.editorId) {
      list = list.filter((r) => r.assigned_editor_id === filter.editorId);
    }
    return list.sort((a, b) => a.reel_number - b.reel_number);
  }

  public getAllCampaigns(): Campaign[] {
    return this.campaigns.map((c) => {
      const client = this.clients.find((cli) => cli.id === c.client_id);
      const manager = c.manager_id ? this.getProfileById(c.manager_id) : undefined;
      return {
        ...c,
        client_name: client?.business_name,
        manager_name: manager?.name,
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAllStaff(): StaffProfile[] {
    return this.profiles.map((p) => {
      const staffDetails = this.staffProfiles.find((sp) => sp.user_id === p.id);
      return {
        id: staffDetails?.id || `st-${p.id}`,
        user_id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        avatar_url: p.avatar_url,
        role_type: p.role,
        equipment: staffDetails?.equipment,
        skills: staffDetails?.skills || [],
        gender: staffDetails?.gender,
        instagram: staffDetails?.instagram,
        daily_rate: staffDetails?.daily_rate || 0,
        availability_status: staffDetails?.availability_status || 'Available',
        notes: staffDetails?.notes,
      };
    });
  }

  public logActivity(activity: Omit<ActivityLog, 'id' | 'created_at'>) {
    const log: ActivityLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      ...activity,
    };
    this.activityLogs.unshift(log);
  }

  public createNotification(notif: Omit<Notification, 'id' | 'created_at' | 'is_read'>) {
    if (notif.dedup_key) {
      const exists = this.notifications.some((n) => n.dedup_key === notif.dedup_key);
      if (exists) return;
    }

    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      is_read: false,
      ...notif,
    };
    this.notifications.unshift(newNotif);
  }
}

export const db = new RelationalDatabaseStore();

// Core Types for SMARTERA DIGITAL Agency Operations Management CRM

export type UserRole =
  | 'Super Admin'
  | 'Admin / Operations'
  | 'Sales Person'
  | 'Social Media Manager'
  | 'Camera Man'
  | 'Video Editor'
  | 'Model'
  | 'Ads / Campaign Manager';

export interface Profile {
  id: string;
  email: string;
  password_hash?: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface StaffProfile {
  id: string;
  user_id: string;
  role_type: UserRole;
  equipment?: string;
  skills: string[];
  gender?: string;
  instagram?: string;
  daily_rate: number;
  availability_status: 'Available' | 'Busy' | 'On Leave';
  notes?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Lead {
  id: string;
  lead_id: string;
  name: string;
  company_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  category?: string;
  city?: string;
  address?: string;
  source: string;
  interested_services: string[];
  estimated_budget: number;
  assigned_sales_id?: string;
  assigned_sales_name?: string;
  status: 'New' | 'Contacted' | 'Interested' | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  next_followup_date?: string;
  notes?: string;
  is_converted: boolean;
  converted_client_id?: string;
  converted_at?: string;
  created_at: string;
  updated_at?: string;
  followups?: LeadFollowup[];
}

export interface LeadFollowup {
  id: string;
  lead_id: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  followup_date: string;
  followup_time: string;
  type: 'Call' | 'WhatsApp' | 'Meeting' | 'Email' | 'Other';
  notes: string;
  result?: string;
  status: 'Pending' | 'Completed' | 'Missed' | 'Cancelled';
  created_at: string;
}

export interface Client {
  id: string;
  client_id: string;
  lead_id?: string;
  business_name: string;
  owner_name: string;
  contact_person?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  google_business_profile?: string;
  category?: string;
  assigned_manager_id?: string;
  assigned_manager_name?: string;
  status: 'Active' | 'On Hold' | 'Expired' | 'Cancelled' | 'Archived';
  notes?: string;
  created_at: string;
  updated_at?: string;
  business_profile?: ClientBusinessProfile;
  active_package?: ClientPackage;
  packages?: ClientPackage[];
  payments?: Payment[];
  work_progress?: {
    total_reels: number;
    completed_reels: number;
    in_progress_reels: number;
    scripting_reels: number;
    shoot_scheduled_reels: number;
    approval_pending_reels: number;
    posted_reels: number;
    total_posts: number;
    completed_posts: number;
  };
}

export interface ClientBusinessProfile {
  id: string;
  client_id: string;
  business_description?: string;
  services_products?: string;
  target_audience?: string;
  target_location?: string;
  competitors?: string;
  brand_colors?: string;
  brand_tone?: string;
  brand_instructions?: string;
  notes?: string;
  client_preferences?: string;
  updated_at?: string;
}

export interface PackageTemplate {
  id: string;
  name: string;
  description?: string;
  duration_days: number;
  price: number;
  reels_count: number;
  posts_count: number;
  stories_count: number;
  shoot_count: number;
  ads_management_included: boolean;
  other_services?: string;
  is_active: boolean;
  created_at?: string;
}

export interface ClientPackage {
  id: string;
  client_id: string;
  client_name?: string;
  package_template_id?: string;
  package_name: string;
  start_date: string;
  end_date: string;
  original_price: number;
  discount: number;
  final_price: number;
  total_paid?: number;
  remaining_balance?: number;
  payment_status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  assigned_manager_id?: string;
  assigned_manager_name?: string;
  status: 'Upcoming' | 'Active' | 'On Hold' | 'Expiring' | 'Expired' | 'Cancelled' | 'Renewed';
  notes?: string;
  days_remaining?: number;
  created_at: string;
  updated_at?: string;
  usage?: PackageUsage;
}

export interface PackageUsage {
  id: string;
  client_package_id: string;
  reels_total: number;
  reels_completed: number;
  posts_total: number;
  posts_completed: number;
  stories_total: number;
  stories_completed: number;
  shoots_total: number;
  shoots_completed: number;
}

export interface Payment {
  id: string;
  payment_id: string;
  client_id: string;
  client_name?: string;
  client_package_id: string;
  package_name?: string;
  amount: number;
  payment_date: string;
  payment_method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
  transaction_id?: string;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  notes?: string;
  recorded_by?: string;
  recorded_by_name?: string;
  created_at: string;
}

export interface Task {
  id: string;
  task_id: string;
  title: string;
  description?: string;
  client_id?: string;
  client_name?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  created_by?: string;
  created_by_name?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  start_date?: string;
  due_date: string;
  status: 'To Do' | 'In Progress' | 'Waiting' | 'Completed' | 'Cancelled';
  category: string;
  notes?: string;
  comments?: TaskComment[];
  created_at: string;
  updated_at?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  comment: string;
  created_at: string;
}

export type ScriptStatus = 'Not Started' | 'In Progress' | 'Ready' | 'Completed';
export type ShootStatus = 'Not Required' | 'Planned' | 'Scheduled' | 'Completed' | 'Cancelled';
export type EditingStatus = 'Not Started' | 'In Progress' | 'Internal Review' | 'Revision Required' | 'Completed';
export type ClientApprovalStatus = 'Not Sent' | 'Pending' | 'Approved' | 'Changes Requested';
export type PostingStatus = 'Not Scheduled' | 'Scheduled' | 'Posted' | 'Cancelled';

export interface Reel {
  id: string;
  reel_id: string;
  client_id: string;
  client_name?: string;
  client_package_id?: string;
  reel_number: number;
  title: string;
  description?: string;
  hook_line?: string;
  script_content?: string;
  content_type: string;
  
  script_status: ScriptStatus;
  shoot_status: ShootStatus;
  editing_status: EditingStatus;
  client_approval_status: ClientApprovalStatus;
  posting_status: PostingStatus;
  overall_status: string;
  
  assigned_smm_id?: string;
  assigned_smm_name?: string;
  assigned_editor_id?: string;
  assigned_editor_name?: string;
  assigned_cameraman_id?: string;
  assigned_cameraman_name?: string;
  assigned_model_id?: string;
  assigned_model_name?: string;
  
  shoot_id?: string;
  shoot_date?: string;
  editing_due_date?: string;
  approval_due_date?: string;
  posting_date?: string;
  posting_time?: string;
  
  external_url?: string;
  approval_notes?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Shoot {
  id: string;
  shoot_id: string;
  client_id: string;
  client_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  shoot_type: string;
  cameraman_id?: string;
  cameraman_name?: string;
  cameraman_phone?: string;
  model_id?: string;
  model_name?: string;
  model_phone?: string;
  editor_id?: string;
  editor_name?: string;
  manager_id?: string;
  manager_name?: string;
  reels_count: number;
  reel_ids?: string[];
  linked_reels?: Reel[];
  notes?: string;
  status: 'Planned' | 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled';
  created_at: string;
}

export interface Campaign {
  id: string;
  campaign_id: string;
  client_id: string;
  client_name?: string;
  campaign_name: string;
  platform: string;
  manager_id?: string;
  manager_name?: string;
  start_date: string;
  end_date?: string;
  budget: number;
  spend: number;
  leads: number;
  impressions: number;
  reach: number;
  clicks: number;
  cpl: number;
  conversions: number;
  status: 'Planned' | 'Ready' | 'Running' | 'Paused' | 'Completed' | 'Cancelled';
  objective: string;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'lead' | 'followup' | 'task' | 'shoot' | 'reel' | 'approval' | 'payment' | 'package' | 'renewal';
  priority: 'info' | 'warning' | 'urgent';
  link?: string;
  is_read: boolean;
  dedup_key?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name: string;
  action: string;
  entity: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  created_at: string;
}

export interface AppSettings {
  lead_statuses: string[];
  lead_sources: string[];
  business_categories: string[];
  campaign_platforms: string[];
  payment_methods: string[];
  agency_info: {
    name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    currency: string;
  };
}

import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LeadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  company_name: z.string().min(2, 'Company/Business name is required'),
  phone: z.string().min(7, 'Phone number is required'),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  website: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  source: z.string().min(1, 'Lead source is required'),
  interested_services: z.array(z.string()).default([]),
  estimated_budget: z.coerce.number().min(0).default(0),
  assigned_sales_id: z.string().optional().nullable(),
  status: z.enum([
    'New',
    'Contacted',
    'Interested',
    'Meeting Scheduled',
    'Proposal Sent',
    'Negotiation',
    'Won',
    'Lost'
  ]).default('New'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  next_followup_date: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const FollowupSchema = z.object({
  lead_id: z.string().min(1, 'Lead ID is required'),
  assigned_user_id: z.string().optional().nullable(),
  followup_date: z.string().min(1, 'Date is required'),
  followup_time: z.string().default('11:00 AM'),
  type: z.enum(['Call', 'WhatsApp', 'Meeting', 'Email', 'Other']),
  notes: z.string().min(1, 'Follow-up notes are required'),
  result: z.string().optional(),
  status: z.enum(['Pending', 'Completed', 'Missed', 'Cancelled']).default('Pending'),
});

export const ConvertLeadSchema = z.object({
  lead_id: z.string().min(1, 'Lead ID is required'),
  package_template_id: z.string().optional().nullable(),
  package_name: z.string().optional(),
  start_date: z.string().optional(),
  original_price: z.coerce.number().optional(),
  discount: z.coerce.number().default(0),
  assigned_manager_id: z.string().optional().nullable(),
  initial_payment: z.object({
    amount: z.coerce.number().min(0),
    payment_method: z.enum(['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other']),
    transaction_id: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

export const ClientSchema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  owner_name: z.string().min(2, 'Owner name is required'),
  contact_person: z.string().optional(),
  phone: z.string().min(7, 'Phone number is required'),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  google_business_profile: z.string().optional(),
  category: z.string().optional(),
  assigned_manager_id: z.string().optional().nullable(),
  status: z.enum(['Active', 'On Hold', 'Expired', 'Cancelled', 'Archived']).default('Active'),
  notes: z.string().optional(),
});

export const ClientBusinessProfileSchema = z.object({
  business_description: z.string().optional(),
  services_products: z.string().optional(),
  target_audience: z.string().optional(),
  target_location: z.string().optional(),
  competitors: z.string().optional(),
  brand_colors: z.string().optional(),
  brand_tone: z.string().optional(),
  brand_instructions: z.string().optional(),
  notes: z.string().optional(),
  client_preferences: z.string().optional(),
});

export const PackageTemplateSchema = z.object({
  name: z.string().min(2, 'Package template name is required'),
  description: z.string().optional(),
  duration_days: z.coerce.number().min(1).default(30),
  price: z.coerce.number().min(0),
  reels_count: z.coerce.number().min(0).default(8),
  posts_count: z.coerce.number().min(0).default(8),
  stories_count: z.coerce.number().min(0).default(12),
  shoot_count: z.coerce.number().min(0).default(1),
  ads_management_included: z.boolean().default(false),
  other_services: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const ClientPackageSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  package_template_id: z.string().optional().nullable(),
  package_name: z.string().min(2, 'Package name is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  original_price: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  assigned_manager_id: z.string().optional().nullable(),
  status: z.enum(['Upcoming', 'Active', 'On Hold', 'Expiring', 'Expired', 'Cancelled', 'Renewed']).default('Active'),
  notes: z.string().optional(),
});

export const PaymentSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  client_package_id: z.string().optional().nullable(),
  package_template_id: z.string().optional().nullable(),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  payment_date: z.string().min(1, 'Payment date is required'),
  payment_method: z.enum(['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other']),
  transaction_id: z.string().optional(),
  status: z.enum(['Paid', 'Partial', 'Pending', 'Overdue']).default('Paid'),
  notes: z.string().optional(),
});

export const TaskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  client_id: z.string().optional().nullable(),
  assigned_to: z.string().optional().nullable(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  start_date: z.string().optional().nullable(),
  due_date: z.string().min(1, 'Due date is required'),
  status: z.enum(['To Do', 'In Progress', 'Waiting', 'Completed', 'Cancelled']).default('To Do'),
  category: z.string().default('General'),
  notes: z.string().optional(),
});

export const ReelSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  client_package_id: z.string().optional().nullable(),
  reel_number: z.coerce.number().min(1),
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  hook_line: z.string().optional(),
  script_content: z.string().optional(),
  content_type: z.string().default('Educational / Showcase'),
  script_status: z.enum(['Not Started', 'In Progress', 'Ready', 'Completed']).default('Not Started'),
  shoot_status: z.enum(['Not Required', 'Planned', 'Scheduled', 'Completed', 'Cancelled']).default('Planned'),
  editing_status: z.enum(['Not Started', 'In Progress', 'Internal Review', 'Revision Required', 'Completed']).default('Not Started'),
  client_approval_status: z.enum(['Not Sent', 'Pending', 'Approved', 'Changes Requested']).default('Pending'),
  posting_status: z.enum(['Not Scheduled', 'Scheduled', 'Posted', 'Cancelled']).default('Not Scheduled'),
  assigned_smm_id: z.string().optional().nullable(),
  assigned_editor_id: z.string().optional().nullable(),
  assigned_cameraman_id: z.string().optional().nullable(),
  assigned_model_id: z.string().optional().nullable(),
  shoot_id: z.string().optional().nullable(),
  shoot_date: z.string().optional().nullable(),
  editing_due_date: z.string().optional().nullable(),
  approval_due_date: z.string().optional().nullable(),
  posting_date: z.string().optional().nullable(),
  posting_time: z.string().optional(),
  external_url: z.string().optional(),
  approval_notes: z.string().optional(),
  notes: z.string().optional(),
});

export const ShootSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  date: z.string().min(1, 'Shoot date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  location: z.string().min(2, 'Location is required'),
  shoot_type: z.string().min(2, 'Shoot type is required'),
  cameraman_id: z.string().optional().nullable(),
  model_id: z.string().optional().nullable(),
  editor_id: z.string().optional().nullable(),
  manager_id: z.string().optional().nullable(),
  reels_count: z.coerce.number().min(1).default(4),
  reel_ids: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: z.enum(['Planned', 'Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled']).default('Scheduled'),
});

export const CampaignSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  campaign_name: z.string().min(2, 'Campaign name is required'),
  platform: z.string().min(2, 'Platform is required'),
  manager_id: z.string().optional().nullable(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().nullable(),
  budget: z.coerce.number().min(0),
  spend: z.coerce.number().min(0).default(0),
  leads: z.coerce.number().min(0).default(0),
  impressions: z.coerce.number().min(0).default(0),
  reach: z.coerce.number().min(0).default(0),
  clicks: z.coerce.number().min(0).default(0),
  cpl: z.coerce.number().min(0).default(0),
  conversions: z.coerce.number().min(0).default(0),
  status: z.enum(['Planned', 'Ready', 'Running', 'Paused', 'Completed', 'Cancelled']).default('Running'),
  objective: z.string().default('Lead Generation'),
  notes: z.string().optional(),
});

export const StaffProfileSchema = z.object({
  name: z.string().min(2, 'Staff name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(7, 'Phone number is required'),
  role: z.enum([
    'Super Admin',
    'Admin / Operations',
    'Sales Person',
    'Social Media Manager',
    'Camera Man',
    'Video Editor',
    'Model',
    'Ads / Campaign Manager'
  ]),
  password: z.string().min(6).optional(),
  equipment: z.string().optional(),
  skills: z.array(z.string()).default([]),
  gender: z.string().optional(),
  instagram: z.string().optional(),
  daily_rate: z.coerce.number().min(0).default(0),
  availability_status: z.enum(['Available', 'Busy', 'On Leave']).default('Available'),
  notes: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

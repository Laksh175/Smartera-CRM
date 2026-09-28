-- ==========================================================
-- SMARTERA DIGITAL — AGENCY MANAGEMENT CRM
-- Comprehensive Relational Database Schema (PostgreSQL / Supabase)
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Staff & System Users)
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'Social Media Manager',
    status VARCHAR(20) NOT NULL DEFAULT 'Active', -- Active, Inactive
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. STAFF PROFILES (Equipment, Skills, Rates, Availability)
CREATE TABLE IF NOT EXISTS staff_profiles (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_type VARCHAR(50) NOT NULL, -- Sales Person, Camera Man, Editor, Model, Social Media Manager, Ads Manager, Admin
    equipment TEXT,
    skills TEXT[],
    gender VARCHAR(20),
    instagram VARCHAR(100),
    daily_rate NUMERIC(10, 2) DEFAULT 0,
    availability_status VARCHAR(50) DEFAULT 'Available',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PERMISSIONS & ROLE PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role VARCHAR(50) NOT NULL,
    permission_code VARCHAR(100) NOT NULL,
    PRIMARY KEY (role, permission_code)
);

-- 4. LEADS
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(100) PRIMARY KEY,
    lead_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. LEAD-1001
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    instagram VARCHAR(100),
    facebook VARCHAR(100),
    website VARCHAR(255),
    category VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    source VARCHAR(50) NOT NULL,
    interested_services TEXT[],
    estimated_budget NUMERIC(12, 2) DEFAULT 0,
    assigned_sales_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'New',
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    next_followup_date DATE,
    notes TEXT,
    is_converted BOOLEAN DEFAULT FALSE,
    converted_client_id VARCHAR(100),
    converted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. LEAD FOLLOWUPS
CREATE TABLE IF NOT EXISTS lead_followups (
    id VARCHAR(100) PRIMARY KEY,
    lead_id VARCHAR(100) NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    assigned_user_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    followup_date DATE NOT NULL,
    followup_time VARCHAR(20) DEFAULT '11:00 AM',
    type VARCHAR(50) NOT NULL,
    notes TEXT NOT NULL,
    result TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. CLI-2001
    lead_id VARCHAR(100) REFERENCES leads(id) ON DELETE SET NULL,
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    website VARCHAR(255),
    instagram VARCHAR(100),
    facebook VARCHAR(100),
    google_business_profile TEXT,
    category VARCHAR(100),
    assigned_manager_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CLIENT BUSINESS PROFILES
CREATE TABLE IF NOT EXISTS client_business_profiles (
    id VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(100) UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    business_description TEXT,
    services_products TEXT,
    target_audience TEXT,
    target_location TEXT,
    competitors TEXT,
    brand_colors VARCHAR(255),
    brand_tone VARCHAR(100),
    brand_instructions TEXT,
    notes TEXT,
    client_preferences TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. PACKAGE TEMPLATES
CREATE TABLE IF NOT EXISTS package_templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_days INT NOT NULL DEFAULT 30,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    reels_count INT NOT NULL DEFAULT 8,
    posts_count INT NOT NULL DEFAULT 8,
    stories_count INT NOT NULL DEFAULT 12,
    shoot_count INT NOT NULL DEFAULT 1,
    ads_management_included BOOLEAN DEFAULT FALSE,
    other_services TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. CLIENT PACKAGES
CREATE TABLE IF NOT EXISTS client_packages (
    id VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    package_template_id VARCHAR(100) REFERENCES package_templates(id) ON DELETE SET NULL,
    package_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    original_price NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0,
    final_price NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    assigned_manager_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    notes TEXT,
    renewal_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PACKAGE USAGE
CREATE TABLE IF NOT EXISTS package_usage (
    id VARCHAR(100) PRIMARY KEY,
    client_package_id VARCHAR(100) UNIQUE NOT NULL REFERENCES client_packages(id) ON DELETE CASCADE,
    reels_total INT NOT NULL DEFAULT 0,
    reels_completed INT NOT NULL DEFAULT 0,
    posts_total INT NOT NULL DEFAULT 0,
    posts_completed INT NOT NULL DEFAULT 0,
    stories_total INT NOT NULL DEFAULT 0,
    stories_completed INT NOT NULL DEFAULT 0,
    shoots_total INT NOT NULL DEFAULT 0,
    shoots_completed INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(100) PRIMARY KEY,
    payment_id VARCHAR(50) UNIQUE NOT NULL,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_package_id VARCHAR(100) NOT NULL REFERENCES client_packages(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'Paid',
    notes TEXT,
    recorded_by VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. TASKS
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(100) PRIMARY KEY,
    task_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_id VARCHAR(100) REFERENCES clients(id) ON DELETE SET NULL,
    assigned_to VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    created_by VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    start_date DATE,
    due_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'To Do',
    category VARCHAR(50) DEFAULT 'General',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. TASK COMMENTS
CREATE TABLE IF NOT EXISTS task_comments (
    id VARCHAR(100) PRIMARY KEY,
    task_id VARCHAR(100) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. SHOOTS
CREATE TABLE IF NOT EXISTS shoots (
    id VARCHAR(100) PRIMARY KEY,
    shoot_id VARCHAR(50) UNIQUE NOT NULL,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    location TEXT NOT NULL,
    shoot_type VARCHAR(100) NOT NULL,
    cameraman_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    model_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    editor_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    manager_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    reels_count INT DEFAULT 4,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. REELS
CREATE TABLE IF NOT EXISTS reels (
    id VARCHAR(100) PRIMARY KEY,
    reel_id VARCHAR(50) UNIQUE NOT NULL,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_package_id VARCHAR(100) REFERENCES client_packages(id) ON DELETE SET NULL,
    reel_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(100) DEFAULT 'Educational / Showcase',
    
    script_status VARCHAR(30) NOT NULL DEFAULT 'Not Started',
    shoot_status VARCHAR(30) NOT NULL DEFAULT 'Planned',
    editing_status VARCHAR(30) NOT NULL DEFAULT 'Not Started',
    client_approval_status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    posting_status VARCHAR(30) NOT NULL DEFAULT 'Not Scheduled',
    
    overall_status VARCHAR(50) NOT NULL DEFAULT 'Scripting',
    
    assigned_smm_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_editor_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_cameraman_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_model_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    
    shoot_id VARCHAR(100) REFERENCES shoots(id) ON DELETE SET NULL,
    shoot_date DATE,
    editing_due_date DATE,
    approval_due_date DATE,
    posting_date DATE,
    posting_time VARCHAR(20) DEFAULT '06:00 PM',
    
    external_url TEXT,
    approval_notes TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. POSTS
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(100) PRIMARY KEY,
    post_id VARCHAR(50) UNIQUE NOT NULL,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_package_id VARCHAR(100) REFERENCES client_packages(id) ON DELETE SET NULL,
    post_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    post_type VARCHAR(50) DEFAULT 'Carousel',
    design_status VARCHAR(30) DEFAULT 'Not Started',
    approval_status VARCHAR(30) DEFAULT 'Pending',
    posting_status VARCHAR(30) DEFAULT 'Not Scheduled',
    scheduled_date DATE,
    external_url TEXT,
    assigned_designer_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(100) PRIMARY KEY,
    campaign_id VARCHAR(50) UNIQUE NOT NULL,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    manager_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
    spend NUMERIC(12, 2) DEFAULT 0,
    leads INT DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    reach BIGINT DEFAULT 0,
    clicks INT DEFAULT 0,
    cpl NUMERIC(10, 2) DEFAULT 0,
    conversions INT DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'Running',
    objective VARCHAR(100) DEFAULT 'Lead Generation',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'info',
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    dedup_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. APP SETTINGS
CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_sales_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_client_packages_client ON client_packages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_packages_status ON client_packages(status);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_shoots_cameraman_date ON shoots(cameraman_id, date);
CREATE INDEX IF NOT EXISTS idx_shoots_model_date ON shoots(model_id, date);
CREATE INDEX IF NOT EXISTS idx_reels_client ON reels(client_id);
CREATE INDEX IF NOT EXISTS idx_reels_editor ON reels(assigned_editor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

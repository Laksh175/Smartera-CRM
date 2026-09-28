import dotenv from 'dotenv';
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
} from './seedData.js';

dotenv.config();

const { Pool } = pg;

async function syncAndSeedPostgres() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('❌ No DATABASE_URL found in .env');
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database!');

    // 1. Profiles
    console.log('Syncing profiles...');
    for (const p of SEED_PROFILES) {
      await client.query(
        `INSERT INTO profiles (id, email, password_hash, name, phone, avatar_url, role, status, last_login, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           role = EXCLUDED.role,
           phone = EXCLUDED.phone`,
        [p.id, p.email, p.password_hash, p.name, p.phone, p.avatar_url, p.role, p.status, p.last_login, p.created_at]
      );
    }

    // 2. Staff Profiles
    console.log('Syncing staff profiles...');
    for (const s of SEED_STAFF_PROFILES) {
      await client.query(
        `INSERT INTO staff_profiles (id, user_id, role_type, equipment, skills, daily_rate, availability_status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.user_id, s.role_type, s.equipment, s.skills, s.daily_rate, s.availability_status, s.notes]
      );
    }

    // 3. Package Templates
    console.log('Syncing package templates...');
    for (const pkg of SEED_PACKAGE_TEMPLATES) {
      await client.query(
        `INSERT INTO package_templates (id, name, description, duration_days, price, reels_count, posts_count, stories_count, shoot_count, ads_management_included, other_services, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [pkg.id, pkg.name, pkg.description, pkg.duration_days, pkg.price, pkg.reels_count, pkg.posts_count, pkg.stories_count, pkg.shoot_count, pkg.ads_management_included, pkg.other_services, pkg.is_active]
      );
    }

    // 4. Leads (Seed leads + divyesh babariya / kurm infotech)
    console.log('Syncing leads...');
    const allLeads = [
      ...SEED_LEADS,
      {
        id: 'lead-1789535313514',
        lead_id: 'LEAD-1006',
        name: 'divyesh babariya',
        company_name: 'kurm infotech',
        phone: '7359266926',
        whatsapp: '7359266934',
        email: 'divyeshbabariya@gmail.com',
        instagram: '@kurminfotech',
        category: 'E-Commerce',
        city: 'Mumbai',
        source: 'Other',
        interested_services: ['Reels Production', 'Meta Ads'],
        estimated_budget: 13000,
        assigned_sales_id: '11111111-1111-1111-1111-111111111111',
        status: 'New' as const,
        priority: 'Medium' as const,
        next_followup_date: '2026-09-17',
        notes: 'Cold outreach - Interested in Reels production & Meta Ads.',
        is_converted: false,
        created_at: new Date().toISOString(),
      }
    ];

    for (const l of allLeads) {
      await client.query(
        `INSERT INTO leads (id, lead_id, name, company_name, phone, whatsapp, email, instagram, category, city, source, interested_services, estimated_budget, assigned_sales_id, status, priority, next_followup_date, notes, is_converted, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           company_name = EXCLUDED.company_name,
           status = EXCLUDED.status,
           estimated_budget = EXCLUDED.estimated_budget,
           next_followup_date = EXCLUDED.next_followup_date`,
        [
          l.id, l.lead_id, l.name, l.company_name, l.phone, l.whatsapp || l.phone,
          l.email || null, l.instagram || null, l.category || 'General', l.city || 'Mumbai',
          l.source || 'Other', l.interested_services || [], l.estimated_budget || 0,
          l.assigned_sales_id || null, l.status || 'New', l.priority || 'Medium',
          l.next_followup_date || null, l.notes || null, l.is_converted || false, l.created_at
        ]
      );
    }

    // 5. Followups
    console.log('Syncing followups...');
    for (const f of SEED_FOLLOWUPS) {
      await client.query(
        `INSERT INTO lead_followups (id, lead_id, assigned_user_id, followup_date, followup_time, type, notes, result, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [f.id, f.lead_id, f.assigned_user_id, f.followup_date, f.followup_time, f.type, f.notes, f.result || null, f.status, f.created_at]
      );
    }

    // 6. Clients
    console.log('Syncing clients...');
    for (const c of SEED_CLIENTS) {
      await client.query(
        `INSERT INTO clients (id, client_id, lead_id, business_name, owner_name, contact_person, phone, whatsapp, email, address, city, website, instagram, category, assigned_manager_id, status, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         ON CONFLICT (id) DO NOTHING`,
        [c.id, c.client_id, c.lead_id, c.business_name, c.owner_name, c.contact_person, c.phone, c.whatsapp, c.email, c.address, c.city, c.website, c.instagram, c.category, c.assigned_manager_id, c.status, c.notes, c.created_at]
      );
    }

    // 7. Client Business Profiles
    console.log('Syncing client business profiles...');
    for (const bp of SEED_BUSINESS_PROFILES) {
      await client.query(
        `INSERT INTO client_business_profiles (id, client_id, business_description, services_products, target_audience, target_location, competitors, brand_colors, brand_tone, brand_instructions, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [bp.id, bp.client_id, bp.business_description, bp.services_products, bp.target_audience, bp.target_location, bp.competitors, bp.brand_colors, bp.brand_tone, bp.brand_instructions, bp.notes]
      );
    }

    // 8. Client Packages
    console.log('Syncing client packages...');
    for (const cp of SEED_CLIENT_PACKAGES) {
      await client.query(
        `INSERT INTO client_packages (id, client_id, package_template_id, package_name, start_date, end_date, original_price, discount, final_price, payment_status, assigned_manager_id, status, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO NOTHING`,
        [cp.id, cp.client_id, cp.package_template_id, cp.package_name, cp.start_date, cp.end_date, cp.original_price, cp.discount, cp.final_price, cp.payment_status, cp.assigned_manager_id, cp.status, cp.notes, cp.created_at]
      );
    }

    // 9. Package Usage
    console.log('Syncing package usage...');
    for (const u of SEED_PACKAGE_USAGE) {
      await client.query(
        `INSERT INTO package_usage (id, client_package_id, reels_total, reels_completed, posts_total, posts_completed, stories_total, stories_completed, shoots_total, shoots_completed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.client_package_id, u.reels_total, u.reels_completed, u.posts_total, u.posts_completed, u.stories_total, u.stories_completed, u.shoots_total, u.shoots_completed]
      );
    }

    // 10. Payments
    console.log('Syncing payments...');
    for (const p of SEED_PAYMENTS) {
      await client.query(
        `INSERT INTO payments (id, payment_id, client_id, client_package_id, amount, payment_date, payment_method, transaction_id, status, notes, recorded_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.payment_id, p.client_id, p.client_package_id, p.amount, p.payment_date, p.payment_method, p.transaction_id, p.status, p.notes, p.recorded_by, p.created_at]
      );
    }

    // 11. Shoots
    console.log('Syncing shoots...');
    for (const sh of SEED_SHOOTS) {
      await client.query(
        `INSERT INTO shoots (id, shoot_id, client_id, date, start_time, end_time, location, shoot_type, cameraman_id, model_id, editor_id, manager_id, reels_count, notes, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (id) DO NOTHING`,
        [sh.id, sh.shoot_id, sh.client_id, sh.date, sh.start_time, sh.end_time, sh.location, sh.shoot_type, sh.cameraman_id, sh.model_id, sh.editor_id, sh.manager_id, sh.reels_count, sh.notes, sh.status, sh.created_at]
      );
    }

    // 12. Reels
    console.log('Syncing reels...');
    for (const r of SEED_REELS) {
      await client.query(
        `INSERT INTO reels (id, reel_id, client_id, client_package_id, reel_number, title, description, content_type, script_status, shoot_status, editing_status, client_approval_status, posting_status, overall_status, assigned_smm_id, assigned_editor_id, assigned_cameraman_id, assigned_model_id, shoot_id, shoot_date, editing_due_date, approval_due_date, posting_date, posting_time, external_url, approval_notes, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
         ON CONFLICT (id) DO NOTHING`,
        [
          r.id, r.reel_id, r.client_id, r.client_package_id, r.reel_number, r.title, r.description, r.content_type,
          r.script_status, r.shoot_status, r.editing_status, r.client_approval_status, r.posting_status, r.overall_status,
          r.assigned_smm_id, r.assigned_editor_id, r.assigned_cameraman_id, r.assigned_model_id,
          r.shoot_id, r.shoot_date, r.editing_due_date, r.approval_due_date, r.posting_date, r.posting_time,
          r.external_url, r.approval_notes, r.notes, r.created_at
        ]
      );
    }

    // 13. Tasks
    console.log('Syncing tasks...');
    for (const t of SEED_TASKS) {
      await client.query(
        `INSERT INTO tasks (id, task_id, title, description, client_id, assigned_to, created_by, priority, due_date, status, category, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [t.id, t.task_id, t.title, t.description, t.client_id, t.assigned_to, t.created_by, t.priority, t.due_date, t.status, t.category, t.notes, t.created_at]
      );
    }

    // 14. Campaigns
    console.log('Syncing campaigns...');
    for (const cmp of SEED_CAMPAIGNS) {
      await client.query(
        `INSERT INTO campaigns (id, campaign_id, client_id, campaign_name, platform, manager_id, start_date, end_date, budget, spend, leads, impressions, reach, clicks, cpl, conversions, status, objective, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         ON CONFLICT (id) DO NOTHING`,
        [cmp.id, cmp.campaign_id, cmp.client_id, cmp.campaign_name, cmp.platform, cmp.manager_id, cmp.start_date, cmp.end_date, cmp.budget, cmp.spend, cmp.leads, cmp.impressions, cmp.reach, cmp.clicks, cmp.cpl, cmp.conversions, cmp.status, cmp.objective, cmp.notes, cmp.created_at]
      );
    }

    console.log('🎉 ALL TABLES SYNCED AND POPULATED IN POSTGRESQL / SUPABASE SUCCESSFULLY!');
    client.release();
  } catch (err: any) {
    console.error('❌ Database Sync Error:', err.message);
  } finally {
    await pool.end();
  }
}

syncAndSeedPostgres();

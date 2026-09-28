import type pg from 'pg';
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
} from '../types/index.js';

export async function seedPostgresIfEmpty(pool: pg.Pool) {
  try {
    const res = await pool.query('SELECT count(*) FROM profiles');
    const count = parseInt(res.rows[0].count, 10);
    if (count > 0) {
      console.log(`📦 PostgreSQL already initialized with ${count} user profiles.`);
      return;
    }

    console.log('🌱 Seeding PostgreSQL database with Smartera Agency data...');

    // 1. Profiles
    for (const p of SEED_PROFILES) {
      await pool.query(
        `INSERT INTO profiles (id, email, password_hash, name, phone, avatar_url, role, status, last_login, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.email, p.password_hash, p.name, p.phone, p.avatar_url, p.role, p.status, p.last_login, p.created_at]
      );
    }

    // 2. Staff Profiles
    for (const s of SEED_STAFF_PROFILES) {
      await pool.query(
        `INSERT INTO staff_profiles (id, user_id, role_type, equipment, skills, daily_rate, availability_status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.user_id, s.role_type, s.equipment, s.skills, s.daily_rate, s.availability_status, s.notes]
      );
    }

    // 3. Package Templates
    for (const pkg of SEED_PACKAGE_TEMPLATES) {
      await pool.query(
        `INSERT INTO package_templates (id, name, description, duration_days, price, reels_count, posts_count, stories_count, shoot_count, ads_management_included, other_services, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [pkg.id, pkg.name, pkg.description, pkg.duration_days, pkg.price, pkg.reels_count, pkg.posts_count, pkg.stories_count, pkg.shoot_count, pkg.ads_management_included, pkg.other_services, pkg.is_active]
      );
    }

    // 4. Leads (Seed leads + Divyesh Babariya kurm infotech)
    const allInitialLeads: Lead[] = [
      ...SEED_LEADS,
      {
        id: 'lead-1789534386131',
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
        status: 'New',
        priority: 'Medium',
        next_followup_date: '2026-09-17',
        notes: 'Cold call outreach for agency retainers.',
        is_converted: false,
        created_at: new Date().toISOString(),
      }
    ];

    for (const l of allInitialLeads) {
      await pool.query(
        `INSERT INTO leads (id, lead_id, name, company_name, phone, whatsapp, email, instagram, website, category, city, address, source, interested_services, estimated_budget, assigned_sales_id, status, priority, next_followup_date, notes, is_converted, converted_client_id, converted_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
         ON CONFLICT (id) DO NOTHING`,
        [
          l.id, l.lead_id, l.name, l.company_name, l.phone, l.whatsapp, l.email, l.instagram, l.website || null,
          l.category, l.city, l.address || null, l.source, l.interested_services, l.estimated_budget,
          l.assigned_sales_id, l.status, l.priority, l.next_followup_date || null, l.notes,
          l.is_converted || false, l.converted_client_id || null, l.converted_at || null, l.created_at
        ]
      );
    }

    // 5. Followups
    for (const f of SEED_FOLLOWUPS) {
      await pool.query(
        `INSERT INTO lead_followups (id, lead_id, assigned_user_id, followup_date, followup_time, type, notes, result, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [f.id, f.lead_id, f.assigned_user_id, f.followup_date, f.followup_time, f.type, f.notes, f.result || null, f.status, f.created_at]
      );
    }

    // 6. Clients
    for (const c of SEED_CLIENTS) {
      await pool.query(
        `INSERT INTO clients (id, client_id, lead_id, business_name, owner_name, contact_person, phone, whatsapp, email, address, city, website, instagram, category, assigned_manager_id, status, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         ON CONFLICT (id) DO NOTHING`,
        [c.id, c.client_id, c.lead_id, c.business_name, c.owner_name, c.contact_person, c.phone, c.whatsapp, c.email, c.address, c.city, c.website, c.instagram, c.category, c.assigned_manager_id, c.status, c.notes, c.created_at]
      );
    }

    // 7. Client Business Profiles
    for (const bp of SEED_BUSINESS_PROFILES) {
      await pool.query(
        `INSERT INTO client_business_profiles (id, client_id, business_description, services_products, target_audience, target_location, competitors, brand_colors, brand_tone, brand_instructions, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [bp.id, bp.client_id, bp.business_description, bp.services_products, bp.target_audience, bp.target_location, bp.competitors, bp.brand_colors, bp.brand_tone, bp.brand_instructions, bp.notes]
      );
    }

    // 8. Client Packages
    for (const cp of SEED_CLIENT_PACKAGES) {
      await pool.query(
        `INSERT INTO client_packages (id, client_id, package_template_id, package_name, start_date, end_date, original_price, discount, final_price, payment_status, assigned_manager_id, status, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO NOTHING`,
        [cp.id, cp.client_id, cp.package_template_id, cp.package_name, cp.start_date, cp.end_date, cp.original_price, cp.discount, cp.final_price, cp.payment_status, cp.assigned_manager_id, cp.status, cp.notes, cp.created_at]
      );
    }

    // 9. Package Usage
    for (const u of SEED_PACKAGE_USAGE) {
      await pool.query(
        `INSERT INTO package_usage (id, client_package_id, reels_total, reels_completed, posts_total, posts_completed, stories_total, stories_completed, shoots_total, shoots_completed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.client_package_id, u.reels_total, u.reels_completed, u.posts_total, u.posts_completed, u.stories_total, u.stories_completed, u.shoots_total, u.shoots_completed]
      );
    }

    // 10. Payments
    for (const p of SEED_PAYMENTS) {
      await pool.query(
        `INSERT INTO payments (id, payment_id, client_id, client_package_id, amount, payment_date, payment_method, transaction_id, status, notes, recorded_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.payment_id, p.client_id, p.client_package_id, p.amount, p.payment_date, p.payment_method, p.transaction_id, p.status, p.notes, p.recorded_by, p.created_at]
      );
    }

    // 11. Shoots
    for (const sh of SEED_SHOOTS) {
      await pool.query(
        `INSERT INTO shoots (id, shoot_id, client_id, date, start_time, end_time, location, shoot_type, cameraman_id, model_id, editor_id, manager_id, reels_count, notes, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (id) DO NOTHING`,
        [sh.id, sh.shoot_id, sh.client_id, sh.date, sh.start_time, sh.end_time, sh.location, sh.shoot_type, sh.cameraman_id, sh.model_id, sh.editor_id, sh.manager_id, sh.reels_count, sh.notes, sh.status, sh.created_at]
      );
    }

    // 12. Reels
    for (const r of SEED_REELS) {
      await pool.query(
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
    for (const t of SEED_TASKS) {
      await pool.query(
        `INSERT INTO tasks (id, task_id, title, description, client_id, assigned_to, created_by, priority, due_date, status, category, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [t.id, t.task_id, t.title, t.description, t.client_id, t.assigned_to, t.created_by, t.priority, t.due_date, t.status, t.category, t.notes, t.created_at]
      );
    }

    // 14. Campaigns
    for (const cmp of SEED_CAMPAIGNS) {
      await pool.query(
        `INSERT INTO campaigns (id, campaign_id, client_id, campaign_name, platform, manager_id, start_date, end_date, budget, spend, leads, impressions, reach, clicks, cpl, conversions, status, objective, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         ON CONFLICT (id) DO NOTHING`,
        [cmp.id, cmp.campaign_id, cmp.client_id, cmp.campaign_name, cmp.platform, cmp.manager_id, cmp.start_date, cmp.end_date, cmp.budget, cmp.spend, cmp.leads, cmp.impressions, cmp.reach, cmp.clicks, cmp.cpl, cmp.conversions, cmp.status, cmp.objective, cmp.notes, cmp.created_at]
      );
    }

    console.log('✅ PostgreSQL database seeded successfully with all initial records!');
  } catch (err: any) {
    console.error('❌ Error seeding PostgreSQL:', err.message);
  }
}

export async function loadDataFromPostgres(pool: pg.Pool) {
  try {
    const [
      profilesRes,
      staffRes,
      templatesRes,
      leadsRes,
      followupsRes,
      clientsRes,
      bpRes,
      packagesRes,
      usageRes,
      paymentsRes,
      shootsRes,
      reelsRes,
      tasksRes,
      campaignsRes,
      notifsRes,
      logsRes,
    ] = await Promise.all([
      pool.query('SELECT * FROM profiles'),
      pool.query('SELECT * FROM staff_profiles'),
      pool.query('SELECT * FROM package_templates'),
      pool.query('SELECT * FROM leads ORDER BY created_at DESC'),
      pool.query('SELECT * FROM lead_followups ORDER BY created_at DESC'),
      pool.query('SELECT * FROM clients ORDER BY created_at DESC'),
      pool.query('SELECT * FROM client_business_profiles'),
      pool.query('SELECT * FROM client_packages ORDER BY created_at DESC'),
      pool.query('SELECT * FROM package_usage'),
      pool.query('SELECT * FROM payments ORDER BY created_at DESC'),
      pool.query('SELECT * FROM shoots ORDER BY date DESC'),
      pool.query('SELECT * FROM reels ORDER BY reel_number ASC'),
      pool.query('SELECT * FROM tasks ORDER BY created_at DESC'),
      pool.query('SELECT * FROM campaigns ORDER BY created_at DESC'),
      pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'),
      pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50'),
    ]);

    const mappedLeads = leadsRes.rows.map((l: any) => ({
      ...l,
      estimated_budget: Number(l.estimated_budget) || 0,
      interested_services: Array.isArray(l.interested_services) ? l.interested_services : [],
      next_followup_date: l.next_followup_date ? (typeof l.next_followup_date === 'object' ? l.next_followup_date.toISOString().split('T')[0] : String(l.next_followup_date).split('T')[0]) : null,
      created_at: l.created_at ? new Date(l.created_at).toISOString() : new Date().toISOString(),
    }));

    const mappedPackages = packagesRes.rows.map((p: any) => ({
      ...p,
      original_price: Number(p.original_price) || 0,
      discount: Number(p.discount) || 0,
      final_price: Number(p.final_price) || 0,
      start_date: p.start_date ? (typeof p.start_date === 'object' ? p.start_date.toISOString().split('T')[0] : String(p.start_date).split('T')[0]) : '',
      end_date: p.end_date ? (typeof p.end_date === 'object' ? p.end_date.toISOString().split('T')[0] : String(p.end_date).split('T')[0]) : '',
      created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
    }));

    const mappedPayments = paymentsRes.rows.map((pay: any) => ({
      ...pay,
      amount: Number(pay.amount) || 0,
      payment_date: pay.payment_date ? (typeof pay.payment_date === 'object' ? pay.payment_date.toISOString().split('T')[0] : String(pay.payment_date).split('T')[0]) : '',
      created_at: pay.created_at ? new Date(pay.created_at).toISOString() : new Date().toISOString(),
    }));

    const mappedTemplates = templatesRes.rows.map((tpl: any) => ({
      ...tpl,
      price: Number(tpl.price) || 0,
    }));

    const mappedStaff = staffRes.rows.map((st: any) => ({
      ...st,
      daily_rate: Number(st.daily_rate) || 0,
      skills: Array.isArray(st.skills) ? st.skills : [],
    }));

    return {
      profiles: profilesRes.rows as Profile[],
      staffProfiles: mappedStaff as StaffProfile[],
      packageTemplates: mappedTemplates as PackageTemplate[],
      leads: mappedLeads as Lead[],
      followups: followupsRes.rows as LeadFollowup[],
      clients: clientsRes.rows as Client[],
      businessProfiles: bpRes.rows as ClientBusinessProfile[],
      clientPackages: mappedPackages as ClientPackage[],
      packageUsages: usageRes.rows as PackageUsage[],
      payments: mappedPayments as Payment[],
      shoots: shootsRes.rows as Shoot[],
      reels: reelsRes.rows as Reel[],
      tasks: tasksRes.rows as Task[],
      campaigns: campaignsRes.rows as Campaign[],
      notifications: notifsRes.rows as Notification[],
      activityLogs: logsRes.rows as ActivityLog[],
    };
  } catch (err: any) {
    console.error('❌ Error loading data from PostgreSQL:', err.message);
    return null;
  }
}

export async function pgInsertLead(pool: pg.Pool, l: Lead) {
  try {
    await pool.query(
      `INSERT INTO leads (id, lead_id, name, company_name, phone, whatsapp, email, instagram, facebook, website, category, city, address, source, interested_services, estimated_budget, assigned_sales_id, status, priority, next_followup_date, notes, is_converted, converted_client_id, converted_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         company_name = EXCLUDED.company_name,
         phone = EXCLUDED.phone,
         whatsapp = EXCLUDED.whatsapp,
         email = EXCLUDED.email,
         instagram = EXCLUDED.instagram,
         category = EXCLUDED.category,
         city = EXCLUDED.city,
         source = EXCLUDED.source,
         estimated_budget = EXCLUDED.estimated_budget,
         assigned_sales_id = EXCLUDED.assigned_sales_id,
         status = EXCLUDED.status,
         priority = EXCLUDED.priority,
         next_followup_date = EXCLUDED.next_followup_date,
         notes = EXCLUDED.notes,
         is_converted = EXCLUDED.is_converted,
         updated_at = CURRENT_TIMESTAMP`,
      [
        l.id, l.lead_id, l.name, l.company_name, l.phone, l.whatsapp || l.phone, l.email || null,
        l.instagram || null, l.facebook || null, l.website || null, l.category || 'General',
        l.city || 'Mumbai', l.address || null, l.source || 'Other', l.interested_services || [],
        l.estimated_budget || 0, l.assigned_sales_id || null, l.status || 'New', l.priority || 'Medium',
        l.next_followup_date || null, l.notes || null, l.is_converted || false,
        l.converted_client_id || null, l.converted_at || null, l.created_at || new Date().toISOString()
      ]
    );
  } catch (err: any) {
    console.error('❌ pgInsertLead error:', err.message);
  }
}

export async function pgUpdateLead(pool: pg.Pool, id: string, data: Partial<Lead>) {
  try {
    const keys = Object.keys(data).filter(k => k !== 'id' && k !== 'assigned_sales_name' && k !== 'followups');
    if (keys.length === 0) return;

    const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = keys.map(k => (data as any)[k]);

    await pool.query(
      `UPDATE leads SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 OR lead_id = $1`,
      [id, ...values]
    );
  } catch (err: any) {
    console.error('❌ pgUpdateLead error:', err.message);
  }
}

export async function pgDeleteLead(pool: pg.Pool, id: string) {
  try {
    await pool.query('DELETE FROM leads WHERE id = $1 OR lead_id = $1', [id]);
  } catch (err: any) {
    console.error('❌ pgDeleteLead error:', err.message);
  }
}

export async function pgInsertFollowup(pool: pg.Pool, f: LeadFollowup) {
  try {
    await pool.query(
      `INSERT INTO lead_followups (id, lead_id, assigned_user_id, followup_date, followup_time, type, notes, result, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         followup_date = EXCLUDED.followup_date,
         followup_time = EXCLUDED.followup_time,
         notes = EXCLUDED.notes,
         result = EXCLUDED.result,
         status = EXCLUDED.status`,
      [f.id, f.lead_id, f.assigned_user_id || null, f.followup_date, f.followup_time || '11:00 AM', f.type || 'Call', f.notes, f.result || null, f.status || 'Pending', f.created_at || new Date().toISOString()]
    );
  } catch (err: any) {
    console.error('❌ pgInsertFollowup error:', err.message);
  }
}

export async function pgInsertClient(pool: pg.Pool, c: Client, bp?: ClientBusinessProfile) {
  try {
    await pool.query(
      `INSERT INTO clients (id, client_id, lead_id, business_name, owner_name, contact_person, phone, whatsapp, email, address, city, website, instagram, category, assigned_manager_id, status, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       ON CONFLICT (id) DO UPDATE SET
         business_name = EXCLUDED.business_name,
         owner_name = EXCLUDED.owner_name,
         phone = EXCLUDED.phone,
         whatsapp = EXCLUDED.whatsapp,
         email = EXCLUDED.email,
         status = EXCLUDED.status,
         updated_at = CURRENT_TIMESTAMP`,
      [c.id, c.client_id, c.lead_id || null, c.business_name, c.owner_name, c.contact_person || null, c.phone, c.whatsapp || c.phone, c.email || null, c.address || null, c.city || 'Mumbai', c.website || null, c.instagram || null, c.category || 'General', c.assigned_manager_id || null, c.status || 'Active', c.notes || null, c.created_at || new Date().toISOString()]
    );

    if (bp) {
      await pool.query(
        `INSERT INTO client_business_profiles (id, client_id, business_description, services_products, target_audience, target_location, competitors, brand_colors, brand_tone, brand_instructions, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           business_description = EXCLUDED.business_description,
           services_products = EXCLUDED.services_products,
           target_audience = EXCLUDED.target_audience,
           updated_at = CURRENT_TIMESTAMP`,
        [bp.id, bp.client_id, bp.business_description || null, bp.services_products || null, bp.target_audience || null, bp.target_location || null, bp.competitors || null, bp.brand_colors || null, bp.brand_tone || null, bp.brand_instructions || null, bp.notes || null]
      );
    }
  } catch (err: any) {
    console.error('❌ pgInsertClient error:', err.message);
  }
}

export async function pgInsertClientPackage(pool: pg.Pool, cp: ClientPackage, u?: PackageUsage) {
  try {
    await pool.query(
      `INSERT INTO client_packages (id, client_id, package_template_id, package_name, start_date, end_date, original_price, discount, final_price, payment_status, assigned_manager_id, status, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         payment_status = EXCLUDED.payment_status,
         status = EXCLUDED.status,
         updated_at = CURRENT_TIMESTAMP`,
      [cp.id, cp.client_id, cp.package_template_id || null, cp.package_name, cp.start_date, cp.end_date, cp.original_price, cp.discount || 0, cp.final_price, cp.payment_status || 'Pending', cp.assigned_manager_id || null, cp.status || 'Active', cp.notes || null, cp.created_at || new Date().toISOString()]
    );

    if (u) {
      await pool.query(
        `INSERT INTO package_usage (id, client_package_id, reels_total, reels_completed, posts_total, posts_completed, stories_total, stories_completed, shoots_total, shoots_completed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           reels_completed = EXCLUDED.reels_completed,
           posts_completed = EXCLUDED.posts_completed,
           shoots_completed = EXCLUDED.shoots_completed,
           updated_at = CURRENT_TIMESTAMP`,
        [u.id, u.client_package_id, u.reels_total, u.reels_completed, u.posts_total, u.posts_completed, u.stories_total, u.stories_completed, u.shoots_total, u.shoots_completed]
      );
    }
  } catch (err: any) {
    console.error('❌ pgInsertClientPackage error:', err.message);
  }
}

export async function pgInsertPayment(pool: pg.Pool, p: Payment) {
  try {
    await pool.query(
      `INSERT INTO payments (id, payment_id, client_id, client_package_id, amount, payment_date, payment_method, transaction_id, status, notes, recorded_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         amount = EXCLUDED.amount,
         status = EXCLUDED.status`,
      [p.id, p.payment_id, p.client_id, p.client_package_id, p.amount, p.payment_date, p.payment_method, p.transaction_id || null, p.status || 'Paid', p.notes || null, p.recorded_by || null, p.created_at || new Date().toISOString()]
    );
  } catch (err: any) {
    console.error('❌ pgInsertPayment error:', err.message);
  }
}

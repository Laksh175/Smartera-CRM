import { db } from '../db/connection.js';
import type { Lead, LeadFollowup, Client, ClientPackage } from '../types/index.js';

export class LeadsService {
  static getLeads(filter?: { status?: string; salesId?: string; search?: string }) {
    return db.getAllLeads(filter);
  }

  static getLeadById(id: string) {
    const lead = db.getLeadById(id);
    if (!lead) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  static createLead(data: any, createdByUserId?: string) {
    const nextNum = db.leads.length + 1001;
    const leadIdStr = `LEAD-${nextNum}`;
    const id = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newLead: Lead = {
      id,
      lead_id: leadIdStr,
      name: data.name,
      company_name: data.company_name,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      email: data.email || '',
      instagram: data.instagram,
      facebook: data.facebook,
      website: data.website,
      category: data.category || 'General',
      city: data.city || 'Mumbai',
      address: data.address,
      source: data.source || 'Instagram',
      interested_services: data.interested_services || [],
      estimated_budget: Number(data.estimated_budget) || 0,
      assigned_sales_id: data.assigned_sales_id || createdByUserId || '22222222-2222-2222-2222-222222222222',
      status: data.status || 'New',
      priority: data.priority || 'Medium',
      next_followup_date: data.next_followup_date || null,
      notes: data.notes,
      is_converted: false,
      created_at: new Date().toISOString(),
    };

    db.leads.unshift(newLead);
    db.saveLead(newLead).catch((err) => console.error('Error saving lead to PG:', err));

    // If next_followup_date is provided, create initial followup
    if (data.next_followup_date) {
      this.addFollowup({
        lead_id: id,
        assigned_user_id: newLead.assigned_sales_id,
        followup_date: data.next_followup_date,
        followup_time: '11:00 AM',
        type: 'Call',
        notes: 'Initial outreach & qualification call.',
        status: 'Pending',
      });
    }

    // Send notification to assigned sales rep
    if (newLead.assigned_sales_id) {
      db.createNotification({
        user_id: newLead.assigned_sales_id,
        title: `🎯 New Lead Assigned: ${newLead.company_name}`,
        message: `${newLead.name} (${newLead.phone}) assigned for follow-up. Source: ${newLead.source}.`,
        type: 'lead',
        priority: 'info',
        link: `/leads?leadId=${id}`,
      });
    }

    return db.getLeadById(id);
  }

  static updateLead(id: string, data: any) {
    const lead = db.leads.find((l) => l.id === id || l.lead_id === id);
    if (!lead) {
      throw new Error(`Lead with ID ${id} not found`);
    }

    Object.assign(lead, data, { updated_at: new Date().toISOString() });
    db.modifyLead(lead.id, data).catch((err) => console.error('Error updating lead in PG:', err));
    return db.getLeadById(lead.id);
  }

  static deleteLead(id: string) {
    const index = db.leads.findIndex((l) => l.id === id || l.lead_id === id);
    if (index === -1) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    const [deleted] = db.leads.splice(index, 1);
    db.removeLead(deleted.id).catch((err) => console.error('Error deleting lead in PG:', err));
    return deleted;
  }

  static addFollowup(data: any) {
    const lead = db.leads.find((l) => l.id === data.lead_id || l.lead_id === data.lead_id);
    if (!lead) {
      throw new Error(`Lead ${data.lead_id} not found`);
    }

    const fupId = `fup-${Date.now()}`;
    const newFollowup: LeadFollowup = {
      id: fupId,
      lead_id: lead.id,
      assigned_user_id: data.assigned_user_id || lead.assigned_sales_id,
      followup_date: data.followup_date,
      followup_time: data.followup_time || '11:00 AM',
      type: data.type || 'Call',
      notes: data.notes,
      result: data.result || '',
      status: data.status || 'Pending',
      created_at: new Date().toISOString(),
    };

    db.followups.unshift(newFollowup);
    db.saveFollowup(newFollowup).catch((err) => console.error('Error saving followup in PG:', err));

    // Update lead's next follow-up date
    if (data.status === 'Pending') {
      lead.next_followup_date = data.followup_date;
      lead.updated_at = new Date().toISOString();
      db.modifyLead(lead.id, { next_followup_date: data.followup_date });
    }

    return newFollowup;
  }

  static updateFollowup(followupId: string, data: any) {
    const fup = db.followups.find((f) => f.id === followupId);
    if (!fup) {
      throw new Error(`Followup ${followupId} not found`);
    }
    Object.assign(fup, data);
    db.saveFollowup(fup).catch((err) => console.error('Error updating followup in PG:', err));
    return fup;
  }

  // LEAD → CLIENT CONVERSION ENGINE
  static convertToClient(params: {
    lead_id: string;
    package_template_id?: string | null;
    package_name?: string;
    start_date?: string;
    original_price?: number;
    discount?: number;
    assigned_manager_id?: string | null;
    initial_payment?: {
      amount: number;
      payment_method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
      transaction_id?: string;
      notes?: string;
    };
  }, recordedByUserId?: string) {
    const lead = db.leads.find((l) => l.id === params.lead_id || l.lead_id === params.lead_id);
    if (!lead) {
      throw new Error(`Lead ${params.lead_id} not found`);
    }

    if (lead.is_converted) {
      throw new Error(`This lead has already been converted into Client ID ${lead.converted_client_id}`);
    }

    const nextCliNum = db.clients.length + 2001;
    const clientIdStr = `CLI-${nextCliNum}`;
    const newClientId = `cli-${Date.now()}`;

    // 1. Create Client record
    const newClient: Client = {
      id: newClientId,
      client_id: clientIdStr,
      lead_id: lead.id,
      business_name: lead.company_name,
      owner_name: lead.name,
      contact_person: lead.name,
      phone: lead.phone,
      whatsapp: lead.whatsapp || lead.phone,
      email: lead.email,
      address: lead.address,
      city: lead.city,
      website: lead.website,
      instagram: lead.instagram,
      facebook: lead.facebook,
      category: lead.category,
      assigned_manager_id: params.assigned_manager_id || '66666666-6666-6666-6666-666666666666', // Neha SMM
      status: 'Active',
      notes: `Converted from Lead ${lead.lead_id} (Source: ${lead.source}). Original notes: ${lead.notes || 'None'}`,
      created_at: new Date().toISOString(),
    };

    db.clients.unshift(newClient);

    // 2. Create Initial Client Business Profile
    const businessProfile = {
      id: `bp-${Date.now()}`,
      client_id: newClientId,
      business_description: `Business services for ${lead.company_name}`,
      services_products: lead.interested_services.join(', '),
      target_audience: 'Primary target demographic',
      target_location: lead.city || 'Mumbai',
      competitors: 'Local Category Competitors',
      brand_colors: '#4F46E5, #0EA5E9, #1E293B',
      brand_tone: 'Modern, Engaging & Professional',
      notes: 'Initial business profile generated from lead conversion.',
    };
    db.businessProfiles.push(businessProfile);
    db.saveClient(newClient, businessProfile).catch((err) => console.error('Error saving client in PG:', err));

    // 3. Mark Lead as Won & Converted
    lead.is_converted = true;
    lead.status = 'Won';
    lead.converted_client_id = newClientId;
    lead.converted_at = new Date().toISOString();
    lead.updated_at = new Date().toISOString();
    db.modifyLead(lead.id, {
      is_converted: true,
      status: 'Won',
      converted_client_id: newClientId,
      converted_at: lead.converted_at,
    });

    let createdPackage: ClientPackage | undefined;

    // 4. Create Package if requested
    if (params.package_template_id || params.package_name) {
      const template = db.packageTemplates.find((pt) => pt.id === params.package_template_id);
      const pkgId = `cpkg-${Date.now()}`;
      const startDate = params.start_date || new Date().toISOString().split('T')[0];
      const duration = template?.duration_days || 30;
      
      const endDateObj = new Date(startDate);
      endDateObj.setDate(endDateObj.getDate() + duration);
      const endDate = endDateObj.toISOString().split('T')[0];

      const origPrice = Number(params.original_price ?? template?.price ?? 25000);
      const discount = Number(params.discount ?? 0);
      const finalPrice = Math.max(0, origPrice - discount);

      createdPackage = {
        id: pkgId,
        client_id: newClientId,
        package_template_id: template?.id,
        package_name: params.package_name || template?.name || 'Custom Agency Package',
        start_date: startDate,
        end_date: endDate,
        original_price: origPrice,
        discount,
        final_price: finalPrice,
        payment_status: 'Pending',
        assigned_manager_id: newClient.assigned_manager_id,
        status: 'Active',
        notes: `Initial package upon conversion from ${lead.lead_id}`,
        created_at: new Date().toISOString(),
      };

      db.clientPackages.unshift(createdPackage);

      // Create Package Usage record
      const usage = {
        id: `pu-${Date.now()}`,
        client_package_id: pkgId,
        reels_total: template?.reels_count || 8,
        reels_completed: 0,
        posts_total: template?.posts_count || 8,
        posts_completed: 0,
        stories_total: template?.stories_count || 12,
        stories_completed: 0,
        shoots_total: template?.shoot_count || 1,
        shoots_completed: 0,
      };
      db.packageUsages.push(usage);
      db.saveClientPackage(createdPackage, usage).catch((err) => console.error('Error saving client package in PG:', err));
    }

    // 5. Record Initial Payment if provided
    let createdPayment: any = undefined;
    if (params.initial_payment && params.initial_payment.amount > 0 && createdPackage) {
      const payId = `pay-${Date.now()}`;
      const paymentNum = db.payments.length + 3001;
      
      createdPayment = {
        id: payId,
        payment_id: `PAY-${paymentNum}`,
        client_id: newClientId,
        client_package_id: createdPackage.id,
        amount: Number(params.initial_payment.amount),
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: params.initial_payment.payment_method,
        transaction_id: params.initial_payment.transaction_id,
        status: 'Paid' as const,
        notes: params.initial_payment.notes || 'Initial advance payment on conversion',
        recorded_by: recordedByUserId,
        created_at: new Date().toISOString(),
      };

      db.payments.unshift(createdPayment);
      db.savePayment(createdPayment).catch((err) => console.error('Error saving payment in PG:', err));

      // Update package payment status
      if (createdPayment.amount >= createdPackage.final_price) {
        createdPackage.payment_status = 'Paid';
      } else {
        createdPackage.payment_status = 'Partial';
      }
      db.saveClientPackage(createdPackage);
    }

    // 6. Log system activity
    db.logActivity({
      user_id: recordedByUserId,
      user_name: 'Agency User',
      action: 'Converted Lead to Client',
      entity: 'Client',
      entity_id: newClientId,
      new_value: {
        client_name: newClient.business_name,
        lead_id: lead.lead_id,
        package: createdPackage?.package_name,
        initial_payment: createdPayment?.amount,
      },
    });

    // 7. Send notification to Account Manager
    if (newClient.assigned_manager_id) {
      db.createNotification({
        user_id: newClient.assigned_manager_id,
        title: `🚀 New Client Onboarded: ${newClient.business_name}`,
        message: `${lead.name} has signed on! Package: ${createdPackage?.package_name || 'Standard'}. Plan first shoot & scripting.`,
        type: 'package',
        priority: 'urgent',
        link: `/clients/${newClientId}`,
      });
    }

    return {
      lead: db.getLeadById(lead.id),
      client: db.getClientById(newClientId),
      package: createdPackage ? db.enrichClientPackage(createdPackage) : undefined,
      payment: createdPayment,
    };
  }
}

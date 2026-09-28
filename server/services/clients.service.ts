import { db } from '../db/connection.js';
import type { Client, ClientBusinessProfile } from '../types/index.js';

export class ClientsService {
  static getClients(filter?: { status?: string; managerId?: string; search?: string }) {
    return db.getAllClients(filter);
  }

  static getClientById(id: string) {
    const client = db.getClientById(id);
    if (!client) {
      throw new Error(`Client with ID ${id} not found`);
    }
    return client;
  }

  static createClient(data: any) {
    const nextCliNum = db.clients.length + 2001;
    const clientIdStr = `CLI-${nextCliNum}`;
    const id = `cli-${Date.now()}`;

    const newClient: Client = {
      id,
      client_id: clientIdStr,
      business_name: data.business_name,
      owner_name: data.owner_name,
      contact_person: data.contact_person || data.owner_name,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      email: data.email || '',
      address: data.address,
      city: data.city || 'Mumbai',
      website: data.website,
      instagram: data.instagram,
      facebook: data.facebook,
      google_business_profile: data.google_business_profile,
      category: data.category || 'General',
      assigned_manager_id: data.assigned_manager_id || '66666666-6666-6666-6666-666666666666',
      status: data.status || 'Active',
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    db.clients.unshift(newClient);

    // Create empty business profile
    db.businessProfiles.push({
      id: `bp-${Date.now()}`,
      client_id: id,
      business_description: '',
      brand_colors: '#4F46E5',
      brand_tone: 'Professional & Modern',
      notes: 'Initial business profile created.',
    });

    return db.getClientById(id);
  }

  static updateClient(id: string, data: any) {
    const client = db.clients.find((c) => c.id === id || c.client_id === id);
    if (!client) {
      throw new Error(`Client with ID ${id} not found`);
    }

    Object.assign(client, data, { updated_at: new Date().toISOString() });
    return db.getClientById(client.id);
  }

  static updateBusinessProfile(clientId: string, data: Partial<ClientBusinessProfile>) {
    let profile = db.businessProfiles.find((bp) => bp.client_id === clientId);
    if (!profile) {
      profile = {
        id: `bp-${Date.now()}`,
        client_id: clientId,
        ...data,
      };
      db.businessProfiles.push(profile);
    } else {
      Object.assign(profile, data, { updated_at: new Date().toISOString() });
    }
    return profile;
  }

  static getClientWorkBoard(clientId: string) {
    const client = db.getClientById(clientId);
    if (!client) {
      throw new Error(`Client ${clientId} not found`);
    }

    const clientReels = db.reels.filter((r) => r.client_id === client.id);
    const activePkg = client.active_package;

    const totalTargetReels = activePkg?.usage?.reels_total || (clientReels.length > 0 ? clientReels.length : 8);

    const postedCount = clientReels.filter((r) => r.posting_status === 'Posted').length;
    const editingCount = clientReels.filter((r) => r.editing_status === 'In Progress' || r.editing_status === 'Internal Review' || r.editing_status === 'Revision Required').length;
    const shootScheduledCount = clientReels.filter((r) => r.shoot_status === 'Scheduled' && r.editing_status === 'Not Started').length;
    const scriptCount = clientReels.filter((r) => (r.script_status === 'In Progress' || r.script_status === 'Ready') && r.shoot_status !== 'Completed').length;
    const approvalPendingCount = clientReels.filter((r) => r.client_approval_status === 'Pending' || r.client_approval_status === 'Changes Requested').length;
    const pendingCount = Math.max(0, totalTargetReels - postedCount - editingCount - shootScheduledCount - scriptCount);

    const completionPercentage = totalTargetReels > 0 ? Math.round((postedCount / totalTargetReels) * 100) : 0;

    return {
      client_id: client.id,
      client_name: client.business_name,
      package_name: activePkg?.package_name || 'Active Package',
      total_target_reels: totalTargetReels,
      posted: postedCount,
      editing: editingCount,
      shoot_scheduled: shootScheduledCount,
      scripting: scriptCount,
      approval_pending: approvalPendingCount,
      pending: pendingCount,
      completion_percentage: completionPercentage,
      reels: clientReels,
    };
  }
}

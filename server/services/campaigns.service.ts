import { db } from '../db/connection.js';
import type { Campaign } from '../types/index.js';

export class CampaignsService {
  static getCampaigns() {
    return db.getAllCampaigns();
  }

  static getCampaignById(id: string) {
    const campaign = db.getAllCampaigns().find((c) => c.id === id || c.campaign_id === id);
    if (!campaign) {
      throw new Error(`Campaign ${id} not found`);
    }
    return campaign;
  }

  static createCampaign(data: any) {
    const nextNum = db.campaigns.length + 7001;
    const campaignIdStr = `CMP-${nextNum}`;
    const id = `cmp-${Date.now()}`;

    const budget = Number(data.budget) || 0;
    const spend = Number(data.spend) || 0;
    const leads = Number(data.leads) || 0;
    const cpl = leads > 0 ? Number((spend / leads).toFixed(2)) : 0;

    const newCampaign: Campaign = {
      id,
      campaign_id: campaignIdStr,
      client_id: data.client_id,
      campaign_name: data.campaign_name,
      platform: data.platform || 'Meta Ads',
      manager_id: data.manager_id || '77777777-7777-7777-7777-777777777777',
      start_date: data.start_date,
      end_date: data.end_date,
      budget,
      spend,
      leads,
      impressions: Number(data.impressions) || 0,
      reach: Number(data.reach) || 0,
      clicks: Number(data.clicks) || 0,
      cpl,
      conversions: Number(data.conversions) || 0,
      status: data.status || 'Running',
      objective: data.objective || 'Lead Generation',
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    db.campaigns.unshift(newCampaign);
    return db.getAllCampaigns().find((c) => c.id === id);
  }

  static updateCampaign(id: string, data: any) {
    const campaign = db.campaigns.find((c) => c.id === id || c.campaign_id === id);
    if (!campaign) {
      throw new Error(`Campaign ${id} not found`);
    }

    const spend = data.spend !== undefined ? Number(data.spend) : campaign.spend;
    const leads = data.leads !== undefined ? Number(data.leads) : campaign.leads;
    const cpl = leads > 0 ? Number((spend / leads).toFixed(2)) : 0;

    Object.assign(campaign, data, { spend, leads, cpl });
    return db.getAllCampaigns().find((c) => c.id === campaign.id);
  }

  static deleteCampaign(id: string) {
    const index = db.campaigns.findIndex((c) => c.id === id || c.campaign_id === id);
    if (index === -1) {
      throw new Error(`Campaign ${id} not found`);
    }
    const [deleted] = db.campaigns.splice(index, 1);
    return deleted;
  }
}

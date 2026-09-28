import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Megaphone,
  Plus,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Eye,
  MousePointer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';
import type { Campaign } from '../types';

export const CampaignsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    client_id: '',
    campaign_name: '',
    platform: 'Meta Ads',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    budget: 35000,
    spend: 0,
    leads: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    status: 'Running' as const,
    objective: 'Lead Generation',
    notes: '',
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.getCampaigns(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.getClients(),
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data: any) => api.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setCreateModalOpen(false);
    },
  });

  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget), 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + Number(c.spend), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + Number(c.leads), 0);
  const avgCPL = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-brand-600" />
            Paid Ads & Performance Campaigns
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor Meta Ads & Google campaign budgets, spend pacing, lead volumes, and cost per lead (CPL).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (clients.length > 0) {
              setCampaignForm({ ...campaignForm, client_id: clients[0].id });
            }
            setCreateModalOpen(true);
          }}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* 4 Performance KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Ad Spend"
          value={`₹${totalSpend.toLocaleString()}`}
          subtitle={`₹${totalBudget.toLocaleString()} Total Budget`}
          icon={DollarSign}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
        />

        <StatCard
          title="Leads Generated"
          value={totalLeads.toLocaleString()}
          subtitle="Inbound prospect inquiries"
          icon={Users}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <StatCard
          title="Average Cost Per Lead"
          value={`₹${avgCPL}`}
          subtitle="Target threshold < ₹250"
          icon={Target}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />

        <StatCard
          title="Active Campaigns"
          value={campaigns.filter((c) => c.status === 'Running').length}
          subtitle={`${campaigns.length} Total Campaigns`}
          icon={Megaphone}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Campaigns Table */}
      <div className="card-base p-4 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Active Campaign Performance ({campaigns.length})</h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Campaign & Client</th>
                <th className="px-4 py-3.5">Platform</th>
                <th className="px-4 py-3.5">Budget</th>
                <th className="px-4 py-3.5">Spend</th>
                <th className="px-4 py-3.5">Leads</th>
                <th className="px-4 py-3.5">CPL</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <span className="font-bold text-slate-900">{c.campaign_name}</span>
                      <p className="text-slate-500 font-medium mt-0.5">{c.client_name} • {c.objective}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-700">{c.platform}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">₹{c.budget.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-bold text-brand-600">₹{c.spend.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-700">{c.leads}</td>
                  <td className="px-4 py-3.5 font-black text-indigo-700">₹{c.cpl}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={c.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Launch New Paid Ad Campaign"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createCampaignMutation.mutate(campaignForm);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 mb-1">Client *</label>
            <select
              required
              value={campaignForm.client_id}
              onChange={(e) => setCampaignForm({ ...campaignForm, client_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="">Select client...</option>
              {clients.map((cli) => (
                <option key={cli.id} value={cli.id}>
                  {cli.business_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Campaign Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Autumn Bridal Lookbook Meta Funnel"
              value={campaignForm.campaign_name}
              onChange={(e) => setCampaignForm({ ...campaignForm, campaign_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Platform</label>
              <select
                value={campaignForm.platform}
                onChange={(e) => setCampaignForm({ ...campaignForm, platform: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Meta Ads">Meta Ads (Instagram / Facebook)</option>
                <option value="Google Search">Google Search</option>
                <option value="Google Performance Max">Google Performance Max</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Monthly Budget (₹) *</label>
              <input
                type="number"
                required
                value={campaignForm.budget}
                onChange={(e) => setCampaignForm({ ...campaignForm, budget: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCampaignMutation.isPending}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm"
            >
              {createCampaignMutation.isPending ? 'Launching...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  CreditCard,
  Edit2,
  Film,
  Video,
  Share2
} from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import type { PackageTemplate, ClientPackage } from '../types';

export const PackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'client-packages' | 'templates'>('client-packages');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    duration_days: 30,
    price: 35000,
    reels_count: 8,
    posts_count: 8,
    stories_count: 12,
    shoot_count: 1,
    ads_management_included: false,
    other_services: 'Monthly Performance Strategy Review',
  });

  const { data: clientPackages = [], isLoading: loadingPackages } = useQuery({
    queryKey: ['client-packages'],
    queryFn: () => api.getClientPackages(),
  });

  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['package-templates'],
    queryFn: () => api.getPackageTemplates(),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => api.createPackageTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package-templates'] });
      setTemplateModalOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600" />
            Package Management & Retainers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor client package lifecycles, remaining balances, delivery quotas, and configure agency tier templates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTemplateModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-base p-1.5 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('client-packages')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'client-packages'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Client Packages ({clientPackages.length})
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'templates'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Package Templates ({templates.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE CLIENT PACKAGES */}
      {activeTab === 'client-packages' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientPackages.map((pkg) => {
              const isExpiring = pkg.status === 'Expiring' || (pkg.days_remaining !== undefined && pkg.days_remaining <= 7);
              return (
                <div
                  key={pkg.id}
                  onClick={() => navigate(`/clients/${pkg.client_id}`)}
                  className="card-base p-5 card-hover cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-brand-600">{pkg.client_name}</span>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={pkg.status} size="sm" />
                        <StatusBadge status={pkg.payment_status} size="sm" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-brand-600 transition-colors">
                      {pkg.package_name}
                    </h3>

                    <div className="mt-3 text-xs text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Timeline:</span>
                        <span className="font-semibold text-slate-700">{pkg.start_date} to {pkg.end_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contract Value:</span>
                        <span className="font-bold text-slate-900">₹{pkg.final_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Paid:</span>
                        <span className="font-bold text-emerald-600">₹{(pkg.total_paid || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining Balance:</span>
                        <span className="font-bold text-rose-600">₹{(pkg.remaining_balance || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Expiry Banner */}
                    <div className={`mt-4 p-2.5 rounded-lg text-xs flex items-center justify-between ${
                      isExpiring ? 'bg-amber-50 border border-amber-200 text-amber-900 font-bold' : 'bg-slate-50 text-slate-600'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {pkg.days_remaining !== undefined && pkg.days_remaining >= 0
                          ? `${pkg.days_remaining} Days to Expiry`
                          : 'Expired'}
                      </span>
                      {isExpiring && (
                        <span className="text-[10px] uppercase font-black tracking-wider text-amber-700">
                          Renewal Due
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Manage Retainer</span>
                    <span className="font-bold text-brand-600 group-hover:underline flex items-center gap-0.5">
                      Client Profile <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PACKAGE TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="card-base p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">{tpl.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {tpl.duration_days} Days
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed min-h-[36px]">{tpl.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-2xl font-black text-slate-900">₹{tpl.price.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                </div>

                {/* Quotas */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Film className="w-4 h-4 text-brand-600" />
                    <span className="font-bold">{tpl.reels_count} Cinematic Reels</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>{tpl.posts_count} Graphics / Carousels</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Video className="w-4 h-4 text-amber-600" />
                    <span className="font-bold">{tpl.shoot_count} Dedicated Shoot Day{tpl.shoot_count > 1 ? 's' : ''}</span>
                  </div>
                  {tpl.ads_management_included && (
                    <div className="flex items-center gap-2 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Meta Ads Setup & Optimization</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/leads')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
              >
                Use in Lead Conversion
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PACKAGE TEMPLATE MODAL */}
      <Modal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title="Create Agency Package Template"
        subtitle="Define standard monthly deliverable quotas, pricing, and services."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createTemplateMutation.mutate(templateForm);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 mb-1">Package Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Creator Growth Matrix"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Ideal for..."
              value={templateForm.description}
              onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Monthly Price (₹) *</label>
              <input
                type="number"
                required
                value={templateForm.price}
                onChange={(e) => setTemplateForm({ ...templateForm, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration (Days)</label>
              <input
                type="number"
                value={templateForm.duration_days}
                onChange={(e) => setTemplateForm({ ...templateForm, duration_days: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reels</label>
              <input
                type="number"
                value={templateForm.reels_count}
                onChange={(e) => setTemplateForm({ ...templateForm, reels_count: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Posts</label>
              <input
                type="number"
                value={templateForm.posts_count}
                onChange={(e) => setTemplateForm({ ...templateForm, posts_count: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Stories</label>
              <input
                type="number"
                value={templateForm.stories_count}
                onChange={(e) => setTemplateForm({ ...templateForm, stories_count: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Shoots</label>
              <input
                type="number"
                value={templateForm.shoot_count}
                onChange={(e) => setTemplateForm({ ...templateForm, shoot_count: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="ads_mgmt"
              checked={templateForm.ads_management_included}
              onChange={(e) => setTemplateForm({ ...templateForm, ads_management_included: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <label htmlFor="ads_mgmt" className="font-bold text-slate-800">
              Includes Paid Meta Ads Management
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setTemplateModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTemplateMutation.isPending}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm"
            >
              {createTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Layers,
  CreditCard,
  Film,
  Video,
  CheckSquare,
  Megaphone,
  Palette,
  FileText,
  Clock,
  Plus,
  Edit2,
  DollarSign,
  Calendar,
  Sparkles,
  Phone,
  Instagram,
  Globe,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import type { Client, ClientPackage, Payment, Reel, Shoot, Campaign, Task } from '../types';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'workboard' | 'business' | 'packages' | 'payments' | 'content' | 'shoots' | 'campaigns' | 'tasks'
  >('overview');

  // Modals
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [editBusinessProfileOpen, setEditBusinessProfileOpen] = useState(false);

  // Forms
  const [paymentForm, setPaymentForm] = useState({
    amount: 10000,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'UPI' as const,
    transaction_id: '',
    notes: '',
  });

  const [renewForm, setRenewForm] = useState({
    start_date: new Date().toISOString().split('T')[0],
    duration_days: 30,
    discount: 0,
    notes: 'Monthly retainer renewal',
  });

  const [businessForm, setBusinessForm] = useState({
    business_description: '',
    services_products: '',
    target_audience: '',
    target_location: '',
    competitors: '',
    brand_colors: '',
    brand_tone: '',
    brand_instructions: '',
    notes: '',
  });

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => api.getClientById(id!),
    enabled: !!id,
  });

  const { data: clientWorkBoard } = useQuery({
    queryKey: ['client-workboard', id],
    queryFn: () => api.getClientWorkBoard(id!),
    enabled: !!id,
  });

  const { data: reels = [] } = useQuery({
    queryKey: ['reels', id],
    queryFn: () => api.getReels({ clientId: id }),
    enabled: !!id,
  });

  const { data: shoots = [] } = useQuery({
    queryKey: ['shoots'],
    queryFn: () => api.getShoots(),
    select: (list) => list.filter((s) => s.client_id === id),
    enabled: !!id,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => api.getTasks({ clientId: id }),
    enabled: !!id,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.getCampaigns(),
    select: (list) => list.filter((c) => c.client_id === id),
    enabled: !!id,
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data: any) => api.recordPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setRecordPaymentOpen(false);
    },
  });

  const renewPackageMutation = useMutation({
    mutationFn: (params: { id: string; data: any }) => api.renewPackage(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setRenewModalOpen(false);
    },
  });

  const updateBusinessProfileMutation = useMutation({
    mutationFn: (data: any) => api.updateBusinessProfile(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      setEditBusinessProfileOpen(false);
    },
  });

  if (isLoading || !client) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">Loading client account...</div>
    );
  }

  const activePackage = client.active_package;
  const businessProfile = client.business_profile;
  const isExpiringSoon = activePackage?.status === 'Expiring' || (activePackage?.days_remaining !== undefined && activePackage.days_remaining <= 7);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Briefcase },
    { id: 'workboard', label: 'Monthly Work Board', icon: Layers },
    { id: 'business', label: 'Brand & Business Profile', icon: Palette },
    { id: 'packages', label: 'Packages & Renewals', icon: Layers },
    { id: 'payments', label: 'Payments Ledger', icon: CreditCard },
    { id: 'content', label: 'Reels Workflow', icon: Film },
    { id: 'shoots', label: 'Shoots', icon: Video },
    { id: 'campaigns', label: 'Ad Campaigns', icon: Megaphone },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Top Client Header */}
      <div className="card-base p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">{client.client_id}</span>
            <StatusBadge status={client.status} size="sm" />
            {isExpiringSoon && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Expiry Approaching ({activePackage?.days_remaining}d)
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-sans tracking-tight">
            {client.business_name}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
            <span>Owner: <strong className="text-slate-800">{client.owner_name}</strong></span>
            <span>Category: <strong className="text-slate-800">{client.category}</strong></span>
            <span>City: <strong className="text-slate-800">{client.city}</strong></span>
            <span>Account Manager: <strong className="text-brand-600">{client.assigned_manager_name || 'Neha Gupta'}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {activePackage && (
            <button
              type="button"
              onClick={() => {
                setRenewForm({
                  start_date: activePackage.end_date,
                  duration_days: 30,
                  discount: 0,
                  notes: 'Retainer renewal',
                });
                setRenewModalOpen(true);
              }}
              className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all border border-indigo-200 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Renew Package
            </button>
          )}

          <button
            type="button"
            onClick={() => setRecordPaymentOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card-base p-1.5 flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Active Package Card */}
            <div className="card-base p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Retainer Package</span>
              <h4 className="text-lg font-black text-slate-900">{activePackage?.package_name || 'No Active Package'}</h4>
              <div className="text-xs text-slate-600 space-y-1 pt-1">
                <div className="flex justify-between">
                  <span>Period:</span>
                  <span className="font-semibold">{activePackage?.start_date} to {activePackage?.end_date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Remaining:</span>
                  <span className="font-bold text-brand-600">{activePackage?.days_remaining ?? 0} days remaining</span>
                </div>
              </div>
            </div>

            {/* Financial Ledger Card */}
            <div className="card-base p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Package Billing & Payments</span>
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-black text-slate-900">₹{(activePackage?.total_paid || 0).toLocaleString()}</h4>
                <span className="text-xs text-slate-400">/ ₹{(activePackage?.final_price || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">Remaining Balance:</span>
                <span className="font-bold text-rose-600">₹{(activePackage?.remaining_balance || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Monthly Work Progress Card */}
            <div className="card-base p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Work Completion</span>
              <div className="flex items-baseline justify-between">
                <h4 className="text-2xl font-black text-brand-600">
                  {client.work_progress?.completed_reels || 0} / {client.work_progress?.total_reels || 8} Reels
                </h4>
                <span className="text-xs font-bold text-slate-500">
                  {client.work_progress?.total_reels ? Math.round(((client.work_progress.completed_reels) / client.work_progress.total_reels) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-brand-600 h-full rounded-full"
                  style={{
                    width: `${
                      client.work_progress?.total_reels
                        ? Math.min(100, Math.round(((client.work_progress.completed_reels) / client.work_progress.total_reels) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Contact & Business Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-base p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-600" />
                Contact Information
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <p>Phone: <strong className="text-slate-800">{client.phone}</strong></p>
                <p>WhatsApp: <strong className="text-slate-800">{client.whatsapp || client.phone}</strong></p>
                <p>Email: <strong className="text-slate-800">{client.email || 'None'}</strong></p>
                <p>Address: <strong className="text-slate-800">{client.address || 'Bandra, Mumbai'}</strong></p>
              </div>
            </div>

            <div className="card-base p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-brand-600" />
                Brand Identity Snapshot
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <p>Brand Tone: <strong className="text-slate-800">{businessProfile?.brand_tone || 'High-End Luxury'}</strong></p>
                <p>Target Audience: <strong className="text-slate-800">{businessProfile?.target_audience || 'Affluent customers'}</strong></p>
                <p>Brand Colors: <strong className="text-slate-800">{businessProfile?.brand_colors || '#1A365D'}</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT MONTHLY WORK BOARD */}
      {activeTab === 'workboard' && (
        <div className="space-y-6">
          <div className="card-base p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-600" />
                  Monthly Agency Work Board ({clientWorkBoard?.package_name || 'Active Package'})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live breakdown of deliverables across the 5 production stages with completion percentages.
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-brand-600">
                  {clientWorkBoard?.completion_percentage || 0}%
                </span>
                <span className="block text-[11px] text-slate-400 font-bold uppercase">Deliverables Completed</span>
              </div>
            </div>

            {/* Big Stage Columns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Posted / Live</span>
                <span className="text-2xl font-black text-emerald-900 mt-1 block">{clientWorkBoard?.posted || 0}</span>
                <span className="text-[11px] text-emerald-700">Reels Completed</span>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-center">
                <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block">In Review / Approval</span>
                <span className="text-2xl font-black text-purple-900 mt-1 block">{clientWorkBoard?.approval_pending || 0}</span>
                <span className="text-[11px] text-purple-700">Client Approvals</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">In Editing</span>
                <span className="text-2xl font-black text-amber-900 mt-1 block">{clientWorkBoard?.editing || 0}</span>
                <span className="text-[11px] text-amber-700">With Video Editor</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">Shoot Scheduled</span>
                <span className="text-2xl font-black text-blue-900 mt-1 block">{clientWorkBoard?.shoot_scheduled || 0}</span>
                <span className="text-[11px] text-blue-700">With DP & Model</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Remaining Quota</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">{clientWorkBoard?.pending || 0}</span>
                <span className="text-[11px] text-slate-500">To Script & Plan</span>
              </div>
            </div>

            {/* List of client reels in work board */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Reels Breakdown for this Client ({reels.length} Total)
              </h4>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {reels.map((reel) => (
                  <div key={reel.id} className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Reel #{reel.reel_number}: {reel.title}</span>
                        <StatusBadge status={reel.overall_status} size="sm" />
                      </div>
                      <p className="text-slate-500 mt-0.5">{reel.content_type} • Editor: <strong>{reel.assigned_editor_name || 'Rohan Mehta'}</strong></p>
                      {reel.external_url && (
                        <a
                          href={reel.external_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-brand-600 font-semibold hover:underline mt-1"
                        >
                          Review Preview Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      <span>Post Date: <strong className="text-slate-700">{reel.posting_date || 'TBD'}</strong></span>
                      <span className="block mt-0.5">Approval: <strong className="text-slate-700">{reel.client_approval_status}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BRAND & BUSINESS PROFILE */}
      {activeTab === 'business' && (
        <div className="card-base p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Brand Identity & Operational Brief</h3>
              <p className="text-xs text-slate-500 mt-0.5">Creative guidelines, brand colors, competitor references, and tone.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBusinessForm({
                  business_description: businessProfile?.business_description || '',
                  services_products: businessProfile?.services_products || '',
                  target_audience: businessProfile?.target_audience || '',
                  target_location: businessProfile?.target_location || '',
                  competitors: businessProfile?.competitors || '',
                  brand_colors: businessProfile?.brand_colors || '',
                  brand_tone: businessProfile?.brand_tone || '',
                  brand_instructions: businessProfile?.brand_instructions || '',
                  notes: businessProfile?.notes || '',
                });
                setEditBusinessProfileOpen(true);
              }}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Brand Brief
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Business Description</span>
                <p className="text-slate-800 leading-relaxed">{businessProfile?.business_description || 'No description provided.'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Products & Services</span>
                <p className="text-slate-800 leading-relaxed">{businessProfile?.services_products || 'General'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Competitors to Monitor</span>
                <p className="text-slate-800 leading-relaxed">{businessProfile?.competitors || 'None noted'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Brand Tone & Aesthetic</span>
                <p className="text-slate-800 font-semibold">{businessProfile?.brand_tone || 'Modern, Premium & High-Energy'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Brand Colors</span>
                <p className="text-slate-800 font-mono">{businessProfile?.brand_colors || '#4F46E5, #0EA5E9'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Important Client Instructions</span>
                <p className="text-slate-800 leading-relaxed">{businessProfile?.brand_instructions || 'Follow standard agency SOPs.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PACKAGES & RENEWALS */}
      {activeTab === 'packages' && (
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Client Package History & Active Retainers</h3>
            {activePackage && (
              <button
                type="button"
                onClick={() => setRenewModalOpen(true)}
                className="px-3.5 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-500 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Renew Package
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {client.packages?.map((pkg) => (
              <div key={pkg.id} className="p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{pkg.package_name}</span>
                    <StatusBadge status={pkg.status} size="sm" />
                    <StatusBadge status={pkg.payment_status} size="sm" />
                  </div>
                  <p className="text-slate-500 mt-1">
                    Duration: <strong>{pkg.start_date} to {pkg.end_date}</strong> • Contract Price: <strong>₹{pkg.final_price.toLocaleString()}</strong>
                  </p>
                </div>

                <div className="text-right text-xs">
                  <span className="font-bold text-slate-900 block">
                    Paid: ₹{(pkg.total_paid || 0).toLocaleString()}
                  </span>
                  <span className="text-rose-600 font-semibold">
                    Balance: ₹{(pkg.remaining_balance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENTS LEDGER */}
      {activeTab === 'payments' && (
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Installment Payments Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">Recorded installments against active client package retainers.</p>
            </div>
            <button
              type="button"
              onClick={() => setRecordPaymentOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Installment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Transaction Ref</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {client.payments?.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-bold text-slate-900">{p.payment_id}</td>
                    <td className="px-4 py-3 text-slate-600">{p.payment_date}</td>
                    <td className="px-4 py-3 font-bold text-emerald-700">₹{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{p.payment_method}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{p.transaction_id || 'N/A'}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} size="sm" /></td>
                    <td className="px-4 py-3 text-slate-500">{p.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: CONTENT WORKFLOW */}
      {activeTab === 'content' && (
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Reels & Content Matrix ({reels.length})</h3>
            <button
              type="button"
              onClick={() => navigate('/reels')}
              className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-500"
            >
              Open Full Matrix
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {reels.map((reel) => (
              <div key={reel.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900">Reel #{reel.reel_number}: {reel.title}</span>
                  <p className="text-slate-500 mt-0.5">
                    Editor: <strong>{reel.assigned_editor_name || 'Rohan'}</strong> • Shoot Date: <strong>{reel.shoot_date || 'N/A'}</strong>
                  </p>
                </div>
                <StatusBadge status={reel.overall_status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SHOOTS */}
      {activeTab === 'shoots' && (
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Client Shoots ({shoots.length})</h3>
            <button
              type="button"
              onClick={() => navigate('/shoots')}
              className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-500"
            >
              Schedule Shoot
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {shoots.map((shoot) => (
              <div key={shoot.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900">{shoot.shoot_type}</span>
                  <p className="text-slate-500 mt-0.5">
                    Location: <strong>{shoot.location}</strong> • Camera: <strong>{shoot.cameraman_name || 'Unassigned'}</strong> • Model: <strong>{shoot.model_name || 'None'}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{shoot.date}</span>
                  <StatusBadge status={shoot.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="card-base p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Ad Campaigns & ROI Performance ({campaigns.length})</h3>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {campaigns.map((cmp) => (
              <div key={cmp.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900">{cmp.campaign_name}</span>
                  <p className="text-slate-500 mt-0.5">
                    Platform: <strong>{cmp.platform}</strong> • Spend: <strong>₹{cmp.spend.toLocaleString()}</strong> • Leads: <strong>{cmp.leads}</strong> (CPL: ₹{cmp.cpl})
                  </p>
                </div>
                <StatusBadge status={cmp.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: TASKS */}
      {activeTab === 'tasks' && (
        <div className="card-base p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Client Operational Tasks ({tasks.length})</h3>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900">{task.title}</span>
                  <p className="text-slate-500 mt-0.5">
                    Assigned: <strong>{task.assigned_to_name || 'Unassigned'}</strong> • Due: <strong>{task.due_date}</strong>
                  </p>
                </div>
                <StatusBadge status={task.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {activePackage && recordPaymentOpen && (
        <Modal
          isOpen={recordPaymentOpen}
          onClose={() => setRecordPaymentOpen(false)}
          title={`Record Payment for ${client.business_name}`}
          subtitle={`Package: ${activePackage.package_name} • Remaining Balance: ₹${(activePackage.remaining_balance || 0).toLocaleString()}`}
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              recordPaymentMutation.mutate({
                client_id: client.id,
                client_package_id: activePackage.id,
                ...paymentForm,
              });
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount to Record (₹) *</label>
              <input
                type="number"
                required
                max={activePackage.remaining_balance || activePackage.final_price}
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Transaction Ref ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. UPI-992019482910"
                value={paymentForm.transaction_id}
                onChange={(e) => setPaymentForm({ ...paymentForm, transaction_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRecordPaymentOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={recordPaymentMutation.isPending}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm"
              >
                {recordPaymentMutation.isPending ? 'Recording...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* RENEW PACKAGE MODAL */}
      {activePackage && renewModalOpen && (
        <Modal
          isOpen={renewModalOpen}
          onClose={() => setRenewModalOpen(false)}
          title={`Renew Package for ${client.business_name}`}
          subtitle="Preserves previous package history and launches a new billing cycle."
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              renewPackageMutation.mutate({
                id: activePackage.id,
                data: renewForm,
              });
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">New Start Date</label>
              <input
                type="date"
                required
                value={renewForm.start_date}
                onChange={(e) => setRenewForm({ ...renewForm, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  value={renewForm.duration_days}
                  onChange={(e) => setRenewForm({ ...renewForm, duration_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Loyalty Discount (₹)</label>
                <input
                  type="number"
                  value={renewForm.discount}
                  onChange={(e) => setRenewForm({ ...renewForm, discount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Renewal Notes</label>
              <textarea
                rows={2}
                value={renewForm.notes}
                onChange={(e) => setRenewForm({ ...renewForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenewModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={renewPackageMutation.isPending}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm"
              >
                {renewPackageMutation.isPending ? 'Renewing...' : 'Confirm Renewal'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT BUSINESS PROFILE MODAL */}
      {editBusinessProfileOpen && (
        <Modal
          isOpen={editBusinessProfileOpen}
          onClose={() => setEditBusinessProfileOpen(false)}
          title={`Edit Brand Profile: ${client.business_name}`}
          maxWidth="xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateBusinessProfileMutation.mutate(businessForm);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Description</label>
              <textarea
                rows={3}
                value={businessForm.business_description}
                onChange={(e) => setBusinessForm({ ...businessForm, business_description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Tone</label>
                <input
                  type="text"
                  placeholder="e.g. Elegant, High-End Luxury"
                  value={businessForm.brand_tone}
                  onChange={(e) => setBusinessForm({ ...businessForm, brand_tone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Colors (Hex)</label>
                <input
                  type="text"
                  placeholder="#1A365D, #C5A880"
                  value={businessForm.brand_colors}
                  onChange={(e) => setBusinessForm({ ...businessForm, brand_colors: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
              <input
                type="text"
                value={businessForm.target_audience}
                onChange={(e) => setBusinessForm({ ...businessForm, target_audience: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Competitors</label>
              <input
                type="text"
                value={businessForm.competitors}
                onChange={(e) => setBusinessForm({ ...businessForm, competitors: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditBusinessProfileOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateBusinessProfileMutation.isPending}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm"
              >
                {updateBusinessProfileMutation.isPending ? 'Saving...' : 'Save Brand Brief'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

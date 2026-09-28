import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Phone,
  Instagram,
  User,
  Layers,
  ArrowRight,
  AlertTriangle,
  Clock,
  Sparkles,
  Calendar
} from 'lucide-react';
import { api } from '../api/client';
import { SearchInput } from '../components/common/SearchInput';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import type { Client } from '../types';

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [addClientOpen, setAddClientOpen] = useState(false);

  const [clientForm, setClientForm] = useState({
    business_name: '',
    owner_name: '',
    contact_person: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: 'Mumbai',
    category: 'Fashion & Luxury',
    website: '',
    instagram: '',
    notes: '',
  });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', statusFilter, search],
    queryFn: () =>
      api.getClients({
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: search || undefined,
      }),
  });

  const createClientMutation = useMutation({
    mutationFn: (data: any) => api.createClient(data),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setAddClientOpen(false);
      navigate(`/clients/${newClient.id}`);
    },
  });

  const filterTabs = ['All', 'Active', 'Expiring', 'Expired', 'On Hold'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-600" />
            Client Accounts & Retainers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage agency clients, active package quotas, brand profiles, and monthly workflow delivery boards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddClientOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-base p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by business, owner, city..."
          className="w-full md:w-72"
        />
      </div>

      {/* Clients Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading clients...</div>
      ) : clients.length === 0 ? (
        <div className="card-base p-16 text-center">
          <p className="text-sm font-semibold text-slate-700">No client accounts found</p>
          <p className="text-xs text-slate-400 mt-1">Try switching tabs or clear search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => {
            const activePkg = client.active_package;
            const wp = client.work_progress;
            const percentage = wp?.total_reels ? Math.round((wp.completed_reels / wp.total_reels) * 100) : 0;
            const isExpiringSoon = activePkg?.status === 'Expiring' || (activePkg?.days_remaining !== undefined && activePkg.days_remaining <= 7);

            return (
              <div
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}
                className="card-base p-5 card-hover cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar with ID & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400">{client.client_id}</span>
                    <StatusBadge status={client.status} size="sm" />
                  </div>

                  {/* Business Title & Owner */}
                  <div className="mt-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {client.business_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {client.owner_name} • <span className="font-semibold text-slate-700">{client.category}</span>
                    </p>
                  </div>

                  {/* Contact Links */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                    {client.instagram && (
                      <div className="flex items-center gap-1 text-[11px] text-pink-600">
                        <Instagram className="w-3 h-3" />
                        <span>{client.instagram}</span>
                      </div>
                    )}
                  </div>

                  {/* Package & Expiry Box */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate">{activePkg?.package_name || 'No Active Package'}</span>
                      {isExpiringSoon && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Expiring Soon
                        </span>
                      )}
                    </div>

                    {activePkg && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Ends: {activePkg.end_date}</span>
                        <span className="font-bold text-slate-700">
                          {activePkg.days_remaining !== undefined && activePkg.days_remaining >= 0
                            ? `${activePkg.days_remaining} days left`
                            : 'Expired'}
                        </span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                        <span className="text-slate-500">Monthly Reels Quota</span>
                        <span className="font-bold text-brand-600">{wp?.completed_reels || 0} / {wp?.total_reels || 8} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Manager: <strong className="text-slate-700">{client.assigned_manager_name || 'Neha Gupta'}</strong>
                  </span>
                  <span className="font-bold text-brand-600 group-hover:underline flex items-center gap-0.5">
                    View Profile <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD CLIENT MODAL */}
      <Modal
        isOpen={addClientOpen}
        onClose={() => setAddClientOpen(false)}
        title="Add New Client Account"
        subtitle="Create client profile and assign an account manager."
        maxWidth="xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createClientMutation.mutate(clientForm);
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business / Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Savoria Bistro"
                value={clientForm.business_name}
                onChange={(e) => setClientForm({ ...clientForm, business_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Owner Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Marco Rossi"
                value={clientForm.owner_name}
                onChange={(e) => setClientForm({ ...clientForm, owner_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+91 98200 00000"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                placeholder="+91 98200 00000"
                value={clientForm.whatsapp}
                onChange={(e) => setClientForm({ ...clientForm, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="info@brand.com"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={clientForm.category}
                onChange={(e) => setClientForm({ ...clientForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Fashion & Luxury">Fashion & Luxury</option>
                <option value="Hospitality & Dining">Hospitality & Dining</option>
                <option value="Fitness & Wellness">Fitness & Wellness</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Healthcare & Aesthetics">Healthcare & Aesthetics</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={clientForm.city}
                onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddClientOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createClientMutation.isPending}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm"
            >
              {createClientMutation.isPending ? 'Saving...' : 'Create Client'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

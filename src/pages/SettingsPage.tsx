import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, CheckCircle2, Building, ShieldCheck, Tag } from 'lucide-react';
import { api } from '../api/client';
import type { AppSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
  });

  const [form, setForm] = useState({
    agency_name: 'Smartera Digital',
    agency_email: 'hello@smarteradigital.com',
    agency_phone: '+91 98200 00000',
    agency_address: 'Bandra Kurla Complex, Mumbai, Maharashtra 400051',
    agency_website: 'https://smarteradigital.com',
    currency: '₹ (INR)',
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) =>
      api.updateSettings({
        agency_info: {
          name: form.agency_name,
          email: form.agency_email,
          phone: form.agency_phone,
          address: form.agency_address,
          website: form.agency_website,
          currency: form.currency,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-600" />
          Agency Settings & System Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure agency corporate details, billing currency, operational dropdowns, and automated reminder parameters.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Agency settings updated successfully!
        </div>
      )}

      {/* Agency Corporate Info */}
      <div className="card-base p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building className="w-4 h-4 text-brand-600" />
          Corporate Agency Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Agency Name</label>
            <input
              type="text"
              value={form.agency_name}
              onChange={(e) => setForm({ ...form, agency_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Email</label>
            <input
              type="email"
              value={form.agency_email}
              onChange={(e) => setForm({ ...form, agency_email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={form.agency_phone}
              onChange={(e) => setForm({ ...form, agency_phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Default Billing Currency</label>
            <input
              type="text"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Office / Studio Address</label>
            <input
              type="text"
              value={form.agency_address}
              onChange={(e) => setForm({ ...form, agency_address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="button"
            onClick={() => updateSettingsMutation.mutate(form)}
            disabled={updateSettingsMutation.isPending}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Dropdown Options Tags Preview */}
      <div className="card-base p-6 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-600" />
          Active Classification Taxonomies
        </h3>

        <div className="space-y-3">
          <div>
            <span className="font-bold text-slate-700 block mb-1">Lead Sources:</span>
            <div className="flex flex-wrap gap-1.5">
              {settings?.lead_sources.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-700 block mb-1">Business Categories:</span>
            <div className="flex flex-wrap gap-1.5">
              {settings?.business_categories.map((c) => (
                <span key={c} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-700 block mb-1">Accepted Payment Methods:</span>
            <div className="flex flex-wrap gap-1.5">
              {settings?.payment_methods.map((pm) => (
                <span key={pm} className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  {pm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

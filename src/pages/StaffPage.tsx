import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Briefcase,
  CheckCircle2,
  Clock,
  Video,
  Film,
  Sparkles,
  Shield,
  Edit2
} from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import type { StaffProfile, UserRole } from '../types';

export const StaffPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All');

  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Social Media Manager' as UserRole,
    equipment: '',
    skills: ['Content Strategy', 'Video Editing'],
    gender: 'Other',
    instagram: '',
    daily_rate: 5000,
    availability_status: 'Available' as const,
    notes: '',
  });

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.getStaff(),
  });

  const createStaffMutation = useMutation({
    mutationFn: (data: any) => api.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setAddStaffOpen(false);
    },
  });

  const rolesList: UserRole[] = [
    'Super Admin',
    'Admin / Operations',
    'Sales Person',
    'Social Media Manager',
    'Camera Man',
    'Video Editor',
    'Model',
    'Ads / Campaign Manager',
  ];

  const filteredStaff = staff.filter((s) => {
    if (roleFilter === 'All') return true;
    return s.role_type === roleFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            Agency Staff & Production Crew Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage team roles, daily commercial billing rates, availability, gear equipment, and active workloads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddStaffOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Role Filter Tabs */}
      <div className="card-base p-2 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setRoleFilter('All')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
            roleFilter === 'All' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Staff ({staff.length})
        </button>
        {rolesList.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              roleFilter === r ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <div key={member.id} className="card-base p-5 card-hover flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={member.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                    <p className="text-xs font-semibold text-brand-600">{member.role_type}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{member.phone}</p>
                  </div>
                </div>

                <StatusBadge status={member.availability_status} size="sm" />
              </div>

              {/* Skills Tags */}
              {member.skills && member.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {member.skills.map((sk) => (
                    <span key={sk} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {sk}
                    </span>
                  ))}
                </div>
              )}

              {/* Workload Matrix Box */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tasks</span>
                  <span className="font-bold text-slate-900">{member.workload?.completed_tasks || 0}/{member.workload?.total_tasks || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Shoots</span>
                  <span className="font-bold text-amber-700">{member.workload?.active_shoots || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Overdue</span>
                  <span className={`font-bold ${(member.workload?.overdue_tasks || 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {member.workload?.overdue_tasks || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Rate: <strong className="text-slate-900">₹{member.daily_rate.toLocaleString()}/day</strong></span>
              <span className="text-[11px] font-bold text-slate-600">{member.email}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD STAFF MODAL */}
      <Modal
        isOpen={addStaffOpen}
        onClose={() => setAddStaffOpen(false)}
        title="Add Staff Member to Agency"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createStaffMutation.mutate(staffForm);
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Karan Kapoor"
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="karan@smarteradigital.com"
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
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
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Role *</label>
              <select
                value={staffForm.role}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {rolesList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Daily Billing Rate (₹)</label>
              <input
                type="number"
                value={staffForm.daily_rate}
                onChange={(e) => setStaffForm({ ...staffForm, daily_rate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Availability</label>
              <select
                value={staffForm.availability_status}
                onChange={(e) => setStaffForm({ ...staffForm, availability_status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Equipment / Kit Details (If Cameraman)</label>
            <input
              type="text"
              placeholder="e.g. Sony A7SIII, Gimbal, 24-70mm GM"
              value={staffForm.equipment}
              onChange={(e) => setStaffForm({ ...staffForm, equipment: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddStaffOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createStaffMutation.isPending}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm"
            >
              {createStaffMutation.isPending ? 'Saving...' : 'Add Staff'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

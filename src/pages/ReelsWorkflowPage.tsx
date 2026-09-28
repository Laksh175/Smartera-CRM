import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Film,
  Plus,
  Edit2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Video,
  User,
  MessageSquare,
  Sparkles,
  Calendar,
  Filter,
  FileText,
  Check,
  Zap,
  Tag
} from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import type { Reel, ScriptStatus, ShootStatus, EditingStatus, ClientApprovalStatus, PostingStatus } from '../types';

export const ReelsWorkflowPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addReelOpen, setAddReelOpen] = useState(false);
  const [activeReel, setActiveReel] = useState<Reel | null>(null);

  const [reelForm, setReelForm] = useState({
    client_id: '',
    reel_number: 1,
    title: '',
    description: '',
    hook_line: '',
    script_content: '',
    content_type: 'Educational / Showcase',
    script_status: 'Not Started' as ScriptStatus,
    shoot_status: 'Planned' as ShootStatus,
    editing_status: 'Not Started' as EditingStatus,
    client_approval_status: 'Pending' as ClientApprovalStatus,
    posting_status: 'Not Scheduled' as PostingStatus,
    assigned_editor_id: '44444444-4444-4444-4444-444444444444',
    assigned_cameraman_id: '33333333-3333-3333-3333-333333333333',
    assigned_model_id: '',
    shoot_date: '',
    editing_due_date: '',
    approval_due_date: '',
    posting_date: '',
    posting_time: '06:00 PM',
    external_url: '',
    approval_notes: '',
    notes: '',
  });

  const { data: reels = [], isLoading } = useQuery({
    queryKey: ['reels'],
    queryFn: () => api.getReels(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.getClients(),
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.getStaff(),
  });

  const createReelMutation = useMutation({
    mutationFn: (data: any) => api.createReel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setAddReelOpen(false);
    },
  });

  const updateReelMutation = useMutation({
    mutationFn: (params: { id: string; data: any }) => api.updateReel(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setEditModalOpen(false);
      setActiveReel(null);
    },
  });

  // Calculate client quota and next reel number
  const getClientStats = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    const clientReels = reels.filter((r) => r.client_id === clientId);
    const maxNumber = clientReels.reduce((max, r) => Math.max(max, r.reel_number || 0), 0);
    const nextNumber = maxNumber + 1;
    const totalQuota = client?.active_package?.usage?.reels_total || client?.work_progress?.total_reels || 12;
    const completedCount = clientReels.filter((r) => r.overall_status === 'Posted').length;
    const readyScriptCount = clientReels.filter((r) => r.script_status === 'Ready' || r.script_status === 'Completed').length;
    return {
      client,
      count: clientReels.length,
      nextNumber,
      totalQuota,
      completedCount,
      readyScriptCount,
    };
  };

  const handleClientChangeInAdd = (clientId: string) => {
    const stats = getClientStats(clientId);
    setReelForm((prev) => ({
      ...prev,
      client_id: clientId,
      reel_number: stats.nextNumber,
    }));
  };

  const openPlanModal = () => {
    const defaultClientId = selectedClient !== 'All' ? selectedClient : clients[0]?.id || '';
    const stats = defaultClientId ? getClientStats(defaultClientId) : { nextNumber: 1 };
    setReelForm({
      client_id: defaultClientId,
      reel_number: stats.nextNumber,
      title: '',
      description: '',
      hook_line: '',
      script_content: '',
      content_type: 'Educational / Showcase',
      script_status: 'Not Started',
      shoot_status: 'Planned',
      editing_status: 'Not Started',
      client_approval_status: 'Pending',
      posting_status: 'Not Scheduled',
      assigned_editor_id: '44444444-4444-4444-4444-444444444444',
      assigned_cameraman_id: '33333333-3333-3333-3333-333333333333',
      assigned_model_id: '',
      shoot_date: '',
      editing_due_date: '',
      approval_due_date: '',
      posting_date: '',
      posting_time: '06:00 PM',
      external_url: '',
      approval_notes: '',
      notes: '',
    });
    setAddReelOpen(true);
  };

  const filteredReels = reels.filter((r) => {
    if (selectedClient !== 'All' && r.client_id !== selectedClient) return false;
    if (selectedStage !== 'All' && r.overall_status.toLowerCase() !== selectedStage.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.reel_id.toLowerCase().includes(q) ||
        r.client_name?.toLowerCase().includes(q) ||
        r.content_type.toLowerCase().includes(q) ||
        r.hook_line?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stagesList = ['All', 'Scripting', 'Shoot Scheduled', 'Editing', 'Internal Review', 'Revision Required', 'Approval Pending', 'Posting Scheduled', 'Posted'];

  const openEditModal = (reel: Reel) => {
    setActiveReel(reel);
    setReelForm({
      client_id: reel.client_id,
      reel_number: reel.reel_number,
      title: reel.title,
      description: reel.description || '',
      hook_line: reel.hook_line || '',
      script_content: reel.script_content || '',
      content_type: reel.content_type,
      script_status: reel.script_status,
      shoot_status: reel.shoot_status,
      editing_status: reel.editing_status,
      client_approval_status: reel.client_approval_status,
      posting_status: reel.posting_status,
      assigned_editor_id: reel.assigned_editor_id || '44444444-4444-4444-4444-444444444444',
      assigned_cameraman_id: reel.assigned_cameraman_id || '',
      assigned_model_id: reel.assigned_model_id || '',
      shoot_date: reel.shoot_date || '',
      editing_due_date: reel.editing_due_date || '',
      approval_due_date: reel.approval_due_date || '',
      posting_date: reel.posting_date || '',
      posting_time: reel.posting_time || '06:00 PM',
      external_url: reel.external_url || '',
      approval_notes: reel.approval_notes || '',
      notes: reel.notes || '',
    });
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Film className="w-5 h-5 text-purple-600" />
            5-Stage Reel Workflow Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage script drafting, shoot coordination, editing pipeline, client approvals, and publishing.
          </p>
        </div>

        <button
          type="button"
          onClick={openPlanModal}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Plan New Reel
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-base p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700"
          >
            <option value="All">All Clients ({clients.length})</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.business_name}
              </option>
            ))}
          </select>

          {stagesList.map((stg) => (
            <button
              key={stg}
              onClick={() => setSelectedStage(stg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStage.toLowerCase() === stg.toLowerCase()
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {stg}
            </button>
          ))}
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by reel title, hook, client..."
          className="w-full md:w-72"
        />
      </div>

      {/* Client Quick Quota Summary Banner (When specific client is selected) */}
      {selectedClient !== 'All' && (() => {
        const stats = getClientStats(selectedClient);
        return (
          <div className="p-3.5 bg-purple-50 border border-purple-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-sm">
                🎬
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{stats.client?.business_name} Package Quota</h4>
                <p className="text-slate-500 text-[11px]">
                  <strong>{stats.count} of {stats.totalQuota}</strong> reels planned • <strong>{stats.readyScriptCount}</strong> scripts ready for filming • <strong>{stats.completedCount}</strong> live/posted
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-white border border-purple-200 rounded-lg text-purple-700 font-bold text-[11px]">
                {stats.totalQuota - stats.count > 0 ? `${stats.totalQuota - stats.count} reels remaining in package` : 'Package Quota Filled'}
              </span>
            </div>
          </div>
        );
      })()}

      {/* 5-Stage Matrix Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Reel & Concept</th>
                <th className="px-3 py-3.5">1. Script Status</th>
                <th className="px-3 py-3.5">2. Shoot Status</th>
                <th className="px-3 py-3.5">3. Editing Status</th>
                <th className="px-3 py-3.5">4. Client Approval</th>
                <th className="px-3 py-3.5">5. Posting Status</th>
                <th className="px-4 py-3.5">Overall Stage</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredReels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No reels found matching current filters. Click "Plan New Reel" to start.
                  </td>
                </tr>
              ) : (
                filteredReels.map((reel) => (
                  <tr key={reel.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="min-w-[200px] max-w-[280px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">#{reel.reel_number} {reel.title}</span>
                        </div>
                        <p className="text-slate-500 font-medium mt-0.5">
                          {reel.client_name} • <span className="text-[11px] text-purple-700 font-semibold">{reel.content_type}</span>
                        </p>
                        {reel.hook_line && (
                          <div className="mt-1 flex items-start gap-1 text-[11px] text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/60">
                            <Zap className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                            <span className="truncate italic" title={reel.hook_line}>"{reel.hook_line}"</span>
                          </div>
                        )}
                        {reel.external_url && (
                          <a
                            href={reel.external_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-brand-600 font-semibold hover:underline mt-1"
                          >
                            Review Video <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* 1. Script */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="space-y-1">
                        <StatusBadge status={reel.script_status} size="sm" />
                        {reel.script_content ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold block">
                            <FileText className="w-2.5 h-2.5" /> Script Added ({reel.script_content.split(/\s+/).length} w)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block italic">No script draft</span>
                        )}
                      </div>
                    </td>

                    {/* 2. Shoot */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <StatusBadge status={reel.shoot_status} size="sm" />
                      {reel.shoot_date && (
                        <span className="block text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 text-brand-500" /> {reel.shoot_date}
                        </span>
                      )}
                    </td>

                    {/* 3. Editing */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <StatusBadge status={reel.editing_status} size="sm" />
                      <span className="block text-[10px] text-slate-400 mt-0.5">Editor: {reel.assigned_editor_name || 'Rohan'}</span>
                    </td>

                    {/* 4. Approval */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <StatusBadge status={reel.client_approval_status} size="sm" />
                      {reel.approval_notes && (
                        <span className="block text-[10px] text-rose-600 font-semibold mt-0.5 max-w-[140px] truncate" title={reel.approval_notes}>
                          Note: {reel.approval_notes}
                        </span>
                      )}
                    </td>

                    {/* 5. Posting */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <StatusBadge status={reel.posting_status} size="sm" />
                      {reel.posting_date && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">{reel.posting_date} ({reel.posting_time || '06:00 PM'})</span>
                      )}
                    </td>

                    {/* Overall Stage */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={reel.overall_status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(reel)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3 h-3" />
                        Script & Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE REEL MODAL */}
      {activeReel && editModalOpen && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Reel #${activeReel.reel_number}: ${activeReel.title}`}
          subtitle={`Client: ${activeReel.client_name} • Edit script, adjust stage progression, and log review feedback`}
          maxWidth="2xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateReelMutation.mutate({
                id: activeReel.id,
                data: reelForm,
              });
            }}
            className="space-y-4 text-xs"
          >
            {/* Quick Action: Mark Script Ready for Shoot */}
            {reelForm.script_status !== 'Ready' && reelForm.script_status !== 'Completed' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-900 block">Script Finalized?</span>
                    <span className="text-[11px] text-emerald-700">Lock the script so this reel appears as ready in Shoot Management.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReelForm({ ...reelForm, script_status: 'Ready' })}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark Script Ready ✅
                </button>
              </div>
            )}

            {/* SCRIPT & HOOK SECTION */}
            <div className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-purple-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  Script & Creative Hook
                </h4>
                <span className="text-[11px] text-purple-700 font-semibold">
                  Status: <strong>{reelForm.script_status}</strong>
                </span>
              </div>

              {/* Hook Line */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Opening Hook Line (0-3s attention grabber)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3 bridal styling hacks nobody tells you before the wedding day..."
                  value={reelForm.hook_line}
                  onChange={(e) => {
                    const newHook = e.target.value;
                    const autoStatus = (!reelForm.script_status || reelForm.script_status === 'Not Started') && newHook ? 'In Progress' : reelForm.script_status;
                    setReelForm({ ...reelForm, hook_line: newHook, script_status: autoStatus });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                />
              </div>

              {/* Script Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Video Script & Scene Breakdown</label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {reelForm.script_content.trim() ? `${reelForm.script_content.trim().split(/\s+/).length} words` : '0 words'}
                  </span>
                </div>
                <textarea
                  rows={4}
                  placeholder="[Scene 1 - 0:00-0:05]: Model holds product close to lens...\n[Voiceover]: Here is why every bride is loving our silk collection...\n[Call to Action]: DM 'Luxe' to book your trial today!"
                  value={reelForm.script_content}
                  onChange={(e) => {
                    const newScript = e.target.value;
                    let autoStatus = reelForm.script_status;
                    if (newScript.length > 5 && (reelForm.script_status === 'Not Started' || !reelForm.script_status)) {
                      autoStatus = 'In Progress';
                    }
                    setReelForm({ ...reelForm, script_content: newScript, script_status: autoStatus });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-mono leading-relaxed"
                />
              </div>
            </div>

            {/* 5 Status Selectors Grid */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                5 Discrete Production Stages
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Script */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">1. Script Status</label>
                  <select
                    value={reelForm.script_status}
                    onChange={(e) => setReelForm({ ...reelForm, script_status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Ready">Ready (For Shoot)</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* 2. Shoot */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">2. Shoot Status</label>
                  <select
                    value={reelForm.shoot_status}
                    onChange={(e) => setReelForm({ ...reelForm, shoot_status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
                  >
                    <option value="Not Required">Not Required</option>
                    <option value="Planned">Planned</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* 3. Editing */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">3. Editing Status</label>
                  <select
                    value={reelForm.editing_status}
                    onChange={(e) => setReelForm({ ...reelForm, editing_status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Internal Review">Internal Review</option>
                    <option value="Revision Required">Revision Required</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* 4. Client Approval */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">4. Client Approval</label>
                  <select
                    value={reelForm.client_approval_status}
                    onChange={(e) => setReelForm({ ...reelForm, client_approval_status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
                  >
                    <option value="Not Sent">Not Sent</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Changes Requested">Changes Requested</option>
                  </select>
                </div>

                {/* 5. Posting */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">5. Posting Status</label>
                  <select
                    value={reelForm.posting_status}
                    onChange={(e) => setReelForm({ ...reelForm, posting_status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
                  >
                    <option value="Not Scheduled">Not Scheduled</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Posted">Posted / Live</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Client Changes Requested Note */}
            {reelForm.client_approval_status === 'Changes Requested' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <label className="block font-bold text-amber-900">Client Feedback / Requested Changes *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Please brighten colors on 0:15 transition and add festive discount sticker"
                  value={reelForm.approval_notes}
                  onChange={(e) => setReelForm({ ...reelForm, approval_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white text-xs"
                />
              </div>
            )}

            {/* External Review URL */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">External Review Video URL (Google Drive / Frame.io / Link)</label>
              <input
                type="text"
                placeholder="https://drive.google.com/file/d/..."
                value={reelForm.external_url}
                onChange={(e) => setReelForm({ ...reelForm, external_url: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            {/* Crew & Deadlines */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Video Editor</label>
                <select
                  value={reelForm.assigned_editor_id}
                  onChange={(e) => setReelForm({ ...reelForm, assigned_editor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {staff.filter((s) => s.role_type === 'Video Editor' || s.role_type === 'Super Admin').map((st) => (
                    <option key={st.user_id} value={st.user_id}>
                      {st.name} ({st.role_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheduled Posting Date</label>
                <input
                  type="date"
                  value={reelForm.posting_date}
                  onChange={(e) => setReelForm({ ...reelForm, posting_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateReelMutation.isPending}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm"
              >
                {updateReelMutation.isPending ? 'Saving...' : 'Save Workflow & Script'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* PLAN NEW REEL MODAL */}
      <Modal
        isOpen={addReelOpen}
        onClose={() => setAddReelOpen(false)}
        title="Plan New Agency Reel"
        subtitle="Initialize reel concept, package sequence, and draft initial script."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createReelMutation.mutate(reelForm);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 mb-1">Client *</label>
            <select
              required
              value={reelForm.client_id}
              onChange={(e) => handleClientChangeInAdd(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.business_name}
                </option>
              ))}
            </select>

            {reelForm.client_id && (() => {
              const stats = getClientStats(reelForm.client_id);
              return (
                <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-[11px] text-purple-900">
                  <span>Package Quota: <strong>{stats.count} planned</strong> / {stats.totalQuota} reels total</span>
                  <span className="font-bold text-purple-700">Auto-numbered: Reel #{stats.nextNumber}</span>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reel Number</label>
              <input
                type="number"
                min={1}
                value={reelForm.reel_number}
                onChange={(e) => setReelForm({ ...reelForm, reel_number: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Reel Title / Concept *</label>
              <input
                type="text"
                required
                placeholder="e.g. 3 Ways to Style an Emerald Dupatta"
                value={reelForm.title}
                onChange={(e) => setReelForm({ ...reelForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Content Format / Angle</label>
            <select
              value={reelForm.content_type}
              onChange={(e) => setReelForm({ ...reelForm, content_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="Educational / Showcase">Educational / Showcase</option>
              <option value="Trending Audio / Hook">Trending Audio / Hook</option>
              <option value="Culinary ASMR / Food Showcase">Culinary ASMR / Food Showcase</option>
              <option value="Founder Story / Craftsmanship">Founder Story / Craftsmanship</option>
              <option value="Aesthetic B-Roll">Aesthetic B-Roll</option>
            </select>
          </div>

          {/* Hook Line Input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Hook Line (Optional, draft right now)
            </label>
            <input
              type="text"
              placeholder="e.g. Don't buy a designer lehenga until you check this..."
              value={reelForm.hook_line}
              onChange={(e) => {
                const hook = e.target.value;
                setReelForm({
                  ...reelForm,
                  hook_line: hook,
                  script_status: hook && reelForm.script_status === 'Not Started' ? 'In Progress' : reelForm.script_status,
                });
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          {/* Initial Script Textarea */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> Script Draft / Shoot Directions (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Draft scene directions or dialogue here. Adding script will automatically mark script status as In Progress / Ready."
              value={reelForm.script_content}
              onChange={(e) => {
                const script = e.target.value;
                setReelForm({
                  ...reelForm,
                  script_content: script,
                  script_status: script.length > 5 && reelForm.script_status === 'Not Started' ? 'In Progress' : reelForm.script_status,
                });
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Initial Script Status</label>
            <select
              value={reelForm.script_status}
              onChange={(e) => setReelForm({ ...reelForm, script_status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="Not Started">Not Started (Script will be drafted later)</option>
              <option value="In Progress">In Progress (Script is drafting)</option>
              <option value="Ready">Ready (Script is ready for filming!)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddReelOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createReelMutation.isPending}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm"
            >
              {createReelMutation.isPending ? 'Planning...' : 'Plan Reel'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


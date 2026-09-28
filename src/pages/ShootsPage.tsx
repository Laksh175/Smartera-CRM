import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Camera,
  User,
  AlertTriangle,
  CheckCircle2,
  Film,
  Sparkles,
  FileText,
  Check,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import type { Shoot, Reel } from '../types';

export const ShootsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');

  const [shootForm, setShootForm] = useState({
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '10:00 AM',
    end_time: '02:00 PM',
    location: '',
    shoot_type: 'On-Location Brand Lookbook',
    cameraman_id: '33333333-3333-3333-3333-333333333333', // Rahul Sen
    model_id: '55555555-5555-5555-5555-555555555555', // Simran Kaur
    reels_count: 4,
    reel_ids: [] as string[],
    notes: '',
    status: 'Scheduled' as const,
  });

  const { data: shoots = [], isLoading } = useQuery({
    queryKey: ['shoots'],
    queryFn: () => api.getShoots(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.getClients(),
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.getStaff(),
  });

  const { data: reels = [] } = useQuery({
    queryKey: ['reels'],
    queryFn: () => api.getReels(),
  });

  const createShootMutation = useMutation({
    mutationFn: (params: { data: any; force: boolean }) => api.createShoot(params.data, params.force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoots'] });
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setScheduleModalOpen(false);
      setConflictModalOpen(false);
    },
    onError: (err: any) => {
      if (err.status === 409 || err.conflict?.hasConflict) {
        setConflictMessage(err.message || 'Scheduling collision detected for selected crew.');
        setConflictModalOpen(true);
      } else {
        alert(err.message);
      }
    },
  });

  const updateShootStatusMutation = useMutation({
    mutationFn: (params: { id: string; status: any }) => api.updateShoot(params.id, { status: params.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoots'] });
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const cameramen = staff.filter((s) => s.role_type === 'Camera Man' || s.role_type === 'Super Admin');
  const models = staff.filter((s) => s.role_type === 'Model');

  // Client reels for selected client in schedule modal
  const clientPlannedReels = reels.filter((r) => r.client_id === shootForm.client_id);
  const scriptReadyReels = clientPlannedReels.filter((r) => r.script_status === 'Ready' || r.script_status === 'Completed');

  const handleClientChange = (clientId: string) => {
    const c = clients.find((cli) => cli.id === clientId);
    const availableReels = reels.filter((r) => r.client_id === clientId);
    // Auto-select ready reels if available (up to 4)
    const readyIds = availableReels.filter((r) => r.script_status === 'Ready' || r.script_status === 'Completed').map((r) => r.id).slice(0, 4);
    
    setShootForm((prev) => ({
      ...prev,
      client_id: clientId,
      location: c?.address || prev.location || 'Client Studio',
      reel_ids: readyIds,
      reels_count: readyIds.length > 0 ? readyIds.length : Math.min(4, Math.max(1, availableReels.length)),
    }));
  };

  const toggleReelSelection = (reelId: string) => {
    const isSelected = shootForm.reel_ids.includes(reelId);
    let updatedIds: string[];
    if (isSelected) {
      updatedIds = shootForm.reel_ids.filter((id) => id !== reelId);
    } else {
      updatedIds = [...shootForm.reel_ids, reelId];
    }
    setShootForm((prev) => ({
      ...prev,
      reel_ids: updatedIds,
      reels_count: updatedIds.length > 0 ? updatedIds.length : prev.reels_count,
    }));
  };

  const selectAllReady = () => {
    const readyIds = scriptReadyReels.map((r) => r.id);
    setShootForm((prev) => ({
      ...prev,
      reel_ids: readyIds,
      reels_count: readyIds.length > 0 ? readyIds.length : prev.reels_count,
    }));
  };

  const openScheduleModal = () => {
    const defaultClientId = clients[0]?.id || '';
    const availableReels = reels.filter((r) => r.client_id === defaultClientId);
    const readyIds = availableReels.filter((r) => r.script_status === 'Ready' || r.script_status === 'Completed').map((r) => r.id).slice(0, 4);

    setShootForm({
      client_id: defaultClientId,
      date: new Date().toISOString().split('T')[0],
      start_time: '10:00 AM',
      end_time: '02:00 PM',
      location: clients[0]?.address || 'Client Studio',
      shoot_type: 'On-Location Brand Lookbook',
      cameraman_id: '33333333-3333-3333-3333-333333333333',
      model_id: '55555555-5555-5555-5555-555555555555',
      reels_count: readyIds.length > 0 ? readyIds.length : 4,
      reel_ids: readyIds,
      notes: '',
      status: 'Scheduled',
    });
    setScheduleModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-brand-600" />
            Production Shoots & Call Sheets
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate video shoots, link script-ready reels in batches, assign crew, and prevent schedule collisions.
          </p>
        </div>

        <button
          type="button"
          onClick={openScheduleModal}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule New Shoot
        </button>
      </div>

      {/* Shoots Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading shoots...</div>
      ) : shoots.length === 0 ? (
        <div className="card-base p-16 text-center text-slate-400 text-xs">No shoots scheduled. Click "Schedule New Shoot" to begin.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shoots.map((shoot) => {
            const linked = shoot.linked_reels && shoot.linked_reels.length > 0 
              ? shoot.linked_reels 
              : reels.filter((r) => shoot.reel_ids?.includes(r.id));

            return (
              <div key={shoot.id} className="card-base p-5 card-hover flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400">{shoot.shoot_id}</span>
                    <StatusBadge status={shoot.status} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2">
                    {shoot.shoot_type}
                  </h3>
                  <p className="text-xs font-semibold text-brand-600 mt-0.5">{shoot.client_name}</p>

                  {/* Location & Time */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="font-bold text-slate-800">{shoot.date}</span>
                      <span className="text-slate-400">({shoot.start_time} - {shoot.end_time})</span>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{shoot.location}</span>
                    </div>
                  </div>

                  {/* Crew Box */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-slate-400" /> Camera DP:
                      </span>
                      <strong className="text-slate-900">{shoot.cameraman_name || 'Unassigned'}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Model:
                      </span>
                      <strong className="text-slate-900">{shoot.model_name || 'Without Model'}</strong>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Planned Batch:</span>
                      <strong className="text-purple-700 font-bold">{shoot.reels_count} Reels</strong>
                    </div>
                  </div>

                  {/* Linked Reels Badges */}
                  {linked.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-purple-600" /> Filming Reels ({linked.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {linked.map((r) => (
                          <div
                            key={r.id}
                            className="px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg text-[11px] font-semibold text-purple-900 flex items-center gap-1.5"
                          >
                            <span>#{r.reel_number} {r.title}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${r.script_status === 'Ready' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {shoot.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-3 bg-white p-2 rounded-lg border border-slate-100">
                      "{shoot.notes}"
                    </p>
                  )}
                </div>

                {/* Status Quick Toggle / 1-Click Complete */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {shoot.status !== 'Completed' ? (
                    <button
                      type="button"
                      onClick={() => updateShootStatusMutation.mutate({ id: shoot.id, status: 'Completed' })}
                      disabled={updateShootStatusMutation.isPending}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Shoot Completed 🎬
                    </button>
                  ) : (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-bold text-center flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Shoot Completed & Footage Handed to Editor
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Stage:</span>
                    <div className="flex items-center gap-1.5">
                      {shoot.status !== 'Confirmed' && shoot.status !== 'Completed' && (
                        <button
                          type="button"
                          onClick={() => updateShootStatusMutation.mutate({ id: shoot.id, status: 'Confirmed' })}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-semibold border border-slate-200"
                        >
                          Confirm Call Sheet
                        </button>
                      )}
                      {shoot.status === 'Completed' && (
                        <span className="text-emerald-700 font-bold">All {shoot.reels_count} reels in Editing</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SCHEDULE SHOOT MODAL */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Video Shoot Session"
        subtitle="Select client, batch planned reels, and assign crew."
        maxWidth="xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createShootMutation.mutate({ data: shootForm, force: false });
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 mb-1">Client *</label>
            <select
              required
              value={shootForm.client_id}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.business_name}
                </option>
              ))}
            </select>
          </div>

          {/* REELS BATCH SELECTION FOR SHOOT */}
          {shootForm.client_id && (
            <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="font-bold text-purple-950 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    Select Reels to Film ({shootForm.reel_ids.length} of {clientPlannedReels.length} selected)
                  </label>
                  <p className="text-[11px] text-purple-700 mt-0.5">
                    Agency shoots film batches of 4-6 reels per session. Select ready scripts below:
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {scriptReadyReels.length > 0 && (
                    <button
                      type="button"
                      onClick={selectAllReady}
                      className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold"
                    >
                      Select All Script-Ready ({scriptReadyReels.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = clientPlannedReels.map((r) => r.id).slice(0, 4);
                      setShootForm((prev) => ({ ...prev, reel_ids: allIds, reels_count: allIds.length }));
                    }}
                    className="px-2 py-1 bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 rounded text-[10px] font-bold"
                  >
                    Select First 4
                  </button>
                </div>
              </div>

              {clientPlannedReels.length === 0 ? (
                <div className="p-3 bg-white rounded-lg border border-purple-100 text-center text-slate-500">
                  No planned reels found for this client. You can still schedule the shoot with estimated reels count.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {clientPlannedReels.map((reel) => {
                    const isSelected = shootForm.reel_ids.includes(reel.id);
                    const isReady = reel.script_status === 'Ready' || reel.script_status === 'Completed';

                    return (
                      <div
                        key={reel.id}
                        onClick={() => toggleReelSelection(reel.id)}
                        className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-purple-100/90 border-purple-400 text-purple-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-purple-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by parent div
                            className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                          />
                          <div>
                            <span className="text-xs">
                              #{reel.reel_number} {reel.title}
                            </span>
                            {reel.hook_line && (
                              <span className="block text-[10px] text-slate-500 font-normal italic truncate max-w-sm">
                                "{reel.hook_line}"
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isReady ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> Script Ready
                            </span>
                          ) : reel.script_status === 'In Progress' ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded-full">
                              ⚠️ Drafting
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full">
                              ❌ No Script
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Shoot Type / Concept *</label>
            <input
              type="text"
              required
              placeholder="e.g. Festive Bridal Evening Lookbook"
              value={shootForm.shoot_type}
              onChange={(e) => setShootForm({ ...shootForm, shoot_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Shoot Date *</label>
              <input
                type="date"
                required
                value={shootForm.date}
                onChange={(e) => setShootForm({ ...shootForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Call Start Time</label>
              <input
                type="text"
                placeholder="10:00 AM"
                value={shootForm.start_time}
                onChange={(e) => setShootForm({ ...shootForm, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="text"
                placeholder="02:00 PM"
                value={shootForm.end_time}
                onChange={(e) => setShootForm({ ...shootForm, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Location / Venue *</label>
            <input
              type="text"
              required
              placeholder="e.g. Luxe Aura Studio, Bandra West"
              value={shootForm.location}
              onChange={(e) => setShootForm({ ...shootForm, location: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Camera Man (DP)</label>
              <select
                value={shootForm.cameraman_id}
                onChange={(e) => setShootForm({ ...shootForm, cameraman_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Select Camera Man...</option>
                {cameramen.map((c) => (
                  <option key={c.user_id} value={c.user_id}>
                    {c.name} ({c.availability_status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Model / Talent</label>
              <select
                value={shootForm.model_id}
                onChange={(e) => setShootForm({ ...shootForm, model_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Without Model</option>
                {models.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.name} ({m.skills.join(', ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Call Notes / Shot Checklist</label>
            <textarea
              rows={2}
              placeholder="Special lenses required, wardrobe changes, client arrival notes..."
              value={shootForm.notes}
              onChange={(e) => setShootForm({ ...shootForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createShootMutation.isPending}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm"
            >
              {createShootMutation.isPending ? 'Verifying schedule...' : 'Schedule Shoot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DOUBLE-BOOKING CONFLICT MODAL */}
      {conflictModalOpen && (
        <Modal
          isOpen={conflictModalOpen}
          onClose={() => setConflictModalOpen(false)}
          title="⚠️ Double-Booking Conflict Warning"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Schedule Collision Detected!</h4>
                <p className="mt-1 leading-relaxed">{conflictMessage}</p>
              </div>
            </div>

            <p className="text-slate-600">
              The assigned crew member is already booked for another shoot on this date and time. You can either adjust the date/time/crew or force override this booking.
            </p>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConflictModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-bold hover:bg-slate-50"
              >
                Change Schedule
              </button>
              <button
                type="button"
                onClick={() => {
                  createShootMutation.mutate({ data: shootForm, force: true });
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-sm"
              >
                Force Override Booking
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};


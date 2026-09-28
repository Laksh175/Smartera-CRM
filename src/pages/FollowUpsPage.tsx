import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import type { LeadFollowup, Lead } from '../types';

export const FollowUpsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'upcoming' | 'completed'>('today');
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState<(LeadFollowup & { lead: Lead }) | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [outcomeStatus, setOutcomeStatus] = useState<'Completed' | 'Missed' | 'Cancelled'>('Completed');

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.getLeads(),
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Flatten all follow-ups across leads
  const allFollowups: (LeadFollowup & { lead: Lead })[] = [];
  leads.forEach((l) => {
    if (l.followups) {
      l.followups.forEach((f) => {
        allFollowups.push({ ...f, lead: l });
      });
    }
  });

  const updateFollowupMutation = useMutation({
    mutationFn: (params: { id: string; data: any }) => api.updateFollowup(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setOutcomeModalOpen(false);
      setSelectedFollowup(null);
      setOutcomeNotes('');
    },
  });

  const todayList = allFollowups.filter((f) => f.followup_date === todayStr && f.status === 'Pending');
  const overdueList = allFollowups.filter((f) => f.followup_date < todayStr && (f.status === 'Pending' || f.status === 'Missed'));
  const upcomingList = allFollowups.filter((f) => f.followup_date > todayStr && f.status === 'Pending');
  const completedList = allFollowups.filter((f) => f.status === 'Completed');

  const currentList =
    activeTab === 'today'
      ? todayList
      : activeTab === 'overdue'
      ? overdueList
      : activeTab === 'upcoming'
      ? upcomingList
      : completedList;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-brand-600" />
            Sales Follow-up Cockpit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Never lose a deal: monitor upcoming calls, pitches, meetings, and resolve overdue touchpoints.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/leads')}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          View Leads to Schedule
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="card-base p-2 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'today'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          Today's Scheduled ({todayList.length})
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-600 hover:bg-rose-50'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Overdue Follow-ups ({overdueList.length})
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'upcoming'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Upcoming ({upcomingList.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'completed'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Completed ({completedList.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <div className="card-base p-12 text-center text-slate-400 text-xs">
            No follow-ups in this tab right now.
          </div>
        ) : (
          currentList.map((fup) => (
            <div
              key={fup.id}
              className="card-base p-5 card-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{fup.lead.company_name}</span>
                  <span className="text-xs text-slate-500">({fup.lead.name})</span>
                  <StatusBadge status={fup.status} size="sm" />
                </div>

                <p className="text-xs text-slate-600">{fup.notes}</p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    {fup.followup_date} at {fup.followup_time}
                  </span>
                  <span>Type: <strong className="text-slate-700">{fup.type}</strong></span>
                  <span>Phone: <strong className="text-slate-700">{fup.lead.phone}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {fup.lead.phone && (
                  <a
                    href={`https://wa.me/${fup.lead.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}

                {fup.status !== 'Completed' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFollowup(fup);
                      setOutcomeModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                  >
                    Log Outcome
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate(`/leads?leadId=${fup.lead.id}`)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  title="Go to Lead Profile"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* OUTCOME MODAL */}
      {selectedFollowup && outcomeModalOpen && (
        <Modal
          isOpen={outcomeModalOpen}
          onClose={() => setOutcomeModalOpen(false)}
          title={`Log Outcome for ${selectedFollowup.lead.company_name}`}
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateFollowupMutation.mutate({
                id: selectedFollowup.id,
                data: {
                  result: outcomeNotes,
                  status: outcomeStatus,
                },
              });
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Result</label>
              <select
                value={outcomeStatus}
                onChange={(e) => setOutcomeStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Completed">Completed (Spoke with client)</option>
                <option value="Missed">Missed / Unanswered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Outcome / Discussion Summary</label>
              <textarea
                required
                rows={3}
                placeholder="Client agreed to proposal, requested shoot schedule, etc..."
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOutcomeModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateFollowupMutation.isPending}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm"
              >
                {updateFollowupMutation.isPending ? 'Updating...' : 'Save Result'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

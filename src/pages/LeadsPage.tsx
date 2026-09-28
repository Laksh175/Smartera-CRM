import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Instagram,
  Calendar,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  MessageSquare,
  Building2,
  Trash2,
  Edit2,
  Save,
  FileText,
  AlertTriangle,
  Check,
  MapPin,
  Tag
} from 'lucide-react';
import { api } from '../api/client';
import { SearchInput } from '../components/common/SearchInput';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import type { Lead, LeadFollowup } from '../types';

export const LeadsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Modals
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [editLeadOpen, setEditLeadOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [addFollowupOpen, setAddFollowupOpen] = useState(false);

  // Inline notes editing state inside Lead Detail Modal
  const [editingNotes, setEditingNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaveMessage, setNotesSaveMessage] = useState('');

  // Form States for Add Lead
  const [leadForm, setLeadForm] = useState({
    name: '',
    company_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    instagram: '',
    category: 'Fashion & Luxury',
    city: 'Mumbai',
    address: '',
    source: 'Instagram',
    estimated_budget: 35000,
    priority: 'Medium' as const,
    status: 'New' as const,
    next_followup_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Form States for Edit Lead
  const [editLeadForm, setEditLeadForm] = useState({
    name: '',
    company_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    instagram: '',
    category: 'Fashion & Luxury',
    city: 'Mumbai',
    address: '',
    source: 'Instagram',
    estimated_budget: 35000,
    priority: 'Medium' as const,
    status: 'New' as const,
    next_followup_date: '',
    notes: '',
  });

  // Form States for Conversion Wizard
  const [convertForm, setConvertForm] = useState({
    package_template_id: 'pkg-tpl-002',
    package_name: 'Pro Brand Scaling',
    original_price: 45000,
    discount: 0,
    initial_payment_amount: 25000,
    payment_method: 'UPI' as const,
    transaction_id: '',
    payment_notes: 'Initial retainer advance',
  });

  // Form States for Add Followup
  const [followupForm, setFollowupForm] = useState({
    followup_date: new Date().toISOString().split('T')[0],
    followup_time: '11:00 AM',
    type: 'Call' as const,
    notes: '',
  });

  // Sync editingNotes whenever selectedLead changes
  useEffect(() => {
    if (selectedLead) {
      setEditingNotes(selectedLead.notes || '');
      setNotesSaveMessage('');
    }
  }, [selectedLead]);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads', selectedStatus, search],
    queryFn: () =>
      api.getLeads({
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        search: search || undefined,
      }),
  });

  const { data: packageTemplates = [] } = useQuery({
    queryKey: ['package-templates'],
    queryFn: () => api.getPackageTemplates(),
  });

  const createLeadMutation = useMutation({
    mutationFn: (data: any) => api.createLead(data),
    onSuccess: (newLead) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setAddLeadOpen(false);
      setSelectedLead(newLead);
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateLead(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setEditLeadOpen(false);
      setEditingLead(null);
      if (selectedLead && selectedLead.id === updated.id) {
        setSelectedLead(updated);
      }
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => api.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setDeleteConfirmOpen(false);
      const deletedId = leadToDelete?.id;
      setLeadToDelete(null);
      if (selectedLead && selectedLead.id === deletedId) {
        setSelectedLead(null);
      }
    },
  });

  const addFollowupMutation = useMutation({
    mutationFn: (data: any) => api.addFollowup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setAddFollowupOpen(false);
      setFollowupForm({
        followup_date: new Date().toISOString().split('T')[0],
        followup_time: '11:00 AM',
        type: 'Call',
        notes: '',
      });
      if (selectedLead) {
        api.getLeadById(selectedLead.id).then(setSelectedLead);
      }
    },
  });

  const convertLeadMutation = useMutation({
    mutationFn: (data: any) => api.convertLead(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setConvertModalOpen(false);
      navigate(`/clients/${res.client.id}`);
    },
  });

  const handleOpenEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setEditLeadForm({
      name: lead.name || '',
      company_name: lead.company_name || '',
      phone: lead.phone || '',
      whatsapp: lead.whatsapp || '',
      email: lead.email || '',
      instagram: lead.instagram || '',
      category: lead.category || 'Fashion & Luxury',
      city: lead.city || 'Mumbai',
      address: lead.address || '',
      source: lead.source || 'Instagram',
      estimated_budget: lead.estimated_budget || 0,
      priority: (lead.priority || 'Medium') as any,
      status: (lead.status || 'New') as any,
      next_followup_date: lead.next_followup_date ? lead.next_followup_date.split('T')[0] : '',
      notes: lead.notes || '',
    });
    setEditLeadOpen(true);
  };

  const handleOpenDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteConfirmOpen(true);
  };

  const handleSaveInlineNotes = async () => {
    if (!selectedLead) return;
    setIsSavingNotes(true);
    try {
      const updated = await api.updateLead(selectedLead.id, { notes: editingNotes });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedLead(updated);
      setNotesSaveMessage('Notes saved successfully!');
      setTimeout(() => setNotesSaveMessage(''), 3000);
    } catch (err: any) {
      setNotesSaveMessage(`Error: ${err.message || 'Failed to save notes'}`);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const statusOptions = ['All', 'New', 'Contacted', 'Interested', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            Lead Management & Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture, nurture, follow-up, edit, and convert inbound agency leads into active paying clients.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddLeadOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Lead
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-base p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {statusOptions.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by business, client name, phone..."
          className="w-full md:w-72"
        />
      </div>

      {/* Leads Table / Grid */}
      <div className="card-base overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-slate-700">No leads found</p>
            <p className="text-xs text-slate-400 mt-1">Try changing the status filter or search keyword.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Lead / Company</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Source & Category</th>
                  <th className="px-4 py-3.5">Est. Budget</th>
                  <th className="px-4 py-3.5">Status & Priority</th>
                  <th className="px-4 py-3.5">Next Follow-up</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{lead.company_name}</span>
                          {lead.is_converted && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Converted
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 font-medium mt-0.5">{lead.name} • {lead.lead_id}</p>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>
                      {lead.instagram && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Instagram className="w-3 h-3 text-pink-500" />
                          <span>{lead.instagram}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-block font-semibold text-slate-800">{lead.source}</span>
                      <p className="text-[11px] text-slate-400">{lead.category}</p>
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-900">
                      ₹{lead.estimated_budget.toLocaleString()}
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <StatusBadge status={lead.status} size="sm" />
                        <span
                          className={`block text-[10px] font-bold uppercase tracking-wider ${
                            lead.priority === 'Urgent'
                              ? 'text-rose-600'
                              : lead.priority === 'High'
                              ? 'text-amber-600'
                              : 'text-slate-400'
                          }`}
                        >
                          Priority: {lead.priority}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {lead.next_followup_date ? (
                        <div className="flex items-center gap-1 text-slate-700 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          <span>{lead.next_followup_date}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not scheduled</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {!lead.is_converted && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLead(lead);
                              setConvertModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                            title="Convert to Client"
                          >
                            <Sparkles className="w-3 h-3" />
                            Convert
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEditLead(lead)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteLead(lead)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LEAD DETAIL DRAWER MODAL */}
      {selectedLead && !convertModalOpen && !editLeadOpen && !deleteConfirmOpen && (
        <Modal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={selectedLead.company_name}
          subtitle={`Lead ID: ${selectedLead.lead_id} • Created ${new Date(selectedLead.created_at).toLocaleDateString()}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Action Bar inside Lead Detail */}
            <div className="flex items-center justify-between p-3 bg-slate-100/70 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedLead.status} size="sm" />
                <span className="text-xs font-semibold text-slate-600">
                  Priority: <strong className="text-slate-800">{selectedLead.priority}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditLead(selectedLead)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-brand-600" />
                  Edit Lead
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDeleteLead(selectedLead)}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  Delete Lead
                </button>
              </div>
            </div>

            {/* Top Banner if already converted */}
            {selectedLead.is_converted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Successfully converted to Client ID: {selectedLead.converted_client_id}
                </span>
                <button
                  onClick={() => navigate(`/clients/${selectedLead.converted_client_id}`)}
                  className="font-bold underline flex items-center gap-1"
                >
                  Go to Client Profile <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Quick Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200/70">
              <div>
                <span className="text-slate-400 block font-medium">Contact Person</span>
                <span className="font-bold text-slate-800">{selectedLead.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Phone / WhatsApp</span>
                <span className="font-bold text-slate-800">{selectedLead.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Est. Budget</span>
                <span className="font-bold text-slate-800">₹{selectedLead.estimated_budget.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Acquisition Source</span>
                <span className="font-bold text-slate-800">{selectedLead.source}</span>
              </div>
            </div>

            {/* EDITABLE LEAD NOTES & REQUIREMENTS */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                  Lead Notes & Requirements
                </h4>
                {notesSaveMessage && (
                  <span className={`text-[11px] font-bold flex items-center gap-1 ${
                    notesSaveMessage.includes('Error') ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    <Check className="w-3.5 h-3.5" /> {notesSaveMessage}
                  </span>
                )}
              </div>

              <textarea
                rows={3}
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Add/edit client requirements, brand vision, shoot specifications, deliverables agreed, pain points..."
                className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none leading-relaxed transition-all shadow-2xs"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Click save to update lead requirements & notes immediately.
                </span>
                <button
                  type="button"
                  onClick={handleSaveInlineNotes}
                  disabled={isSavingNotes}
                  className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>

            {/* Follow-up Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                  Follow-up History & Next Actions
                </h4>
                <button
                  type="button"
                  onClick={() => setAddFollowupOpen(true)}
                  className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-brand-200"
                >
                  <Plus className="w-3 h-3" />
                  Log Follow-up
                </button>
              </div>

              {selectedLead.followups && selectedLead.followups.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {selectedLead.followups.map((fup) => (
                    <div key={fup.id} className="p-3 text-xs flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{fup.type} Outreach</span>
                          <StatusBadge status={fup.status} size="sm" />
                        </div>
                        <p className="text-slate-600 mt-1">{fup.notes}</p>
                        {fup.result && (
                          <p className="text-slate-500 italic mt-0.5">Outcome: {fup.result}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-700 block">{fup.followup_date}</span>
                        <span>{fup.followup_time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No follow-ups recorded yet.</p>
              )}
            </div>

            {/* Footer Convert Button */}
            {!selectedLead.is_converted && (
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setConvertModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  Convert to Active Client
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* FULL EDIT LEAD MODAL */}
      {editingLead && editLeadOpen && (
        <Modal
          isOpen={editLeadOpen}
          onClose={() => {
            setEditLeadOpen(false);
            setEditingLead(null);
          }}
          title={`Edit Lead: ${editingLead.company_name}`}
          subtitle={`Lead ID: ${editingLead.lead_id}`}
          maxWidth="xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateLeadMutation.mutate({
                id: editingLead.id,
                data: editLeadForm,
              });
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business / Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Velvet Runway Studios"
                  value={editLeadForm.company_name}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={editLeadForm.name}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, name: e.target.value })}
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
                  value={editLeadForm.phone}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  placeholder="+91 98200 00000"
                  value={editLeadForm.whatsapp}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="contact@brand.com"
                  value={editLeadForm.email}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Instagram Handle</label>
                <input
                  type="text"
                  placeholder="@brandname"
                  value={editLeadForm.instagram}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, instagram: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Acquisition Source</label>
                <select
                  value={editLeadForm.source}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, source: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Website">Website</option>
                  <option value="Google">Google Search</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category / Niche</label>
                <select
                  value={editLeadForm.category}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Fashion & Luxury">Fashion & Luxury</option>
                  <option value="Hospitality & Dining">Hospitality & Dining</option>
                  <option value="Fitness & Wellness">Fitness & Wellness</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Healthcare & Aesthetics">Healthcare & Aesthetics</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Jewellery">Jewellery</option>
                  <option value="Tech & SaaS">Tech & SaaS</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Est. Budget (₹)</label>
                <input
                  type="number"
                  value={editLeadForm.estimated_budget}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, estimated_budget: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lead Status</label>
                <select
                  value={editLeadForm.status}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Meeting Scheduled">Meeting Scheduled</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority</label>
                <select
                  value={editLeadForm.priority}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={editLeadForm.next_followup_date}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, next_followup_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">City / Location</label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Bandra West"
                value={editLeadForm.city}
                onChange={(e) => setEditLeadForm({ ...editLeadForm, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lead Notes & Requirements</label>
              <textarea
                rows={3}
                placeholder="Client requirement, initial conversation details, deliverables..."
                value={editLeadForm.notes}
                onChange={(e) => setEditLeadForm({ ...editLeadForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditLeadOpen(false);
                  setEditingLead(null);
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateLeadMutation.isPending}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm"
              >
                {updateLeadMutation.isPending ? 'Saving...' : 'Update Lead'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE LEAD CONFIRMATION MODAL */}
      {leadToDelete && deleteConfirmOpen && (
        <Modal
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setLeadToDelete(null);
          }}
          title="Delete Lead"
          subtitle="This action will permanently delete the lead."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-rose-900">
                <p className="font-bold text-sm">Are you sure you want to delete this lead?</p>
                <p className="mt-1 text-xs text-rose-700 leading-relaxed">
                  Lead: <strong>{leadToDelete.company_name}</strong> ({leadToDelete.name} • {leadToDelete.lead_id})
                </p>
                <p className="mt-1 text-[11px] text-rose-600">
                  This will permanently remove the lead along with all recorded follow-up timelines. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setLeadToDelete(null);
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLeadMutation.isPending}
                onClick={() => deleteLeadMutation.mutate(leadToDelete.id)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {deleteLeadMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 1-CLICK CONVERT LEAD TO CLIENT MODAL */}
      {selectedLead && convertModalOpen && (
        <Modal
          isOpen={convertModalOpen}
          onClose={() => setConvertModalOpen(false)}
          title={`Convert "${selectedLead.company_name}" to Client`}
          subtitle="Automatically creates client record, business profile, package, and records onboarding payment."
          maxWidth="xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              convertLeadMutation.mutate({
                lead_id: selectedLead.id,
                package_template_id: convertForm.package_template_id,
                package_name: convertForm.package_name,
                original_price: convertForm.original_price,
                discount: convertForm.discount,
                initial_payment: {
                  amount: convertForm.initial_payment_amount,
                  payment_method: convertForm.payment_method,
                  transaction_id: convertForm.transaction_id,
                  notes: convertForm.payment_notes,
                },
              });
            }}
            className="space-y-4 text-xs"
          >
            {/* Preserved Data Summary Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Transferring Preserved Lead Data:</p>
              <p className="text-slate-500">
                Business: <strong>{selectedLead.company_name}</strong> • Owner: <strong>{selectedLead.name}</strong> • Phone: <strong>{selectedLead.phone}</strong> • Source: <strong>{selectedLead.source}</strong>
              </p>
            </div>

            {/* Select Package Template */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Agency Package</label>
              <select
                value={convertForm.package_template_id}
                onChange={(e) => {
                  const tpl = packageTemplates.find((t) => t.id === e.target.value);
                  setConvertForm({
                    ...convertForm,
                    package_template_id: e.target.value,
                    package_name: tpl?.name || convertForm.package_name,
                    original_price: tpl?.price || convertForm.original_price,
                  });
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              >
                {packageTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (₹{t.price.toLocaleString()} / mo - {t.reels_count} Reels, {t.shoot_count} Shoots)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  value={convertForm.original_price}
                  onChange={(e) => setConvertForm({ ...convertForm, original_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Discount (₹)</label>
                <input
                  type="number"
                  value={convertForm.discount}
                  onChange={(e) => setConvertForm({ ...convertForm, discount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex justify-between items-center font-bold text-indigo-900">
              <span>Final Contract Value:</span>
              <span className="text-sm">
                ₹{Math.max(0, convertForm.original_price - convertForm.discount).toLocaleString()}
              </span>
            </div>

            {/* Initial Onboarding Payment */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800">Initial Onboarding Payment</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Advance Amount Received (₹)</label>
                  <input
                    type="number"
                    value={convertForm.initial_payment_amount}
                    onChange={(e) => setConvertForm({ ...convertForm, initial_payment_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={convertForm.payment_method}
                    onChange={(e) => setConvertForm({ ...convertForm, payment_method: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit/Debit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Transaction ID / Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-992019482910"
                  value={convertForm.transaction_id}
                  onChange={(e) => setConvertForm({ ...convertForm, transaction_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConvertModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={convertLeadMutation.isPending}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm"
              >
                {convertLeadMutation.isPending ? 'Converting...' : 'Confirm & Create Client'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD LEAD MODAL */}
      <Modal
        isOpen={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        title="Capture New Agency Lead"
        subtitle="Record lead details for sales outreach and proposal tracking."
        maxWidth="xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createLeadMutation.mutate(leadForm);
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business / Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Velvet Runway Studios"
                value={leadForm.company_name}
                onChange={(e) => setLeadForm({ ...leadForm, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Person Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
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
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                placeholder="+91 98200 00000"
                value={leadForm.whatsapp}
                onChange={(e) => setLeadForm({ ...leadForm, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="contact@brand.com"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Instagram Handle</label>
              <input
                type="text"
                placeholder="@brandname"
                value={leadForm.instagram}
                onChange={(e) => setLeadForm({ ...leadForm, instagram: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Acquisition Source</label>
              <select
                value={leadForm.source}
                onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Website">Website</option>
                <option value="Google">Google Search</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={leadForm.category}
                onChange={(e) => setLeadForm({ ...leadForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Fashion & Luxury">Fashion & Luxury</option>
                <option value="Hospitality & Dining">Hospitality & Dining</option>
                <option value="Fitness & Wellness">Fitness & Wellness</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Healthcare & Aesthetics">Healthcare & Aesthetics</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Jewellery">Jewellery</option>
                <option value="Tech & SaaS">Tech & SaaS</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Est. Budget (₹)</label>
              <input
                type="number"
                value={leadForm.estimated_budget}
                onChange={(e) => setLeadForm({ ...leadForm, estimated_budget: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={leadForm.priority}
                onChange={(e) => setLeadForm({ ...leadForm, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Next Follow-up Date</label>
              <input
                type="date"
                value={leadForm.next_followup_date}
                onChange={(e) => setLeadForm({ ...leadForm, next_followup_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lead Notes & Requirements</label>
            <textarea
              rows={3}
              placeholder="Client requirement, initial conversation details, deliverables expected..."
              value={leadForm.notes}
              onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddLeadOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLeadMutation.isPending}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm"
            >
              {createLeadMutation.isPending ? 'Saving...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* LOG FOLLOW-UP MODAL */}
      {selectedLead && addFollowupOpen && (
        <Modal
          isOpen={addFollowupOpen}
          onClose={() => setAddFollowupOpen(false)}
          title={`Log Follow-up with ${selectedLead.company_name}`}
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addFollowupMutation.mutate({
                lead_id: selectedLead.id,
                ...followupForm,
              });
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Follow-up Type</label>
                <select
                  value={followupForm.type}
                  onChange={(e) => setFollowupForm({ ...followupForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Call">Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Meeting">In-Person Meeting</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={followupForm.followup_date}
                  onChange={(e) => setFollowupForm({ ...followupForm, followup_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Follow-up Notes / Discussion</label>
              <textarea
                required
                rows={3}
                placeholder="What was discussed? Next steps agreed with client..."
                value={followupForm.notes}
                onChange={(e) => setFollowupForm({ ...followupForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddFollowupOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addFollowupMutation.isPending}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg"
              >
                {addFollowupMutation.isPending ? 'Logging...' : 'Save Follow-up'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

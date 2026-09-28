import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCheck, Briefcase, Film, Calendar, Users, X, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

interface OmniSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OmniSearchModal: React.FC<OmniSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const { data: leads = [] } = useQuery({ queryKey: ['leads'], queryFn: () => api.getLeads(), enabled: isOpen });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => api.getClients(), enabled: isOpen });
  const { data: reels = [] } = useQuery({ queryKey: ['reels'], queryFn: () => api.getReels(), enabled: isOpen });
  const { data: shoots = [] } = useQuery({ queryKey: ['shoots'], queryFn: () => api.getShoots(), enabled: isOpen });
  const { data: staff = [] } = useQuery({ queryKey: ['staff'], queryFn: () => api.getStaff(), enabled: isOpen });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredLeads = q ? leads.filter((l) => l.name.toLowerCase().includes(q) || l.company_name.toLowerCase().includes(q) || l.lead_id.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredClients = q ? clients.filter((c) => c.business_name.toLowerCase().includes(q) || c.client_id.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredReels = q ? reels.filter((r) => r.title.toLowerCase().includes(q) || r.reel_id.toLowerCase().includes(q) || r.client_name?.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredShoots = q ? shoots.filter((s) => s.location.toLowerCase().includes(q) || s.shoot_type.toLowerCase().includes(q) || s.client_name?.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredStaff = q ? staff.filter((s) => s.name?.toLowerCase().includes(q) || s.role_type.toLowerCase().includes(q)).slice(0, 3) : [];

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  const totalResults = filteredLeads.length + filteredClients.length + filteredReels.length + filteredShoots.length + filteredStaff.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-modal">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-brand-600 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, clients, reels, shoots, staff... (Esc to close)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 divide-y divide-slate-100">
          {!query && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type anything to search across the entire Smartera Digital agency operations.
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching results found for "{query}".
            </div>
          )}

          {/* Clients */}
          {filteredClients.length > 0 && (
            <div className="py-2">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Clients</p>
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => handleSelect(`/clients/${client.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-brand-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-600">{client.business_name}</p>
                      <p className="text-xs text-slate-500">{client.client_id} • {client.category}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600" />
                </div>
              ))}
            </div>
          )}

          {/* Leads */}
          {filteredLeads.length > 0 && (
            <div className="py-2">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Leads</p>
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => handleSelect(`/leads?leadId=${lead.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-600">{lead.company_name} ({lead.name})</p>
                      <p className="text-xs text-slate-500">{lead.lead_id} • Status: {lead.status}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600" />
                </div>
              ))}
            </div>
          )}

          {/* Reels */}
          {filteredReels.length > 0 && (
            <div className="py-2">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Reels & Content</p>
              {filteredReels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => handleSelect(`/reels?reelId=${reel.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Film className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-600">{reel.title}</p>
                      <p className="text-xs text-slate-500">{reel.reel_id} • {reel.client_name} • Stage: {reel.overall_status}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600" />
                </div>
              ))}
            </div>
          )}

          {/* Shoots */}
          {filteredShoots.length > 0 && (
            <div className="py-2">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Shoots</p>
              {filteredShoots.map((shoot) => (
                <div
                  key={shoot.id}
                  onClick={() => handleSelect('/shoots')}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-600">{shoot.shoot_type} — {shoot.client_name}</p>
                      <p className="text-xs text-slate-500">{shoot.date} • {shoot.location}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600" />
                </div>
              ))}
            </div>
          )}

          {/* Staff */}
          {filteredStaff.length > 0 && (
            <div className="py-2">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Staff Team</p>
              {filteredStaff.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleSelect('/staff')}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-600">{st.name}</p>
                      <p className="text-xs text-slate-500">{st.role_type} • {st.phone}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

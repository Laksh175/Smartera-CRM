import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Film,
  Video,
  Clock,
  Filter,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const ContentCalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedClient, setSelectedClient] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const { data: reels = [] } = useQuery({
    queryKey: ['reels'],
    queryFn: () => api.getReels(),
  });

  const { data: shoots = [] } = useQuery({
    queryKey: ['shoots'],
    queryFn: () => api.getShoots(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.getClients(),
  });

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sun

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  // Combine calendar items: Shoots and Scheduled Posts / Deadlines
  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${month}-${dayStr}`;

    const events: any[] = [];

    // Shoots
    shoots.forEach((s) => {
      if (s.date === dateKey) {
        if (selectedClient === 'All' || s.client_id === selectedClient) {
          events.push({
            id: s.id,
            type: 'shoot',
            title: `🎬 Shoot: ${s.client_name}`,
            time: s.start_time,
            location: s.location,
            status: s.status,
            raw: s,
          });
        }
      }
    });

    // Reels Posting
    reels.forEach((r) => {
      if (r.posting_date === dateKey) {
        if (selectedClient === 'All' || r.client_id === selectedClient) {
          events.push({
            id: r.id,
            type: 'post',
            title: `📱 Post Reel #${r.reel_number}: ${r.client_name}`,
            time: r.posting_time || '06:00 PM',
            status: r.posting_status,
            raw: r,
          });
        }
      }
    });

    return events;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-600" />
            Agency Content & Production Calendar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized workflow view of scheduled shoots, editing milestones, and posting dates.
          </p>
        </div>

        {/* Client Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700 shadow-2xs"
          >
            <option value="All">All Client Workflows</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.business_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="card-base p-6 space-y-4">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(2026, 8, 1))}
              className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
            >
              Today (Sep 2026)
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-[11px] font-bold text-slate-500 py-2.5 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="min-h-[110px] bg-slate-50/40 p-2" />;
              }

              const events = getEventsForDay(day);
              const isToday = day === 15; // Sep 15

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-50/80 ${
                    isToday ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-brand-600 text-white' : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {events.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-semibold">{events.length}</span>
                    )}
                  </div>

                  {/* Events list inside cell */}
                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`px-1.5 py-1 rounded text-[10px] font-semibold truncate cursor-pointer transition-all ${
                          ev.type === 'shoot'
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                            : 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200'
                        }`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.type === 'shoot' ? 'Shoot Details' : 'Scheduled Post Details'}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{selectedEvent.title}</h4>
              <p className="text-slate-600">Time: <strong>{selectedEvent.time}</strong></p>
              <div className="pt-1">
                <StatusBadge status={selectedEvent.status} size="sm" />
              </div>
            </div>

            {selectedEvent.type === 'shoot' && (
              <div className="space-y-2 text-slate-600">
                <p>Location: <strong className="text-slate-900">{selectedEvent.raw.location}</strong></p>
                <p>Camera Man: <strong className="text-slate-900">{selectedEvent.raw.cameraman_name || 'Rahul Sen'}</strong></p>
                <p>Model: <strong className="text-slate-900">{selectedEvent.raw.model_name || 'None'}</strong></p>
                <p>Notes: {selectedEvent.raw.notes || 'No special notes'}</p>
              </div>
            )}

            {selectedEvent.type === 'post' && (
              <div className="space-y-2 text-slate-600">
                <p>Content Format: <strong className="text-slate-900">{selectedEvent.raw.content_type}</strong></p>
                <p>Editor: <strong className="text-slate-900">{selectedEvent.raw.assigned_editor_name || 'Rohan Mehta'}</strong></p>
                {selectedEvent.raw.external_url && (
                  <p>
                    Link: <a href={selectedEvent.raw.external_url} target="_blank" rel="noreferrer" className="text-brand-600 font-bold underline">Open Drive Link</a>
                  </p>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

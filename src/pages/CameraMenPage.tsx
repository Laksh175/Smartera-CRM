import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Camera, Video, Phone, Mail, CheckCircle2, Clock, MapPin, Plus } from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';

export const CameraMenPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.getStaff(),
  });

  const { data: shoots = [] } = useQuery({
    queryKey: ['shoots'],
    queryFn: () => api.getShoots(),
  });

  const cameramen = staff.filter((s) => s.role_type === 'Camera Man' || s.role_type === 'Super Admin');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-600" />
            Camera Men & Cinematographers Roster
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage agency camera operators, lighting gear setups, day rates, and shoot call-sheet bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/shoots')}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Video className="w-4 h-4" />
          Schedule Shoot with DP
        </button>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cameramen.map((cam) => {
          const assignedShoots = shoots.filter((s) => s.cameraman_id === cam.user_id && s.status !== 'Cancelled');
          return (
            <div key={cam.id} className="card-base p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={cam.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                    alt={cam.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{cam.name}</h3>
                    <p className="text-xs font-semibold text-brand-600">{cam.role_type}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cam.phone} • {cam.email}</p>
                  </div>
                </div>

                <StatusBadge status={cam.availability_status} size="sm" />
              </div>

              {/* Equipment Kit Specs */}
              {cam.equipment && (
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1 text-xs">
                  <span className="font-bold text-slate-700 block">Primary Equipment & Lighting Kit:</span>
                  <p className="text-slate-600 font-mono text-[11px] leading-relaxed">{cam.equipment}</p>
                </div>
              )}

              {/* Skills & Day Rate */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Daily Commercial Rate</span>
                  <span className="font-black text-slate-900 text-sm">₹{cam.daily_rate.toLocaleString()} / day</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-medium">Assigned Shoots</span>
                  <span className="font-bold text-brand-600">{assignedShoots.length} Booked</span>
                </div>
              </div>

              {/* Upcoming Shoots */}
              {assignedShoots.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Upcoming Booked Schedule:
                  </span>
                  <div className="space-y-1.5">
                    {assignedShoots.slice(0, 2).map((shoot) => (
                      <div key={shoot.id} className="p-2 rounded-lg bg-amber-50/60 border border-amber-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{shoot.client_name}</span>
                          <p className="text-[11px] text-slate-500">{shoot.location}</p>
                        </div>
                        <span className="font-semibold text-slate-700 text-[11px]">{shoot.date} ({shoot.start_time})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

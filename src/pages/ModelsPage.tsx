import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Video, Instagram, Phone, Star, Sparkles, Plus } from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';

export const ModelsPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.getStaff(),
  });

  const { data: shoots = [] } = useQuery({
    queryKey: ['shoots'],
    queryFn: () => api.getShoots(),
  });

  const models = staff.filter((s) => s.role_type === 'Model');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Agency Talent & Models Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cast and assign models for fashion lookbooks, culinary reels, lifestyle showcases, and commercial shoots.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/shoots')}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Video className="w-4 h-4" />
          Book Model for Shoot
        </button>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((model) => {
          const assignedShoots = shoots.filter((s) => s.model_id === model.user_id && s.status !== 'Cancelled');
          return (
            <div key={model.id} className="card-base p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={model.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                    alt={model.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-100 shadow-sm"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{model.name}</h3>
                    <p className="text-xs text-slate-500">{model.gender} • {model.instagram || '@model.official'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{model.phone}</p>
                  </div>
                </div>

                <StatusBadge status={model.availability_status} size="sm" />
              </div>

              {/* Skills Tags */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 block">Category Specialties:</span>
                <div className="flex flex-wrap gap-1.5">
                  {model.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rates */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Daily Commercial Booking Rate</span>
                  <span className="font-black text-slate-900 text-sm">₹{model.daily_rate.toLocaleString()} / day</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-medium">Confirmed Shoots</span>
                  <span className="font-bold text-purple-600">{assignedShoots.length} Booked</span>
                </div>
              </div>

              {/* Assigned Shoots */}
              {assignedShoots.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Confirmed Shoot Call-Times:
                  </span>
                  <div className="space-y-1.5">
                    {assignedShoots.map((shoot) => (
                      <div key={shoot.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{shoot.client_name}</span>
                          <p className="text-[11px] text-slate-500">{shoot.shoot_type}</p>
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

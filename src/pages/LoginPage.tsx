import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, DEMO_PROFILES } from '../store/authStore';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import type { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, switchRole } = useAuthStore();

  const [email, setEmail] = useState('admin@smarteradigital.com');
  const [password, setPassword] = useState('smartera123');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedProfile = DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (matchedProfile) {
      setUser(matchedProfile, 'mock_token_' + matchedProfile.role);
      navigate('/');
    } else {
      setError('Invalid credentials. Please use one of the demo profiles below.');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    switchRole(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white font-black text-xl shadow-lg shadow-brand-500/30 mb-3">
          S
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight font-sans">
          SMARTERA DIGITAL
        </h2>
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mt-0.5">
          Agency Operations & CRM System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-950/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 font-semibold text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-brand-500/25 flex items-center justify-center gap-1.5"
            >
              Sign in to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              One-Click Role Sandbox Login
            </p>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_PROFILES.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleQuickLogin(p.role)}
                  className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/50 rounded-lg text-left transition-colors flex items-center gap-2 group"
                >
                  <img src={p.avatar_url} alt={p.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-white group-hover:text-brand-400 truncate">{p.name}</p>
                    <p className="text-[9px] text-slate-500 truncate">{p.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

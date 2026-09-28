import { create } from 'zustand';
import type { Profile, UserRole } from '../types';

export const DEMO_PROFILES: Profile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@smarteradigital.com',
    name: 'Aarav Sharma',
    phone: '+91 98201 11223',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Super Admin',
    status: 'Active',
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'priya.sales@smarteradigital.com',
    name: 'Priya Verma',
    phone: '+91 98202 22334',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'Sales Person',
    status: 'Active',
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'neha.smm@smarteradigital.com',
    name: 'Neha Gupta',
    phone: '+91 98206 66778',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'Social Media Manager',
    status: 'Active',
    created_at: '2026-02-15T08:30:00Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'rohan.editor@smarteradigital.com',
    name: 'Rohan Mehta',
    phone: '+91 98204 44556',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Video Editor',
    status: 'Active',
    created_at: '2026-02-05T11:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'rahul.camera@smarteradigital.com',
    name: 'Rahul Sen',
    phone: '+91 98203 33445',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Camera Man',
    status: 'Active',
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'simran.model@smarteradigital.com',
    name: 'Simran Kaur',
    phone: '+91 98205 55667',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Model',
    status: 'Active',
    created_at: '2026-02-10T12:00:00Z',
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    email: 'vikram.ads@smarteradigital.com',
    name: 'Vikram Malhotra',
    phone: '+91 98207 77889',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'Ads / Campaign Manager',
    status: 'Active',
    created_at: '2026-02-20T09:30:00Z',
  }
];

interface AuthState {
  user: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: Profile | null, token?: string | null) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedUser = localStorage.getItem('smartera_user');
  const storedToken = localStorage.getItem('smartera_token');
  const initialUser = storedUser ? JSON.parse(storedUser) : DEMO_PROFILES[0];
  const initialToken = storedToken || 'demo_super_admin_jwt_token';

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: true,
    setUser: (user, token) => {
      if (user) {
        localStorage.setItem('smartera_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('smartera_user');
      }
      if (token) {
        localStorage.setItem('smartera_token', token);
      } else if (token === null) {
        localStorage.removeItem('smartera_token');
      }
      set({ user, token: token || null, isAuthenticated: !!user });
    },
    switchRole: (role: UserRole) => {
      const targetProfile = DEMO_PROFILES.find((p) => p.role === role) || DEMO_PROFILES[0];
      localStorage.setItem('smartera_user', JSON.stringify(targetProfile));
      set({ user: targetProfile, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('smartera_user');
      localStorage.removeItem('smartera_token');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});

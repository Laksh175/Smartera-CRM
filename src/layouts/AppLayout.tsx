import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Briefcase,
  Layers,
  CreditCard,
  CheckSquare,
  Film,
  Calendar as CalendarIcon,
  Video,
  Camera,
  User,
  Megaphone,
  BarChart3,
  History,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { OmniSearchModal } from '../components/common/OmniSearchModal';
import { NotificationDrawer } from '../components/notifications/NotificationDrawer';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { UserRole } from '../types';

export const AppLayout: React.FC = () => {
  const { user, switchRole } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [omniSearchOpen, setOmniSearchOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const location = useLocation();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
    refetchInterval: 15000,
  });

  const unreadNotifsCount = notifications.filter((n) => !n.is_read).length;

  const rolesList: UserRole[] = [
    'Super Admin',
    'Admin / Operations',
    'Sales Person',
    'Social Media Manager',
    'Video Editor',
    'Camera Man',
    'Model',
    'Ads / Campaign Manager',
  ];

  const navSections = [
    {
      title: 'CORE',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, permission: 'all' },
      ],
    },
    {
      title: 'SALES & CLIENTS',
      items: [
        { name: 'Leads', path: '/leads', icon: Users, permission: 'leads' },
        { name: 'Follow-ups', path: '/followups', icon: CalendarCheck, permission: 'leads' },
        { name: 'Clients', path: '/clients', icon: Briefcase, permission: 'clients' },
      ],
    },
    {
      title: 'FINANCE & PACKAGES',
      items: [
        { name: 'Packages', path: '/packages', icon: Layers, permission: 'packages' },
        { name: 'Payments', path: '/payments', icon: CreditCard, permission: 'payments' },
      ],
    },
    {
      title: 'AGENCY OPERATIONS',
      items: [
        { name: 'Tasks', path: '/tasks', icon: CheckSquare, permission: 'tasks' },
        { name: 'Reels Workflow', path: '/reels', icon: Film, permission: 'reels' },
        { name: 'Content Calendar', path: '/calendar', icon: CalendarIcon, permission: 'calendar' },
      ],
    },
    {
      title: 'PRODUCTION CREW',
      items: [
        { name: 'Shoots Management', path: '/shoots', icon: Video, permission: 'shoots' },
        { name: 'Camera Men', path: '/cameramen', icon: Camera, permission: 'shoots' },
        { name: 'Models', path: '/models', icon: User, permission: 'shoots' },
      ],
    },
    {
      title: 'PERFORMANCE & TEAM',
      items: [
        { name: 'Ad Campaigns', path: '/campaigns', icon: Megaphone, permission: 'campaigns' },
        { name: 'Staff Directory', path: '/staff', icon: Users, permission: 'staff' },
        { name: 'Reports & Analytics', path: '/reports', icon: BarChart3, permission: 'reports' },
        { name: 'Activity Log', path: '/activity-log', icon: History, permission: 'activity' },
        { name: 'Settings', path: '/settings', icon: Settings, permission: 'settings' },
      ],
    },
  ];

  // Role filtering for navigation
  const isItemVisible = (permission: string) => {
    if (!user) return true;
    if (user.role === 'Super Admin' || user.role === 'Admin / Operations') return true;
    if (user.role === 'Video Editor') {
      return ['all', 'reels', 'tasks', 'calendar'].includes(permission);
    }
    if (user.role === 'Camera Man' || user.role === 'Model') {
      return ['all', 'shoots', 'tasks', 'calendar'].includes(permission);
    }
    if (user.role === 'Sales Person') {
      return ['all', 'leads', 'clients', 'packages', 'payments', 'tasks'].includes(permission);
    }
    if (user.role === 'Social Media Manager') {
      return ['all', 'clients', 'reels', 'calendar', 'shoots', 'tasks'].includes(permission);
    }
    if (user.role === 'Ads / Campaign Manager') {
      return ['all', 'clients', 'campaigns', 'tasks'].includes(permission);
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Flex Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white font-black shadow-md shadow-brand-500/20">
                S
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white tracking-wider font-sans">SMARTERA</h1>
                <p className="text-[10px] font-semibold text-brand-400 tracking-widest uppercase">Digital Operations</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navSections.map((section) => {
              const visibleItems = section.items.filter((item) => isItemVisible(item.permission));
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title} className="space-y-1">
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {section.title}
                  </p>
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Current Role Notice Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/40">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center gap-2.5">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-brand-500/40"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <span className="inline-block text-[10px] text-brand-300 font-medium truncate">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Quick Search Shortcut */}
              <button
                type="button"
                onClick={() => setOmniSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Quick search anything...</span>
                <kbd className="ml-2 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-400 font-mono shadow-2xs">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Right Header Items: Role Switcher, Notifications, User */}
            <div className="flex items-center gap-3">
              {/* Role Switcher Sandbox Tool */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden md:inline">Role:</span>
                  <span>{user?.role}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-75" />
                </button>

                {roleDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-dropdown border border-slate-200 py-1.5 z-50 animate-modal"
                    onClick={() => setRoleDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="text-[11px] font-bold uppercase text-slate-400">Switch Role Sandbox</p>
                    </div>
                    {rolesList.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => switchRole(role)}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                          user?.role === role
                            ? 'bg-brand-50 text-brand-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{role}</span>
                        {user?.role === role && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => setNotifDrawerOpen(true)}
                className="relative p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                />
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-slate-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Body Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <OmniSearchModal isOpen={omniSearchOpen} onClose={() => setOmniSearchOpen(false)} />
      <NotificationDrawer isOpen={notifDrawerOpen} onClose={() => setNotifDrawerOpen(false)} />
    </div>
  );
};

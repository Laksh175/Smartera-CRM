import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Briefcase,
  CreditCard,
  CheckSquare,
  Video,
  Film,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { api } from '../api/client';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.getDashboardMetrics(),
    refetchInterval: 30000,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.getClients(),
  });

  const { data: recentShoots = [] } = useQuery({
    queryKey: ['shoots'],
    queryFn: () => api.getShoots(),
  });

  const { data: recentReels = [] } = useQuery({
    queryKey: ['reels'],
    queryFn: () => api.getReels(),
  });

  if (isLoading || !metrics) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Smartera Digital CRM Operations...</p>
      </div>
    );
  }

  const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Agency Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/30 text-brand-300 border border-brand-400/30">
              Agency Operations Cockpit
            </span>
            <span className="text-xs text-slate-400">• Live Realtime Data</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1.5 font-sans">
            Smartera Digital Management Overview
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Managing people, clients, revenue, shoots, editing workflows, and monthly deliverables across all accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/leads')}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-brand-500/25 flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            + New Lead
          </button>
          <button
            type="button"
            onClick={() => navigate('/shoots')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Video className="w-4 h-4" />
            Schedule Shoot
          </button>
        </div>
      </div>

      {/* Urgent Operational Alerts Strip */}
      {(metrics.sales.overdue_followups > 0 || metrics.operations.overdue_tasks > 0 || metrics.clients.expiring_packages > 0) && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-amber-900 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Operational Attention Required:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {metrics.sales.overdue_followups > 0 && (
              <button
                onClick={() => navigate('/followups')}
                className="hover:underline font-semibold flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {metrics.sales.overdue_followups} Overdue Follow-up{metrics.sales.overdue_followups > 1 ? 's' : ''}
              </button>
            )}

            {metrics.operations.overdue_tasks > 0 && (
              <button
                onClick={() => navigate('/tasks')}
                className="hover:underline font-semibold flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {metrics.operations.overdue_tasks} Overdue Task{metrics.operations.overdue_tasks > 1 ? 's' : ''}
              </button>
            )}

            {metrics.clients.expiring_packages > 0 && (
              <button
                onClick={() => navigate('/packages')}
                className="hover:underline font-semibold flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {metrics.clients.expiring_packages} Expiring Package{metrics.clients.expiring_packages > 1 ? 's' : ''} (Renewals Due)
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4 Core Financial & Operations Metric Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales */}
        <StatCard
          title="Sales Pipeline"
          value={metrics.sales.total_leads}
          subtitle={`${metrics.sales.converted_leads} Won • ${metrics.sales.conversion_rate}% Conversion Rate`}
          icon={Users}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
          onClick={() => navigate('/leads')}
        />

        {/* Finance */}
        <StatCard
          title="Total Revenue Collected"
          value={`₹${metrics.finance.total_revenue.toLocaleString()}`}
          subtitle={`₹${metrics.finance.pending_payments.toLocaleString()} Pending Balance`}
          icon={CreditCard}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={{ value: `+₹${metrics.finance.current_month_revenue.toLocaleString()} this month`, isPositive: true }}
          onClick={() => navigate('/payments')}
        />

        {/* Clients */}
        <StatCard
          title="Active Clients"
          value={metrics.clients.active_clients}
          subtitle={`${metrics.clients.expiring_packages} Packages Expiring Soon`}
          icon={Briefcase}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          onClick={() => navigate('/clients')}
        />

        {/* Reels & Workloads */}
        <StatCard
          title="Reels In Production"
          value={metrics.operations.reels_in_editing + metrics.operations.reels_pending}
          subtitle={`${metrics.operations.client_approvals_pending} Awaiting Client Approval`}
          icon={Film}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          onClick={() => navigate('/reels')}
        />
      </div>

      {/* Client Monthly Work Boards Preview */}
      <div className="card-base p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-600" />
              Client Monthly Work Progress (Quota Completion)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking of monthly reels, posts, shoots completed vs remaining for active retainers
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View all clients <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {clients.map((client) => {
            const wp = client.work_progress;
            const percentage = wp?.total_reels ? Math.round((wp.completed_reels / wp.total_reels) * 100) : 0;
            return (
              <div
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}
                className="p-4 rounded-xl border border-slate-200 hover:border-brand-400 bg-slate-50/50 hover:bg-white transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {client.business_name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{client.active_package?.package_name || 'Active Retainer'}</p>
                  </div>
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                    {percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>

                {/* Stage Breakdown Pills */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Reels</span>
                    <span className="font-bold text-slate-800">{wp?.completed_reels || 0}/{wp?.total_reels || 8}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">In Editing</span>
                    <span className="font-bold text-amber-600">{wp?.in_progress_reels || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Approvals</span>
                    <span className="font-bold text-purple-600">{wp?.approval_pending_reels || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend (2 cols) */}
        <div className="lg:col-span-2 card-base p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Monthly Revenue vs Target Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Past 6 months billing collections across agency packages</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              ₹{metrics.finance.total_revenue.toLocaleString()} Total
            </span>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.charts.monthly_revenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Source Pie (1 col) */}
        <div className="card-base p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Leads by Acquisition Source</h3>
            <p className="text-xs text-slate-500 mt-0.5">Top performing inbound & referral channels</p>
          </div>

          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.charts.leads_by_source}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={{ stroke: '#64748B', strokeWidth: 1.5 }}
                  label={({ cx, cy, midAngle, outerRadius, percent, name }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 16;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#0F172A"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        style={{ fontSize: '10px', fontWeight: 800 }}
                      >
                        {`${name} (${(percent * 100).toFixed(0)}%)`}
                      </text>
                    );
                  }}
                >
                  {metrics.charts.leads_by_source.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} Leads`, `${name}`]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  }}
                  itemStyle={{ color: '#38BDF8', fontWeight: 700 }}
                  labelStyle={{ color: '#FFFFFF', fontWeight: 800 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {metrics.charts.leads_by_source.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 p-1 rounded-md bg-slate-50 border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-700 font-medium truncate flex-1">{item.name}:</span>
                <span className="font-extrabold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom 2 Columns: Shoots Schedule + Active Reel Workflow Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shoots Hub */}
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-brand-600" />
                Shoots & Crew Schedule
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Upcoming on-location & studio shoots with assigned crew</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/shoots')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              All Shoots <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentShoots.slice(0, 3).map((shoot) => (
              <div key={shoot.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{shoot.shoot_type}</span>
                    <StatusBadge status={shoot.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Client: <strong className="text-slate-700">{shoot.client_name}</strong> • {shoot.location}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Camera: <strong>{shoot.cameraman_name || 'Unassigned'}</strong> • Model: <strong>{shoot.model_name || 'None'}</strong>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold">
                    {shoot.date}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">{shoot.start_time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Stage Reel Matrix Quick View */}
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-600" />
                Recent Reel Workflow Statuses
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Metadata tracking through Scripting → Shoot → Edit → Review → Post</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/reels')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Workflow Matrix <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentReels.slice(0, 4).map((reel) => (
              <div key={reel.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      Reel #{reel.reel_number}: {reel.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {reel.client_name} • Editor: <strong>{reel.assigned_editor_name || 'Rohan'}</strong>
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <StatusBadge status={reel.overall_status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

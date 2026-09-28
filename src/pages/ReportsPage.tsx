import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Users,
  Briefcase,
  Film,
  Video,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { StatCard } from '../components/common/StatCard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['reports-full'],
    queryFn: () => api.getFullReports(),
  });

  if (isLoading || !metrics) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">Loading Agency Reports...</div>
    );
  }

  const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-600" />
          Agency Operational Intelligence & Reports
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Actionable metrics answering the 20 fundamental operational questions across sales, finance, client health, and crew productivity.
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lead Conversion Rate"
          value={`${metrics.sales.conversion_rate}%`}
          subtitle={`${metrics.sales.converted_leads} of ${metrics.sales.total_leads} leads converted`}
          icon={Users}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
        />

        <StatCard
          title="Total Cash Collected"
          value={`₹${metrics.finance.total_revenue.toLocaleString()}`}
          subtitle={`₹${metrics.finance.pending_payments.toLocaleString()} pending receivables`}
          icon={CreditCard}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <StatCard
          title="Active Retainer Health"
          value={`${metrics.clients.active_clients} Clients`}
          subtitle={`${metrics.clients.expiring_packages} renewals due this week`}
          icon={Briefcase}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />

        <StatCard
          title="Content Throughput"
          value={`${metrics.operations.total_posted_reels} Posted`}
          subtitle={`${metrics.operations.reels_in_editing} in active editing/review`}
          icon={Film}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Workload & Task Completion */}
        <div className="card-base p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Staff Workload & Task Completion</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tasks assigned, completed, and overdue by team member</p>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.charts.staff_workload} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="assigned" name="Assigned" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Generation Sources */}
        <div className="card-base p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Lead Acquisition Channel Share</h3>
            <p className="text-xs text-slate-500 mt-0.5">Where high-converting inbound leads originate</p>
          </div>

          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.charts.leads_by_source}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={{ stroke: '#64748B', strokeWidth: 1.5 }}
                  label={({ cx, cy, midAngle, outerRadius, percent, name }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 20;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#0F172A"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        style={{ fontSize: '11px', fontWeight: 800 }}
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

          {/* Breakdown summary chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
            {metrics.charts.leads_by_source.map((item, idx) => {
              const total = metrics.charts.leads_by_source.reduce((acc, curr) => acc + curr.value, 0);
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/70"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-slate-700 truncate">{item.name}</div>
                    <div className="text-[11px] font-extrabold text-slate-900">
                      {item.value} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

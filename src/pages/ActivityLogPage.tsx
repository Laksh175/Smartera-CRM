import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Shield, User, Clock, Search, Filter } from 'lucide-react';
import { api } from '../api/client';
import { SearchInput } from '../components/common/SearchInput';
import type { ActivityLog } from '../types';

export const ActivityLogPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: () => api.getActivityLogs(),
  });

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.user_name.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.entity_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-brand-600" />
            Immutable Audit & Activity Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete tamper-resistant activity trail recording all leads, payments, shoots, reels, and staff mutations.
          </p>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by user, action, entity ID..."
          className="w-full sm:w-72"
        />
      </div>

      {/* Log Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Staff User</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Entity</th>
                <th className="px-4 py-3.5">Entity Reference</th>
                <th className="px-4 py-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {log.user_name}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-700">{log.entity}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-slate-900">{log.entity_id}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

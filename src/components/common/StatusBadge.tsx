import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = status.toLowerCase();

  let badgeClass = 'badge-slate';

  // Success variants
  if (['active', 'completed', 'approved', 'posted', 'paid', 'won', 'available', 'running', 'confirmed'].includes(s)) {
    badgeClass = 'badge-success';
  }
  // Warning variants
  else if (['pending', 'partial', 'scheduled', 'expiring', 'in progress', 'meeting scheduled', 'proposal sent', 'negotiation', 'internal review', 'ready', 'busy', 'urgent'].includes(s)) {
    badgeClass = 'badge-warning';
  }
  // Danger variants
  else if (['overdue', 'rejected', 'changes requested', 'revision required', 'cancelled', 'expired', 'lost', 'missed', 'on leave', 'inactive'].includes(s)) {
    badgeClass = 'badge-danger';
  }
  // Info variants
  else if (['new', 'contacted', 'interested', 'planned', 'upcoming', 'to do'].includes(s)) {
    badgeClass = 'badge-info';
  }
  // Purple / Special
  else if (['renewed', 'on hold', 'archived'].includes(s)) {
    badgeClass = 'badge-purple';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`${badgeClass} ${sizeClass} font-medium tracking-wide capitalize`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {status}
    </span>
  );
};

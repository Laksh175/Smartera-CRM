import { db } from '../db/connection.js';

export class ReportsService {
  static getDashboardMetrics() {
    const todayStr = new Date().toISOString().split('T')[0];

    // --- SALES ---
    const totalLeads = db.leads.length;
    const newLeads = db.leads.filter((l) => l.status === 'New').length;
    const contactedLeads = db.leads.filter((l) => l.status === 'Contacted').length;
    const interestedLeads = db.leads.filter((l) => l.status === 'Interested').length;
    const proposalsSent = db.leads.filter((l) => l.status === 'Proposal Sent').length;
    const convertedLeads = db.leads.filter((l) => l.is_converted || l.status === 'Won').length;
    const lostLeads = db.leads.filter((l) => l.status === 'Lost').length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // Follow-ups today & overdue
    const followupsToday = db.followups.filter((f) => f.status === 'Pending' && f.followup_date === todayStr).length;
    const overdueFollowups = db.followups.filter((f) => f.status === 'Pending' && f.followup_date < todayStr).length;

    // --- CLIENTS ---
    const totalClients = db.clients.length;
    const activeClients = db.clients.filter((c) => c.status === 'Active').length;
    const expiringPackages = db.clientPackages.filter((p) => p.status === 'Expiring').length;
    const expiredPackages = db.clientPackages.filter((p) => p.status === 'Expired').length;

    // --- FINANCE ---
    const totalRevenue = db.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const currentMonth = todayStr.substring(0, 7);
    const currentMonthRevenue = db.payments
      .filter((p) => p.payment_date.startsWith(currentMonth))
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const totalContractValue = db.clientPackages.reduce((sum, p) => sum + Number(p.final_price), 0);
    const pendingPayments = Math.max(0, totalContractValue - totalRevenue);

    // --- OPERATIONS ---
    const todayTasks = db.tasks.filter((t) => t.due_date === todayStr && t.status !== 'Completed').length;
    const overdueTasks = db.tasks.filter((t) => t.due_date < todayStr && t.status !== 'Completed').length;
    const todayShoots = db.shoots.filter((s) => s.date === todayStr && s.status !== 'Cancelled').length;
    const upcomingShoots = db.shoots.filter((s) => s.date > todayStr && s.status !== 'Cancelled').length;

    // Reel Stages
    const reelsPending = db.reels.filter((r) => r.overall_status === 'Planning' || r.overall_status === 'Scripting').length;
    const reelsInEditing = db.reels.filter((r) => r.editing_status === 'In Progress' || r.editing_status === 'Internal Review').length;
    const clientApprovalsPending = db.reels.filter((r) => r.client_approval_status === 'Pending' || r.client_approval_status === 'Changes Requested').length;
    const scheduledPosts = db.reels.filter((r) => r.posting_status === 'Scheduled').length;
    const totalPostedReels = db.reels.filter((r) => r.posting_status === 'Posted').length;

    // --- CHARTS DATA ---
    // Leads by Source
    const sourceCounts: Record<string, number> = {};
    db.leads.forEach((l) => {
      sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
    });
    const leadsBySourceChart = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));

    // Monthly Revenue (Past 6 months mock/calculated)
    const monthlyRevenueChart = [
      { month: 'Apr', revenue: 65000, target: 60000 },
      { month: 'May', revenue: 85000, target: 80000 },
      { month: 'Jun', revenue: 110000, target: 100000 },
      { month: 'Jul', revenue: 125000, target: 120000 },
      { month: 'Aug', revenue: 140000, target: 135000 },
      { month: 'Sep', revenue: totalRevenue, target: 160000 },
    ];

    // Staff Workload Breakdown
    const staffWorkload = db.getAllStaff().map((st) => {
      const assigned = db.tasks.filter((t) => t.assigned_to === st.user_id).length;
      const completed = db.tasks.filter((t) => t.assigned_to === st.user_id && t.status === 'Completed').length;
      const overdue = db.tasks.filter((t) => t.assigned_to === st.user_id && t.status !== 'Completed' && t.due_date < todayStr).length;
      return {
        name: st.name?.split(' ')[0] || 'Staff',
        role: st.role_type,
        assigned,
        completed,
        overdue,
      };
    });

    return {
      sales: {
        total_leads: totalLeads,
        new_leads: newLeads,
        contacted_leads: contactedLeads,
        interested_leads: interestedLeads,
        proposals_sent: proposalsSent,
        converted_leads: convertedLeads,
        lost_leads: lostLeads,
        conversion_rate: conversionRate,
        followups_today: followupsToday,
        overdue_followups: overdueFollowups,
      },
      clients: {
        total_clients: totalClients,
        active_clients: activeClients,
        expiring_packages: expiringPackages,
        expired_packages: expiredPackages,
      },
      finance: {
        total_revenue: totalRevenue,
        current_month_revenue: currentMonthRevenue,
        pending_payments: pendingPayments,
        total_contract_value: totalContractValue,
      },
      operations: {
        today_tasks: todayTasks,
        overdue_tasks: overdueTasks,
        today_shoots: todayShoots,
        upcoming_shoots: upcomingShoots,
        reels_pending: reelsPending,
        reels_in_editing: reelsInEditing,
        client_approvals_pending: clientApprovalsPending,
        scheduled_posts: scheduledPosts,
        total_posted_reels: totalPostedReels,
      },
      charts: {
        leads_by_source: leadsBySourceChart,
        monthly_revenue: monthlyRevenueChart,
        staff_workload: staffWorkload,
      },
    };
  }

  static getFullReports() {
    return this.getDashboardMetrics();
  }
}

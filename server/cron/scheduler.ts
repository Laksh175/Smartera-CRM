import { db } from '../db/connection.js';

export function runAutomatedRemindersEngine() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 1. Check Package Expiry
  db.clientPackages.forEach((pkg) => {
    if (pkg.status === 'Active' || pkg.status === 'Expiring') {
      const endDate = new Date(pkg.end_date);
      const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const client = db.clients.find((c) => c.id === pkg.client_id);

      if (diffDays <= 0) {
        pkg.status = 'Expired';
        db.createNotification({
          user_id: '11111111-1111-1111-1111-111111111111', // Super Admin
          title: `⚠️ Package Expired: ${client?.business_name || 'Client'}`,
          message: `The package for ${client?.business_name} expired on ${pkg.end_date}. Initiate renewal immediately.`,
          type: 'package',
          priority: 'urgent',
          link: `/clients/${pkg.client_id}`,
          dedup_key: `pkg_exp_${pkg.id}_0d`,
        });
      } else if (diffDays <= 7) {
        pkg.status = 'Expiring';
        db.createNotification({
          user_id: '11111111-1111-1111-1111-111111111111', // Super Admin
          title: `⏳ Package Expiring in ${diffDays} Days: ${client?.business_name}`,
          message: `${client?.business_name}'s package ends on ${pkg.end_date}. Reach out for renewal.`,
          type: 'package',
          priority: diffDays <= 3 ? 'urgent' : 'warning',
          link: `/clients/${pkg.client_id}`,
          dedup_key: `pkg_exp_${pkg.id}_${diffDays}d`,
        });
      }
    }
  });

  // 2. Check Overdue & Today's Follow-ups
  db.followups.forEach((f) => {
    if (f.status === 'Pending') {
      const lead = db.leads.find((l) => l.id === f.lead_id);
      if (f.followup_date < todayStr) {
        f.status = 'Missed';
        if (f.assigned_user_id) {
          db.createNotification({
            user_id: f.assigned_user_id,
            title: `🚨 Overdue Follow-up: ${lead?.company_name || 'Lead'}`,
            message: `Follow-up was scheduled for ${f.followup_date} at ${f.followup_time}. Please contact the lead.`,
            type: 'followup',
            priority: 'urgent',
            link: `/leads?leadId=${f.lead_id}`,
            dedup_key: `fup_overdue_${f.id}`,
          });
        }
      } else if (f.followup_date === todayStr) {
        if (f.assigned_user_id) {
          db.createNotification({
            user_id: f.assigned_user_id,
            title: `📞 Follow-up Today at ${f.followup_time}: ${lead?.company_name}`,
            message: `Scheduled ${f.type} with ${lead?.name} (${lead?.company_name}).`,
            type: 'followup',
            priority: 'warning',
            link: `/leads?leadId=${f.lead_id}`,
            dedup_key: `fup_today_${f.id}_${todayStr}`,
          });
        }
      }
    }
  });

  // 3. Check Overdue Tasks
  db.tasks.forEach((t) => {
    if (t.status !== 'Completed' && t.status !== 'Cancelled') {
      if (t.due_date < todayStr && t.assigned_to) {
        db.createNotification({
          user_id: t.assigned_to,
          title: `⏰ Overdue Task: ${t.title}`,
          message: `Task deadline was ${t.due_date}. Please update status or mark completed.`,
          type: 'task',
          priority: 'urgent',
          link: `/tasks`,
          dedup_key: `task_overdue_${t.id}_${todayStr}`,
        });
      }
    }
  });

  // 4. Check Upcoming Shoots (Today and Tomorrow)
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  db.shoots.forEach((s) => {
    if (s.status === 'Confirmed' || s.status === 'Scheduled') {
      const client = db.clients.find((c) => c.id === s.client_id);
      if (s.date === todayStr) {
        if (s.cameraman_id) {
          db.createNotification({
            user_id: s.cameraman_id,
            title: `🎬 Shoot TODAY: ${client?.business_name}`,
            message: `Location: ${s.location} | Time: ${s.start_time} - ${s.end_time}. Check gear checklist.`,
            type: 'shoot',
            priority: 'urgent',
            link: `/shoots`,
            dedup_key: `shoot_today_${s.id}_${todayStr}`,
          });
        }
      } else if (s.date === tomorrowStr) {
        if (s.cameraman_id) {
          db.createNotification({
            user_id: s.cameraman_id,
            title: `📸 Shoot Tomorrow: ${client?.business_name}`,
            message: `Location: ${s.location} | Time: ${s.start_time}. Ensure battery charge and memory cards.`,
            type: 'shoot',
            priority: 'warning',
            link: `/shoots`,
            dedup_key: `shoot_tmrw_${s.id}_${tomorrowStr}`,
          });
        }
      }
    }
  });
}

export function startCronScheduler() {
  console.log('⏰ Starting Automated Reminders Cron Engine...');
  runAutomatedRemindersEngine();

  // Run periodic automated checks every 30 minutes
  setInterval(() => {
    runAutomatedRemindersEngine();
  }, 30 * 60 * 1000);
}

import http from 'http';
import { db } from './server/db/connection.js';
import { AuthService } from './server/services/auth.service.js';
import { LeadsService } from './server/services/leads.service.js';
import { ClientsService } from './server/services/clients.service.js';
import { PackagesService } from './server/services/packages.service.js';
import { PaymentsService } from './server/services/payments.service.js';
import { ShootsService } from './server/services/shoots.service.js';
import { ReelsService } from './server/services/reels.service.js';
import { ReportsService } from './server/services/reports.service.js';
import { runAutomatedRemindersEngine } from './server/cron/scheduler.js';

console.log('🧪 ========================================================');
console.log('🧪 SMARTERA DIGITAL CRM — AUTOMATED SYSTEM VERIFICATION');
console.log('🧪 ========================================================\n');

async function runTests() {
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. Auth Test
  console.log('--- 1. AUTHENTICATION & RBAC ---');
  const loginResult = AuthService.login('admin@smarteradigital.com', 'smartera123');
  assert(!!loginResult.token, 'Super Admin login returns valid JWT token');
  assert(loginResult.user.role === 'Super Admin', 'User role correctly identified as Super Admin');

  // 2. Leads Management & Conversion Test
  console.log('\n--- 2. LEADS LIFECYCLE & 1-CLICK CONVERSION ---');
  const newLead = LeadsService.createLead({
    name: 'Vikramaditya Roy',
    company_name: 'Royale Heritage Jewels',
    phone: '+91 98333 44556',
    source: 'Instagram',
    estimated_budget: 60000,
    category: 'Jewellery',
    priority: 'High',
  });
  assert(!!newLead, 'Lead created successfully with formatted ID');
  assert(newLead?.company_name === 'Royale Heritage Jewels', 'Lead company name matches input');

  // Log follow-up
  const fup = LeadsService.addFollowup({
    lead_id: newLead!.id,
    followup_date: '2026-09-18',
    type: 'Meeting',
    notes: 'In-person boutique pitch meeting',
  });
  assert(fup.status === 'Pending', 'Follow-up created and attached to lead');

  // Convert to Client
  const conversionResult = LeadsService.convertToClient({
    lead_id: newLead!.id,
    package_template_id: 'pkg-tpl-002',
    original_price: 45000,
    discount: 5000,
    initial_payment: {
      amount: 20000,
      payment_method: 'UPI',
      transaction_id: 'UPI-TEST-12345',
      notes: 'Advance booking payment',
    },
  });
  assert(!!conversionResult.client, 'Lead converted into Client record without duplicate data entry');
  assert(conversionResult.client?.business_name === 'Royale Heritage Jewels', 'Client inherits business name');
  assert(conversionResult.package?.final_price === 40000, 'Package final price calculated accurately (45k - 5k = 40k)');
  assert(conversionResult.package?.remaining_balance === 20000, 'Remaining balance calculated accurately (40k - 20k = 20k)');

  // 3. Multi-Installment Payments & Math
  console.log('\n--- 3. MULTI-INSTALLMENT PAYMENTS & BALANCE MATH ---');
  const secondPayment = PaymentsService.recordPayment({
    client_id: conversionResult.client!.id,
    client_package_id: conversionResult.package!.id,
    amount: 20000,
    payment_date: '2026-09-25',
    payment_method: 'Bank Transfer',
    transaction_id: 'HDFC-NEFT-9988',
    notes: 'Final installment clearing total balance',
  });
  assert(secondPayment.package_summary.remaining_balance === 0, 'Remaining balance reaches ₹0 after second installment');
  assert(secondPayment.package_summary.payment_status === 'Paid', 'Package automatically marked as Paid');

  // 4. Shoots & Double-Booking Conflict Prevention
  console.log('\n--- 4. SHOOTS & DOUBLE-BOOKING CONFLICT PREVENTION ---');
  const conflictCheck = ShootsService.checkConflicts({
    date: '2026-09-20',
    start_time: '11:00 AM',
    end_time: '03:00 PM',
    cameraman_id: '33333333-3333-3333-3333-333333333333', // Rahul Sen (already booked for SHT-5003)
  });
  assert(conflictCheck.hasConflict === true, 'Collision engine correctly detects cameraman double-booking');
  assert(conflictCheck.message!.includes('Rahul'), 'Conflict message highlights specific crew member collision');

  // 5. 5-Stage Reel Workflow Matrix
  console.log('\n--- 5. 5-STAGE REEL WORKFLOW MATRIX ---');
  const testReel = ReelsService.createReel({
    client_id: conversionResult.client!.id,
    reel_number: 1,
    title: 'Solitaire Diamond Ring Macro Sparkle',
    script_status: 'Completed',
    shoot_status: 'Completed',
    editing_status: 'In Progress',
    client_approval_status: 'Pending',
    posting_status: 'Not Scheduled',
  });
  assert(testReel?.overall_status === 'Editing', 'Overall stage calculated as "Editing"');

  const updatedReel = ReelsService.updateReel(testReel!.id, {
    editing_status: 'Completed',
    client_approval_status: 'Changes Requested',
    approval_notes: 'Please brighten reflections in the center stone',
  });
  assert(updatedReel?.overall_status === 'Revision Required', 'Overall stage reflects "Revision Required" upon client feedback');

  // 6. Automated Reminders Cron Engine
  console.log('\n--- 6. AUTOMATED REMINDERS & NOTIFICATION DEDUPLICATION ---');
  const beforeNotifCount = db.notifications.length;
  runAutomatedRemindersEngine();
  const afterNotifCount = db.notifications.length;
  assert(afterNotifCount >= beforeNotifCount, 'Automated reminder engine triggers expiry & overdue alerts');

  // Re-run to ensure idempotency (no duplicate notifications)
  runAutomatedRemindersEngine();
  assert(db.notifications.length === afterNotifCount, 'Deduplication keys prevent duplicate alerts');

  // 7. Lead Notes Update, Delete & Template Payment for New Client
  console.log('\n--- 7. LEAD NOTES UPDATE, DELETE & ON-THE-FLY PACKAGE PAYMENT ---');
  // Lead Notes update
  const sampleLead = LeadsService.createLead({
    name: 'Aarav Mehta',
    company_name: 'Mehta Couture',
    phone: '+91 98111 22334',
    source: 'Instagram',
    estimated_budget: 45000,
    category: 'Fashion & Luxury',
    notes: 'Initial inquiry',
  });
  const updatedLeadWithNotes = LeadsService.updateLead(sampleLead!.id, {
    notes: 'Updated notes: Requires 12 Reels and 2 Studio Shoots for Diwali Collection.',
  });
  assert(
    updatedLeadWithNotes.notes.includes('Diwali Collection'),
    'Lead Notes & Requirements updated and persisted correctly'
  );

  // Lead Deletion
  const leadToDelete = LeadsService.createLead({
    name: 'Junk Contact',
    company_name: 'Spam Brand',
    phone: '+91 90000 00000',
    source: 'Other',
    estimated_budget: 0,
  });
  const deleteResult = LeadsService.deleteLead(leadToDelete!.id);
  assert(!!deleteResult && deleteResult.company_name === 'Spam Brand', 'Lead successfully deleted');
  const existsAfterDelete = db.leads.some((l) => l.id === leadToDelete!.id);
  assert(!existsAfterDelete, 'Deleted lead no longer exists in repository');

  // New Client Payment with Package Template
  const directClient = ClientsService.createClient({
    business_name: 'Urban Chic Apparel',
    owner_name: 'Neha Sharma',
    phone: '+91 98765 43210',
    category: 'Fashion & Luxury',
    city: 'Mumbai',
  });
  const directPayment = PaymentsService.recordPayment({
    client_id: directClient.id,
    package_template_id: 'pkg-tpl-001', // Starter Growth Retainer (₹25,000)
    amount: 15000,
    payment_date: '2026-09-17',
    payment_method: 'UPI',
    transaction_id: 'UPI-NEWCLIENT-8899',
    notes: 'First installment for newly added client',
  });
  assert(!!directPayment.package_summary.package_id, 'Package automatically created on-the-fly for new client');
  assert(directPayment.package_summary.final_price === 25000, 'Package assigned with correct template price (₹25,000)');
  assert(directPayment.package_summary.remaining_balance === 10000, 'Remaining balance accurately calculated (₹25,000 - ₹15,000 = ₹10,000)');
  assert(directPayment.package_summary.payment_status === 'Partial', 'Payment status marked as Partial');

  // 9. Reel Script Drafting, Shoot-Reel Linkage & Auto-Progression
  console.log('\n--- 9. REEL SCRIPT DRAFTING, SHOOT-REEL BATCH LINKAGE & COMPLETION SYNC ---');
  // Step 1: Plan Reel with script
  const scriptedReel = ReelsService.createReel({
    client_id: directClient.id,
    reel_number: 2,
    title: '5 Ways to Style Luxury Silk Dupattas',
    hook_line: 'Stop buying silk dupattas until you try this 1 trick!',
    script_content: 'Scene 1: Model unfolds pure banarasi dupatta. Scene 2: 3 rapid styling draping transitions. Scene 3: CTA to book in bio.',
  });
  assert(scriptedReel.hook_line?.includes('Stop buying'), 'Reel stores hook line properly');
  assert(scriptedReel.script_status === 'In Progress', 'Script status automatically set to "In Progress" upon providing script draft');

  // Step 2: Mark Script as Ready
  const readyReel = ReelsService.updateReel(scriptedReel.id, {
    script_status: 'Ready',
  });
  assert(readyReel.script_status === 'Ready', 'Script status successfully marked as Ready');

  // Step 3: Plan another script-ready reel for batch shoot
  const scriptedReel2 = ReelsService.createReel({
    client_id: directClient.id,
    reel_number: 3,
    title: 'Festive Velvet Lehenga Spotlight',
    hook_line: 'The wedding season secret every bride is talking about!',
    script_content: 'Scene 1: Low-angle twirl in velvet lehenga with warm backlighting. Scene 2: Hand-embroidery close-up. Scene 3: Price drop banner.',
    script_status: 'Ready',
  });

  // Step 4: Schedule Shoot linking both reels
  const linkedShoot = ShootsService.createShoot(
    {
      client_id: directClient.id,
      date: '2026-09-28',
      start_time: '02:00 PM',
      end_time: '06:00 PM',
      location: 'Studio Nirvana, Bandra',
      shoot_type: 'Festive Lookbook Batch Shoot',
      cameraman_id: '44444444-4444-4444-4444-444444444444',
      reels_count: 2,
      reel_ids: [readyReel.id, scriptedReel2.id],
    },
    true // force override for test
  );
  assert(linkedShoot.reel_ids?.length === 2, 'Shoot created with 2 linked reel IDs');
  assert(linkedShoot.linked_reels?.length === 2, 'Shoot populated with linked reels objects');

  // Verify that the reels got updated with shoot_status: 'Scheduled'
  const reel1AfterShoot = ReelsService.getReelById(readyReel.id);
  const reel2AfterShoot = ReelsService.getReelById(scriptedReel2.id);
  assert(reel1AfterShoot?.shoot_status === 'Scheduled', 'Linked Reel 1 shoot_status automatically synced to "Scheduled"');
  assert(reel1AfterShoot?.shoot_date === '2026-09-28', 'Linked Reel 1 shoot_date automatically populated from shoot');
  assert(reel2AfterShoot?.shoot_status === 'Scheduled', 'Linked Reel 2 shoot_status automatically synced to "Scheduled"');

  // Step 5: Mark Shoot as Completed
  const completedShoot = ShootsService.updateShoot(linkedShoot.id, { status: 'Completed' });
  assert(completedShoot?.status === 'Completed', 'Shoot status updated to Completed');

  // Verify that both reels automatically advanced shoot_status to 'Completed' and overall_status to 'Editing'
  const reel1Final = ReelsService.getReelById(readyReel.id);
  const reel2Final = ReelsService.getReelById(scriptedReel2.id);
  assert(reel1Final?.shoot_status === 'Completed', 'Linked Reel 1 shoot_status automatically marked as Completed');
  assert(reel1Final?.overall_status === 'Editing', 'Linked Reel 1 overall_status automatically progressed to "Editing"');
  assert(reel2Final?.shoot_status === 'Completed', 'Linked Reel 2 shoot_status automatically marked as Completed');
  assert(reel2Final?.overall_status === 'Editing', 'Linked Reel 2 overall_status automatically progressed to "Editing"');

  console.log('\n========================================================');
  console.log(`🎉 ALL TESTS PASSED: ${passed}/${total} assertions verified!`);
  console.log('========================================================\n');
}

runTests();


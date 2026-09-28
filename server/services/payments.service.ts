import { db } from '../db/connection.js';
import type { Payment, ClientPackage } from '../types/index.js';

export class PaymentsService {
  static getPayments() {
    return db.getAllPayments();
  }

  static getPaymentsByClient(clientId: string) {
    return db.getAllPayments().filter((p) => p.client_id === clientId);
  }

  static recordPayment(data: any, recordedByUserId?: string) {
    const client = db.clients.find((c) => c.id === data.client_id);
    if (!client) {
      throw new Error(`Client ${data.client_id} not found`);
    }

    let pkg = db.clientPackages.find((p) => p.id === data.client_package_id);
    if (!pkg) {
      // Check if client_package_id is a template id or package_template_id was provided
      const templateId =
        data.package_template_id ||
        (typeof data.client_package_id === 'string' && data.client_package_id.startsWith('template:')
          ? data.client_package_id.replace('template:', '')
          : data.client_package_id);

      const template = db.packageTemplates.find((t) => t.id === templateId);
      if (template) {
        const pkgId = `cpkg-${Date.now()}`;
        const startDate = data.payment_date || new Date().toISOString().split('T')[0];
        const endDateObj = new Date(startDate);
        endDateObj.setDate(endDateObj.getDate() + (template.duration_days || 30));
        const endDate = endDateObj.toISOString().split('T')[0];

        const newCreatedPkg: ClientPackage = {
          id: pkgId,
          client_id: data.client_id,
          package_template_id: template.id,
          package_name: template.name,
          start_date: startDate,
          end_date: endDate,
          original_price: Number(template.price),
          discount: 0,
          final_price: Number(template.price),
          payment_status: 'Pending',
          assigned_manager_id: client.assigned_manager_id || undefined,
          status: 'Active',
          notes: 'Auto-assigned on recording initial installment payment.',
          created_at: new Date().toISOString(),
        };
        db.clientPackages.unshift(newCreatedPkg);
        pkg = newCreatedPkg;

        db.packageUsages.push({
          id: `pu-${Date.now()}`,
          client_package_id: pkgId,
          reels_total: template.reels_count || 8,
          reels_completed: 0,
          posts_total: template.posts_count || 8,
          posts_completed: 0,
          stories_total: template.stories_count || 12,
          stories_completed: 0,
          shoots_total: template.shoot_count || 1,
          shoots_completed: 0,
        });

        data.client_package_id = pkgId;
      } else {
        throw new Error(`Package ${data.client_package_id || data.package_template_id} not found`);
      }
    }

    if (!pkg) {
      throw new Error(`Package ${data.client_package_id} not found`);
    }

    const targetPkg = pkg;
    const existingPayments = db.payments.filter((p) => p.client_package_id === targetPkg.id);
    const existingPaid = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remainingBefore = Math.max(0, Number(targetPkg.final_price) - existingPaid);

    const paymentAmount = Number(data.amount);
    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    if (paymentAmount > remainingBefore + 0.01) {
      throw new Error(
        `Payment amount (₹${paymentAmount.toLocaleString()}) cannot exceed the package remaining balance (₹${remainingBefore.toLocaleString()})`
      );
    }

    const nextNum = db.payments.length + 3001;
    const paymentIdStr = `PAY-${nextNum}`;
    const id = `pay-${Date.now()}`;

    const newPayment: Payment = {
      id,
      payment_id: paymentIdStr,
      client_id: data.client_id,
      client_package_id: data.client_package_id,
      amount: paymentAmount,
      payment_date: data.payment_date,
      payment_method: data.payment_method,
      transaction_id: data.transaction_id,
      status: 'Paid',
      notes: data.notes,
      recorded_by: recordedByUserId,
      created_at: new Date().toISOString(),
    };

    db.payments.unshift(newPayment);

    // Sync package payment status
    const newTotalPaid = existingPaid + paymentAmount;
    if (newTotalPaid >= Number(targetPkg.final_price)) {
      targetPkg.payment_status = 'Paid';
    } else {
      targetPkg.payment_status = 'Partial';
    }
    targetPkg.updated_at = new Date().toISOString();

    // Create Notification
    db.createNotification({
      user_id: '11111111-1111-1111-1111-111111111111',
      title: `💰 Payment Received: ₹${paymentAmount.toLocaleString()}`,
      message: `Recorded for ${client.business_name} (${targetPkg.package_name}) via ${data.payment_method}. Remaining: ₹${Math.max(0, Number(targetPkg.final_price) - newTotalPaid).toLocaleString()}`,
      type: 'payment',
      priority: 'info',
      link: `/payments`,
    });

    return {
      payment: newPayment,
      package_summary: {
        package_id: targetPkg.id,
        final_price: targetPkg.final_price,
        total_paid: newTotalPaid,
        remaining_balance: Math.max(0, Number(targetPkg.final_price) - newTotalPaid),
        payment_status: targetPkg.payment_status,
      },
    };
  }

  static getFinancialSummary() {
    const totalRevenue = db.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const allPackages = db.clientPackages;
    const totalContractValue = allPackages.reduce((sum, pkg) => sum + Number(pkg.final_price), 0);
    const pendingBalance = Math.max(0, totalContractValue - totalRevenue);

    // Current month revenue
    const currentMonth = new Date().toISOString().substring(0, 7);
    const currentMonthRevenue = db.payments
      .filter((p) => p.payment_date.startsWith(currentMonth))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const paidPackagesCount = allPackages.filter((p) => p.payment_status === 'Paid').length;
    const partialPackagesCount = allPackages.filter((p) => p.payment_status === 'Partial').length;
    const pendingPackagesCount = allPackages.filter((p) => p.payment_status === 'Pending').length;

    return {
      total_revenue: totalRevenue,
      current_month_revenue: currentMonthRevenue,
      total_contract_value: totalContractValue,
      pending_balance: pendingBalance,
      packages_count: {
        paid: paidPackagesCount,
        partial: partialPackagesCount,
        pending: pendingPackagesCount,
        total: allPackages.length,
      },
    };
  }
}

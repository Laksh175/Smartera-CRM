import { db } from '../db/connection.js';
import type { PackageTemplate, ClientPackage, PackageUsage } from '../types/index.js';

export class PackagesService {
  // Templates
  static getTemplates() {
    return db.packageTemplates;
  }

  static createTemplate(data: any) {
    const newTemplate: PackageTemplate = {
      id: `pkg-tpl-${Date.now()}`,
      name: data.name,
      description: data.description,
      duration_days: Number(data.duration_days) || 30,
      price: Number(data.price),
      reels_count: Number(data.reels_count) || 8,
      posts_count: Number(data.posts_count) || 8,
      stories_count: Number(data.stories_count) || 12,
      shoot_count: Number(data.shoot_count) || 1,
      ads_management_included: Boolean(data.ads_management_included),
      other_services: data.other_services,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      created_at: new Date().toISOString(),
    };
    db.packageTemplates.push(newTemplate);
    return newTemplate;
  }

  static updateTemplate(id: string, data: any) {
    const template = db.packageTemplates.find((t) => t.id === id);
    if (!template) {
      throw new Error(`Package template ${id} not found`);
    }
    Object.assign(template, data);
    return template;
  }

  // Client Packages
  static getAllClientPackages() {
    return db.getAllClientPackages();
  }

  static getClientPackageById(id: string) {
    const pkg = db.clientPackages.find((p) => p.id === id);
    if (!pkg) {
      throw new Error(`Client package ${id} not found`);
    }
    return db.enrichClientPackage(pkg);
  }

  static createClientPackage(data: any) {
    const template = db.packageTemplates.find((t) => t.id === data.package_template_id);
    const pkgId = `cpkg-${Date.now()}`;
    const origPrice = Number(data.original_price ?? template?.price ?? 25000);
    const discount = Number(data.discount || 0);
    const finalPrice = Math.max(0, origPrice - discount);

    const newPkg: ClientPackage = {
      id: pkgId,
      client_id: data.client_id,
      package_template_id: data.package_template_id,
      package_name: data.package_name || template?.name || 'Custom Package',
      start_date: data.start_date,
      end_date: data.end_date,
      original_price: origPrice,
      discount,
      final_price: finalPrice,
      payment_status: 'Pending',
      assigned_manager_id: data.assigned_manager_id,
      status: data.status || 'Active',
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    db.clientPackages.unshift(newPkg);

    // Create Package Usage Record
    db.packageUsages.push({
      id: `pu-${Date.now()}`,
      client_package_id: pkgId,
      reels_total: template?.reels_count || Number(data.reels_count) || 8,
      reels_completed: 0,
      posts_total: template?.posts_count || Number(data.posts_count) || 8,
      posts_completed: 0,
      stories_total: template?.stories_count || Number(data.stories_count) || 12,
      stories_completed: 0,
      shoots_total: template?.shoot_count || Number(data.shoot_count) || 1,
      shoots_completed: 0,
    });

    return db.enrichClientPackage(newPkg);
  }

  static updateClientPackage(id: string, data: any) {
    const pkg = db.clientPackages.find((p) => p.id === id);
    if (!pkg) {
      throw new Error(`Package ${id} not found`);
    }

    if (data.original_price !== undefined || data.discount !== undefined) {
      const orig = Number(data.original_price ?? pkg.original_price);
      const disc = Number(data.discount ?? pkg.discount);
      pkg.original_price = orig;
      pkg.discount = disc;
      pkg.final_price = Math.max(0, orig - disc);
    }

    Object.assign(pkg, data);
    return db.enrichClientPackage(pkg);
  }

  static updatePackageUsage(packageId: string, data: Partial<PackageUsage>) {
    let usage = db.packageUsages.find((u) => u.client_package_id === packageId);
    if (!usage) {
      usage = {
        id: `pu-${Date.now()}`,
        client_package_id: packageId,
        reels_total: 8,
        reels_completed: 0,
        posts_total: 8,
        posts_completed: 0,
        stories_total: 12,
        stories_completed: 0,
        shoots_total: 1,
        shoots_completed: 0,
        ...data,
      };
      db.packageUsages.push(usage);
    } else {
      Object.assign(usage, data);
    }
    return usage;
  }

  // RENEWAL WORKFLOW
  static renewPackage(previousPackageId: string, renewalData: {
    start_date: string;
    duration_days?: number;
    discount?: number;
    notes?: string;
  }) {
    const prev = db.clientPackages.find((p) => p.id === previousPackageId);
    if (!prev) {
      throw new Error(`Package ${previousPackageId} not found`);
    }

    // Mark previous package as Renewed
    prev.status = 'Renewed';

    const startDate = renewalData.start_date;
    const duration = renewalData.duration_days || 30;
    const endDateObj = new Date(startDate);
    endDateObj.setDate(endDateObj.getDate() + duration);
    const endDate = endDateObj.toISOString().split('T')[0];

    const template = db.packageTemplates.find((t) => t.id === prev.package_template_id);
    const origPrice = Number(prev.original_price);
    const discount = Number(renewalData.discount ?? prev.discount ?? 0);
    const finalPrice = Math.max(0, origPrice - discount);

    const newPkgId = `cpkg-${Date.now()}`;
    const newPackage: ClientPackage = {
      id: newPkgId,
      client_id: prev.client_id,
      package_template_id: prev.package_template_id,
      package_name: `${prev.package_name} (Renewal)`,
      start_date: startDate,
      end_date: endDate,
      original_price: origPrice,
      discount,
      final_price: finalPrice,
      payment_status: 'Pending',
      assigned_manager_id: prev.assigned_manager_id,
      status: 'Active',
      notes: `Renewed from Package ID ${prev.id}. ${renewalData.notes || ''}`,
      created_at: new Date().toISOString(),
    };

    db.clientPackages.unshift(newPackage);

    // Fresh usage quota
    db.packageUsages.push({
      id: `pu-${Date.now()}`,
      client_package_id: newPkgId,
      reels_total: template?.reels_count || 8,
      reels_completed: 0,
      posts_total: template?.posts_count || 8,
      posts_completed: 0,
      stories_total: template?.stories_count || 12,
      stories_completed: 0,
      shoots_total: template?.shoot_count || 1,
      shoots_completed: 0,
    });

    const client = db.clients.find((c) => c.id === prev.client_id);
    db.createNotification({
      user_id: '11111111-1111-1111-1111-111111111111',
      title: `✨ Package Renewed: ${client?.business_name}`,
      message: `Successfully renewed package until ${endDate}.`,
      type: 'renewal',
      priority: 'info',
      link: `/clients/${prev.client_id}`,
    });

    return db.enrichClientPackage(newPackage);
  }
}

import { db } from '../db/connection.js';
import type { Reel, ScriptStatus, ShootStatus, EditingStatus, ClientApprovalStatus, PostingStatus } from '../types/index.js';

export class ReelsService {
  static getReels(filter?: { clientId?: string; editorId?: string; status?: string }) {
    return db.getAllReels(filter);
  }

  static getReelById(id: string) {
    const reel = db.getAllReels().find((r) => r.id === id || r.reel_id === id);
    if (!reel) {
      throw new Error(`Reel with ID ${id} not found`);
    }
    return reel;
  }

  static calculateOverallStatus(params: {
    script_status: ScriptStatus;
    shoot_status: ShootStatus;
    editing_status: EditingStatus;
    client_approval_status: ClientApprovalStatus;
    posting_status: PostingStatus;
  }): string {
    if (params.posting_status === 'Posted') return 'Posted';
    if (params.posting_status === 'Scheduled' && params.client_approval_status === 'Approved') return 'Posting Scheduled';
    if (params.client_approval_status === 'Changes Requested') return 'Revision Required';
    if (params.client_approval_status === 'Pending' && params.editing_status === 'Completed') return 'Approval Pending';
    if (params.client_approval_status === 'Approved') return 'Approved';
    if (params.editing_status === 'Internal Review') return 'Internal Review';
    if (params.editing_status === 'In Progress') return 'Editing';
    if (params.shoot_status === 'Completed') return 'Editing';
    if (params.shoot_status === 'Scheduled') return 'Shoot Scheduled';
    if (params.script_status === 'Ready') return 'Script Ready';
    if (params.script_status === 'In Progress') return 'Scripting';
    return 'Planning';
  }


  static createReel(data: any) {
    const client = db.clients.find((c) => c.id === data.client_id);
    if (!client) {
      throw new Error(`Client ${data.client_id} not found`);
    }

    const nextNum = db.reels.length + 6001;
    const reelIdStr = `REL-${nextNum}`;
    const id = `rel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    let script_status = data.script_status;
    if (!script_status) {
      if ((data.script_content && data.script_content.trim().length > 0) || (data.hook_line && data.hook_line.trim().length > 0)) {
        script_status = 'In Progress';
      } else {
        script_status = 'Not Started';
      }
    }

    const shoot_status = data.shoot_status || 'Planned';
    const editing_status = data.editing_status || 'Not Started';
    const client_approval_status = data.client_approval_status || 'Pending';
    const posting_status = data.posting_status || 'Not Scheduled';

    const overall_status = this.calculateOverallStatus({
      script_status,
      shoot_status,
      editing_status,
      client_approval_status,
      posting_status,
    });

    const newReel: Reel = {
      id,
      reel_id: reelIdStr,
      client_id: data.client_id,
      client_package_id: data.client_package_id || client.active_package?.id,
      reel_number: Number(data.reel_number) || 1,
      title: data.title,
      description: data.description,
      hook_line: data.hook_line,
      script_content: data.script_content,
      content_type: data.content_type || 'Educational / Showcase',
      script_status,
      shoot_status,
      editing_status,
      client_approval_status,
      posting_status,
      overall_status,
      assigned_smm_id: data.assigned_smm_id || client.assigned_manager_id,
      assigned_editor_id: data.assigned_editor_id || '44444444-4444-4444-4444-444444444444',
      assigned_cameraman_id: data.assigned_cameraman_id,
      assigned_model_id: data.assigned_model_id,
      shoot_id: data.shoot_id,
      shoot_date: data.shoot_date,
      editing_due_date: data.editing_due_date,
      approval_due_date: data.approval_due_date,
      posting_date: data.posting_date,
      posting_time: data.posting_time || '06:00 PM',
      external_url: data.external_url,
      approval_notes: data.approval_notes,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    db.reels.unshift(newReel);
    return db.getAllReels().find((r) => r.id === id);
  }

  static updateReel(id: string, data: any) {
    const reel = db.reels.find((r) => r.id === id || r.reel_id === id);
    if (!reel) {
      throw new Error(`Reel ${id} not found`);
    }

    let script_status = data.script_status ?? reel.script_status;
    if (data.script_status === undefined && (data.script_content !== undefined || data.hook_line !== undefined)) {
      const hasContent = (data.script_content && data.script_content.trim().length > 0) || (data.hook_line && data.hook_line.trim().length > 0);
      if (hasContent && reel.script_status === 'Not Started') {
        script_status = 'In Progress';
      }
    }

    const shoot_status = data.shoot_status ?? reel.shoot_status;
    const editing_status = data.editing_status ?? reel.editing_status;
    const client_approval_status = data.client_approval_status ?? reel.client_approval_status;
    const posting_status = data.posting_status ?? reel.posting_status;

    const overall_status = this.calculateOverallStatus({
      script_status,
      shoot_status,
      editing_status,
      client_approval_status,
      posting_status,
    });

    Object.assign(reel, data, {
      script_status,
      shoot_status,
      editing_status,
      client_approval_status,
      posting_status,
      overall_status,
      updated_at: new Date().toISOString(),
    });

    // Notify Editor if changes requested
    if (data.client_approval_status === 'Changes Requested' && reel.assigned_editor_id) {
      db.createNotification({
        user_id: reel.assigned_editor_id,
        title: `🔄 Changes Requested on Reel #${reel.reel_number}`,
        message: `${reel.title}: "${data.approval_notes || 'Client requested revisions'}"`,
        type: 'approval',
        priority: 'warning',
        link: `/reels?reelId=${reel.id}`,
      });
    }

    return db.getAllReels().find((r) => r.id === reel.id);
  }

  static deleteReel(id: string) {
    const index = db.reels.findIndex((r) => r.id === id || r.reel_id === id);
    if (index === -1) {
      throw new Error(`Reel ${id} not found`);
    }
    const [deleted] = db.reels.splice(index, 1);
    return deleted;
  }
}

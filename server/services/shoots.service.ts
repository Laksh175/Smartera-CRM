import { db } from '../db/connection.js';
import type { Shoot } from '../types/index.js';
import { ReelsService } from './reels.service.js';

export class ShootsService {
  static getShoots() {
    return db.getAllShoots();
  }

  static getShootById(id: string) {
    const shoot = db.getAllShoots().find((s) => s.id === id || s.shoot_id === id);
    if (!shoot) {
      throw new Error(`Shoot ${id} not found`);
    }
    return shoot;
  }

  static checkConflicts(params: {
    shootIdToIgnore?: string;
    date: string;
    start_time: string;
    end_time: string;
    cameraman_id?: string | null;
    model_id?: string | null;
  }) {
    return db.checkShootConflicts(params);
  }

  static createShoot(data: any, forceBooking: boolean = false) {
    const client = db.clients.find((c) => c.id === data.client_id);
    if (!client) {
      throw new Error(`Client ${data.client_id} not found`);
    }

    // Double-Booking Collision Check
    const conflictCheck = db.checkShootConflicts({
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      cameraman_id: data.cameraman_id,
      model_id: data.model_id,
    });

    if (conflictCheck.hasConflict && !forceBooking) {
      const err: any = new Error(conflictCheck.message || 'Scheduling conflict detected');
      err.statusCode = 409;
      err.conflict = conflictCheck;
      throw err;
    }

    const nextNum = db.shoots.length + 5001;
    const shootIdStr = `SHT-${nextNum}`;
    const id = `sht-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const reelIds: string[] = Array.isArray(data.reel_ids) ? data.reel_ids : [];

    const newShoot: Shoot = {
      id,
      shoot_id: shootIdStr,
      client_id: data.client_id,
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      shoot_type: data.shoot_type,
      cameraman_id: data.cameraman_id,
      model_id: data.model_id,
      editor_id: data.editor_id,
      manager_id: data.manager_id || client.assigned_manager_id,
      reels_count: reelIds.length > 0 ? reelIds.length : (Number(data.reels_count) || 4),
      reel_ids: reelIds,
      notes: data.notes,
      status: data.status || 'Scheduled',
      created_at: new Date().toISOString(),
    };

    db.shoots.unshift(newShoot);

    // Auto-sync linked reels to 'Scheduled' and update shoot metadata
    if (reelIds.length > 0) {
      for (const rId of reelIds) {
        const reel = db.reels.find((r) => r.id === rId || r.reel_id === rId);
        if (reel) {
          reel.shoot_id = id;
          reel.shoot_date = data.date;
          if (data.cameraman_id) reel.assigned_cameraman_id = data.cameraman_id;
          if (data.model_id) reel.assigned_model_id = data.model_id;
          reel.shoot_status = data.status === 'Completed' ? 'Completed' : 'Scheduled';
          reel.overall_status = ReelsService.calculateOverallStatus(reel);
          reel.updated_at = new Date().toISOString();
        }
      }
    }

    // Notify Cameraman
    if (newShoot.cameraman_id) {
      db.createNotification({
        user_id: newShoot.cameraman_id,
        title: `📸 New Shoot Booked: ${client.business_name}`,
        message: `Date: ${newShoot.date} (${newShoot.start_time} - ${newShoot.end_time}) at ${newShoot.location}. Batch of ${newShoot.reels_count} reels.`,
        type: 'shoot',
        priority: 'info',
        link: `/shoots`,
      });
    }

    // Notify Model if assigned
    if (newShoot.model_id) {
      db.createNotification({
        user_id: newShoot.model_id,
        title: `👗 Model Booking: ${client.business_name}`,
        message: `Date: ${newShoot.date} (${newShoot.start_time} - ${newShoot.end_time}) at ${newShoot.location}`,
        type: 'shoot',
        priority: 'info',
        link: `/shoots`,
      });
    }

    return db.getAllShoots().find((s) => s.id === id);
  }

  static updateShoot(id: string, data: any, forceBooking: boolean = false) {
    const shoot = db.shoots.find((s) => s.id === id || s.shoot_id === id);
    if (!shoot) {
      throw new Error(`Shoot ${id} not found`);
    }

    const checkDate = data.date || shoot.date;
    const checkStart = data.start_time || shoot.start_time;
    const checkEnd = data.end_time || shoot.end_time;
    const checkCam = data.cameraman_id !== undefined ? data.cameraman_id : shoot.cameraman_id;
    const checkModel = data.model_id !== undefined ? data.model_id : shoot.model_id;

    if (data.date || data.start_time || data.cameraman_id || data.model_id) {
      const conflictCheck = db.checkShootConflicts({
        shootIdToIgnore: shoot.id,
        date: checkDate,
        start_time: checkStart,
        end_time: checkEnd,
        cameraman_id: checkCam,
        model_id: checkModel,
      });

      if (conflictCheck.hasConflict && !forceBooking) {
        const err: any = new Error(conflictCheck.message || 'Scheduling conflict detected');
        err.statusCode = 409;
        err.conflict = conflictCheck;
        throw err;
      }
    }

    // Sync linked reels if status or reel_ids change
    const newStatus = data.status || shoot.status;
    const newDate = data.date || shoot.date;
    const updatedReelIds: string[] = data.reel_ids !== undefined ? (Array.isArray(data.reel_ids) ? data.reel_ids : []) : (shoot.reel_ids || []);

    // Unlink reels that were removed
    if (data.reel_ids !== undefined && shoot.reel_ids) {
      const removedIds = shoot.reel_ids.filter((oldId) => !updatedReelIds.includes(oldId));
      for (const rId of removedIds) {
        const reel = db.reels.find((r) => r.id === rId || r.reel_id === rId);
        if (reel && reel.shoot_id === shoot.id) {
          reel.shoot_id = undefined;
          reel.shoot_date = undefined;
          reel.shoot_status = 'Planned';
          reel.overall_status = ReelsService.calculateOverallStatus(reel);
          reel.updated_at = new Date().toISOString();
        }
      }
    }

    // Update newly linked or existing linked reels
    for (const rId of updatedReelIds) {
      const reel = db.reels.find((r) => r.id === rId || r.reel_id === rId);
      if (reel) {
        reel.shoot_id = shoot.id;
        reel.shoot_date = newDate;
        if (data.cameraman_id !== undefined) reel.assigned_cameraman_id = data.cameraman_id;
        if (data.model_id !== undefined) reel.assigned_model_id = data.model_id;

        if (newStatus === 'Completed') {
          reel.shoot_status = 'Completed';
          if (reel.editing_status === 'Not Started') {
            reel.editing_status = 'In Progress';
          }
          if (reel.assigned_editor_id) {
            db.createNotification({
              user_id: reel.assigned_editor_id,
              title: `🎬 Raw Footage Ingested: Reel #${reel.reel_number}`,
              message: `Shoot completed for ${reel.client_name || 'Client'}. Reel is now in your Editing queue.`,
              type: 'reel',
              priority: 'info',
              link: `/reels-workflow`,
            });
          }
        } else if (newStatus === 'Cancelled') {
          reel.shoot_status = 'Planned';
        } else {
          reel.shoot_status = 'Scheduled';
        }
        reel.overall_status = ReelsService.calculateOverallStatus(reel);
        reel.updated_at = new Date().toISOString();
      }
    }

    // Also update any other reels that had this shoot_id
    const remainingLinked = db.reels.filter((r) => r.shoot_id === shoot.id);
    for (const reel of remainingLinked) {
      if (newStatus === 'Completed') {
        reel.shoot_status = 'Completed';
        if (reel.editing_status === 'Not Started') {
          reel.editing_status = 'In Progress';
        }
      } else if (newStatus === 'Cancelled') {
        reel.shoot_status = 'Planned';
      } else {
        reel.shoot_status = 'Scheduled';
      }
      reel.shoot_date = newDate;
      reel.overall_status = ReelsService.calculateOverallStatus(reel);
      reel.updated_at = new Date().toISOString();
    }


    Object.assign(shoot, data, {
      reel_ids: updatedReelIds,
      reels_count: updatedReelIds.length > 0 ? updatedReelIds.length : (data.reels_count !== undefined ? Number(data.reels_count) : shoot.reels_count),
      updated_at: new Date().toISOString()
    });

    return db.getAllShoots().find((s) => s.id === shoot.id);
  }

  static deleteShoot(id: string) {
    const index = db.shoots.findIndex((s) => s.id === id || s.shoot_id === id);
    if (index === -1) {
      throw new Error(`Shoot ${id} not found`);
    }
    const [deleted] = db.shoots.splice(index, 1);

    // Unlink any reels assigned to this shoot
    const linked = db.reels.filter((r) => r.shoot_id === id || (deleted.reel_ids && deleted.reel_ids.includes(r.id)));
    for (const reel of linked) {
      reel.shoot_id = undefined;
      reel.shoot_date = undefined;
      reel.shoot_status = 'Planned';
      reel.overall_status = ReelsService.calculateOverallStatus(reel);
      reel.updated_at = new Date().toISOString();
    }

    return deleted;
  }
}

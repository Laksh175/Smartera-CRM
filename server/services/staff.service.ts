import { db } from '../db/connection.js';
import type { StaffProfile, Profile } from '../types/index.js';
import bcrypt from 'bcryptjs';

export class StaffService {
  static getAllStaff() {
    const staffList = db.getAllStaff();
    const todayStr = new Date().toISOString().split('T')[0];

    return staffList.map((st) => {
      const assignedTasks = db.tasks.filter((t) => t.assigned_to === st.user_id);
      const completedTasks = assignedTasks.filter((t) => t.status === 'Completed').length;
      const overdueTasks = assignedTasks.filter((t) => t.status !== 'Completed' && t.due_date < todayStr).length;

      const assignedShoots = db.shoots.filter(
        (s) => (s.cameraman_id === st.user_id || s.model_id === st.user_id || s.manager_id === st.user_id) && s.status !== 'Cancelled'
      ).length;

      const assignedReels = db.reels.filter(
        (r) => (r.assigned_editor_id === st.user_id || r.assigned_smm_id === st.user_id || r.assigned_cameraman_id === st.user_id) && r.posting_status !== 'Posted'
      ).length;

      return {
        ...st,
        workload: {
          total_tasks: assignedTasks.length,
          completed_tasks: completedTasks,
          overdue_tasks: overdueTasks,
          active_shoots: assignedShoots,
          active_reels: assignedReels,
        },
      };
    });
  }

  static getStaffById(userId: string) {
    const staff = this.getAllStaff().find((s) => s.user_id === userId || s.id === userId);
    if (!staff) {
      throw new Error(`Staff member ${userId} not found`);
    }
    return staff;
  }

  static createStaff(data: any) {
    const existing = db.getProfileByEmail(data.email);
    if (existing) {
      throw new Error(`User with email ${data.email} already exists`);
    }

    const userId = `usr-${Date.now()}`;
    const staffId = `st-${Date.now()}`;
    const passwordHash = bcrypt.hashSync(data.password || 'smartera123', 8);

    const newProfile: Profile = {
      id: userId,
      email: data.email,
      password_hash: passwordHash,
      name: data.name,
      phone: data.phone,
      avatar_url: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      role: data.role,
      status: data.status || 'Active',
      created_at: new Date().toISOString(),
    };

    db.profiles.push(newProfile);

    const newStaffProfile: StaffProfile = {
      id: staffId,
      user_id: userId,
      role_type: data.role,
      equipment: data.equipment,
      skills: data.skills || [],
      gender: data.gender,
      instagram: data.instagram,
      daily_rate: Number(data.daily_rate) || 0,
      availability_status: data.availability_status || 'Available',
      notes: data.notes,
    };

    db.staffProfiles.push(newStaffProfile);
    return this.getStaffById(userId);
  }

  static updateStaff(userId: string, data: any) {
    const profile = db.profiles.find((p) => p.id === userId);
    if (!profile) {
      throw new Error(`User ${userId} not found`);
    }

    if (data.name) profile.name = data.name;
    if (data.phone) profile.phone = data.phone;
    if (data.role) profile.role = data.role;
    if (data.status) profile.status = data.status;
    if (data.avatar_url) profile.avatar_url = data.avatar_url;
    profile.updated_at = new Date().toISOString();

    let staff = db.staffProfiles.find((sp) => sp.user_id === userId);
    if (staff) {
      if (data.equipment !== undefined) staff.equipment = data.equipment;
      if (data.skills !== undefined) staff.skills = data.skills;
      if (data.gender !== undefined) staff.gender = data.gender;
      if (data.instagram !== undefined) staff.instagram = data.instagram;
      if (data.daily_rate !== undefined) staff.daily_rate = Number(data.daily_rate);
      if (data.availability_status !== undefined) staff.availability_status = data.availability_status;
      if (data.notes !== undefined) staff.notes = data.notes;
    }

    return this.getStaffById(userId);
  }
}

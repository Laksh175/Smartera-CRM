import { db } from '../db/connection.js';

export class ActivityService {
  static getActivityLogs() {
    return db.activityLogs;
  }
}

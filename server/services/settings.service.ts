import { db } from '../db/connection.js';
import type { AppSettings } from '../types/index.js';

export class SettingsService {
  static getSettings(): AppSettings {
    return db.settings;
  }

  static updateSettings(data: Partial<AppSettings>): AppSettings {
    Object.assign(db.settings, data);
    return db.settings;
  }
}

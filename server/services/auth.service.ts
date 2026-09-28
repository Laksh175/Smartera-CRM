import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection.js';
import type { Profile } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smartera_super_secret_jwt_key_2026_marketing_agency_crm';

export class AuthService {
  static login(email: string, password?: string) {
    const user = db.getProfileByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (password && user.password_hash) {
      const isValid = bcrypt.compareSync(password, user.password_hash);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }
    }

    user.last_login = new Date().toISOString();

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    return { user: safeUser, token };
  }

  static getProfile(userId: string) {
    const user = db.getProfileById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  static updateProfile(userId: string, data: Partial<Profile>) {
    const user = db.getProfileById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    if (data.avatar_url) user.avatar_url = data.avatar_url;
    user.updated_at = new Date().toISOString();

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}

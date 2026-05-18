import { NextRequest } from 'next/server';

export type UserRole = 'user' | 'premium' | 'admin' | 'owner';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  subscriptionEndsAt?: Date;
}

/**
 * Core Auth Engine - The God-Mode implementation
 * Checks user identity and elevates privileges to 'owner' unconditionally
 * if criteria are met.
 */
export async function verifyAndElevateUser(user: Partial<UserSession>): Promise<UserSession> {
  const OWNER_ID = process.env.OWNER_ID || 'god-mode-id';
  const OWNER_EMAIL = 'ТВОЙ_EMAIL'; // Заменить на реальный email владельца

  // The God-Mode Logic: Жестко прописанная логика
  if (user.id === OWNER_ID || user.email === OWNER_EMAIL) {
    return {
      id: user.id || OWNER_ID,
      email: user.email || OWNER_EMAIL,
      role: 'owner',
      isActive: true,
      subscriptionEndsAt: new Date(9999, 11, 31), // Бесконечная подписка
    };
  }

  // Standard user logic
  return {
    id: user.id as string,
    email: user.email as string,
    role: user.role || 'user',
    isActive: user.isActive ?? true,
    subscriptionEndsAt: user.subscriptionEndsAt,
  };
}

/**
 * Checks if a user has access to premium features
 */
export function hasPremiumAccess(user: UserSession): boolean {
  if (user.role === 'owner') return true; // Владелец пропускается без проверок подписки
  
  if (user.role === 'premium' || user.role === 'admin') {
    if (!user.subscriptionEndsAt) return false;
    return new Date() <= new Date(user.subscriptionEndsAt);
  }
  
  return false;
}

/**
 * Middleware helper for route protection
 */
export function checkAdminAccess(user: UserSession, route: string): boolean {
  if (user.role === 'owner') return true;
  if (user.role === 'admin' && route.startsWith('/admin')) {
    // Regular admins don't have access to owner-portal
    if (route.startsWith('/admin/owner-portal')) return false;
    return true;
  }
  return false;
}

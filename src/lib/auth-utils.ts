// src/lib/auth-utils.ts

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { Role } from '@prisma/client';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role as Role)) {
    redirect('/unauthorized');
  }
  return session;
}

// Permission definitions
export const Permissions = {
  'quotes:read': [Role.ADMIN, Role.STAFF, Role.READONLY],
  'quotes:create': [Role.ADMIN, Role.STAFF],
  'quotes:update': [Role.ADMIN, Role.STAFF],
  'quotes:delete': [Role.ADMIN],
  'quotes:send': [Role.ADMIN, Role.STAFF],
  'products:read': [Role.ADMIN, Role.STAFF, Role.READONLY],
  'products:create': [Role.ADMIN],
  'products:update': [Role.ADMIN],
  'products:delete': [Role.ADMIN],
  'users:read': [Role.ADMIN],
  'users:update': [Role.ADMIN],
} as const;

export function hasPermission(
  userRole: Role,
  permission: keyof typeof Permissions
): boolean {
  return Permissions[permission].includes(userRole);
}

import { UserRole } from '@/types/auth';

export const getDashboardUrl = (role: UserRole | null): string => {
  switch (role) {
    case 'super_admin':
      return '/dashboard/super-admin';
    case 'admin':
      return '/dashboard/admin';
    case 'agent':
      return '/dashboard/agent';
    case 'user':
      return '/dashboard/user';
    default:
      return '/dashboard/user'; // Default to user dashboard instead of /dashboard
  }
};

export const getRoleFromDashboardUrl = (url: string): UserRole | null => {
  if (url.includes('/dashboard/super-admin')) return 'super_admin';
  if (url.includes('/dashboard/admin')) return 'admin';
  if (url.includes('/dashboard/agent')) return 'agent';
  if (url.includes('/dashboard/user')) return 'user';
  return null;
};

import { UserRole } from '@/types/auth';

export const getDashboardUrl = (role: UserRole | null): string => {
  switch (role) {
    case 'super_admin':
      return '/super-admin';
    case 'admin':
    case 'sub_admin':
      return '/admin';
    case 'agent':
      return '/agent';
    case 'user':
      return '/user';
    default:
      return '/user';
  }
};

export const getRoleFromDashboardUrl = (url: string): UserRole | null => {
  if (url.includes('/super-admin')) return 'super_admin';
  if (url.includes('/admin')) return 'admin';
  if (url.includes('/agent')) return 'agent';
  if (url.includes('/user')) return 'user';
  return null;
};

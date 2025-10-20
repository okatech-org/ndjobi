import { useAuth } from '@/hooks/useAuth';

export const useDashboardPermissions = () => {
  const { user, role } = useAuth();

  const canManageAgents = ['super_admin', 'admin'].includes(role || '');
  const canManageSubAdmins = ['super_admin', 'admin'].includes(role || '');
  const canValidateCases = ['super_admin', 'admin', 'sub_admin'].includes(role || '');
  const canViewReports = ['super_admin', 'admin', 'sub_admin', 'agent'].includes(role || '');
  const canAccessXR7 = ['super_admin', 'admin'].includes(role || '');
  const isPresident = user?.email === '24177888001@ndjobi.com' || user?.phone === '+24177888001';

  return {
    canManageAgents,
    canManageSubAdmins,
    canValidateCases,
    canViewReports,
    canAccessXR7,
    isPresident,
    role
  };
};

export default useDashboardPermissions;


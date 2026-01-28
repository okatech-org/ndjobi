import { useAuth } from '@/hooks/useAuth';
import { isSpecializedAgentRole, type AgentRole } from '@/services/signalementRouting';

export const useDashboardPermissions = () => {
  const { user, role } = useAuth();

  // Rôles administratifs de haut niveau
  const isHighLevelAdmin = ['super_admin', 'admin'].includes(role || '');
  
  // Rôles de sous-admins (y compris spécialisés)
  const isSubAdmin = ['sub_admin', 'sub_admin_dgss', 'sub_admin_dgr'].includes(role || '');
  
  // Rôles d'agents (y compris spécialisés)
  const isAgent = ['agent', 'agent_anticorruption', 'agent_justice', 'agent_interior', 'agent_defense'].includes(role || '');
  
  // Vérifier si c'est un agent spécialisé
  const isSpecializedAgent = isSpecializedAgentRole(role);

  const canManageAgents = isHighLevelAdmin;
  const canManageSubAdmins = isHighLevelAdmin;
  const canValidateCases = isHighLevelAdmin || isSubAdmin;
  const canViewReports = isHighLevelAdmin || isSubAdmin || isAgent;
  const canAccessXR7 = isHighLevelAdmin;
  const isPresident = user?.email === '24177888001@ndjobi.com' || user?.phone === '+24177888001';
  
  // Récupère le rôle d'agent spécialisé si applicable
  const specializedAgentRole: AgentRole | null = isSpecializedAgent ? (role as AgentRole) : null;

  return {
    canManageAgents,
    canManageSubAdmins,
    canValidateCases,
    canViewReports,
    canAccessXR7,
    isPresident,
    isHighLevelAdmin,
    isSubAdmin,
    isAgent,
    isSpecializedAgent,
    specializedAgentRole,
    role
  };
};

export default useDashboardPermissions;


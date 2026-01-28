/**
 * Signalement Routing Service
 * Gère le routage automatique des signalements vers les agents spécialisés
 */

export type AgentRole =
    | 'agent_anticorruption'
    | 'agent_justice'
    | 'agent_interior'
    | 'agent_defense'
    | 'sub_admin_dgss'
    | 'sub_admin_dgr';

export type SignalementType =
    | 'corruption'
    | 'detournement'
    | 'extorsion'
    | 'abus_pouvoir'
    | 'favoritisme'
    | 'fraude'
    | 'defense'
    | 'securite'
    | 'renseignement'
    | 'autre';

/**
 * Mapping des types de signalements vers les rôles d'agents
 */
export const SIGNALEMENT_ROUTING: Record<SignalementType, AgentRole> = {
    'corruption': 'agent_anticorruption',
    'detournement': 'agent_anticorruption',
    'extorsion': 'agent_interior',
    'abus_pouvoir': 'agent_justice',
    'favoritisme': 'agent_interior',
    'fraude': 'agent_justice',
    'defense': 'agent_defense',
    'securite': 'sub_admin_dgss',
    'renseignement': 'sub_admin_dgr',
    'autre': 'agent_interior',
};

/**
 * Labels français pour les rôles d'agents
 */
export const AGENT_ROLE_LABELS: Record<AgentRole, string> = {
    'agent_anticorruption': 'Agent Anti-Corruption',
    'agent_justice': 'Agent Justice',
    'agent_interior': 'Agent Intérieur',
    'agent_defense': 'Agent Défense',
    'sub_admin_dgss': 'Sous-Admin DGSS',
    'sub_admin_dgr': 'Sous-Admin DGR',
};

/**
 * Configuration complète des rôles avec icônes et couleurs
 */
export const AGENT_ROLE_CONFIG: Record<AgentRole, {
    label: string;
    icon: string;
    color: string;
    description: string;
    types: SignalementType[];
}> = {
    'agent_anticorruption': {
        label: 'Agent Anti-Corruption',
        icon: '🛡️',
        color: 'bg-red-500',
        description: 'Lutte contre la corruption et le détournement de fonds',
        types: ['corruption', 'detournement'],
    },
    'agent_justice': {
        label: 'Agent Justice',
        icon: '⚖️',
        color: 'bg-purple-500',
        description: 'Abus de pouvoir et fraude judiciaire',
        types: ['abus_pouvoir', 'fraude'],
    },
    'agent_interior': {
        label: 'Agent Intérieur',
        icon: '🏛️',
        color: 'bg-blue-500',
        description: 'Affaires administratives et favoritisme',
        types: ['extorsion', 'favoritisme', 'autre'],
    },
    'agent_defense': {
        label: 'Agent Défense',
        icon: '🎖️',
        color: 'bg-green-600',
        description: 'Défense nationale et affaires militaires',
        types: ['defense'],
    },
    'sub_admin_dgss': {
        label: 'Sous-Admin DGSS',
        icon: '🔒',
        color: 'bg-orange-500',
        description: 'Direction Générale de la Sécurité et de la Surveillance',
        types: ['securite'],
    },
    'sub_admin_dgr': {
        label: 'Sous-Admin DGR',
        icon: '🕵️',
        color: 'bg-gray-700',
        description: 'Direction Générale du Renseignement',
        types: ['renseignement'],
    },
};

/**
 * Obtient le rôle d'agent approprié pour un type de signalement
 */
export function getAgentRoleForType(type: string): AgentRole {
    return SIGNALEMENT_ROUTING[type as SignalementType] || 'agent_interior';
}

/**
 * Obtient les types de signalements pour un rôle d'agent donné
 */
export function getTypesForAgentRole(role: AgentRole): SignalementType[] {
    return AGENT_ROLE_CONFIG[role]?.types || [];
}

/**
 * Vérifie si un rôle peut accéder à un type de signalement
 */
export function canAccessSignalementType(role: AgentRole, type: string): boolean {
    const assignedRole = getAgentRoleForType(type);
    return role === assignedRole;
}

/**
 * Liste des types de signalements avec leurs labels
 */
export const SIGNALEMENT_TYPES = [
    { value: 'corruption', label: 'Corruption', agent: 'agent_anticorruption' },
    { value: 'detournement', label: 'Détournement de fonds', agent: 'agent_anticorruption' },
    { value: 'extorsion', label: 'Extorsion', agent: 'agent_interior' },
    { value: 'abus_pouvoir', label: 'Abus de pouvoir', agent: 'agent_justice' },
    { value: 'favoritisme', label: 'Favoritisme', agent: 'agent_interior' },
    { value: 'fraude', label: 'Fraude', agent: 'agent_justice' },
    { value: 'defense', label: 'Affaires de défense', agent: 'agent_defense' },
    { value: 'securite', label: 'Sécurité nationale', agent: 'sub_admin_dgss' },
    { value: 'renseignement', label: 'Renseignement', agent: 'sub_admin_dgr' },
    { value: 'autre', label: 'Autre', agent: 'agent_interior' },
] as const;

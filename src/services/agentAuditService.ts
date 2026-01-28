import { supabase } from "@/integrations/supabase/client";

export type AuditActionType = 
  | 'view_signalement'
  | 'update_status'
  | 'update_priority'
  | 'add_comment'
  | 'assign_signalement'
  | 'resolve_signalement'
  | 'reject_signalement'
  | 'export_report'
  | 'download_attachment';

interface AuditLogEntry {
  agent_id: string;
  signalement_id: string;
  action_type: AuditActionType;
  action_details?: Record<string, unknown>;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
}

export const agentAuditService = {
  /**
   * Enregistre une action d'agent dans l'audit trail
   */
  async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      
      if (!accessToken) {
        console.error('No auth token available');
        return;
      }

      // Direct REST API call to avoid TypeScript issues with dynamic tables
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/agent_audit_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          agent_id: entry.agent_id,
          signalement_id: entry.signalement_id,
          action_type: entry.action_type,
          action_details: entry.action_details || {},
          old_values: entry.old_values || null,
          new_values: entry.new_values || null,
          user_agent: navigator.userAgent
        })
      });
    } catch (err) {
      console.error('Erreur audit service:', err);
    }
  },

  /**
   * Récupère l'historique des actions pour un agent
   */
  async getAgentHistory(agentId: string, limit = 50) {
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    
    if (!accessToken) return [];

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/agent_audit_logs?agent_id=eq.${agentId}&order=created_at.desc&limit=${limit}`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      return [];
    }
  },

  /**
   * Récupère l'historique des actions pour un signalement
   */
  async getSignalementHistory(signalementId: string) {
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    
    if (!accessToken) return [];

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/agent_audit_logs?signalement_id=eq.${signalementId}&order=created_at.desc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Erreur récupération historique signalement:', error);
      return [];
    }
  },

  /**
   * Récupère l'historique global de tous les agents (super-admin uniquement)
   */
  async getAllAgentsHistory(filters?: {
    actionType?: AuditActionType;
    startDate?: Date;
    endDate?: Date;
    agentId?: string;
    limit?: number;
  }) {
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    
    if (!accessToken) return [];

    try {
      let url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/agent_audit_logs?order=created_at.desc`;
      
      if (filters?.limit) {
        url += `&limit=${filters.limit}`;
      } else {
        url += '&limit=200';
      }

      if (filters?.actionType) {
        url += `&action_type=eq.${filters.actionType}`;
      }

      if (filters?.agentId) {
        url += `&agent_id=eq.${filters.agentId}`;
      }

      if (filters?.startDate) {
        url += `&created_at=gte.${filters.startDate.toISOString()}`;
      }

      if (filters?.endDate) {
        url += `&created_at=lte.${filters.endDate.toISOString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur récupération historique global:', error);
      return [];
    }
  },

  /**
   * Traduit le type d'action en label lisible
   */
  getActionLabel(actionType: AuditActionType): string {
    const labels: Record<AuditActionType, string> = {
      view_signalement: 'Consultation du signalement',
      update_status: 'Modification du statut',
      update_priority: 'Modification de la priorité',
      add_comment: 'Ajout d\'un commentaire',
      assign_signalement: 'Assignation du signalement',
      resolve_signalement: 'Résolution du signalement',
      reject_signalement: 'Rejet du signalement',
      export_report: 'Export du rapport',
      download_attachment: 'Téléchargement de pièce jointe'
    };
    return labels[actionType] || actionType;
  },

  /**
   * Retourne l'icône associée à une action
   */
  getActionIcon(actionType: AuditActionType): string {
    const icons: Record<AuditActionType, string> = {
      view_signalement: '👁️',
      update_status: '🔄',
      update_priority: '⚡',
      add_comment: '💬',
      assign_signalement: '👤',
      resolve_signalement: '✅',
      reject_signalement: '❌',
      export_report: '📄',
      download_attachment: '📎'
    };
    return icons[actionType] || '📋';
  }
};

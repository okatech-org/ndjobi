export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      iasted_conversations: {
        Row: {
          actions_triggered: Json | null
          artifacts_generated: string[] | null
          assistant_audio_url: string | null
          assistant_message: string
          context_data: Json | null
          created_at: string | null
          id: string
          mode: string
          response_time_ms: number | null
          session_id: string
          user_id: string | null
          user_message: string
          user_message_audio_url: string | null
          user_message_transcription: string | null
          user_message_vector: unknown | null
        }
        Insert: {
          actions_triggered?: Json | null
          artifacts_generated?: string[] | null
          assistant_audio_url?: string | null
          assistant_message: string
          context_data?: Json | null
          created_at?: string | null
          id?: string
          mode: string
          response_time_ms?: number | null
          session_id: string
          user_id?: string | null
          user_message: string
          user_message_audio_url?: string | null
          user_message_transcription?: string | null
          user_message_vector?: unknown | null
        }
        Update: {
          actions_triggered?: Json | null
          artifacts_generated?: string[] | null
          assistant_audio_url?: string | null
          assistant_message?: string
          context_data?: Json | null
          created_at?: string | null
          id?: string
          mode?: string
          response_time_ms?: number | null
          session_id?: string
          user_id?: string | null
          user_message?: string
          user_message_audio_url?: string | null
          user_message_transcription?: string | null
          user_message_vector?: unknown | null
        }
        Relationships: []
      }
      iasted_knowledge_base: {
        Row: {
          confidence_score: number | null
          content: string
          content_vector: unknown | null
          created_at: string | null
          id: string
          knowledge_type: string
          last_accessed_at: string | null
          relevance_score: number | null
          source_conversation_id: string | null
          source_data: Json | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          content: string
          content_vector?: unknown | null
          created_at?: string | null
          id?: string
          knowledge_type: string
          last_accessed_at?: string | null
          relevance_score?: number | null
          source_conversation_id?: string | null
          source_data?: Json | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          content?: string
          content_vector?: unknown | null
          created_at?: string | null
          id?: string
          knowledge_type?: string
          last_accessed_at?: string | null
          relevance_score?: number | null
          source_conversation_id?: string | null
          source_data?: Json | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iasted_knowledge_base_source_conversation_id_fkey"
            columns: ["source_conversation_id"]
            isOneToOne: false
            referencedRelation: "iasted_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      national_kpis: {
        Row: {
          calculated_at: string | null
          created_at: string | null
          id: string
          impact_economique: number | null
          metadata: Json | null
          period_end: string
          period_start: string
          score_transparence: number | null
          signalements_critiques: number | null
          taux_resolution: number | null
          total_signalements: number | null
        }
        Insert: {
          calculated_at?: string | null
          created_at?: string | null
          id?: string
          impact_economique?: number | null
          metadata?: Json | null
          period_end: string
          period_start: string
          score_transparence?: number | null
          signalements_critiques?: number | null
          taux_resolution?: number | null
          total_signalements?: number | null
        }
        Update: {
          calculated_at?: string | null
          created_at?: string | null
          id?: string
          impact_economique?: number | null
          metadata?: Json | null
          period_end?: string
          period_start?: string
          score_transparence?: number | null
          signalements_critiques?: number | null
          taux_resolution?: number | null
          total_signalements?: number | null
        }
        Relationships: []
      }
      pin_attempts: {
        Row: {
          attempt_time: string
          id: string
          ip_address: string | null
          phone: string
          successful: boolean
        }
        Insert: {
          attempt_time?: string
          id?: string
          ip_address?: string | null
          phone: string
          successful?: boolean
        }
        Update: {
          attempt_time?: string
          id?: string
          ip_address?: string | null
          phone?: string
          successful?: boolean
        }
        Relationships: []
      }
      presidential_decisions: {
        Row: {
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          decision_type: string
          id: string
          metadata: Json | null
          motif: string | null
          signalement_id: string | null
        }
        Insert: {
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_type: string
          id?: string
          metadata?: Json | null
          motif?: string | null
          signalement_id?: string | null
        }
        Update: {
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_type?: string
          id?: string
          metadata?: Json | null
          motif?: string | null
          signalement_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presidential_decisions_signalement_id_fkey"
            columns: ["signalement_id"]
            isOneToOne: false
            referencedRelation: "signalements"
            referencedColumns: ["id"]
          },
        ]
      }
      presidential_directives: {
        Row: {
          content: string
          created_at: string | null
          id: string
          issued_at: string | null
          issued_by: string | null
          metadata: Json | null
          priority: string | null
          status: string | null
          target_ministries: string[] | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          target_ministries?: string[] | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          target_ministries?: string[] | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          metadata: Json | null
          organization: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          metadata?: Json | null
          organization?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          metadata?: Json | null
          organization?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projets: {
        Row: {
          category: string
          created_at: string | null
          description: string
          files: Json | null
          id: string
          metadata: Json | null
          protected_at: string | null
          protection_number: string | null
          protection_type: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          files?: Json | null
          id?: string
          metadata?: Json | null
          protected_at?: string | null
          protection_number?: string | null
          protection_type?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          files?: Json | null
          id?: string
          metadata?: Json | null
          protected_at?: string | null
          protection_number?: string | null
          protection_type?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      signalements: {
        Row: {
          attachments: Json | null
          created_at: string | null
          description: string
          id: string
          location: string | null
          metadata: Json | null
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          description: string
          id?: string
          location?: string | null
          metadata?: Json | null
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          description?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subadmin_performance: {
        Row: {
          calculated_at: string | null
          cas_traites: number | null
          created_at: string | null
          delai_moyen_jours: number | null
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          statut: string | null
          taux_succes: number | null
          user_id: string | null
        }
        Insert: {
          calculated_at?: string | null
          cas_traites?: number | null
          created_at?: string | null
          delai_moyen_jours?: number | null
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          statut?: string | null
          taux_succes?: number | null
          user_id?: string | null
        }
        Update: {
          calculated_at?: string | null
          cas_traites?: number | null
          created_at?: string | null
          delai_moyen_jours?: number | null
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          statut?: string | null
          taux_succes?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_pins: {
        Row: {
          created_at: string | null
          id: string
          pin_hash: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pin_hash: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pin_hash?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      iasted_analytics: {
        Row: {
          avg_response_time_ms: number | null
          date: string | null
          interactions_with_artifacts: number | null
          mode: string | null
          total_interactions: number | null
          unique_sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_pin_attempts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ensure_demo_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      get_super_admin_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          full_name: string
          id: string
          organization: string
          phone: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_president: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "agent" | "admin" | "super_admin" | "sub_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "agent", "admin", "super_admin", "sub_admin"],
    },
  },
} as const

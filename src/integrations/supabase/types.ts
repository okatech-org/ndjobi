export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      device_projets: {
        Row: {
          created_at: string | null
          device_id: string
          id: string
          migrated_at: string | null
          migrated_to_user: string | null
          projet_id: string
        }
        Insert: {
          created_at?: string | null
          device_id: string
          id?: string
          migrated_at?: string | null
          migrated_to_user?: string | null
          projet_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string
          id?: string
          migrated_at?: string | null
          migrated_to_user?: string | null
          projet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_projets_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
        ]
      }
      device_sessions: {
        Row: {
          created_at: string | null
          device_id: string
          fingerprint_data: Json | null
          fingerprint_hash: string
          first_seen: string
          id: string
          language: string | null
          last_seen: string
          linked_at: string | null
          platform: string | null
          session_count: number | null
          timezone: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          fingerprint_data?: Json | null
          fingerprint_hash: string
          first_seen?: string
          id?: string
          language?: string | null
          last_seen?: string
          linked_at?: string | null
          platform?: string | null
          session_count?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          fingerprint_data?: Json | null
          fingerprint_hash?: string
          first_seen?: string
          id?: string
          language?: string | null
          last_seen?: string
          linked_at?: string | null
          platform?: string | null
          session_count?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      device_signalements: {
        Row: {
          created_at: string | null
          device_id: string
          id: string
          migrated_at: string | null
          migrated_to_user: string | null
          signalement_id: string
        }
        Insert: {
          created_at?: string | null
          device_id: string
          id?: string
          migrated_at?: string | null
          migrated_to_user?: string | null
          signalement_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string
          id?: string
          migrated_at?: string | null
          migrated_to_user?: string | null
          signalement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_signalements_signalement_id_fkey"
            columns: ["signalement_id"]
            isOneToOne: false
            referencedRelation: "signalements"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_activations: {
        Row: {
          activated_by: string
          activation_metadata: Json | null
          biometric_validated: boolean | null
          created_at: string | null
          deactivated_at: string | null
          deactivation_reason: string | null
          duration_hours: number
          end_date: string
          id: string
          judicial_authorization: string
          legal_reference: string
          reason: string
          start_date: string
          status: string | null
          two_factor_validated: boolean | null
          updated_at: string | null
        }
        Insert: {
          activated_by: string
          activation_metadata?: Json | null
          biometric_validated?: boolean | null
          created_at?: string | null
          deactivated_at?: string | null
          deactivation_reason?: string | null
          duration_hours: number
          end_date: string
          id: string
          judicial_authorization: string
          legal_reference: string
          reason: string
          start_date: string
          status?: string | null
          two_factor_validated?: boolean | null
          updated_at?: string | null
        }
        Update: {
          activated_by?: string
          activation_metadata?: Json | null
          biometric_validated?: boolean | null
          created_at?: string | null
          deactivated_at?: string | null
          deactivation_reason?: string | null
          duration_hours?: number
          end_date?: string
          id?: string
          judicial_authorization?: string
          legal_reference?: string
          reason?: string
          start_date?: string
          status?: string | null
          two_factor_validated?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_activations_judicial_authorization_fkey"
            columns: ["judicial_authorization"]
            isOneToOne: false
            referencedRelation: "judicial_authorizations"
            referencedColumns: ["authorization_number"]
          },
        ]
      }
      emergency_audio_recordings: {
        Row: {
          activation_id: string
          created_at: string | null
          duration_seconds: number
          encrypted_audio: string
          id: string
          legal_validation: Json | null
          recorded_at: string
          recorded_by: string
          recording_id: string
          target_user_id: string
        }
        Insert: {
          activation_id: string
          created_at?: string | null
          duration_seconds: number
          encrypted_audio: string
          id?: string
          legal_validation?: Json | null
          recorded_at: string
          recorded_by: string
          recording_id: string
          target_user_id: string
        }
        Update: {
          activation_id?: string
          created_at?: string | null
          duration_seconds?: number
          encrypted_audio?: string
          id?: string
          legal_validation?: Json | null
          recorded_at?: string
          recorded_by?: string
          recording_id?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_audio_recordings_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "emergency_activations"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_audit_log: {
        Row: {
          activation_id: string | null
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          activation_id?: string | null
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          timestamp: string
          user_agent?: string | null
        }
        Update: {
          activation_id?: string | null
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_audit_log_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "emergency_activations"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_audit_reports: {
        Row: {
          activation_id: string | null
          created_at: string | null
          end_date: string
          events: Json
          generated_at: string
          generated_by: string | null
          id: string
          start_date: string
          total_events: number
          transmitted_to: string[] | null
        }
        Insert: {
          activation_id?: string | null
          created_at?: string | null
          end_date: string
          events: Json
          generated_at: string
          generated_by?: string | null
          id?: string
          start_date: string
          total_events: number
          transmitted_to?: string[] | null
        }
        Update: {
          activation_id?: string | null
          created_at?: string | null
          end_date?: string
          events?: Json
          generated_at?: string
          generated_by?: string | null
          id?: string
          start_date?: string
          total_events?: number
          transmitted_to?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_audit_reports_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "emergency_activations"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_decoded_data: {
        Row: {
          activation_id: string
          created_at: string | null
          decoded_at: string
          decoded_by: string
          decoded_data: Json
          id: string
          target_user_id: string
        }
        Insert: {
          activation_id: string
          created_at?: string | null
          decoded_at: string
          decoded_by: string
          decoded_data: Json
          id?: string
          target_user_id: string
        }
        Update: {
          activation_id?: string
          created_at?: string | null
          decoded_at?: string
          decoded_by?: string
          decoded_data?: Json
          id?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_decoded_data_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "emergency_activations"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_notifications: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          acknowledgment_received: boolean | null
          activation_id: string
          created_at: string | null
          id: string
          notification_content: Json | null
          notification_sent_at: string
          notification_type: string
          notified_authorities: string[]
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          acknowledgment_received?: boolean | null
          activation_id: string
          created_at?: string | null
          id?: string
          notification_content?: Json | null
          notification_sent_at: string
          notification_type: string
          notified_authorities: string[]
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          acknowledgment_received?: boolean | null
          activation_id?: string
          created_at?: string | null
          id?: string
          notification_content?: Json | null
          notification_sent_at?: string
          notification_type?: string
          notified_authorities?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "emergency_notifications_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "emergency_activations"
            referencedColumns: ["id"]
          },
        ]
      }
      judicial_authorizations: {
        Row: {
          attached_documents: Json | null
          authorization_number: string
          created_at: string | null
          expiry_date: string
          id: string
          issued_by: string
          issued_date: string
          legal_basis: string
          scope: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attached_documents?: Json | null
          authorization_number: string
          created_at?: string | null
          expiry_date: string
          id?: string
          issued_by: string
          issued_date: string
          legal_basis: string
          scope: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attached_documents?: Json | null
          authorization_number?: string
          created_at?: string | null
          expiry_date?: string
          id?: string
          issued_by?: string
          issued_date?: string
          legal_basis?: string
          scope?: string
          status?: string | null
          updated_at?: string | null
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
          organization: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          organization?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projets: {
        Row: {
          category: string
          created_at: string | null
          description: string
          device_id: string | null
          files: Json | null
          id: string
          is_anonymous: boolean | null
          metadata: Json | null
          protected_at: string | null
          protection_number: string | null
          protection_type: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          device_id?: string | null
          files?: Json | null
          id?: string
          is_anonymous?: boolean | null
          metadata?: Json | null
          protected_at?: string | null
          protection_number?: string | null
          protection_type?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          device_id?: string | null
          files?: Json | null
          id?: string
          is_anonymous?: boolean | null
          metadata?: Json | null
          protected_at?: string | null
          protection_number?: string | null
          protection_type?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      signalements: {
        Row: {
          attachments: Json | null
          created_at: string | null
          description: string
          device_id: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          is_anonymous: boolean | null
          location: string | null
          metadata: Json | null
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          submission_method: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          description: string
          device_id?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          is_anonymous?: boolean | null
          location?: string | null
          metadata?: Json | null
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          submission_method?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          description?: string
          device_id?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          is_anonymous?: boolean | null
          location?: string | null
          metadata?: Json | null
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          submission_method?: string | null
          title?: string
          type?: string
          updated_at?: string | null
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
      user_settings: {
        Row: {
          anonymous_reports: boolean
          created_at: string
          email_notifications: boolean
          language: string
          profile_visibility: string
          project_updates: boolean
          push_notifications: boolean
          report_updates: boolean
          security_alerts: boolean
          show_email: boolean
          show_phone: boolean
          sms_notifications: boolean
          theme: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anonymous_reports?: boolean
          created_at?: string
          email_notifications?: boolean
          language?: string
          profile_visibility?: string
          project_updates?: boolean
          push_notifications?: boolean
          report_updates?: boolean
          security_alerts?: boolean
          show_email?: boolean
          show_phone?: boolean
          sms_notifications?: boolean
          theme?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anonymous_reports?: boolean
          created_at?: string
          email_notifications?: boolean
          language?: string
          profile_visibility?: string
          project_updates?: boolean
          push_notifications?: boolean
          report_updates?: boolean
          security_alerts?: boolean
          show_email?: boolean
          show_phone?: boolean
          sms_notifications?: boolean
          theme?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_devices_with_history: {
        Row: {
          device_id: string | null
          fingerprint_hash: string | null
          first_seen: string | null
          last_seen: string | null
          linked_at: string | null
          pending_projets: number | null
          pending_signalements: number | null
          session_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
      device_migration_stats: {
        Row: {
          anonymous_devices: number | null
          avg_sessions_per_device: number | null
          conversion_rate: number | null
          linked_devices: number | null
          total_devices: number | null
        }
        Relationships: []
      }
      device_statistics: {
        Row: {
          anonymous_devices: number | null
          devices_with_projects: number | null
          devices_with_signalements: number | null
          linked_devices: number | null
          total_devices: number | null
        }
        Relationships: []
      }
      emergency_statistics: {
        Row: {
          active_activations: number | null
          avg_activation_duration: number | null
          last_activation: string | null
          total_activations: number | null
          total_audio_recordings: number | null
          total_decodings: number | null
          unauthorized_attempts: number | null
        }
        Relationships: []
      }
      top_active_devices: {
        Row: {
          device_id: string | null
          first_seen: string | null
          last_seen: string | null
          session_count: number | null
          total_projets: number | null
          total_signalements: number | null
          usage_duration: unknown | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_emergency_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_device_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      ensure_demo_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      get_device_history: {
        Args: { device_id_param: string }
        Returns: {
          last_activity: string
          projets_count: number
          signalements_count: number
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
      is_super_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_emergency_event: {
        Args: {
          p_activation_id?: string
          p_details: Json
          p_event_type: string
        }
        Returns: string
      }
      migrate_device_to_user: {
        Args: { device_id_param: string; user_id_param: string }
        Returns: {
          projets_linked: number
          signalements_linked: number
        }[]
      }
      send_security_alert: {
        Args: { p_details: Json; p_event_type: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "agent" | "admin" | "super_admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["user", "agent", "admin", "super_admin"],
    },
  },
} as const


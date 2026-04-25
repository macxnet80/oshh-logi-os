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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      absences: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          note: string | null
          profile_id: string
          start_date: string
          type: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          note?: string | null
          profile_id: string
          start_date: string
          type: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          note?: string | null
          profile_id?: string
          start_date?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "absences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      availabilities: {
        Row: {
          created_at: string
          date: string
          id: string
          is_recurring: boolean
          recurrence_rule: string | null
          released_by: string
          spot_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_recurring?: boolean
          recurrence_rule?: string | null
          released_by: string
          spot_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_recurring?: boolean
          recurrence_rule?: string | null
          released_by?: string
          spot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availabilities_released_by_fkey"
            columns: ["released_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availabilities_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "parking_spots"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      freelancer_checkins: {
        Row: {
          check_in: string
          check_out: string | null
          created_at: string
          freelancer_id: string
          id: string
        }
        Insert: {
          check_in: string
          check_out?: string | null
          created_at?: string
          freelancer_id: string
          id?: string
        }
        Update: {
          check_in?: string
          check_out?: string | null
          created_at?: string
          freelancer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_checkins_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancers: {
        Row: {
          created_at: string
          hourly_rate_eur: string | number
          id: string
          input_vat_deductible: boolean
          is_active: boolean
          name: string
          pin: string
        }
        Insert: {
          created_at?: string
          hourly_rate_eur?: string | number
          id?: string
          input_vat_deductible?: boolean
          is_active?: boolean
          name: string
          pin: string
        }
        Update: {
          created_at?: string
          hourly_rate_eur?: string | number
          id?: string
          is_active?: boolean
          name?: string
          pin?: string
          input_vat_deductible?: boolean
        }
        Relationships: []
      }
      logi_user_access: {
        Row: {
          is_admin: boolean
          team: string
          updated_at: string
          user_id: string
        }
        Insert: {
          is_admin?: boolean
          team: string
          updated_at?: string
          user_id: string
        }
        Update: {
          is_admin?: boolean
          team?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      logi_polls: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          options: Json
          question: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          options: Json
          question: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          options?: Json
          question?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "logi_polls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      logi_poll_votes: {
        Row: {
          id: string
          poll_id: string
          selected_option: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          poll_id: string
          selected_option: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          poll_id?: string
          selected_option?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logi_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "logi_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      parking_spots: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_permanently_released: boolean
          label: string
          sort_order: number
          zone: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_permanently_released?: boolean
          label: string
          sort_order?: number
          zone?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_permanently_released?: boolean
          label?: string
          sort_order?: number
          zone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_blocked: boolean
          must_change_password: boolean
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_blocked?: boolean
          must_change_password?: boolean
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_blocked?: boolean
          must_change_password?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_required: boolean | null
          options: Json | null
          placeholder: string | null
          question: string
          rating_items: Json | null
          sort_order: number
          subtitle: string | null
          survey_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          placeholder?: string | null
          question: string
          rating_items?: Json | null
          sort_order?: number
          subtitle?: string | null
          survey_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          placeholder?: string | null
          question?: string
          rating_items?: Json | null
          sort_order?: number
          subtitle?: string | null
          survey_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_availabilities: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          spot_id: string
          weekday: number
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          spot_id: string
          weekday: number
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          spot_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "recurring_availabilities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_availabilities_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "parking_spots"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          availability_id: string | null
          cancelled_at: string | null
          created_at: string
          date: string
          id: string
          spot_id: string
          status: string
          user_id: string
        }
        Insert: {
          availability_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          date: string
          id?: string
          spot_id: string
          status?: string
          user_id: string
        }
        Update: {
          availability_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          date?: string
          id?: string
          spot_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "availabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "parking_spots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          answers: Json
          id: string
          submitted_at: string | null
          survey_id: string
        }
        Insert: {
          answers?: Json
          id?: string
          submitted_at?: string | null
          survey_id: string
        }
        Update: {
          answers?: Json
          id?: string
          submitted_at?: string | null
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      spot_assignments: {
        Row: {
          created_at: string
          id: string
          spot_id: string
          user_id: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          spot_id: string
          user_id: string
          valid_from: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          spot_id?: string
          user_id?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spot_assignments_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "parking_spots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spot_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spot_blocks: {
        Row: {
          blocked_by: string
          created_at: string
          date: string
          id: string
          spot_id: string
        }
        Insert: {
          blocked_by: string
          created_at?: string
          date: string
          id?: string
          spot_id: string
        }
        Update: {
          blocked_by?: string
          created_at?: string
          date?: string
          id?: string
          spot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spot_blocks_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spot_blocks_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "parking_spots"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_admins: {
        Row: {
          created_at: string | null
          id: string
          survey_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          survey_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_admins_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          landing_description: string | null
          landing_title: string | null
          owner_id: string | null
          password_hash: string | null
          slug: string
          start_button_label: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          landing_description?: string | null
          landing_title?: string | null
          owner_id?: string | null
          password_hash?: string | null
          slug: string
          start_button_label?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          landing_description?: string | null
          landing_title?: string | null
          owner_id?: string | null
          password_hash?: string | null
          slug?: string
          start_button_label?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_survey_admin_by_email: {
        Args: { p_email: string; p_survey_id: string }
        Returns: undefined
      }
      get_logi_planner_members: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_blocked: boolean
          must_change_password: boolean
          role: string
          updated_at: string
        }[]
      }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_spot_owner: { Args: { p_spot_id: string }; Returns: boolean }
      is_survey_admin: { Args: { p_survey_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

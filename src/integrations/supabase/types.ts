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
      agent_settings: {
        Row: {
          character_prompt: string | null
          created_at: string
          guidelines: string | null
          id: string
          updated_at: string
          user_id: string
          user_identity: string | null
        }
        Insert: {
          character_prompt?: string | null
          created_at?: string
          guidelines?: string | null
          id?: string
          updated_at?: string
          user_id: string
          user_identity?: string | null
        }
        Update: {
          character_prompt?: string | null
          created_at?: string
          guidelines?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          user_identity?: string | null
        }
        Relationships: []
      }
      ai_chats: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      connected_platforms: {
        Row: {
          access_token_encrypted: string
          access_token_hash: string
          created_at: string
          expires_at: string | null
          id: string
          platform: Database["public"]["Enums"]["platform_type"]
          platform_account_id: string
          platform_display_name: string | null
          platform_username: string | null
          refresh_token_encrypted: string | null
          refresh_token_hash: string | null
          scope: string | null
          status: Database["public"]["Enums"]["platform_connection_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          access_token_hash: string
          created_at?: string
          expires_at?: string | null
          id?: string
          platform: Database["public"]["Enums"]["platform_type"]
          platform_account_id: string
          platform_display_name?: string | null
          platform_username?: string | null
          refresh_token_encrypted?: string | null
          refresh_token_hash?: string | null
          scope?: string | null
          status?: Database["public"]["Enums"]["platform_connection_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          access_token_hash?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          platform_account_id?: string
          platform_display_name?: string | null
          platform_username?: string | null
          refresh_token_encrypted?: string | null
          refresh_token_hash?: string | null
          scope?: string | null
          status?: Database["public"]["Enums"]["platform_connection_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          platform: Database["public"]["Enums"]["platform_type"] | null
          post_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          platform?: Database["public"]["Enums"]["platform_type"] | null
          post_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          platform?: Database["public"]["Enums"]["platform_type"] | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_logs_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_schedules: {
        Row: {
          created_at: string
          error_message: string | null
          executed_at: string | null
          id: string
          post_id: string
          qstash_message_id: string | null
          retry_count: number | null
          rule_id: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          post_id: string
          qstash_message_id?: string | null
          retry_count?: number | null
          rule_id?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          post_id?: string
          qstash_message_id?: string | null
          retry_count?: number | null
          rule_id?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_schedules_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_schedules_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "schedule_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          error_message: string | null
          id: string
          media_urls: string[] | null
          order_index: number | null
          platforms: Database["public"]["Enums"]["platform_type"][] | null
          posted_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["post_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          order_index?: number | null
          platforms?: Database["public"]["Enums"]["platform_type"][] | null
          posted_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          order_index?: number | null
          platforms?: Database["public"]["Enums"]["platform_type"][] | null
          posted_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          role: string | null
          status: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          role?: string | null
          status?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string | null
          status?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_rules: {
        Row: {
          created_at: string
          days: string[] | null
          id: string
          is_active: boolean | null
          name: string | null
          time: string
          timezone: string | null
          type: Database["public"]["Enums"]["schedule_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          time: string
          timezone?: string | null
          type: Database["public"]["Enums"]["schedule_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          time?: string
          timezone?: string | null
          type?: Database["public"]["Enums"]["schedule_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_limits: {
        Row: {
          created_at: string
          id: string
          monthly_limit: number | null
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_limit?: number | null
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_limit?: number | null
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          created_at: string
          id: string
          month_year: string
          platform: Database["public"]["Enums"]["platform_type"]
          posts_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month_year: string
          platform: Database["public"]["Enums"]["platform_type"]
          posts_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month_year?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          posts_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      job_status: "scheduled" | "executed" | "failed" | "cancelled"
      platform_connection_status: "connected" | "expired" | "revoked" | "error"
      platform_type:
        | "twitter"
        | "instagram"
        | "linkedin"
        | "facebook"
        | "threads"
        | "tiktok"
        | "youtube"
        | "pinterest"
      post_status: "draft" | "scheduled" | "posting" | "posted" | "failed"
      schedule_type: "daily" | "weekdays" | "weekends" | "custom"
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
      app_role: ["admin", "user"],
      job_status: ["scheduled", "executed", "failed", "cancelled"],
      platform_connection_status: ["connected", "expired", "revoked", "error"],
      platform_type: [
        "twitter",
        "instagram",
        "linkedin",
        "facebook",
        "threads",
        "tiktok",
        "youtube",
        "pinterest",
      ],
      post_status: ["draft", "scheduled", "posting", "posted", "failed"],
      schedule_type: ["daily", "weekdays", "weekends", "custom"],
    },
  },
} as const

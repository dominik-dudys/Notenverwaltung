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
      profiles: {
        Row: {
          id: string
          email: string
          role: string
          first_name: string | null
          last_name: string | null
          study_program: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          email: string
          role?: string
          first_name?: string | null
          last_name?: string | null
          study_program?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: string
          first_name?: string | null
          last_name?: string | null
          study_program?: string | null
          avatar_url?: string | null
        }
        Relationships: []
      }
      timetable_entries: {
        Row: {
          id: string
          day: string
          time_slot: string
          subject: string
          room: string | null
          lecturer: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          day: string
          time_slot: string
          subject: string
          room?: string | null
          lecturer?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          day?: string
          time_slot?: string
          subject?: string
          room?: string | null
          lecturer?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      grades: {
        Row: {
          created_at: string | null
          date: string | null
          description: string | null
          grade: number
          id: string
          module_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          grade: number
          id?: string
          module_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          grade?: number
          id?: string
          module_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_averages"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "grades_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string | null
          ects: number
          id: string
          name: string
          semester: number | null
          semester_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          ects: number
          id?: string
          name: string
          semester?: number | null
          semester_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          ects?: number
          id?: string
          name?: string
          semester?: number | null
          semester_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      semesters: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      module_averages: {
        Row: {
          average_grade: number | null
          ects: number | null
          grade_count: number | null
          module_id: string | null
          module_name: string | null
          semester_name: string | null
        }
        Relationships: []
      }
      overall_average: {
        Row: {
          total_ects: number | null
          total_grades: number | null
          weighted_average: number | null
        }
        Relationships: []
      }
      semester_averages: {
        Row: {
          semester_id: string | null
          semester_name: string | null
          total_ects: number | null
          weighted_average: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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

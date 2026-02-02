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
      activity_log: {
        Row: {
          action_type: string
          created_at: string
          entity_id: string
          entity_name: string
          entity_type: string
          id: string
          metadata: Json
          organization_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          entity_id: string
          entity_name: string
          entity_type: string
          id?: string
          metadata?: Json
          organization_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          entity_id?: string
          entity_name?: string
          entity_type?: string
          id?: string
          metadata?: Json
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          created_at: string | null
          id: string
          is_completed: boolean | null
          item_type: string
          notes: string | null
          parent_item_id: string | null
          section_id: string
          sort_order: number
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          item_type?: string
          notes?: string | null
          parent_item_id?: string | null
          section_id: string
          sort_order?: number
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          item_type?: string
          notes?: string | null
          parent_item_id?: string | null
          section_id?: string
          sort_order?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_parent_item_id_fkey"
            columns: ["parent_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "checklist_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_sections: {
        Row: {
          checklist_id: string
          created_at: string | null
          display_mode: string
          id: string
          image_url: string | null
          images: Json | null
          sort_order: number
          title: string
        }
        Insert: {
          checklist_id: string
          created_at?: string | null
          display_mode?: string
          id?: string
          image_url?: string | null
          images?: Json | null
          sort_order?: number
          title: string
        }
        Update: {
          checklist_id?: string
          created_at?: string | null
          display_mode?: string
          id?: string
          image_url?: string | null
          images?: Json | null
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_sections_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          archived_at: string | null
          category: Database["public"]["Enums"]["document_category"]
          created_at: string | null
          created_by: string
          description: string | null
          display_mode: string
          id: string
          is_locked: boolean | null
          organization_id: string
          project_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          category: Database["public"]["Enums"]["document_category"]
          created_at?: string | null
          created_by: string
          description?: string | null
          display_mode?: string
          id?: string
          is_locked?: boolean | null
          organization_id: string
          project_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string | null
          created_by?: string
          description?: string | null
          display_mode?: string
          id?: string
          is_locked?: boolean | null
          organization_id?: string
          project_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_sections: {
        Row: {
          created_at: string
          created_by: string
          id: string
          organization_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          organization_id: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          organization_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_sections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_visible: boolean
          name: string
          organization_id: string
          position: number
          size: string
          updated_at: string
          widget_type: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          name: string
          organization_id: string
          position?: number
          size?: string
          updated_at?: string
          widget_type: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          name?: string
          organization_id?: string
          position?: number
          size?: string
          updated_at?: string
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      file_directory_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          menu_item_id: string
          organization_id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          menu_item_id: string
          organization_id: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          menu_item_id?: string
          organization_id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_directory_files_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_directory_files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      gemba_doc_cells: {
        Row: {
          created_at: string | null
          id: string
          image_annotations: Json | null
          image_url: string | null
          page_id: string
          position: number
          step_number: string | null
          step_text: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_annotations?: Json | null
          image_url?: string | null
          page_id: string
          position: number
          step_number?: string | null
          step_text?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_annotations?: Json | null
          image_url?: string | null
          page_id?: string
          position?: number
          step_number?: string | null
          step_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gemba_doc_cells_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "gemba_doc_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      gemba_doc_pages: {
        Row: {
          created_at: string | null
          gemba_doc_id: string
          id: string
          page_number: number
        }
        Insert: {
          created_at?: string | null
          gemba_doc_id: string
          id?: string
          page_number?: number
        }
        Update: {
          created_at?: string | null
          gemba_doc_id?: string
          id?: string
          page_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "gemba_doc_pages_gemba_doc_id_fkey"
            columns: ["gemba_doc_id"]
            isOneToOne: false
            referencedRelation: "gemba_docs"
            referencedColumns: ["id"]
          },
        ]
      }
      gemba_docs: {
        Row: {
          archived_at: string | null
          category: Database["public"]["Enums"]["document_category"]
          created_at: string | null
          created_by: string
          description: string | null
          grid_columns: number
          grid_rows: number
          id: string
          is_locked: boolean | null
          organization_id: string
          orientation: string
          title: string
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          category: Database["public"]["Enums"]["document_category"]
          created_at?: string | null
          created_by: string
          description?: string | null
          grid_columns?: number
          grid_rows?: number
          id?: string
          is_locked?: boolean | null
          organization_id: string
          orientation?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string | null
          created_by?: string
          description?: string | null
          grid_columns?: number
          grid_rows?: number
          id?: string
          is_locked?: boolean | null
          organization_id?: string
          orientation?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gemba_docs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          icon: string
          id: string
          name: string
          organization_id: string
          parent_category_id: string | null
          section_id: string | null
          show_in_sidebar: boolean
          show_on_dashboard: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          organization_id: string
          parent_category_id?: string | null
          section_id?: string | null
          show_in_sidebar?: boolean
          show_on_dashboard?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          organization_id?: string
          parent_category_id?: string | null
          section_id?: string | null
          show_in_sidebar?: boolean
          show_on_dashboard?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_categories_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "dashboard_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_documents: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          document_id: string | null
          document_type: string
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          menu_item_id: string
          organization_id: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          document_id?: string | null
          document_type: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          menu_item_id: string
          organization_id: string
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          document_id?: string | null
          document_type?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          menu_item_id?: string
          organization_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_documents_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string
          created_by: string
          description: string | null
          icon: string
          id: string
          is_searchable: boolean
          item_type: string
          name: string
          organization_id: string
          section_id: string | null
          sort_order: number
          target_category_id: string | null
          tool_is_searchable: boolean
          tool_mode: string
          tool_type: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          created_by: string
          description?: string | null
          icon?: string
          id?: string
          is_searchable?: boolean
          item_type: string
          name: string
          organization_id: string
          section_id?: string | null
          sort_order?: number
          target_category_id?: string | null
          tool_is_searchable?: boolean
          tool_mode?: string
          tool_type?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string
          id?: string
          is_searchable?: boolean
          item_type?: string
          name?: string
          organization_id?: string
          section_id?: string | null
          sort_order?: number
          target_category_id?: string | null
          tool_is_searchable?: boolean
          tool_mode?: string
          tool_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_target_category_id_fkey"
            columns: ["target_category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          accent_color: string | null
          card_style: string
          created_at: string
          dashboard_layout: string
          display_name: string | null
          id: string
          logo_url: string | null
          main_logo_colors: Json | null
          main_logo_dark_url: string | null
          main_logo_url: string | null
          name: string
          slug: string
          sub_logo_colors: Json | null
          sub_logo_dark_url: string | null
          sub_logo_url: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          card_style?: string
          created_at?: string
          dashboard_layout?: string
          display_name?: string | null
          id?: string
          logo_url?: string | null
          main_logo_colors?: Json | null
          main_logo_dark_url?: string | null
          main_logo_url?: string | null
          name: string
          slug: string
          sub_logo_colors?: Json | null
          sub_logo_dark_url?: string | null
          sub_logo_url?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          card_style?: string
          created_at?: string
          dashboard_layout?: string
          display_name?: string | null
          id?: string
          logo_url?: string | null
          main_logo_colors?: Json | null
          main_logo_dark_url?: string | null
          main_logo_url?: string | null
          name?: string
          slug?: string
          sub_logo_colors?: Json | null
          sub_logo_dark_url?: string | null
          sub_logo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pinned_items: {
        Row: {
          document_id: string
          document_type: string
          id: string
          organization_id: string
          pinned_at: string
          sort_order: number
          user_id: string
        }
        Insert: {
          document_id: string
          document_type: string
          id?: string
          organization_id: string
          pinned_at?: string
          sort_order?: number
          user_id: string
        }
        Update: {
          document_id?: string
          document_type?: string
          id?: string
          organization_id?: string
          pinned_at?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinned_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pipe_drawer_measurements: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          id: string
          notes: string | null
          organization_id: string
          project_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          organization_id: string
          project_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          organization_id?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipe_drawer_measurements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipe_drawer_measurements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          archived_at: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          organization_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          organization_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          organization_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_documents: {
        Row: {
          archived_at: string | null
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          created_by: string
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          organization_id: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          category: Database["public"]["Enums"]["document_category"]
          created_at?: string
          created_by: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          organization_id: string
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          created_by?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          organization_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employee"
      document_category:
        | "machine_operation"
        | "machine_maintenance"
        | "sop_training"
        | "follow_up_list"
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
      app_role: ["admin", "employee"],
      document_category: [
        "machine_operation",
        "machine_maintenance",
        "sop_training",
        "follow_up_list",
      ],
    },
  },
} as const

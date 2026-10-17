// Generated from the NunyaLink Admin Supabase schema (supabase/migrations).
// Regenerate with the Supabase CLI or MCP `generate_typescript_types` after schema changes.

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      admin_users: {
        Row: {user_id: string; role: string; full_name: string | null; created_at: string; };
        Insert: {user_id: string; role?: string; full_name?: string | null; created_at?: string; };
        Update: {user_id?: string; role?: string; full_name?: string | null; created_at?: string; };
        Relationships: [];
      };
      leads: {
        Row: {id: string; created_at: string; updated_at: string; full_name: string; business_name: string | null; email: string; phone: string | null; location: string | null; contact_method: string | null; industry: string | null; employees: string | null; biggest_task: string | null; hours_per_week: string | null; message: string | null; source: string; status: string; notes: string | null; next_follow_up: string | null; client_id: string | null; };
        Insert: {id?: string; created_at?: string; updated_at?: string; full_name: string; business_name?: string | null; email: string; phone?: string | null; location?: string | null; contact_method?: string | null; industry?: string | null; employees?: string | null; biggest_task?: string | null; hours_per_week?: string | null; message?: string | null; source?: string; status?: string; notes?: string | null; next_follow_up?: string | null; client_id?: string | null; };
        Update: {id?: string; created_at?: string; updated_at?: string; full_name?: string; business_name?: string | null; email?: string; phone?: string | null; location?: string | null; contact_method?: string | null; industry?: string | null; employees?: string | null; biggest_task?: string | null; hours_per_week?: string | null; message?: string | null; source?: string; status?: string; notes?: string | null; next_follow_up?: string | null; client_id?: string | null; };
        Relationships: [{ foreignKeyName: "leads_client_id_fkey"; columns: ["client_id"]; isOneToOne: false; referencedRelation: "clients"; referencedColumns: ["id"] },];
      };
      clients: {
        Row: {id: string; created_at: string; updated_at: string; name: string; contact_name: string | null; email: string | null; phone: string | null; address: string | null; status: string; notes: string | null; lead_id: string | null; };
        Insert: {id?: string; created_at?: string; updated_at?: string; name: string; contact_name?: string | null; email?: string | null; phone?: string | null; address?: string | null; status?: string; notes?: string | null; lead_id?: string | null; };
        Update: {id?: string; created_at?: string; updated_at?: string; name?: string; contact_name?: string | null; email?: string | null; phone?: string | null; address?: string | null; status?: string; notes?: string | null; lead_id?: string | null; };
        Relationships: [{ foreignKeyName: "clients_lead_id_fkey"; columns: ["lead_id"]; isOneToOne: false; referencedRelation: "leads"; referencedColumns: ["id"] },];
      };
      projects: {
        Row: {id: string; created_at: string; updated_at: string; client_id: string; name: string; type: string; status: string; start_date: string | null; due_date: string | null; value_pence: number | null; notes: string | null; };
        Insert: {id?: string; created_at?: string; updated_at?: string; client_id: string; name: string; type?: string; status?: string; start_date?: string | null; due_date?: string | null; value_pence?: number | null; notes?: string | null; };
        Update: {id?: string; created_at?: string; updated_at?: string; client_id?: string; name?: string; type?: string; status?: string; start_date?: string | null; due_date?: string | null; value_pence?: number | null; notes?: string | null; };
        Relationships: [{ foreignKeyName: "projects_client_id_fkey"; columns: ["client_id"]; isOneToOne: false; referencedRelation: "clients"; referencedColumns: ["id"] },];
      };
      project_tasks: {
        Row: {id: string; created_at: string; project_id: string; title: string; done: boolean; due_date: string | null; };
        Insert: {id?: string; created_at?: string; project_id: string; title: string; done?: boolean; due_date?: string | null; };
        Update: {id?: string; created_at?: string; project_id?: string; title?: string; done?: boolean; due_date?: string | null; };
        Relationships: [{ foreignKeyName: "project_tasks_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] },];
      };
      quotes: {
        Row: {id: string; created_at: string; updated_at: string; quote_number: string; client_id: string | null; lead_id: string | null; project_id: string | null; title: string; status: string; issue_date: string; valid_until: string | null; vat_rate: number; notes: string | null; };
        Insert: {id?: string; created_at?: string; updated_at?: string; quote_number?: string; client_id?: string | null; lead_id?: string | null; project_id?: string | null; title: string; status?: string; issue_date?: string; valid_until?: string | null; vat_rate?: number; notes?: string | null; };
        Update: {id?: string; created_at?: string; updated_at?: string; quote_number?: string; client_id?: string | null; lead_id?: string | null; project_id?: string | null; title?: string; status?: string; issue_date?: string; valid_until?: string | null; vat_rate?: number; notes?: string | null; };
        Relationships: [{ foreignKeyName: "quotes_client_id_fkey"; columns: ["client_id"]; isOneToOne: false; referencedRelation: "clients"; referencedColumns: ["id"] }, { foreignKeyName: "quotes_lead_id_fkey"; columns: ["lead_id"]; isOneToOne: false; referencedRelation: "leads"; referencedColumns: ["id"] }, { foreignKeyName: "quotes_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] },];
      };
      quote_items: {
        Row: {id: string; quote_id: string; position: number; description: string; quantity: number; unit_price_pence: number; };
        Insert: {id?: string; quote_id: string; position?: number; description: string; quantity?: number; unit_price_pence?: number; };
        Update: {id?: string; quote_id?: string; position?: number; description?: string; quantity?: number; unit_price_pence?: number; };
        Relationships: [{ foreignKeyName: "quote_items_quote_id_fkey"; columns: ["quote_id"]; isOneToOne: false; referencedRelation: "quotes"; referencedColumns: ["id"] },];
      };
      invoices: {
        Row: {id: string; created_at: string; updated_at: string; invoice_number: string; client_id: string; project_id: string | null; quote_id: string | null; status: string; issue_date: string; due_date: string | null; paid_date: string | null; vat_rate: number; notes: string | null; };
        Insert: {id?: string; created_at?: string; updated_at?: string; invoice_number?: string; client_id: string; project_id?: string | null; quote_id?: string | null; status?: string; issue_date?: string; due_date?: string | null; paid_date?: string | null; vat_rate?: number; notes?: string | null; };
        Update: {id?: string; created_at?: string; updated_at?: string; invoice_number?: string; client_id?: string; project_id?: string | null; quote_id?: string | null; status?: string; issue_date?: string; due_date?: string | null; paid_date?: string | null; vat_rate?: number; notes?: string | null; };
        Relationships: [{ foreignKeyName: "invoices_client_id_fkey"; columns: ["client_id"]; isOneToOne: false; referencedRelation: "clients"; referencedColumns: ["id"] }, { foreignKeyName: "invoices_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] }, { foreignKeyName: "invoices_quote_id_fkey"; columns: ["quote_id"]; isOneToOne: false; referencedRelation: "quotes"; referencedColumns: ["id"] },];
      };
      invoice_items: {
        Row: {id: string; invoice_id: string; position: number; description: string; quantity: number; unit_price_pence: number; };
        Insert: {id?: string; invoice_id: string; position?: number; description: string; quantity?: number; unit_price_pence?: number; };
        Update: {id?: string; invoice_id?: string; position?: number; description?: string; quantity?: number; unit_price_pence?: number; };
        Relationships: [{ foreignKeyName: "invoice_items_invoice_id_fkey"; columns: ["invoice_id"]; isOneToOne: false; referencedRelation: "invoices"; referencedColumns: ["id"] },];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
      is_owner: { Args: never; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicTables = Database["public"]["Tables"];
export type Tables<T extends keyof PublicTables> = PublicTables[T]["Row"];
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]["Insert"];
export type TablesUpdate<T extends keyof PublicTables> = PublicTables[T]["Update"];

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          company_name: string
          cvr: string
          employees: number
          contact_person: string
          email: string
          data_period_start: string
          data_period_end: string
          ip_address: string | null
          user_agent: string | null
          status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          company_name: string
          cvr: string
          employees: number
          contact_person: string
          email: string
          data_period_start: string
          data_period_end: string
          ip_address?: string | null
          user_agent?: string | null
          status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          company_name?: string
          cvr?: string
          employees?: number
          contact_person?: string
          email?: string
          data_period_start?: string
          data_period_end?: string
          ip_address?: string | null
          user_agent?: string | null
          status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'
        }
      }
      file_uploads: {
        Row: {
          id: string
          created_at: string
          file_name: string
          file_size: number
          mime_type: string
          file_path: string
          company_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          file_name: string
          file_size: number
          mime_type: string
          file_path: string
          company_id: string
        }
        Update: {
          id?: string
          created_at?: string
          file_name?: string
          file_size?: number
          mime_type?: string
          file_path?: string
          company_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
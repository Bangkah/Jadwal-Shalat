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
      cities: {
        Row: {
          id: string
          name: string
          country: string
          latitude: number
          longitude: number
          timezone: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          country: string
          latitude: number
          longitude: number
          timezone?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          country?: string
          latitude?: number
          longitude?: number
          timezone?: string
          created_at?: string | null
        }
      }
      prayer_times: {
        Row: {
          id: string
          city_id: string
          date: string
          fajr: string
          sunrise: string
          dhuhr: string
          asr: string
          maghrib: string
          isha: string
          created_at: string | null
        }
        Insert: {
          id?: string
          city_id: string
          date: string
          fajr: string
          sunrise: string
          dhuhr: string
          asr: string
          maghrib: string
          isha: string
          created_at?: string | null
        }
        Update: {
          id?: string
          city_id?: string
          date?: string
          fajr?: string
          sunrise?: string
          dhuhr?: string
          asr?: string
          maghrib?: string
          isha?: string
          created_at?: string | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
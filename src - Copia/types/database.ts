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
      sa_users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sa_users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sa_user_profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'moderator'
          bio: string | null
          website: string | null
          location: string | null
          timezone: string
          language: string
          theme: 'light' | 'dark' | 'system'
          email_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'moderator'
          bio?: string | null
          website?: string | null
          location?: string | null
          timezone?: string
          language?: string
          theme?: 'light' | 'dark' | 'system'
          email_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'moderator'
          bio?: string | null
          website?: string | null
          location?: string | null
          timezone?: string
          language?: string
          theme?: 'light' | 'dark' | 'system'
          email_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sa_user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "sa_users"
            referencedColumns: ["id"]
          }
        ]
      }
      sa_github_profiles: {
        Row: {
          id: string
          user_id: string | null
          github_user_id: number
          github_username: string
          access_token: string
          scope: string
          avatar_url: string | null
          name: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          github_user_id: number
          github_username: string
          access_token: string
          scope: string
          avatar_url?: string | null
          name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          github_user_id?: number
          github_username?: string
          access_token?: string
          scope?: string
          avatar_url?: string | null
          name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sa_github_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sa_users"
            referencedColumns: ["id"]
          }
        ]
      }
      sa_repositories: {
        Row: {
          id: string
          name: string
          full_name: string
          description: string | null
          url: string
          clone_url: string | null
          ssh_url: string | null
          html_url: string | null
          language: string | null
          stars: number
          forks: number
          watchers: number
          size_kb: number
          is_private: boolean
          is_fork: boolean
          has_issues: boolean
          has_projects: boolean
          has_wiki: boolean
          default_branch: string
          owner_login: string | null
          owner_avatar_url: string | null
          topics: string[] | null
          license_name: string | null
          github_created_at: string | null
          github_updated_at: string | null
          github_pushed_at: string | null
          status: string
          notes: string | null
          category: string | null
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          full_name: string
          description?: string | null
          url: string
          clone_url?: string | null
          ssh_url?: string | null
          html_url?: string | null
          language?: string | null
          stars?: number
          forks?: number
          watchers?: number
          size_kb?: number
          is_private?: boolean
          is_fork?: boolean
          has_issues?: boolean
          has_projects?: boolean
          has_wiki?: boolean
          default_branch?: string
          owner_login?: string | null
          owner_avatar_url?: string | null
          topics?: string[] | null
          license_name?: string | null
          github_created_at?: string | null
          github_updated_at?: string | null
          github_pushed_at?: string | null
          status?: string
          notes?: string | null
          category?: string | null
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          full_name?: string
          description?: string | null
          url?: string
          clone_url?: string | null
          ssh_url?: string | null
          html_url?: string | null
          language?: string | null
          stars?: number
          forks?: number
          watchers?: number
          size_kb?: number
          is_private?: boolean
          is_fork?: boolean
          has_issues?: boolean
          has_projects?: boolean
          has_wiki?: boolean
          default_branch?: string
          owner_login?: string | null
          owner_avatar_url?: string | null
          topics?: string[] | null
          license_name?: string | null
          github_created_at?: string | null
          github_updated_at?: string | null
          github_pushed_at?: string | null
          status?: string
          notes?: string | null
          category?: string | null
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      sa_users_complete: {
        Row: {
          id: string | null
          email: string | null
          user_created_at: string | null
          name: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'moderator' | null
          bio: string | null
          website: string | null
          location: string | null
          timezone: string | null
          language: string | null
          theme: 'light' | 'dark' | 'system' | null
          email_notifications: boolean | null
          profile_created_at: string | null
          profile_updated_at: string | null
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
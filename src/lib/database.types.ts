
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "availabilities": {
                  Row: {
                    "end_time": string,"id": string,"provider_id": string,"start_time": string,"weekday": number
                  }
                  Insert: {
                    "end_time": string,"id"?: string,"provider_id": string,"start_time": string,"weekday": number
                  }
                  Update: {
                    "end_time"?: string,"id"?: string,"provider_id"?: string,"start_time"?: string,"weekday"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "availabilities_provider_id_fkey"
      columns: ["provider_id"]
isOneToOne: false
      referencedRelation: "providers"
      referencedColumns: ["id"]
    }
                  ]
                },"credentials": {
                  Row: {
                    "created_at": string,"expires_on": string | null,"id": string,"kind": string,"provider_id": string,"status": Database["public"]['Enums']["credential_status"],"verified_at": string | null
                  }
                  Insert: {
                    "created_at"?: string,"expires_on"?: string | null,"id"?: string,"kind": string,"provider_id": string,"status"?: Database["public"]['Enums']["credential_status"],"verified_at"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"expires_on"?: string | null,"id"?: string,"kind"?: string,"provider_id"?: string,"status"?: Database["public"]['Enums']["credential_status"],"verified_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "credentials_provider_id_fkey"
      columns: ["provider_id"]
isOneToOne: false
      referencedRelation: "providers"
      referencedColumns: ["id"]
    }
                  ]
                },"favorites": {
                  Row: {
                    "provider_id": string,"venue_id": string
                  }
                  Insert: {
                    "provider_id": string,"venue_id": string
                  }
                  Update: {
                    "provider_id"?: string,"venue_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "favorites_provider_id_fkey"
      columns: ["provider_id"]
isOneToOne: false
      referencedRelation: "providers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "favorites_venue_id_fkey"
      columns: ["venue_id"]
isOneToOne: false
      referencedRelation: "venues"
      referencedColumns: ["id"]
    }
                  ]
                },"offers": {
                  Row: {
                    "created_at": string,"distance_km": number,"id": string,"provider_id": string,"reason": string,"responded_at": string | null,"score": number,"slot_id": string,"status": Database["public"]['Enums']["offer_status"]
                  }
                  Insert: {
                    "created_at"?: string,"distance_km"?: number,"id"?: string,"provider_id": string,"reason"?: string,"responded_at"?: string | null,"score"?: number,"slot_id": string,"status"?: Database["public"]['Enums']["offer_status"]
                  }
                  Update: {
                    "created_at"?: string,"distance_km"?: number,"id"?: string,"provider_id"?: string,"reason"?: string,"responded_at"?: string | null,"score"?: number,"slot_id"?: string,"status"?: Database["public"]['Enums']["offer_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "offers_provider_id_fkey"
      columns: ["provider_id"]
isOneToOne: false
      referencedRelation: "providers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "offers_slot_id_fkey"
      columns: ["slot_id"]
isOneToOne: false
      referencedRelation: "slots"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string,"id": string,"role": Database["public"]['Enums']["app_role"]
                  }
                  Insert: {
                    "created_at"?: string,"full_name": string,"id": string,"role": Database["public"]['Enums']["app_role"]
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string,"id"?: string,"role"?: Database["public"]['Enums']["app_role"]
                  }
                  Relationships: [
                    
                  ]
                },"provider_skills": {
                  Row: {
                    "provider_id": string,"skill": string
                  }
                  Insert: {
                    "provider_id": string,"skill": string
                  }
                  Update: {
                    "provider_id"?: string,"skill"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "provider_skills_provider_id_fkey"
      columns: ["provider_id"]
isOneToOne: false
      referencedRelation: "providers"
      referencedColumns: ["id"]
    }
                  ]
                },"providers": {
                  Row: {
                    "bio": string,"commune": string,"created_at": string,"display_name": string,"id": string,"lat": number,"lng": number,"min_hourly_rate_cents": number,"missions_count": number,"radius_km": number,"rating": number,"user_id": string | null,"vertical": string
                  }
                  Insert: {
                    "bio"?: string,"commune": string,"created_at"?: string,"display_name": string,"id"?: string,"lat": number,"lng": number,"min_hourly_rate_cents"?: number,"missions_count"?: number,"radius_km"?: number,"rating"?: number,"user_id"?: string | null,"vertical"?: string
                  }
                  Update: {
                    "bio"?: string,"commune"?: string,"created_at"?: string,"display_name"?: string,"id"?: string,"lat"?: number,"lng"?: number,"min_hourly_rate_cents"?: number,"missions_count"?: number,"radius_km"?: number,"rating"?: number,"user_id"?: string | null,"vertical"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "providers_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"slots": {
                  Row: {
                    "assigned_provider_id": string | null,"ends_at": string,"filled_at": string | null,"id": string,"notes": string,"published_at": string,"rate_cents": number,"search_radius_km": number,"skill": string,"starts_at": string,"status": Database["public"]['Enums']["slot_status"],"venue_id": string
                  }
                  Insert: {
                    "assigned_provider_id"?: string | null,"ends_at": string,"filled_at"?: string | null,"id"?: string,"notes"?: string,"published_at"?: string,"rate_cents": number,"search_radius_km"?: number,"skill": string,"starts_at": string,"status"?: Database["public"]['Enums']["slot_status"],"venue_id": string
                  }
                  Update: {
                    "assigned_provider_id"?: string | null,"ends_at"?: string,"filled_at"?: string | null,"id"?: string,"notes"?: string,"published_at"?: string,"rate_cents"?: number,"search_radius_km"?: number,"skill"?: string,"starts_at"?: string,"status"?: Database["public"]['Enums']["slot_status"],"venue_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "slots_assigned_provider_id_fkey"
      columns: ["assigned_provider_id"]
isOneToOne: false
      referencedRelation: "providers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "slots_venue_id_fkey"
      columns: ["venue_id"]
isOneToOne: false
      referencedRelation: "venues"
      referencedColumns: ["id"]
    }
                  ]
                },"venues": {
                  Row: {
                    "address": string,"commune": string,"created_at": string,"id": string,"lat": number,"lng": number,"name": string,"owner_id": string | null,"phone": string | null,"vertical": string
                  }
                  Insert: {
                    "address": string,"commune": string,"created_at"?: string,"id"?: string,"lat": number,"lng": number,"name": string,"owner_id"?: string | null,"phone"?: string | null,"vertical"?: string
                  }
                  Update: {
                    "address"?: string,"commune"?: string,"created_at"?: string,"id"?: string,"lat"?: number,"lng"?: number,"name"?: string,"owner_id"?: string | null,"phone"?: string | null,"vertical"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "venues_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "accept_offer":
{ Args: { "p_offer": string }; Returns: string
                           },
"current_app_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["app_role"]
                           },
"decline_offer":
{ Args: { "p_offer": string }; Returns: string
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"my_provider_id":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"offered_slot":
{ Args: { "p_slot": string }; Returns: boolean
                           },
"offered_venue":
{ Args: { "p_venue": string }; Returns: boolean
                           },
"owns_provider":
{ Args: { "p_provider": string }; Returns: boolean
                           },
"owns_slot":
{ Args: { "p_slot": string }; Returns: boolean
                           },
"owns_venue":
{ Args: { "p_venue": string }; Returns: boolean
                           },
"provider_busy_ranges":
{ Args: { "p_from": string,"p_providers": (string)[],"p_to": string }; Returns: {
              "ends_at": string,"provider_id": string,"starts_at": string
            }[]
                           }
          }
          Enums: {
            "app_role": "admin"|"salle"|"coach","credential_status": "verified"|"pending","offer_status": "pending"|"accepted"|"declined"|"expired","slot_status": "open"|"filled"|"cancelled"|"done"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "app_role": ["admin", "salle", "coach"],"credential_status": ["verified", "pending"],"offer_status": ["pending", "accepted", "declined", "expired"],"slot_status": ["open", "filled", "cancelled", "done"]
          }
        }
} as const

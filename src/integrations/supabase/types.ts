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
      vehicles: {
        Row: {
          id: string
          internal_id: string | null
          plate: string
          renavam: string | null
          chassis: string | null
          brand: string
          model: string
          version: string | null
          manufacturing_year: number | null
          model_year: number | null
          vehicle_type: string
          color: string | null
          category: string
          status: Database["public"]["Enums"]["vehicle_state"]
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          internal_id?: string | null
          plate: string
          renavam?: string | null
          chassis?: string | null
          brand: string
          model: string
          version?: string | null
          manufacturing_year?: number | null
          model_year?: number | null
          vehicle_type: string
          color?: string | null
          category: string
          status?: Database["public"]["Enums"]["vehicle_state"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          internal_id?: string | null
          plate?: string
          renavam?: string | null
          chassis?: string | null
          brand?: string
          model?: string
          version?: string | null
          manufacturing_year?: number | null
          model_year?: number | null
          vehicle_type?: string
          color?: string | null
          category?: string
          status?: Database["public"]["Enums"]["vehicle_state"]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      fleet_records: {
        Row: {
          andar_estacionado: string
          atividade: string
          created_at: string
          data_final: string
          data_inicial: string
          destino: string
          horario_final: string
          horario_inicial: string
          id: string
          km_final: number
          km_inicial: number
          lavagem: Database["public"]["Enums"]["lavagem_status"]
          raw_message: string | null
          responsavel: string
          source: string | null
          tanque: Database["public"]["Enums"]["tanque_status"]
          status: Database["public"]["Enums"]["trip_status"]
          updated_at: string
          veiculo: string
          foto_painel_inicial_url: string | null
          foto_painel_final_url: string | null
          comprovante_abastecimento_url: string | null
        }
        Insert: {
          andar_estacionado?: string | null
          atividade: string
          created_at?: string
          data_final?: string | null
          data_inicial: string
          destino: string
          horario_final?: string | null
          horario_inicial: string
          id?: string
          km_final?: number | null
          km_inicial: number
          lavagem?: Database["public"]["Enums"]["lavagem_status"]
          raw_message?: string | null
          responsavel: string
          source?: string | null
          tanque?: Database["public"]["Enums"]["tanque_status"]
          status?: Database["public"]["Enums"]["trip_status"]
          updated_at?: string
          veiculo: string
          foto_painel_inicial_url?: string | null
          foto_painel_final_url?: string | null
          comprovante_abastecimento_url?: string | null
        }
        Update: {
          andar_estacionado?: string | null
          atividade?: string
          created_at?: string
          data_final?: string | null
          data_inicial?: string
          destino?: string
          horario_final?: string | null
          horario_inicial?: string
          id?: string
          km_final?: number | null
          km_inicial?: number
          lavagem?: Database["public"]["Enums"]["lavagem_status"]
          raw_message?: string | null
          responsavel?: string
          source?: string | null
          tanque?: Database["public"]["Enums"]["tanque_status"]
          status?: Database["public"]["Enums"]["trip_status"]
          updated_at?: string
          veiculo?: string
          foto_painel_inicial_url?: string | null
          foto_painel_final_url?: string | null
          comprovante_abastecimento_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lavagem_status: "realizada" | "pendente"
      tanque_status: "cheio" | "necessario_abastecer" | "meio_tanque"
      trip_status: "em_andamento" | "finalizado" | "cancelado" | "agendado"
      vehicle_state: "disponivel" | "em_uso" | "bloqueado" | "agendado"
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
      lavagem_status: ["realizada", "pendente"],
      tanque_status: ["cheio", "necessario_abastecer", "meio_tanque"],
    },
  },
} as const

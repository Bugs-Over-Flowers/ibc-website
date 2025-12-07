export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      Application: {
        Row: {
          applicationDate: string;
          applicationId: string;
          applicationType: Database["public"]["Enums"]["ApplicationType"];
          companyAddress: string;
          companyName: string;
          emailAddress: string;
          faxNumber: string;
          landline: string;
          logoImageURL: string;
          memberId: string | null;
          mobileNumber: string;
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"];
          sectorId: number;
          websiteURL: string;
        };
        Insert: {
          applicationDate?: string;
          applicationId?: string;
          applicationType: Database["public"]["Enums"]["ApplicationType"];
          companyAddress: string;
          companyName: string;
          emailAddress: string;
          faxNumber: string;
          landline: string;
          logoImageURL: string;
          memberId?: string | null;
          mobileNumber: string;
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"];
          sectorId: number;
          websiteURL: string;
        };
        Update: {
          applicationDate?: string;
          applicationId?: string;
          applicationType?: Database["public"]["Enums"]["ApplicationType"];
          companyAddress?: string;
          companyName?: string;
          emailAddress?: string;
          faxNumber?: string;
          landline?: string;
          logoImageURL?: string;
          memberId?: string | null;
          mobileNumber?: string;
          paymentMethod?: Database["public"]["Enums"]["PaymentMethod"];
          sectorId?: number;
          websiteURL?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Application_sectorId_fkey";
            columns: ["sectorId"];
            isOneToOne: false;
            referencedRelation: "Sector";
            referencedColumns: ["sectorId"];
          },
        ];
      };
      ApplicationMember: {
        Row: {
          applicationId: string;
          applicationMemberId: string;
          applicationMemberType: Database["public"]["Enums"]["ApplicationMemberType"];
          birthdate: string;
          companyDesignation: string;
          emailAddress: string;
          faxNumber: string;
          fullName: string;
          landline: string;
          mailingAddress: string;
          mobileNumber: string;
          nationality: string;
          sex: string;
        };
        Insert: {
          applicationId: string;
          applicationMemberId?: string;
          applicationMemberType: Database["public"]["Enums"]["ApplicationMemberType"];
          birthdate: string;
          companyDesignation: string;
          emailAddress: string;
          faxNumber: string;
          fullName: string;
          landline: string;
          mailingAddress: string;
          mobileNumber: string;
          nationality: string;
          sex: string;
        };
        Update: {
          applicationId?: string;
          applicationMemberId?: string;
          applicationMemberType?: Database["public"]["Enums"]["ApplicationMemberType"];
          birthdate?: string;
          companyDesignation?: string;
          emailAddress?: string;
          faxNumber?: string;
          fullName?: string;
          landline?: string;
          mailingAddress?: string;
          mobileNumber?: string;
          nationality?: string;
          sex?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ApplicationMember_applicationId_fkey";
            columns: ["applicationId"];
            isOneToOne: false;
            referencedRelation: "Application";
            referencedColumns: ["applicationId"];
          },
        ];
      };
      BusinessMember: {
        Row: {
          businessMemberId: string;
          businessName: string;
          joinDate: string;
          logoImageURL: string | null;
          sectorId: number;
          websiteURL: string;
        };
        Insert: {
          businessMemberId?: string;
          businessName: string;
          joinDate: string;
          logoImageURL?: string | null;
          sectorId: number;
          websiteURL: string;
        };
        Update: {
          businessMemberId?: string;
          businessName?: string;
          joinDate?: string;
          logoImageURL?: string | null;
          sectorId?: number;
          websiteURL?: string;
        };
        Relationships: [
          {
            foreignKeyName: "BusinessMember_sectorId_fkey";
            columns: ["sectorId"];
            isOneToOne: false;
            referencedRelation: "Sector";
            referencedColumns: ["sectorId"];
          },
        ];
      };
      CheckIn: {
        Row: {
          date: string;
          participantId: string;
        };
        Insert: {
          date?: string;
          participantId?: string;
        };
        Update: {
          date?: string;
          participantId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "CheckIn_participantId_fkey";
            columns: ["participantId"];
            isOneToOne: false;
            referencedRelation: "Participant";
            referencedColumns: ["participantId"];
          },
        ];
      };
      Event: {
        Row: {
          description: string | null;
          eventEndDate: string | null;
          eventHeaderUrl: string | null;
          eventId: string;
          eventStartDate: string | null;
          eventTitle: string;
          eventType: Database["public"]["Enums"]["EventType"] | null;
          publishedAt: string | null;
          registrationFee: number;
          updatedAt: string | null;
          venue: string | null;
        };
        Insert: {
          description?: string | null;
          eventEndDate?: string | null;
          eventHeaderUrl?: string | null;
          eventId?: string;
          eventStartDate?: string | null;
          eventTitle: string;
          eventType?: Database["public"]["Enums"]["EventType"] | null;
          publishedAt?: string | null;
          registrationFee?: number;
          updatedAt?: string | null;
          venue?: string | null;
        };
        Update: {
          description?: string | null;
          eventEndDate?: string | null;
          eventHeaderUrl?: string | null;
          eventId?: string;
          eventStartDate?: string | null;
          eventTitle?: string;
          eventType?: Database["public"]["Enums"]["EventType"] | null;
          publishedAt?: string | null;
          registrationFee?: number;
          updatedAt?: string | null;
          venue?: string | null;
        };
        Relationships: [];
      };
      Participant: {
        Row: {
          contactNumber: string;
          email: string;
          firstName: string;
          isPrincipal: boolean;
          lastName: string;
          participantId: string;
          registrationId: string;
        };
        Insert: {
          contactNumber: string;
          email: string;
          firstName: string;
          isPrincipal?: boolean;
          lastName: string;
          participantId?: string;
          registrationId: string;
        };
        Update: {
          contactNumber?: string;
          email?: string;
          firstName?: string;
          isPrincipal?: boolean;
          lastName?: string;
          participantId?: string;
          registrationId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Participant_registrationId_fkey";
            columns: ["registrationId"];
            isOneToOne: false;
            referencedRelation: "Registration";
            referencedColumns: ["registrationId"];
          },
        ];
      };
      ProofImage: {
        Row: {
          applicationId: string | null;
          path: string;
          proofImageId: string;
          registrationId: string | null;
        };
        Insert: {
          applicationId?: string | null;
          path: string;
          proofImageId?: string;
          registrationId?: string | null;
        };
        Update: {
          applicationId?: string | null;
          path?: string;
          proofImageId?: string;
          registrationId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ProofImage_applicationId_fkey";
            columns: ["applicationId"];
            isOneToOne: false;
            referencedRelation: "Application";
            referencedColumns: ["applicationId"];
          },
          {
            foreignKeyName: "ProofImage_registrationId_fkey";
            columns: ["registrationId"];
            isOneToOne: false;
            referencedRelation: "Registration";
            referencedColumns: ["registrationId"];
          },
        ];
      };
      Registration: {
        Row: {
          businessMemberId: string | null;
          eventId: string;
          nonMemberName: string | null;
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"];
          paymentStatus: Database["public"]["Enums"]["PaymentStatus"];
          registrationDate: string;
          registrationId: string;
        };
        Insert: {
          businessMemberId?: string | null;
          eventId: string;
          nonMemberName?: string | null;
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"];
          paymentStatus: Database["public"]["Enums"]["PaymentStatus"];
          registrationDate?: string;
          registrationId?: string;
        };
        Update: {
          businessMemberId?: string | null;
          eventId?: string;
          nonMemberName?: string | null;
          paymentMethod?: Database["public"]["Enums"]["PaymentMethod"];
          paymentStatus?: Database["public"]["Enums"]["PaymentStatus"];
          registrationDate?: string;
          registrationId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Registration_businessMemberId_fkey";
            columns: ["businessMemberId"];
            isOneToOne: false;
            referencedRelation: "BusinessMember";
            referencedColumns: ["businessMemberId"];
          },
          {
            foreignKeyName: "Registration_eventId_fkey";
            columns: ["eventId"];
            isOneToOne: false;
            referencedRelation: "Event";
            referencedColumns: ["eventId"];
          },
        ];
      };
      Sector: {
        Row: {
          sectorId: number;
          sectorName: string;
        };
        Insert: {
          sectorId?: number;
          sectorName: string;
        };
        Update: {
          sectorId?: number;
          sectorName?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      submit_event_registration: {
        Args: {
          p_business_member_id?: string;
          p_event_id: string;
          p_member_type: string;
          p_non_member_name?: string;
          p_other_registrants?: Json;
          p_payment_method?: string;
          p_payment_path?: string;
          p_principal_registrant?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      ApplicationMemberType: "corporate" | "personal";
      ApplicationType: "newMember" | "updating" | "renewal";
      EventType: "public" | "private";
      PaymentMethod: "BPI" | "ONSITE";
      PaymentStatus: "pending" | "verified";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      ApplicationMemberType: ["corporate", "personal"],
      ApplicationType: ["newMember", "updating", "renewal"],
      EventType: ["public", "private"],
      PaymentMethod: ["BPI", "ONSITE"],
      PaymentStatus: ["pending", "verified"],
    },
  },
} as const;

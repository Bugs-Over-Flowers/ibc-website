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
          applicationMemberType: Database["public"]["Enums"]["ApplicationMemberType"];
          applicationStatus: Database["public"]["Enums"]["ApplicationStatus"];
          applicationType: Database["public"]["Enums"]["ApplicationType"];
          businessMemberId: string | null;
          companyAddress: string;
          companyName: string;
          emailAddress: string;
          faxNumber: string;
          identifier: string;
          interviewId: string | null;
          landline: string;
          logoImageURL: string;
          mobileNumber: string;
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"];
          paymentStatus: Database["public"]["Enums"]["PaymentStatus"];
          sectorId: number | null;
          websiteURL: string;
        };
        Insert: {
          applicationDate?: string;
          applicationId?: string;
          applicationMemberType: Database["public"]["Enums"]["ApplicationMemberType"];
          applicationStatus?: Database["public"]["Enums"]["ApplicationStatus"];
          applicationType: Database["public"]["Enums"]["ApplicationType"];
          businessMemberId?: string | null;
          companyAddress: string;
          companyName: string;
          emailAddress: string;
          faxNumber: string;
          identifier: string;
          interviewId?: string | null;
          landline: string;
          logoImageURL: string;
          mobileNumber: string;
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"];
          paymentStatus: Database["public"]["Enums"]["PaymentStatus"];
          sectorId?: number | null;
          websiteURL: string;
        };
        Update: {
          applicationDate?: string;
          applicationId?: string;
          applicationMemberType?: Database["public"]["Enums"]["ApplicationMemberType"];
          applicationStatus?: Database["public"]["Enums"]["ApplicationStatus"];
          applicationType?: Database["public"]["Enums"]["ApplicationType"];
          businessMemberId?: string | null;
          companyAddress?: string;
          companyName?: string;
          emailAddress?: string;
          faxNumber?: string;
          identifier?: string;
          interviewId?: string | null;
          landline?: string;
          logoImageURL?: string;
          mobileNumber?: string;
          paymentMethod?: Database["public"]["Enums"]["PaymentMethod"];
          paymentStatus?: Database["public"]["Enums"]["PaymentStatus"];
          sectorId?: number | null;
          websiteURL?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Application_businessMemberId_fkey";
            columns: ["businessMemberId"];
            isOneToOne: false;
            referencedRelation: "BusinessMember";
            referencedColumns: ["businessMemberId"];
          },
          {
            foreignKeyName: "Application_interviewId_fkey";
            columns: ["interviewId"];
            isOneToOne: false;
            referencedRelation: "Interview";
            referencedColumns: ["interviewId"];
          },
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
          birthdate: string;
          companyDesignation: string;
          companyMemberType: Database["public"]["Enums"]["CompanyMemberType"];
          emailAddress: string;
          faxNumber: string;
          firstName: string;
          landline: string;
          lastName: string;
          mailingAddress: string;
          mobileNumber: string;
          nationality: string;
          sex: string;
        };
        Insert: {
          applicationId: string;
          applicationMemberId?: string;
          birthdate: string;
          companyDesignation: string;
          companyMemberType: Database["public"]["Enums"]["CompanyMemberType"];
          emailAddress: string;
          faxNumber: string;
          firstName: string;
          landline: string;
          lastName: string;
          mailingAddress: string;
          mobileNumber: string;
          nationality: string;
          sex: string;
        };
        Update: {
          applicationId?: string;
          applicationMemberId?: string;
          birthdate?: string;
          companyDesignation?: string;
          companyMemberType?: Database["public"]["Enums"]["CompanyMemberType"];
          emailAddress?: string;
          faxNumber?: string;
          firstName?: string;
          landline?: string;
          lastName?: string;
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
          identifier: string;
          joinDate: string;
          lastPaymentDate: string | null;
          logoImageURL: string | null;
          membershipExpiryDate: string | null;
          membershipStatus:
            | Database["public"]["Enums"]["MembershipStatus"]
            | null;
          primaryApplicationId: string | null;
          sectorId: number;
          websiteURL: string;
        };
        Insert: {
          businessMemberId?: string;
          businessName: string;
          identifier: string;
          joinDate: string;
          lastPaymentDate?: string | null;
          logoImageURL?: string | null;
          membershipExpiryDate?: string | null;
          membershipStatus?:
            | Database["public"]["Enums"]["MembershipStatus"]
            | null;
          primaryApplicationId?: string | null;
          sectorId: number;
          websiteURL: string;
        };
        Update: {
          businessMemberId?: string;
          businessName?: string;
          identifier?: string;
          joinDate?: string;
          lastPaymentDate?: string | null;
          logoImageURL?: string | null;
          membershipExpiryDate?: string | null;
          membershipStatus?:
            | Database["public"]["Enums"]["MembershipStatus"]
            | null;
          primaryApplicationId?: string | null;
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
          checkInId: string;
          checkInTime: string;
          eventDayId: string;
          participantId: string;
          remarks: string | null;
        };
        Insert: {
          checkInId?: string;
          checkInTime?: string;
          eventDayId?: string;
          participantId?: string;
          remarks?: string | null;
        };
        Update: {
          checkInId?: string;
          checkInTime?: string;
          eventDayId?: string;
          participantId?: string;
          remarks?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "CheckIn_eventDayId_fkey";
            columns: ["eventDayId"];
            isOneToOne: false;
            referencedRelation: "EventDay";
            referencedColumns: ["eventDayId"];
          },
          {
            foreignKeyName: "CheckIn_participantId_fkey";
            columns: ["participantId"];
            isOneToOne: false;
            referencedRelation: "Participant";
            referencedColumns: ["participantId"];
          },
        ];
      };
      EvaluationForm: {
        Row: {
          additionalComments: string | null;
          createdAt: string;
          evaluationId: string;
          eventId: string;
          feedback: string | null;
          name: string | null;
          q1Rating: Database["public"]["Enums"]["ratingScale"];
          q2Rating: Database["public"]["Enums"]["ratingScale"];
          q3Rating: Database["public"]["Enums"]["ratingScale"];
          q4Rating: Database["public"]["Enums"]["ratingScale"];
          q5Rating: Database["public"]["Enums"]["ratingScale"];
          q6Rating: Database["public"]["Enums"]["ratingScale"];
        };
        Insert: {
          additionalComments?: string | null;
          createdAt?: string;
          evaluationId?: string;
          eventId: string;
          feedback?: string | null;
          name?: string | null;
          q1Rating: Database["public"]["Enums"]["ratingScale"];
          q2Rating: Database["public"]["Enums"]["ratingScale"];
          q3Rating: Database["public"]["Enums"]["ratingScale"];
          q4Rating: Database["public"]["Enums"]["ratingScale"];
          q5Rating: Database["public"]["Enums"]["ratingScale"];
          q6Rating: Database["public"]["Enums"]["ratingScale"];
        };
        Update: {
          additionalComments?: string | null;
          createdAt?: string;
          evaluationId?: string;
          eventId?: string;
          feedback?: string | null;
          name?: string | null;
          q1Rating?: Database["public"]["Enums"]["ratingScale"];
          q2Rating?: Database["public"]["Enums"]["ratingScale"];
          q3Rating?: Database["public"]["Enums"]["ratingScale"];
          q4Rating?: Database["public"]["Enums"]["ratingScale"];
          q5Rating?: Database["public"]["Enums"]["ratingScale"];
          q6Rating?: Database["public"]["Enums"]["ratingScale"];
        };
        Relationships: [
          {
            foreignKeyName: "evaluationform_eventid_fkey";
            columns: ["eventId"];
            isOneToOne: false;
            referencedRelation: "Event";
            referencedColumns: ["eventId"];
          },
        ];
      };
      Event: {
        Row: {
          availableSlots: number | null;
          description: string | null;
          eventEndDate: string | null;
          eventHeaderUrl: string | null;
          eventId: string;
          eventStartDate: string | null;
          eventTitle: string;
          eventType: Database["public"]["Enums"]["EventType"] | null;
          maxGuest: number | null;
          publishedAt: string | null;
          registrationFee: number;
          updatedAt: string | null;
          venue: string | null;
        };
        Insert: {
          availableSlots?: number | null;
          description?: string | null;
          eventEndDate?: string | null;
          eventHeaderUrl?: string | null;
          eventId?: string;
          eventStartDate?: string | null;
          eventTitle: string;
          eventType?: Database["public"]["Enums"]["EventType"] | null;
          maxGuest?: number | null;
          publishedAt?: string | null;
          registrationFee?: number;
          updatedAt?: string | null;
          venue?: string | null;
        };
        Update: {
          availableSlots?: number | null;
          description?: string | null;
          eventEndDate?: string | null;
          eventHeaderUrl?: string | null;
          eventId?: string;
          eventStartDate?: string | null;
          eventTitle?: string;
          eventType?: Database["public"]["Enums"]["EventType"] | null;
          maxGuest?: number | null;
          publishedAt?: string | null;
          registrationFee?: number;
          updatedAt?: string | null;
          venue?: string | null;
        };
        Relationships: [];
      };
      EventDay: {
        Row: {
          eventDate: string;
          eventDayId: string;
          eventId: string;
          label: string;
        };
        Insert: {
          eventDate: string;
          eventDayId?: string;
          eventId: string;
          label: string;
        };
        Update: {
          eventDate?: string;
          eventDayId?: string;
          eventId?: string;
          label?: string;
        };
        Relationships: [
          {
            foreignKeyName: "EventDay_eventId_fkey";
            columns: ["eventId"];
            isOneToOne: false;
            referencedRelation: "Event";
            referencedColumns: ["eventId"];
          },
        ];
      };
      Interview: {
        Row: {
          applicationId: string | null;
          createdAt: string | null;
          interviewDate: string;
          interviewId: string;
          interviewVenue: string;
          notes: string | null;
          status: Database["public"]["Enums"]["InterviewStatus"] | null;
          updatedAt: string | null;
        };
        Insert: {
          applicationId?: string | null;
          createdAt?: string | null;
          interviewDate: string;
          interviewId?: string;
          interviewVenue: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["InterviewStatus"] | null;
          updatedAt?: string | null;
        };
        Update: {
          applicationId?: string | null;
          createdAt?: string | null;
          interviewDate?: string;
          interviewId?: string;
          interviewVenue?: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["InterviewStatus"] | null;
          updatedAt?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "Interview_applicationId_fkey";
            columns: ["applicationId"];
            isOneToOne: false;
            referencedRelation: "Application";
            referencedColumns: ["applicationId"];
          },
        ];
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
          identifier: string;
          nonMemberName: string | null;
          numberOfParticipants: number | null;
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"];
          paymentStatus: Database["public"]["Enums"]["PaymentStatus"];
          registrationDate: string;
          registrationId: string;
        };
        Insert: {
          businessMemberId?: string | null;
          eventId: string;
          identifier: string;
          nonMemberName?: string | null;
          numberOfParticipants?: number | null;
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"];
          paymentStatus: Database["public"]["Enums"]["PaymentStatus"];
          registrationDate?: string;
          registrationId?: string;
        };
        Update: {
          businessMemberId?: string | null;
          eventId?: string;
          identifier?: string;
          nonMemberName?: string | null;
          numberOfParticipants?: number | null;
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
      check_member_exists:
        | { Args: { p_identifier: string }; Returns: Json }
        | {
            Args: { p_application_type?: string; p_identifier: string };
            Returns: Json;
          };
      check_membership_expiry: { Args: never; Returns: undefined };
      compute_primary_application_id: {
        Args: { p_member_id: string };
        Returns: string;
      };
      delete_evaluation: {
        Args: { eval_id: string };
        Returns: {
          message: string;
          success: boolean;
        }[];
      };
      get_all_evaluations: {
        Args: never;
        Returns: {
          additional_comments: string;
          created_at: string;
          evaluation_id: string;
          event_end_date: string;
          event_id: string;
          event_start_date: string;
          event_title: string;
          feedback: string;
          name: string;
          q1_rating: Database["public"]["Enums"]["ratingScale"];
          q2_rating: Database["public"]["Enums"]["ratingScale"];
          q3_rating: Database["public"]["Enums"]["ratingScale"];
          q4_rating: Database["public"]["Enums"]["ratingScale"];
          q5_rating: Database["public"]["Enums"]["ratingScale"];
          q6_rating: Database["public"]["Enums"]["ratingScale"];
          venue: string;
        }[];
      };
      get_evaluation_by_id: {
        Args: { eval_id: string };
        Returns: {
          additional_comments: string;
          created_at: string;
          evaluation_id: string;
          event_end_date: string;
          event_id: string;
          event_start_date: string;
          event_title: string;
          feedback: string;
          name: string;
          q1_rating: Database["public"]["Enums"]["ratingScale"];
          q2_rating: Database["public"]["Enums"]["ratingScale"];
          q3_rating: Database["public"]["Enums"]["ratingScale"];
          q4_rating: Database["public"]["Enums"]["ratingScale"];
          q5_rating: Database["public"]["Enums"]["ratingScale"];
          q6_rating: Database["public"]["Enums"]["ratingScale"];
          venue: string;
        }[];
      };
      get_event_participant_list: {
        Args: { p_event_id: string; p_search_text?: string };
        Returns: Database["public"]["CompositeTypes"]["participant_list_item"][];
        SetofOptions: {
          from: "*";
          to: "participant_list_item";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      get_event_status: { Args: { p_event_id: string }; Returns: Json };
      get_member_primary_application: {
        Args: { p_member_id: string };
        Returns: string;
      };
      get_registration_list: {
        Args: {
          p_event_id: string;
          p_payment_status?: Database["public"]["Enums"]["PaymentStatus"];
          p_search_text?: string;
        };
        Returns: Database["public"]["CompositeTypes"]["registration_list_item"][];
        SetofOptions: {
          from: "*";
          to: "registration_list_item";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      get_registration_list_checkin: {
        Args: { p_identifier: string; p_today?: string };
        Returns: Database["public"]["CompositeTypes"]["registration_details_result"];
        SetofOptions: {
          from: "*";
          to: "registration_details_result";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      get_registration_list_stats: {
        Args: { p_event_id: string };
        Returns: Database["public"]["CompositeTypes"]["registration_stats"];
        SetofOptions: {
          from: "*";
          to: "registration_stats";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      january_first_reset: { Args: never; Returns: undefined };
      publish_event: { Args: { p_event_id: string }; Returns: undefined };
      submit_evaluation_form: {
        Args: {
          p_additional_comments?: string;
          p_event_id: string;
          p_feedback?: string;
          p_name: string;
          p_q1_rating: Database["public"]["Enums"]["ratingScale"];
          p_q2_rating: Database["public"]["Enums"]["ratingScale"];
          p_q3_rating: Database["public"]["Enums"]["ratingScale"];
          p_q4_rating: Database["public"]["Enums"]["ratingScale"];
          p_q5_rating: Database["public"]["Enums"]["ratingScale"];
          p_q6_rating: Database["public"]["Enums"]["ratingScale"];
        };
        Returns: Json;
      };
      submit_event_registration: {
        Args: {
          p_business_member_id?: string;
          p_event_id: string;
          p_identifier: string;
          p_member_type: string;
          p_non_member_name?: string;
          p_other_participants?: Json;
          p_payment_method?: string;
          p_payment_path?: string;
          p_registrant?: Json;
        };
        Returns: Json;
      };
      submit_membership_application: {
        Args: {
          p_application_member_type: string;
          p_application_type: string;
          p_company_details: Json;
          p_payment_method: string;
          p_payment_proof_url?: string;
          p_representatives: Json;
        };
        Returns: Json;
      };
      update_event_details: {
        Args: {
          p_description?: string;
          p_end_date?: string;
          p_event_header_url?: string;
          p_event_id: string;
          p_event_type?: string;
          p_registration_fee?: number;
          p_start_date?: string;
          p_title?: string;
          p_venue?: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      ApplicationMemberType: "corporate" | "personal";
      ApplicationStatus: "new" | "pending" | "approved" | "rejected";
      ApplicationType: "newMember" | "updating" | "renewal";
      CompanyMemberType: "principal" | "alternate";
      EventType: "public" | "private";
      InterviewStatus: "scheduled" | "completed" | "cancelled" | "rescheduled";
      MembershipStatus: "paid" | "unpaid" | "cancelled";
      PaymentMethod: "BPI" | "ONSITE";
      PaymentStatus: "pending" | "verified";
      ratingScale: "poor" | "fair" | "good" | "veryGood" | "excellent";
    };
    CompositeTypes: {
      participant_list_item: {
        participant_id: string | null;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        contact_number: string | null;
        affiliation: string | null;
        registration_date: string | null;
        registration_id: string | null;
      };
      registration_details_result: {
        registration_details: Json | null;
        event_details: Json | null;
        check_in_list: Json | null;
        event_days: Json | null;
        all_is_checked_in: boolean | null;
        is_event_day: boolean | null;
      };
      registration_list_item: {
        registration_id: string | null;
        affiliation: string | null;
        registration_date: string | null;
        payment_status: Database["public"]["Enums"]["PaymentStatus"] | null;
        payment_method: Database["public"]["Enums"]["PaymentMethod"] | null;
        business_member_id: string | null;
        business_name: string | null;
        is_member: boolean | null;
        registrant: Json | null;
        people: number | null;
        registration_identifier: string | null;
      };
      registration_stats: {
        totalRegistrations: number | null;
        verifiedRegistrations: number | null;
        pendingRegistrations: number | null;
        totalParticipants: number | null;
      };
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
      ApplicationStatus: ["new", "pending", "approved", "rejected"],
      ApplicationType: ["newMember", "updating", "renewal"],
      CompanyMemberType: ["principal", "alternate"],
      EventType: ["public", "private"],
      InterviewStatus: ["scheduled", "completed", "cancelled", "rescheduled"],
      MembershipStatus: ["paid", "unpaid", "cancelled"],
      PaymentMethod: ["BPI", "ONSITE"],
      PaymentStatus: ["pending", "verified"],
      ratingScale: ["poor", "fair", "good", "veryGood", "excellent"],
    },
  },
} as const;

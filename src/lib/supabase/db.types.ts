export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
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
          companyProfileType: Database["public"]["Enums"]["CompanyProfileType"];
          emailAddress: string;
          identifier: string;
          interviewId: string | null;
          landline: string;
          logoImageURL: string;
          mobileNumber: string;
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"];
          paymentProofStatus: Database["public"]["Enums"]["PaymentProofStatus"];
          sectorName: string | null;
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
          companyProfileType?: Database["public"]["Enums"]["CompanyProfileType"];
          emailAddress: string;
          identifier: string;
          interviewId?: string | null;
          landline: string;
          logoImageURL: string;
          mobileNumber: string;
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"];
          paymentProofStatus?: Database["public"]["Enums"]["PaymentProofStatus"];
          sectorName?: string | null;
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
          companyProfileType?: Database["public"]["Enums"]["CompanyProfileType"];
          emailAddress?: string;
          identifier?: string;
          interviewId?: string | null;
          landline?: string;
          logoImageURL?: string;
          mobileNumber?: string;
          paymentMethod?: Database["public"]["Enums"]["PaymentMethod"];
          paymentProofStatus?: Database["public"]["Enums"]["PaymentProofStatus"];
          sectorName?: string | null;
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
          featuredExpirationDate: string | null;
          identifier: string;
          joinDate: string;
          lastPaymentDate: string | null;
          logoImageURL: string | null;
          membershipExpiryDate: string | null;
          membershipStatus:
            | Database["public"]["Enums"]["MembershipStatus"]
            | null;
          primaryApplicationId: string;
          sectorId: number;
          websiteURL: string;
        };
        Insert: {
          businessMemberId?: string;
          businessName: string;
          featuredExpirationDate?: string | null;
          identifier: string;
          joinDate: string;
          lastPaymentDate?: string | null;
          logoImageURL?: string | null;
          membershipExpiryDate?: string | null;
          membershipStatus?:
            | Database["public"]["Enums"]["MembershipStatus"]
            | null;
          primaryApplicationId: string;
          sectorId: number;
          websiteURL: string;
        };
        Update: {
          businessMemberId?: string;
          businessName?: string;
          featuredExpirationDate?: string | null;
          identifier?: string;
          joinDate?: string;
          lastPaymentDate?: string | null;
          logoImageURL?: string | null;
          membershipExpiryDate?: string | null;
          membershipStatus?:
            | Database["public"]["Enums"]["MembershipStatus"]
            | null;
          primaryApplicationId?: string;
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
          description: string | null;
          eventEndDate: string | null;
          eventHeaderUrl: string | null;
          eventId: string;
          eventPoster: string | null;
          eventStartDate: string | null;
          eventTitle: string;
          eventType: Database["public"]["Enums"]["EventType"] | null;
          facebookLink: string | null;
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
          eventPoster?: string | null;
          eventStartDate?: string | null;
          eventTitle: string;
          eventType?: Database["public"]["Enums"]["EventType"] | null;
          facebookLink?: string | null;
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
          eventPoster?: string | null;
          eventStartDate?: string | null;
          eventTitle?: string;
          eventType?: Database["public"]["Enums"]["EventType"] | null;
          facebookLink?: string | null;
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
      Networks: {
        Row: {
          about: string;
          created_at: string;
          id: string;
          location_type: string;
          logo_url: string | null;
          organization: string;
          representative_name: string;
          representative_position: string;
          updated_at: string;
        };
        Insert: {
          about: string;
          created_at?: string;
          id?: string;
          location_type: string;
          logo_url?: string | null;
          organization: string;
          representative_name: string;
          representative_position: string;
          updated_at?: string;
        };
        Update: {
          about?: string;
          created_at?: string;
          id?: string;
          location_type?: string;
          logo_url?: string | null;
          organization?: string;
          representative_name?: string;
          representative_position?: string;
          updated_at?: string;
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
          participantIdentifier: string;
          registrationId: string;
        };
        Insert: {
          contactNumber: string;
          email: string;
          firstName: string;
          isPrincipal?: boolean;
          lastName: string;
          participantId?: string;
          participantIdentifier: string;
          registrationId: string;
        };
        Update: {
          contactNumber?: string;
          email?: string;
          firstName?: string;
          isPrincipal?: boolean;
          lastName?: string;
          participantId?: string;
          participantIdentifier?: string;
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
          orderIndex: number | null;
          path: string;
          proofImageId: string;
          registrationId: string | null;
        };
        Insert: {
          applicationId?: string | null;
          orderIndex?: number | null;
          path: string;
          proofImageId?: string;
          registrationId?: string | null;
        };
        Update: {
          applicationId?: string | null;
          orderIndex?: number | null;
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
          note: string | null;
          numberOfParticipants: number | null;
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"];
          paymentProofStatus: Database["public"]["Enums"]["PaymentProofStatus"];
          registrationDate: string;
          registrationId: string;
          sourceSubmissionId: string | null;
          sponsoredRegistrationId: string | null;
        };
        Insert: {
          businessMemberId?: string | null;
          eventId: string;
          identifier: string;
          nonMemberName?: string | null;
          note?: string | null;
          numberOfParticipants?: number | null;
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"];
          paymentProofStatus?: Database["public"]["Enums"]["PaymentProofStatus"];
          registrationDate?: string;
          registrationId?: string;
          sourceSubmissionId?: string | null;
          sponsoredRegistrationId?: string | null;
        };
        Update: {
          businessMemberId?: string | null;
          eventId?: string;
          identifier?: string;
          nonMemberName?: string | null;
          note?: string | null;
          numberOfParticipants?: number | null;
          paymentMethod?: Database["public"]["Enums"]["PaymentMethod"];
          paymentProofStatus?: Database["public"]["Enums"]["PaymentProofStatus"];
          registrationDate?: string;
          registrationId?: string;
          sourceSubmissionId?: string | null;
          sponsoredRegistrationId?: string | null;
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
          {
            foreignKeyName: "Registration_sponsoredRegistrationId_fkey";
            columns: ["sponsoredRegistrationId"];
            isOneToOne: false;
            referencedRelation: "SponsoredRegistration";
            referencedColumns: ["sponsoredRegistrationId"];
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
      SponsoredRegistration: {
        Row: {
          createdAt: string;
          eventId: string;
          feeDeduction: number;
          maxSponsoredGuests: number | null;
          sponsoredBy: string;
          sponsoredRegistrationId: string;
          status: Database["public"]["Enums"]["SponsoredRegistrationStatus"];
          updatedAt: string;
          usedCount: number;
          uuid: string;
        };
        Insert: {
          createdAt?: string;
          eventId: string;
          feeDeduction?: number;
          maxSponsoredGuests?: number | null;
          sponsoredBy: string;
          sponsoredRegistrationId?: string;
          status?: Database["public"]["Enums"]["SponsoredRegistrationStatus"];
          updatedAt?: string;
          usedCount?: number;
          uuid?: string;
        };
        Update: {
          createdAt?: string;
          eventId?: string;
          feeDeduction?: number;
          maxSponsoredGuests?: number | null;
          sponsoredBy?: string;
          sponsoredRegistrationId?: string;
          status?: Database["public"]["Enums"]["SponsoredRegistrationStatus"];
          updatedAt?: string;
          usedCount?: number;
          uuid?: string;
        };
        Relationships: [
          {
            foreignKeyName: "SponsoredRegistration_event_fkey";
            columns: ["eventId"];
            isOneToOne: false;
            referencedRelation: "Event";
            referencedColumns: ["eventId"];
          },
        ];
      };
      WebsiteContent: {
        Row: {
          cardPlacement: number | null;
          createdAt: string;
          entryKey: string;
          group: string | null;
          icon: string | null;
          id: string;
          imageUrl: string | null;
          isActive: boolean;
          section: Database["public"]["Enums"]["WebsiteContentSection"];
          textType: Database["public"]["Enums"]["WebsiteContentTextType"];
          textValue: string | null;
          updatedAt: string;
        };
        Insert: {
          cardPlacement?: number | null;
          createdAt?: string;
          entryKey: string;
          group?: string | null;
          icon?: string | null;
          id?: string;
          imageUrl?: string | null;
          isActive?: boolean;
          section: Database["public"]["Enums"]["WebsiteContentSection"];
          textType: Database["public"]["Enums"]["WebsiteContentTextType"];
          textValue?: string | null;
          updatedAt?: string;
        };
        Update: {
          cardPlacement?: number | null;
          createdAt?: string;
          entryKey?: string;
          group?: string | null;
          icon?: string | null;
          id?: string;
          imageUrl?: string | null;
          isActive?: boolean;
          section?: Database["public"]["Enums"]["WebsiteContentSection"];
          textType?: Database["public"]["Enums"]["WebsiteContentTextType"];
          textValue?: string | null;
          updatedAt?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      approve_membership_application: {
        Args: { p_application_id: string };
        Returns: {
          business_member_id: string;
          message: string;
        }[];
      };
      approve_membership_renewal_application: {
        Args: { p_application_id: string };
        Returns: {
          business_member_id: string;
          message: string;
        }[];
      };
      approve_membership_update_application: {
        Args: { p_application_id: string };
        Returns: {
          business_member_id: string;
          message: string;
        }[];
      };
      check_application_status: {
        Args: { p_application_identifier: string };
        Returns: Json;
      };
      check_member_exists: {
        Args: { p_application_type?: string; p_identifier: string };
        Returns: Json;
      };
      check_member_exists_and_get: {
        Args: { p_application_type?: string; p_identifier: string };
        Returns: Json;
      };
      check_membership_expiry: { Args: never; Returns: undefined };
      compute_primary_application_id: {
        Args: { p_member_id: string };
        Returns: string;
      };
      create_sponsored_registration: {
        Args: {
          p_event_id: string;
          p_fee_deduction: number;
          p_max_sponsored_guests?: number;
          p_sponsored_by: string;
        };
        Returns: Json;
      };
      delete_evaluation: {
        Args: { eval_id: string };
        Returns: {
          message: string;
          success: boolean;
        }[];
      };
      delete_sr: {
        Args: { p_sponsored_registration_id: string };
        Returns: Json;
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
      get_all_sponsored_registrations: {
        Args: never;
        Returns: {
          created_at: string;
          event_end_date: string;
          event_id: string;
          event_name: string;
          event_start_date: string;
          max_sponsored_guests: number;
          sponsored_by: string;
          sponsored_registration_id: string;
          status: string;
          updated_at: string;
          used_count: number;
          uuid: string;
        }[];
      };
      get_all_sponsored_registrations_with_event: {
        Args: never;
        Returns: {
          created_at: string;
          event_end_date: string;
          event_id: string;
          event_start_date: string;
          event_title: string;
          max_sponsored_guests: number;
          sponsored_by: string;
          sponsored_registration_id: string;
          status: Database["public"]["Enums"]["SponsoredRegistrationStatus"];
          updated_at: string;
          used_count: number;
          uuid: string;
        }[];
      };
      get_application_history: { Args: { p_member_id: string }; Returns: Json };
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
      get_evaluations_by_event: {
        Args: { completed_only?: boolean; event_id: string };
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
      get_events_for_select: {
        Args: never;
        Returns: {
          event_end_date: string;
          event_id: string;
          event_start_date: string;
          event_title: string;
        }[];
      };
      get_member_primary_application: {
        Args: { p_member_id: string };
        Returns: string;
      };
      get_registration_list: {
        Args: {
          p_event_id: string;
          p_payment_proof_status?: Database["public"]["Enums"]["PaymentProofStatus"];
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
      get_sector_member_counts: {
        Args: { p_sector_ids: number[] };
        Returns: {
          memberCount: number;
          sectorId: number;
        }[];
      };
      get_sponsored_registration_by_id: {
        Args: { registration_id: string };
        Returns: {
          createdAt: string;
          eventId: string;
          feeDeduction: number;
          maxSponsoredGuests: number | null;
          sponsoredBy: string;
          sponsoredRegistrationId: string;
          status: Database["public"]["Enums"]["SponsoredRegistrationStatus"];
          updatedAt: string;
          usedCount: number;
          uuid: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "SponsoredRegistration";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      get_sponsored_registration_by_uuid: {
        Args: { p_uuid: string };
        Returns: {
          createdAt: string;
          eventId: string;
          feeDeduction: number;
          maxSponsoredGuests: number;
          sponsoredBy: string;
          sponsoredRegistrationId: string;
          status: Database["public"]["Enums"]["SponsoredRegistrationStatus"];
          updatedAt: string;
          usedCount: number;
          uuid: string;
        }[];
      };
      get_sponsored_registrations_with_details: {
        Args: { p_event_id: string };
        Returns: {
          created_at: string;
          event_id: string;
          id: string;
          registration_email: string;
          registration_id: string;
          sponsor_id: string;
          sponsor_name: string;
          status: string;
          updated_at: string;
        }[];
      };
      get_sr_by_event_id: {
        Args: { p_event_id: string };
        Returns: {
          createdAt: string;
          eventId: string;
          feeDeduction: number;
          maxSponsoredGuests: number | null;
          sponsoredBy: string;
          sponsoredRegistrationId: string;
          status: Database["public"]["Enums"]["SponsoredRegistrationStatus"];
          updatedAt: string;
          usedCount: number;
          uuid: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "SponsoredRegistration";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      import_event_registrations: {
        Args: { p_dry_run?: boolean; p_event_id: string; p_rows: Json };
        Returns: Json;
      };
      is_admin_user: { Args: never; Returns: boolean };
      january_first_reset: { Args: never; Returns: undefined };
      process_membership_statuses: {
        Args: { p_reference_time?: string };
        Returns: undefined;
      };
      publish_event: { Args: { p_event_id: string }; Returns: undefined };
      quick_onsite_registration: {
        Args: {
          p_business_member_id?: string;
          p_event_day_id: string;
          p_event_id: string;
          p_identifier: string;
          p_member_type: string;
          p_non_member_name?: string;
          p_registrant?: Json;
          p_remark?: string;
        };
        Returns: Json;
      };
      schedule_interviews_batch: {
        Args: { p_interview_data: Json };
        Returns: {
          interview_count: number;
          message: string;
          success: boolean;
        }[];
      };
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
          p_note?: string;
          p_other_participants?: Json;
          p_payment_method?: string;
          p_payment_paths?: Json;
          p_registrant?: Json;
          p_sponsored_registration_id?: string;
        };
        Returns: Json;
      };
      submit_membership_application:
        | {
            Args: {
              p_application_member_type: string;
              p_application_type: string;
              p_company_details: Json;
              p_payment_method: string;
              p_payment_proof_url?: string;
              p_representatives: Json;
            };
            Returns: Json;
          }
        | {
            Args: {
              p_application_member_type: string;
              p_application_type: string;
              p_company_details: Json;
              p_company_profile_type?: string;
              p_payment_method: string;
              p_payment_proof_url?: string;
              p_representatives: Json;
            };
            Returns: Json;
          };
      toggle_sr_status: {
        Args: { p_sponsored_registration_id: string };
        Returns: Json;
      };
      update_event_details: {
        Args: {
          p_description?: string;
          p_end_date?: string;
          p_event_header_url?: string;
          p_event_id: string;
          p_event_poster?: string;
          p_event_type?: string;
          p_facebook_link?: string;
          p_registration_fee?: number;
          p_start_date?: string;
          p_title?: string;
          p_venue?: string;
        };
        Returns: Json;
      };
      update_member_with_representatives: {
        Args: {
          p_application_id: string;
          p_business_name: string;
          p_company_address: string;
          p_email_address: string;
          p_join_date?: string;
          p_landline: string;
          p_member_id: string;
          p_membership_expiry_date?: string;
          p_membership_status?: Database["public"]["Enums"]["MembershipStatus"];
          p_mobile_number: string;
          p_representatives?: Json;
          p_sector_id: number;
          p_website_url?: string;
        };
        Returns: Json;
      };
      upsert_website_content: {
        Args: {
          p_card_placement?: number;
          p_entry_key: string;
          p_group?: string;
          p_icon?: string;
          p_image_url?: string;
          p_is_active?: boolean;
          p_section: Database["public"]["Enums"]["WebsiteContentSection"];
          p_text_type: Database["public"]["Enums"]["WebsiteContentTextType"];
          p_text_value?: string;
        };
        Returns: {
          cardPlacement: number | null;
          createdAt: string;
          entryKey: string;
          group: string | null;
          icon: string | null;
          id: string;
          imageUrl: string | null;
          isActive: boolean;
          section: Database["public"]["Enums"]["WebsiteContentSection"];
          textType: Database["public"]["Enums"]["WebsiteContentTextType"];
          textValue: string | null;
          updatedAt: string;
        };
        SetofOptions: {
          from: "*";
          to: "WebsiteContent";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      ApplicationMemberType: "corporate" | "personal";
      ApplicationStatus: "new" | "pending" | "approved" | "rejected";
      ApplicationType: "newMember" | "updating" | "renewal";
      CompanyMemberType: "principal" | "alternate";
      CompanyProfileType: "image" | "document" | "website";
      EventType: "public" | "private";
      InterviewStatus: "scheduled" | "completed" | "cancelled" | "rescheduled";
      MembershipStatus: "paid" | "unpaid" | "cancelled";
      PaymentMethod: "BPI" | "ONSITE" | "IMPORTED";
      PaymentProofStatus: "pending" | "accepted" | "rejected";
      ratingScale: "poor" | "fair" | "good" | "veryGood" | "excellent";
      SponsoredRegistrationStatus: "active" | "full" | "disabled";
      WebsiteContentSection:
        | "vision_mission"
        | "goals"
        | "company_thrusts"
        | "board_of_trustees"
        | "secretariat"
        | "landing_page_benefits"
        | "hero_section";
      WebsiteContentTextType: "Paragraph" | "Title" | "Subtitle";
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
        participant_identifier: string | null;
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
        payment_proof_status:
          | Database["public"]["Enums"]["PaymentProofStatus"]
          | null;
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ApplicationMemberType: ["corporate", "personal"],
      ApplicationStatus: ["new", "pending", "approved", "rejected"],
      ApplicationType: ["newMember", "updating", "renewal"],
      CompanyMemberType: ["principal", "alternate"],
      CompanyProfileType: ["image", "document", "website"],
      EventType: ["public", "private"],
      InterviewStatus: ["scheduled", "completed", "cancelled", "rescheduled"],
      MembershipStatus: ["paid", "unpaid", "cancelled"],
      PaymentMethod: ["BPI", "ONSITE", "IMPORTED"],
      PaymentProofStatus: ["pending", "accepted", "rejected"],
      ratingScale: ["poor", "fair", "good", "veryGood", "excellent"],
      SponsoredRegistrationStatus: ["active", "full", "disabled"],
      WebsiteContentSection: [
        "vision_mission",
        "goals",
        "company_thrusts",
        "board_of_trustees",
        "secretariat",
        "landing_page_benefits",
        "hero_section",
      ],
      WebsiteContentTextType: ["Paragraph", "Title", "Subtitle"],
    },
  },
} as const;

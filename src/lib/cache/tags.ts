export const CACHE_TAGS = {
  events: {
    all: "events:all",
    admin: "events:admin",
    public: "events:public",
    registrations: "events:registrations",
    checkIns: "events:check-ins",
  },
  members: {
    all: "members:all",
    admin: "members:admin",
    public: "members:public",
  },
  applications: {
    all: "applications:all",
    admin: "applications:admin",
  },
  registrations: {
    all: "registrations:all",
    list: "registrations:list",
    details: "registrations:details",
    stats: "registrations:stats",
    event: "registrations:event",
  },
  checkIns: {
    all: "check-ins:all",
    list: "check-ins:list",
    stats: "check-ins:stats",
    eventDay: "check-ins:eventDay",
  },
  evaluations: {
    all: "evaluations:all",
    admin: "evaluations:admin",
  },
  sectors: {
    all: "sectors:all",
  },
  websiteContent: {
    all: "website-content:all",
    public: "website-content:public",
    section: {
      visionMission: "website-content:section:vision_mission",
      goals: "website-content:section:goals",
      companyThrusts: "website-content:section:company_thrusts",
      boardOfTrustees: "website-content:section:board_of_trustees",
      secretariat: "website-content:section:secretariat",
      landingPageBenefits: "website-content:section:landing_page_benefits",
    },
  },
} as const;

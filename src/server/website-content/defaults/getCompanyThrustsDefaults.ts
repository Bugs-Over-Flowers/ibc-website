import type { WebsiteContentSectionDefaults } from "../types";

export function getCompanyThrustsDefaults(): WebsiteContentSectionDefaults {
  return {
    placeholders: {
      title: "Policy Advisory & Advocacy",
      subtitle: "",
      paragraph:
        "We are at the forefront of issues concerning the business sector. Iloilo Business Club, Inc. holds membership to various regional and local policy-making bodies to represent and put forth critical agenda to improve planning and development, service delivery and the local business climate.",
      visionParagraph: "",
      missionParagraph: "",
      icon: "Shield",
      imageUrl: "",
      cardPlacement: "1",
    },
    cards: [
      {
        entryKey: "thrust_1",
        title: "Policy Advisory & Advocacy",
        subtitle: "",
        paragraph:
          "We are at the forefront of issues concerning the business sector. Iloilo Business Club, Inc. holds membership to various regional and local policy-making bodies to represent and put forth critical agenda to improve planning and development, service delivery and the local business climate.",
        icon: "Shield",
        imageUrl: "",
        cardPlacement: 1,
        group: null,
      },
      {
        entryKey: "thrust_2",
        title: "Investment Promotion",
        subtitle: "",
        paragraph:
          "Iloilo Business Club, Inc. is one of the founding business organizations of the Iloilo Economic Development Foundation, Inc. The Club partners with national government agencies, private companies and individuals that assist investors and businesses in locating and growing their business in Iloilo.",
        icon: "TrendingUp",
        imageUrl: "",
        cardPlacement: 2,
        group: null,
      },
      {
        entryKey: "thrust_3",
        title: "Tourism, Culture, Heritage & Arts",
        subtitle: "",
        paragraph:
          "To boost efforts to promote the Province and the City of Iloilo as a tourist destination, Iloilo Business Club, Inc. pursues partnerships and roles that provide capacity development for local stakeholders, discover new markets with growth potential, and improve services and facilities.",
        icon: "Palette",
        imageUrl: "",
        cardPlacement: 3,
        group: null,
      },
      {
        entryKey: "thrust_4",
        title: "Business Support Services",
        subtitle: "",
        paragraph:
          "Projects and activities of Iloilo Business Club are carefully selected to address the needs of its membership and the business sector in general. Economic data and information from key national government agencies and local government units are accessed for members upon request.",
        icon: "Handshake",
        imageUrl: "",
        cardPlacement: 4,
        group: null,
      },
    ],
  };
}

import type { WebsiteContentSectionDefaults } from "../types";

export function getGoalsDefaults(): WebsiteContentSectionDefaults {
  return {
    placeholders: {
      title: "Increase Trailblazer Companies",
      subtitle: "",
      paragraph: "Increase by 5% the number of trailblazer companies in Iloilo",
      visionParagraph: "",
      missionParagraph: "",
      icon: "TrendingUp",
      imageUrl: "",
      cardPlacement: "1",
    },
    cards: [
      {
        entryKey: "goal_1",
        title: "Increase Trailblazer Companies",
        subtitle: "",
        paragraph:
          "Increase by 5% the number of trailblazer companies in Iloilo",
        icon: "TrendingUp",
        imageUrl: "",
        cardPlacement: 1,
        group: null,
      },
      {
        entryKey: "goal_2",
        title: "Policy Advocacy",
        subtitle: "",
        paragraph: "Support policy advocacy agenda for business development",
        icon: "Shield",
        imageUrl: "",
        cardPlacement: 2,
        group: null,
      },
      {
        entryKey: "goal_3",
        title: "Community Development",
        subtitle: "",
        paragraph: "Support development of community/business clusters",
        icon: "Users",
        imageUrl: "",
        cardPlacement: 3,
        group: null,
      },
      {
        entryKey: "goal_4",
        title: "Network & Forums",
        subtitle: "",
        paragraph: "Network to relevant and applicable forums",
        icon: "Globe",
        imageUrl: "",
        cardPlacement: 4,
        group: null,
      },
      {
        entryKey: "goal_5",
        title: "Sustainable Investment",
        subtitle: "",
        paragraph:
          "Increased capacity for sustainable investment, trade & tourism development",
        icon: "Building2",
        imageUrl: "",
        cardPlacement: 5,
        group: null,
      },
      {
        entryKey: "goal_6",
        title: "Environmental Protection",
        subtitle: "",
        paragraph: "Promote environmental protection policies",
        icon: "Palette",
        imageUrl: "",
        cardPlacement: 6,
        group: null,
      },
    ],
  };
}

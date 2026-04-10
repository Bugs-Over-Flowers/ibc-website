import type { WebsiteContentSectionDefaults } from "../types";

export function getVisionMissionDefaults(): WebsiteContentSectionDefaults {
  return {
    placeholders: {
      title: "",
      subtitle: "",
      paragraph: "",
      visionParagraph:
        "By 2028, Iloilo and Panay are globally connected and recognized as a leading source of world-class enterprises.",
      missionParagraph:
        "To establish itself as an independent and sustainable institution at the forefront of policy advocacy and strategic initiatives for broad-based and inclusive growth in Iloilo and Panay.",
      icon: "",
      imageUrl: "",
      cardPlacement: "",
    },
    cards: [
      {
        entryKey: "vision",
        title: "",
        subtitle: "",
        paragraph:
          "By 2028, Iloilo and Panay are globally connected and recognized as a leading source of world-class enterprises.",
        icon: "",
        imageUrl: "",
        cardPlacement: null,
        group: null,
      },
      {
        entryKey: "mission",
        title: "",
        subtitle: "",
        paragraph:
          "To establish itself as an independent and sustainable institution at the forefront of policy advocacy and strategic initiatives for broad-based and inclusive growth in Iloilo and Panay.",
        icon: "",
        imageUrl: "",
        cardPlacement: null,
        group: null,
      },
    ],
  };
}

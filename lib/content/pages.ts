export type ContentPage = {
  slug: string;
  title: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  table?: { caption: string; columns: string[]; rows: string[][] };
};

// Information pages. Copy marked as placeholder must be replaced before launch.
export const infoPages: ContentPage[] = [
  {
    slug: "sustainability",
    title: "Sustainability",
    intro: "Placeholder: a short summary of how the brand thinks about materials and making.",
    sections: [
      {
        heading: "Materials",
        paragraphs: ["Placeholder: describe the materials used, with facts you can stand behind."],
      },
      {
        heading: "Packaging",
        paragraphs: ["Placeholder: describe the packaging and what it is made from."],
      },
    ],
  },
  {
    slug: "care-guide",
    title: "Care guide",
    intro: "Keep your pieces looking fresh off the beach with a few simple habits.",
    sections: [
      {
        heading: "Keep it shining",
        paragraphs: [
          "Avoid direct contact with lotions, perfumes and sunscreen.",
          "Wipe with a soft, dry cloth after wearing, especially after time at the beach or pool.",
          "Store pieces apart so chains and hoops don't tangle or scratch.",
        ],
      },
    ],
  },
  {
    slug: "shipping-returns",
    title: "Shipping and returns",
    intro: "Placeholder: the delivery and returns policy in plain language.",
    sections: [
      {
        heading: "Delivery",
        paragraphs: ["Placeholder: delivery times and costs, once they are confirmed."],
      },
      {
        heading: "Returns",
        paragraphs: ["Placeholder: how to return an item and how long you have to do it."],
      },
    ],
  },
  {
    slug: "size-guide",
    title: "Size guide",
    intro: "Find your ring size with the table below.",
    sections: [
      {
        heading: "How to measure",
        paragraphs: [
          "Measure a ring you already wear that fits well, on the inside, in millimetres. Match it to the table.",
        ],
      },
    ],
    table: {
      caption: "Approximate inside diameter for each ring size",
      columns: ["Size", "Inside diameter"],
      rows: [
        ["6", "16.5 mm"],
        ["7", "17.3 mm"],
        ["8", "18.1 mm"],
        ["9", "18.9 mm"],
      ],
    },
  },
];

// Legal pages are placeholders: the text must come from you or your lawyer, not from this file.
export const policies: ContentPage[] = [
  {
    slug: "privacy-policy",
    title: "Privacy policy",
    intro: "Placeholder: replace this text with your privacy policy before launch.",
    sections: [{ heading: "Placeholder", paragraphs: ["Your privacy policy text goes here."] }],
  },
  {
    slug: "terms-of-service",
    title: "Terms of service",
    intro: "Placeholder: replace this text with your terms before launch.",
    sections: [{ heading: "Placeholder", paragraphs: ["Your terms of service go here."] }],
  },
  {
    slug: "refund-policy",
    title: "Refund policy",
    intro: "Placeholder: replace this text with your refund policy before launch.",
    sections: [{ heading: "Placeholder", paragraphs: ["Your refund policy goes here."] }],
  },
];

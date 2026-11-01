export type ContentPage = {
  slug: string;
  title: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  table?: { caption: string; columns: string[]; rows: string[][] };
};

// Legal pages are placeholders: the text must come from you or your lawyer, not from this file.
// Information pages are in the CMS (docs/seed holds their starting copy).
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

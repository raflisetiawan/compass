export interface FunctionalOutcome {
  title: string;
  slug: string;
  description: string;
}

export const functionalOutcomes: FunctionalOutcome[] = [
  {
    title: "Survival after prostate cancer treatment",
    slug: "survival-after-prostate-cancer-treatment",
    description: "% are alive at 5 years after diagnosis",
  },
    {
    title: "Risk & Retreatment Equations",
    slug: "risk-retreatment-equations",
    description:
      "Updated risk assessment and retreatment probability calculations for prostate cancer treatment outcomes.",
  },
  {
    title: "Leaking urine at 1 year",
    slug: "leaking-urine-at-one-year",
    description:
      "How leaking status changes at 1 year from starting treatment.",
  },
  {
    title: "Use of urinary pads at 1 year",
    slug: "use-of-urinary-pads-at-one-year",
    description:
      "How pad usage status changes at 1 year from starting treatment.",
  },
  {
    title: "Urinary Bother",
    slug: "urinary-bother",
    description:
      "How bother with urinary function changes at 1 year from starting treatment.",
  },
  {
    title: "Erectile function at 1 year",
    slug: "sufficient-erections-for-intercourse",
    description:
      "How erectile function changes at 1 year from starting treatment.",
  },
  {
    title: "Bother with erectile function at 1 year",
    slug: "sexual-bother",
    description:
      "How bother with erectile function changes at 1 year from starting treatment.",
  },
  {
    title: "Problem with bowel urgency at 1 year",
    slug: "problem-with-urgency",
    description:
      "How the degree of problem with bowel urgency changes at 1 year from starting treatment.",
  },
  {
    title: "Bowel bother at 1 year",
    slug: "bowel-bother",
    description:
      "How bother with bowel function changes at 1 year from starting treatment.",
  },

];

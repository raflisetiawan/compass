import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { SurvivalData } from "@/types";

const functionalOutcomes = [
  {
    title: "Survival after prostate cancer treatment",
    slug: "survival-after-prostate-cancer-treatment",
    description: "% are alive at 5 years after diagnosis",
  },
  {
    title: "Leaking urine at 1 year",
    slug: "leaking-urine-at-one-year",
    description: "How leaking status changes at 1 year from starting treatment.",
  },
  {
    title: "Use of urinary pads at 1 year",
    slug: "use-of-urinary-pads-at-one-year",
    description: "How pad usage status changes at 1 year from starting treatment.",
  },
  {
    title: "Urinary Bother",
    slug: "urinary-bother",
    description:
      "% of Men or whom their urinary function is not considered to be a problem",
  },
  {
    title: "Sufficient erections for intercourse",
    slug: "sufficient-erections-for-intercourse",
    description:
      "% of men whose erections are sufficient for intercourse with or without use of medications or sexual devices",
  },
  {
    title: "Sexual bother",
    slug: "sexual-bother",
    description:
      "% of men for whom their sexual function is not considered to be a problem",
  },
  {
    title: "Problem with urgency",
    slug: "problem-with-urgency",
    description:
      "% of men for whom their urgency to have a bowel movement is not considered to be a problem",
  },
  {
    title: "Bowel bother",
    slug: "bowel-bother",
    description:
      "% of men for whom their bowel function is not considered to be a problem",
  },
];

interface FunctionalOutcomesSummaryProps {
  survivalOutcome: SurvivalData | undefined;
}

export const FunctionalOutcomesSummary = ({
  survivalOutcome,
}: FunctionalOutcomesSummaryProps) => (
  <Card>
    <CardHeader className="text-center p-4">
      <CardTitle className="text-xl font-bold mt-4">
        Summary Table of Functional Outcomes
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {functionalOutcomes.map((item) => {
          let description = item.description;
          if (item.title === "Survival after prostate cancer treatment") {
            if (survivalOutcome && survivalOutcome["Alive (%)"]) {
              const alivePercent = Number(survivalOutcome["Alive (%)"]).toFixed(
                1
              );
              description = `${alivePercent}% are alive at 5 years after diagnosis`;
            } else {
              description = "Data not available for the selected parameters.";
            }
          }

          return (
            <Card key={item.title} className="shadow-md rounded-lg border flex flex-col">
              <CardContent className="p-4 flex-grow">
                <h4 className="font-bold text-teal-600">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-2">{description}</p>
              </CardContent>
              <div className="p-4 pt-0">
                <Button asChild variant="link" className="p-0 h-auto text-teal-600">
                  <Link to={`/functional-outcome/${item.slug}`}>
                    Read More <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="mt-6 bg-blue-100 text-blue-800 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-1 flex-shrink-0" />
        <p className="text-sm">
          These definitions correspond to the lowest score (1 out of 5) of their
          corresponding EPIC-26 questions.
        </p>
      </div>
    </CardContent>
  </Card>
);

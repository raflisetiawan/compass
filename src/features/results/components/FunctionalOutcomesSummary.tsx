import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { SurvivalData } from "@/types";
import { functionalOutcomes } from '@/data/functional-outcomes';
import { FunctionalOutcomeCard } from './FunctionalOutcomeCard';

interface FunctionalOutcomesSummaryProps {
  survivalOutcome: SurvivalData | undefined;
}

export const FunctionalOutcomesSummary = ({
  survivalOutcome,
}: FunctionalOutcomesSummaryProps) => {
  const outcomesWithDynamicData = useMemo(() => {
    return functionalOutcomes.map((item) => {
      if (item.slug === "survival-after-prostate-cancer-treatment") {
        let description: string;
        if (survivalOutcome && survivalOutcome["Alive (%)"]) {
          const alivePercent = Number(survivalOutcome["Alive (%)"]).toFixed(1);
          description = `${alivePercent}% are alive at 5 years after diagnosis`;
        } else {
          description = "Data not available for the selected parameters.";
        }
        return { ...item, description };
      }
      return item;
    });
  }, [survivalOutcome]);

  return (
    <Card>
      <CardHeader className="text-center p-4">
        <CardTitle className="text-xl font-bold mt-4">
          Prediction Results of Functional Outcomes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {outcomesWithDynamicData.map((item) => (
            <FunctionalOutcomeCard key={item.slug} outcome={item} />
          ))}
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
};

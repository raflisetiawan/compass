import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { FunctionalOutcome } from "@/data/functional-outcomes";

interface FunctionalOutcomeCardProps {
  outcome: FunctionalOutcome;
}

export const FunctionalOutcomeCard = ({ outcome }: FunctionalOutcomeCardProps) => (
  <Card className="shadow-md rounded-lg border flex flex-col">
    <CardContent className="p-4 flex-grow">
      <h4 className="font-bold text-teal-600">{outcome.title}</h4>
      <p className="text-sm text-gray-600 mt-2">{outcome.description}</p>
    </CardContent>
    <div className="p-4 pt-0">
      <Button asChild variant="link" className="p-0 h-auto text-teal-600">
        <Link to={`/functional-outcome/${outcome.slug}`}>
          Read More <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </Button>
    </div>
  </Card>
);

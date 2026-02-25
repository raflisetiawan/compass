import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  User,
  MessageSquareQuoteIcon,
} from "lucide-react";
import { ClinicalParametersContent } from "./ClinicalParametersContent";
import { BaselineFunctionContent } from "./BaselineFunctionContent";
import type { ClinicalParameters, BaselineFunction } from "@/types";

interface ResultsSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  clinicalParameters: ClinicalParameters;
  baselineGenitoUrinaryBowelFunction: BaselineFunction;
}

export const ResultsSidebar = ({
  isExpanded,
  onToggle,
  clinicalParameters,
  baselineGenitoUrinaryBowelFunction,
}: ResultsSidebarProps) => {
  const [accordionValue, setAccordionValue] = useState<string[]>([]);

  // Auto-expand both sections when sidebar opens
  useEffect(() => {
    if (isExpanded) {
      setAccordionValue(["clinical-params", "baseline-function"]);
    } else {
      setAccordionValue([]);
    }
  }, [isExpanded]);

  return (
    <aside
      className={`hidden md:block transition-all duration-300 ${
        isExpanded ? "w-1/3" : "w-20"
      }`}
    >
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Hide
            </>
          ) : (
            <>
              <ChevronRight className="h-4 w-4 mr-1" />
              See your answers
            </>
          )}
        </Button>
      </div>
      {isExpanded ? (
        <Accordion
          type="multiple"
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="w-full"
        >
          <AccordionItem value="clinical-params">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6" />
                Clinical Parameters
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <ClinicalParametersContent parameters={clinicalParameters} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="baseline-function">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-3">
                <MessageSquareQuoteIcon className="h-6 w-6" />
                Baseline Function
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <BaselineFunctionContent
                baseline={baselineGenitoUrinaryBowelFunction}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <div className="flex flex-col items-center space-y-4 mt-8">
          <User className="h-6 w-6" />
          <MessageSquareQuoteIcon className="h-6 w-6" />
        </div>
      )}
    </aside>
  );
};


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
}: ResultsSidebarProps) => (
  <aside
    className={`hidden md:block transition-all duration-300 ${
      isExpanded ? "w-1/3" : "w-20"
    }`}
  >
    <div className="flex justify-end mb-2">
      <Button
        variant="outline"
        size={isExpanded ? "sm" : "icon"}
        onClick={onToggle}
      >
        {isExpanded ? (
          <>
            <ChevronLeft className="h-4 w-4 mr-1" />
            MINIMIZE
          </>
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
    {isExpanded ? (
      <Accordion
        type="multiple"
        defaultValue={["clinical-params", "baseline-function"]}
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

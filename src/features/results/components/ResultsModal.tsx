import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ClinicalParametersContent } from "./ClinicalParametersContent";
import { BaselineFunctionContent } from "./BaselineFunctionContent";
import type {
  ModalContentType,
  ClinicalParameters,
  BaselineFunction,
} from "@/types";

interface ResultsModalProps {
  modalContent: ModalContentType;
  onClose: () => void;
  clinicalParameters: ClinicalParameters;
  baselineGenitoUrinaryBowelFunction: BaselineFunction;
}

export const ResultsModal = ({
  modalContent,
  onClose,
  clinicalParameters,
  baselineGenitoUrinaryBowelFunction,
}: ResultsModalProps) => {
  if (!modalContent) return null;

  const isClinical = modalContent === "clinical";
  const title = isClinical
    ? "Clinical Parameters"
    : "Baseline genito-urinary-bowel function";

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center md:hidden">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div>
          {isClinical ? (
            <ClinicalParametersContent parameters={clinicalParameters} />
          ) : (
            <BaselineFunctionContent
              baseline={baselineGenitoUrinaryBowelFunction}
            />
          )}
        </div>
      </div>
    </div>
  );
};

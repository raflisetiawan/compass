import { useState, useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
import IconArray from "@/features/results/components/IconArray";
import { IconLegendModal } from "@/features/results/components/IconLegendModal";
import RiskRetreatmentTable from "@/features/results/components/RiskRetreatmentTable";
import LegendIcon from "@/features/results/components/LegendIcon";
import { calculateAllStrategies } from "@/utils/riskRetreatmentUtils";
import { AlertCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LegendModalData {
  name: string;
  data: { name: string; value: number; color: string }[];
}

const RiskRetreatmentPageContent = () => {
  const { answers } = useOutcomePageData();
  const [legendModalData, setLegendModalData] = useState<LegendModalData | null>(null);

  const strategyResults = useMemo(() => {
    return calculateAllStrategies(answers);
  }, [answers]);

  const treatmentOutcomes = useMemo(() => {
    return [
      {
        name: "Active Surveillance",
        ...strategyResults.activeSurveillance,
      },
      {
        name: "Focal Therapy",
        ...strategyResults.focalTherapy,
      },
      {
        name: "Surgery",
        ...strategyResults.surgery,
      },
      {
        name: "Radiotherapy",
        ...strategyResults.radiotherapy,
      },
    ];
  }, [strategyResults]);

  const Legend = () => (
    <div className="mb-6 p-4 rounded-lg">
      <h3 className="font-bold mb-2 text-lg">What the icons mean</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <LegendIcon color="#1b5e20" name="No Treatment" />
          <span className="ml-2">No Treatment Needed / Success</span>
        </div>
        <div className="flex items-center">
          <LegendIcon color="#90EE90" name="Progression" />
          <span className="ml-2">Progression to Treatment / First Treatment Success</span>
        </div>
        <div className="flex items-center">
          <LegendIcon color="#FFEB3B" name="Repeat Focal" />
          <span className="ml-2">Repeat Focal Treatment</span>
        </div>
        <div className="flex items-center">
          <LegendIcon color="#FF9800" name="Radical/Salvage" />
          <span className="ml-2">Radical / Salvage Treatment Needed</span>
        </div>
        <div className="flex items-center">
          <LegendIcon color="#FFC107" name="Both" />
          <span className="ml-2">Both Repeat & Radical Treatment</span>
        </div>
      </div>
    </div>
  );

  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
      <p className="text-sm text-amber-800">{message}</p>
    </div>
  );

  return (
    <>
      <p className="text-sm text-gray-600 mb-4">
        The following graphs show the predicted treatment outcomes based on your clinical parameters. 
        Each icon plot represents 100 patients with similar characteristics, showing the probability 
        distribution of requiring additional treatment or retreatment.
      </p>

      <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-2 text-lg">Your Clinical Parameters:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">T Stage:</span>{" "}
            <span className="font-medium">{answers.cancer_stage || answers.t_stage || "Not specified"}</span>
          </div>
          <div>
            <span className="text-gray-600">Gleason Score:</span>{" "}
            <span className="font-medium">{answers.gleason_score || answers.gleason || "Not specified"}</span>
          </div>
          <div>
            <span className="text-gray-600">PSA:</span>{" "}
            <span className="font-medium">{answers.psa || "Not specified"} ng/mL</span>
          </div>
          <div>
            <span className="text-gray-600">MRI Visibility:</span>{" "}
            <span className="font-medium">{answers.mri_pirad_score || answers.mri_visibility || "Not specified"}</span>
          </div>
        </div>
      </div>

      <Legend />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {treatmentOutcomes.map((treatment) => (
          <div key={treatment.name} className="space-y-2">
            <h3 className="font-bold text-md text-center">{treatment.name}</h3>
            {treatment.error ? (
              <ErrorDisplay message={treatment.error} />
            ) : (
              <div
                onClick={() => setLegendModalData({
                  name: treatment.name,
                  data: treatment.data,
                })}
                className="cursor-pointer"
              >
                <IconArray data={treatment.data} />
              </div>
            )}
          </div>
        ))}
      </div>

      <h3 className="font-bold mt-6 mb-2 text-lg">Table</h3>
      <RiskRetreatmentTable data={treatmentOutcomes} />

      <Accordion type="single" collapsible className="w-full mt-6">
        <AccordionItem value="summary">
          <AccordionTrigger className="font-bold text-lg">Summary</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-gray-600 space-y-4">
              <p>
                Based on your clinical parameters, here is the predicted probability of requiring 
                additional treatment for each treatment option:
              </p>
              {treatmentOutcomes.map((treatment) => (
                <div key={treatment.name}>
                  <p className="font-semibold">{treatment.name}:</p>
                  {treatment.error ? (
                    <p className="text-amber-600 pl-4">{treatment.error}</p>
                  ) : (
                    <ul className="list-disc list-inside pl-4">
                      {treatment.data.map((outcome) => (
                        <li key={outcome.name}>
                          {outcome.value}% - {outcome.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {legendModalData && (
        <IconLegendModal
          isOpen={!!legendModalData}
          onClose={() => setLegendModalData(null)}
          title={`Legend for ${legendModalData.name}`}
          legendData={legendModalData.data}
        />
      )}
    </>
  );
};

const RiskRetreatmentPage = () => (
  <FunctionalOutcomePageLayout title="Risk & Retreatment Equations">
    <RiskRetreatmentPageContent />
  </FunctionalOutcomePageLayout>
);

export default RiskRetreatmentPage;

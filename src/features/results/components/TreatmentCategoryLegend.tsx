import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TreatmentCategoryLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

const treatmentDescriptions = {
  "Active Surveillance":
    "Monitoring the cancer closely. Treatment such as surgery or radiotherapy is only started if the cancer grows or causes symptoms.",
  "Focal Therapy":
    "A range of techniques for destroying small tumours within the prostate, while preserving the surrounding healthy tissue.",
  Surgery:
    "An operation to remove the entire prostate gland plus some of the tissue around it (this is called a radical prostatectomy).",
  RadioTherapy:
    "Using high-energy rays (similar to X-rays) to kill cancer cells.",
};

export const TreatmentCategoryLegend = ({
  isOpen,
  onClose,
}: TreatmentCategoryLegendProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative pb-2">
          <CardTitle>Treatment Categories</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(treatmentDescriptions).map(
              ([name, description]) => (
                <div key={name}>
                  <h4 className="font-bold">
                    {name === "RadioTherapy" ? "Radiotherapy" : name}
                  </h4>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

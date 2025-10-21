import type { ClinicalParameters } from "@/types";

interface ClinicalParametersContentProps {
  parameters: ClinicalParameters;
}

export const ClinicalParametersContent = ({
  parameters,
}: ClinicalParametersContentProps) => (
  <div className="divide-y divide-gray-200">
    {Object.entries(parameters).map(([key, value]) => (
      <div key={key} className="p-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">{key}</p>
        <p className="font-bold">{String(value)}</p>
      </div>
    ))}
  </div>
);

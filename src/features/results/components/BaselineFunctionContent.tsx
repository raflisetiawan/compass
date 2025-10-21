import type { BaselineFunction } from "@/types";

interface BaselineFunctionContentProps {
  baseline: BaselineFunction;
}

export const BaselineFunctionContent = ({
  baseline,
}: BaselineFunctionContentProps) => (
  <div className="divide-y divide-gray-200">
    {Object.entries(baseline).map(([key, value]) => (
      <div key={key} className="p-4">
        <p className="text-sm text-gray-500">
          {key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
        </p>
        <p className="font-bold">{String(value)}</p>
      </div>
    ))}
  </div>
);

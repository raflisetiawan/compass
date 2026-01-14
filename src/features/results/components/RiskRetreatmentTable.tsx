interface TableData {
  name: string;
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  error?: string;
}

interface RiskRetreatmentTableProps {
  data: TableData[];
}

const RiskRetreatmentTable = ({ data }: RiskRetreatmentTableProps) => {
  // Filter out treatments with errors
  const validTreatments = data.filter((treatment) => !treatment.error && treatment.data.length > 0);

  if (validTreatments.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No data available for the selected clinical parameters.
      </div>
    );
  }

  // Get all unique outcome names across all treatments
  const allOutcomeNames = Array.from(
    new Set(validTreatments.flatMap((t) => t.data.map((d) => d.name)))
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 font-semibold text-teal-600">Treatment</th>
            {allOutcomeNames.map((name) => (
              <th key={name} className="text-center p-2 font-semibold text-gray-600">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {validTreatments.map((treatment) => (
            <tr key={treatment.name} className="border-b hover:bg-gray-50">
              <td className="p-2 font-medium text-teal-600">{treatment.name}</td>
              {allOutcomeNames.map((outcomeName) => {
                const outcomeData = treatment.data.find((d) => d.name === outcomeName);
                return (
                  <td key={outcomeName} className="text-center p-2">
                    {outcomeData ? `${outcomeData.value}%` : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RiskRetreatmentTable;

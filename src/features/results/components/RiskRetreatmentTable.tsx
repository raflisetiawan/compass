import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5 min-w-[120px]">Outcome</TableHead>
            {validTreatments.map((treatment) => (
              <TableHead key={treatment.name} className="text-right w-1/5 min-w-[120px]">
                {treatment.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {allOutcomeNames.map((outcomeName) => (
            <TableRow key={outcomeName}>
              <TableCell className="font-medium">
                {outcomeName}
              </TableCell>
              {validTreatments.map((treatment) => {
                const outcomeData = treatment.data.find((d) => d.name === outcomeName);
                return (
                  <TableCell key={treatment.name} className="text-right">
                    {outcomeData ? `${outcomeData.value}%` : "-"}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RiskRetreatmentTable;

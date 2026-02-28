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
    <div>
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/5 break-words whitespace-normal">Outcome</TableHead>
            {validTreatments.map((treatment) => (
              <TableHead key={treatment.name} className="text-right break-words whitespace-normal">
                {treatment.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {allOutcomeNames.map((outcomeName) => (
            <TableRow key={outcomeName}>
              <TableCell className="font-medium break-words whitespace-normal">
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

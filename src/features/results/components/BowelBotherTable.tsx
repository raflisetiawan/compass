import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OutcomeData = {
  name: string;
  value: number;
};

type TreatmentOutcome = {
  name: string;
  data: OutcomeData[];
};

interface BowelBotherTableProps {
  data: TreatmentOutcome[];
}

const BowelBotherTable = ({ data }: BowelBotherTableProps) => {
  if (!data || data.length === 0) {
    return <p>No data available.</p>;
  }

  const outcomeNames = data[0].data.map((item) => item.name);

  return (
    <div className="overflow-x-auto">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5 min-w-[120px]">Outcome</TableHead>
            {data.map((treatment) => (
              <TableHead key={treatment.name} className="text-right w-1/5 min-w-[120px]">
                {treatment.name === "Radiotherapy"
                  ? "Radiotherapy"
                  : treatment.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {outcomeNames.map((outcomeName, outcomeIndex) => (
            <TableRow key={outcomeName}>
              <TableCell className="font-medium">
                {outcomeName}
              </TableCell>
              {data.map((treatment) => (
                <TableCell key={treatment.name} className="text-right">
                  {treatment.data[outcomeIndex]?.value ?? 0}%
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BowelBotherTable;

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

interface UrinaryPadUsageTableProps {
  data: TreatmentOutcome[];
}

const UrinaryPadUsageTable = ({ data }: UrinaryPadUsageTableProps) => {
  if (!data || data.length === 0) {
    return <p>No data available.</p>;
  }

  const outcomeNames = data[0].data.map((item) => item.name);

  return (
    <div>
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/5 break-words whitespace-normal">Outcome</TableHead>
            {data.map((treatment) => (
              <TableHead key={treatment.name} className="text-right break-words whitespace-normal">
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
              <TableCell className="font-medium break-words whitespace-normal">
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

export default UrinaryPadUsageTable;

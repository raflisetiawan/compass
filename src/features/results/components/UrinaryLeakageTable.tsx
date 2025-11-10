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

interface UrinaryLeakageTableProps {
  data: TreatmentOutcome[];
}

const UrinaryLeakageTable = ({ data }: UrinaryLeakageTableProps) => {
  if (!data || data.length === 0) {
    return <p>No data available.</p>;
  }

  const outcomeNames = data[0].data.map((item) => item.name);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Treatment</TableHead>
          {outcomeNames.map((name) => (
            <TableHead key={name} className="text-right">
              {name}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((treatment) => (
          <TableRow key={treatment.name}>
            <TableCell>
              {treatment.name === "RadioTherapy"
                ? "Radiotherapy"
                : treatment.name}
            </TableCell>
            {treatment.data.map((outcome) => (
              <TableCell key={outcome.name} className="text-right">
                {outcome.value}%
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UrinaryLeakageTable;

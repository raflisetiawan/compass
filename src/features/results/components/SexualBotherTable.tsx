import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LegendIcon from "./LegendIcon";

type OutcomeData = {
  name: string;
  value: number;
  color?: string;
};

type TreatmentOutcome = {
  name: string;
  data: OutcomeData[];
};

interface SexualBotherTableProps {
  data: TreatmentOutcome[];
}

const SexualBotherTable = ({ data }: SexualBotherTableProps) => {
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
                <div className="flex items-center gap-2">
                  {data[0]?.data[outcomeIndex]?.color && (
                    <LegendIcon color={data[0].data[outcomeIndex].color!} name={outcomeName} size={16} />
                  )}
                  <span>{outcomeName}</span>
                </div>
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

export default SexualBotherTable;

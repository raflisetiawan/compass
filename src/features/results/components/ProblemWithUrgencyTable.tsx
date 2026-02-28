import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  
  interface OutcomeData {
    name: string;
    data: {
      name:string;
      value: number;
    }[];
  }
  
  interface ProblemWithUrgencyTableProps {
    data: OutcomeData[];
  }
  
  const ProblemWithUrgencyTable = ({ data }: ProblemWithUrgencyTableProps) => {
    const headers = data[0]?.data.map(d => d.name) || [];
  
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
            {headers.map((outcomeName, outcomeIndex) => (
              <TableRow key={outcomeName}>
                <TableCell className="font-medium">{outcomeName}</TableCell>
                {data.map(treatment => (
                  <TableCell key={treatment.name} className="text-right">
                    {treatment.data[outcomeIndex]?.value?.toFixed(0) ?? 0}%
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  export default ProblemWithUrgencyTable;

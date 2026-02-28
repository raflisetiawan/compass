import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import LegendIcon from "./LegendIcon";
  
  interface OutcomeData {
    name: string;
    data: {
      name:string;
      value: number;
      color?: string;
      Icon?: React.ElementType;
    }[];
  }
  
  interface ProblemWithUrgencyTableProps {
    data: OutcomeData[];
  }
  
  const ProblemWithUrgencyTable = ({ data }: ProblemWithUrgencyTableProps) => {
    const headers = data[0]?.data.map(d => d.name) || [];
  
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
            {headers.map((outcomeName, outcomeIndex) => (
              <TableRow key={outcomeName}>
                <TableCell className="font-medium break-words whitespace-normal">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const outcomeData = data[0]?.data[outcomeIndex];
                      if (outcomeData?.Icon) {
                        const IconComp = outcomeData.Icon;
                        return <IconComp color={outcomeData.color} size={16} />;
                      }
                      if (outcomeData?.color) {
                        return <LegendIcon color={outcomeData.color} name={outcomeName} size={16} />;
                      }
                      return null;
                    })()}
                    <span>{outcomeName}</span>
                  </div>
                </TableCell>
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

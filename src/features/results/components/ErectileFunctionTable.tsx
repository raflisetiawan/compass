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
      name: string;
      displayName?: string;
      value: number;
      color?: string;
      showPill?: boolean;
    }[];
  }
  
  interface ErectileFunctionTableProps {
    data: OutcomeData[];
  }
  
  const ErectileFunctionTable = ({ data }: ErectileFunctionTableProps) => {
    // Get all unique headers from data
    const headers = data[0]?.data || [];
  
    return (
      <div>
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/5 break-words whitespace-normal">Outcome</TableHead>
              {data.map((treatment) => (
                <TableHead key={treatment.name} className="text-right break-words whitespace-normal">
                  {treatment.name === "Radiotherapy" ? "Radiotherapy" : treatment.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {headers.map((header, outcomeIndex) => (
              <TableRow key={header.name}>
                <TableCell className="font-medium break-words whitespace-normal">
                  <div className="flex items-center gap-2">
                    {header.color && (
                      <div className="shrink-0">
                        <LegendIcon color={header.color} name={header.displayName || header.name} showPill={header.showPill} size={16} />
                      </div>
                    )}
                    <span>{header.displayName || header.name}</span>
                  </div>
                </TableCell>
                {data.map((treatment) => (
                  <TableCell key={treatment.name} className="text-center">
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
  
  export default ErectileFunctionTable;

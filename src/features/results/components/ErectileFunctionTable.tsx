import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import PillIcon from "./PillIcon";
  
  interface OutcomeData {
    name: string;
    data: {
      name: string;
      value: number;
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Treatment</TableHead>
              {headers.map((header, idx) => (
                <TableHead key={idx} className="text-center min-w-[150px]">
                  <div className="flex flex-col items-center gap-1">
                    <span>{header.name}</span>
                    {header.showPill && (
                      <PillIcon size={12} />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                {row.data.map((d, idx) => (
                  <TableCell key={idx} className="text-center">
                    {d.value.toFixed(0)}%
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

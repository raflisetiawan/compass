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
                <TableCell className="font-medium break-words whitespace-normal">{header.name}</TableCell>
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

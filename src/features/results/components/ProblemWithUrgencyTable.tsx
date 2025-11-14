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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Treatment</TableHead>
            {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-medium">{row.name}</TableCell>
              {row.data.map(d => <TableCell key={d.name}>{d.value.toFixed(0)}%</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  export default ProblemWithUrgencyTable;

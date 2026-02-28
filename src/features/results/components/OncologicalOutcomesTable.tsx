import StickManIcon from "./StickManIcon";

type OutcomeData = {
  name: string;
  value: number;
  color: string;
};

interface OncologicalOutcomesTableProps {
  data: OutcomeData[];
}

const OncologicalOutcomesTable = ({ data }: OncologicalOutcomesTableProps) => {
  if (!data || data.length === 0) {
    return <p>No data available.</p>;
  }

  return (
    <div>
      <table className="w-full border-collapse border border-gray-400">
        {/* Header */}
        <thead>
          <tr>
            <th 
              colSpan={2} 
              className="bg-[#4A6FA5] text-white text-xl font-bold py-3 px-4 text-center border border-gray-400"
            >
              Oncological Outcomes
            </th>
          </tr>
          <tr>
            <th className="bg-[#D4C5E2] text-left py-2 px-4 border border-gray-400 font-normal text-sm">
              Time point: 5 years
            </th>
            <th className="bg-[#A4D96C] text-center py-2 px-4 border border-gray-400 font-bold text-sm">
              % men
            </th>
          </tr>
        </thead>
        {/* Body */}
        <tbody>
          {data.map((item) => (
            <tr key={item.name} className="bg-[#F8E5F1]">
              <td className="py-2 px-4 border border-gray-400">
                <div className="flex items-center gap-2">
                  <StickManIcon color={item.color} size={16} />
                  <span className="font-bold text-sm">{item.name}</span>
                </div>
              </td>
              <td className="py-2 px-4 border border-gray-400 text-center font-normal text-sm">
                {item.value.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OncologicalOutcomesTable;

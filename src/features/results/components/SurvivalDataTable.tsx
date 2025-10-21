import type { SurvivalData } from "@/types";

interface SurvivalDataTableProps {
  data: SurvivalData | undefined;
}

const SurvivalDataTable = ({ data }: SurvivalDataTableProps) => {
  if (!data) {
    return (
      <p className="text-sm text-gray-500">Data for the table is not available.</p>
    );
  }

  const formatValue = (value: string | number | undefined) => {
    if (value === undefined || value === "") return "N/A";
    return value;
  };

  const formatPercent = (value: string | number | undefined) => {
    if (value === undefined || value === "") return "";
    const num = Number(value);
    return isNaN(num) ? "" : `(${num.toFixed(1)}%)`;
  };

  const tableData = [
    {
      label: "Total Number of Men in Cohort",
      value: formatValue(data["Total (N)"]),
    },
    {
      label: "Alive",
      value: `${formatValue(data["Alive (n)"])} ${formatPercent(
        data["Alive (%)"]
      )}`,
    },
    {
      label: "Death from Prostate Cancer",
      value: `${formatValue(data["PCa Death (n)"])} ${formatPercent(
        data["PCa Death (%)"]
      )}`,
    },
    {
      label: "Death from Other Causes",
      value: `${formatValue(data["Other Death (n)"])} ${formatPercent(
        data["Other Death (%)"]
      )}`,
    },
  ];

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Outcome
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Number of Men
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.label} className="bg-white border-b last:border-b-0">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  {row.label}
                </th>
                <td className="px-6 py-4 text-right">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden rounded-lg border border-gray-200">
        {tableData.map((row, index) => (
          <div
            key={row.label}
            className={`bg-white p-4 ${
              index < tableData.length - 1 ? "border-b border-gray-200" : ""
            }`}
          >
            <div className="font-medium text-gray-900 mb-1">{row.label}</div>
            <div className="text-gray-500 text-right">{row.value}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default SurvivalDataTable;
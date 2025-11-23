import IconArray from "@/features/results/components/IconArray";
import LegendIcon from "@/features/results/components/LegendIcon";

interface IconData {
  name: string;
  value: number;
  color: string;
}

interface SurvivalChartForPdfProps {
  data: IconData[];
}

export const SurvivalChartForPdf = ({ data }: SurvivalChartForPdfProps) => (
  <div className="flex flex-row items-start gap-4 p-4 bg-white">
    <IconArray data={data} />
    <div className="flex flex-col gap-2">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <LegendIcon color={item.color} name={item.name} />
          <span className="text-sm text-gray-700">
            {item.name} ({item.value}%)
          </span>
        </div>
      ))}
    </div>
  </div>
);

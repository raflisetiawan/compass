import IconArray from "@/features/results/components/IconArray";

interface OutcomeData {
  name: string;
  value: number;
  color: string;
  iconUrl?: string;
}

interface UrinaryPadUsageChartForPdfProps {
  treatment: {
    name: string;
    data: OutcomeData[];
  };
}

export const UrinaryPadUsageChartForPdf = ({ treatment }: UrinaryPadUsageChartForPdfProps) => (
  <div className="p-4 bg-white">
    <h3 className="font-bold text-xl mb-2 text-center">
      {treatment.name}
    </h3>
    <IconArray data={treatment.data} />
  </div>
);

import IconArray from "@/features/results/components/IconArray";

interface OutcomeData {
  name: string;
  value: number;
  color: string;
  Icon: React.ElementType;
}

interface UrinaryLeakageChartForPdfProps {
  treatment: {
    name: string;
    data: OutcomeData[];
  };
}

export const UrinaryLeakageChartForPdf = ({
  treatment,
}: UrinaryLeakageChartForPdfProps) => (
  <div className="p-4 bg-white">
    <h3 className="font-bold text-xl mb-2 text-center">
      {treatment.name === "RadioTherapy" ? "Radiotherapy" : treatment.name}
    </h3>
    <IconArray data={treatment.data} />
  </div>
);

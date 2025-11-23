import IconArray from "@/features/results/components/IconArray";
import React from 'react';

interface OutcomeData {
    name: string;
    value: number;
    color: string;
    Icon?: React.ElementType;
}

interface ProblemWithUrgencyChartForPdfProps {
    treatment: {
        name: string;
        data: OutcomeData[];
    };
}

export const ProblemWithUrgencyChartForPdf = ({ treatment }: ProblemWithUrgencyChartForPdfProps) => (
    <div className="p-4 bg-white">
        <h3 className="font-bold text-xl mb-2 text-center">
            {treatment.name}
        </h3>
        <IconArray data={treatment.data} />
    </div>
);

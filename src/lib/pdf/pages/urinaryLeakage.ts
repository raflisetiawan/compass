import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderChartsNonBlocking } from '../utils';
import urinaryLeakageData from "@/assets/leaking_urine_at_one_year.json";
import { UrinaryLeakageChartForPdf } from '@/features/results/components/UrinaryLeakageChartForPdf';
import FilledSun from "@/features/results/components/FilledSun";
import FilledDroplet from "@/features/results/components/FilledDroplet";

export const addUrinaryLeakagePage = async ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 3: Leaking urine at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Leaking urine at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same leaking status as you. The icon plot shows how their leaking status changes at 1 year from starting their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    const baselineLeakageStatus = (() => {
        const leakage = answers.urine_leak || "Rarely or never";
        if (String(leakage).includes("day")) return "At least once a day";
        if (String(leakage).includes("week")) return "At least once a week";
        return "Rarely or never";
    })();

    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];
    const treatmentOutcomes = treatments.map((treatment) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const treatmentData = (urinaryLeakageData as any)[treatment]["Baseline urine leakage"][baselineLeakageStatus];
        let rarely = Math.round(treatmentData["Rarely or never"]);
        const weekly = Math.round(treatmentData["At least once a week"]);
        const daily = Math.round(treatmentData["At least once a day"]);

        const total = rarely + weekly + daily;
        if (total !== 100) {
            rarely -= total - 100;
        }

        return {
            name: treatment,
            data: [
                { name: "Rarely or never leaking", value: rarely, color: "#FFC107", Icon: FilledSun },
                { name: "Leaking once a week or more", value: weekly, color: "#64B5F6", Icon: FilledDroplet },
                { name: "Leaking once a day or more", value: daily, color: "#1976D2", Icon: FilledDroplet },
            ],
        };
    });

    // Render all charts with non-blocking approach
    const chartConfigs = treatmentOutcomes.map(treatment => ({
        Component: UrinaryLeakageChartForPdf,
        props: { treatment }
    }));
    const imageDataUrls = await renderChartsNonBlocking(chartConfigs);

    const colGutter = 5;
    const fourColWidth = (pdfWidth - (margin * 2) - (colGutter * 3)) / 4;
    // Estimate height based on typical chart aspect ratio
    const imgHeight = fourColWidth * 1.5;

    const yPos = 45;

    imageDataUrls.forEach((dataUrl, idx) => {
        const xPos = margin + (fourColWidth + colGutter) * idx;
        doc.addImage(dataUrl, 'JPEG', xPos, yPos, fourColWidth, imgHeight);
    });

    const rowMaxHeight = imgHeight;
    const tableY = yPos + rowMaxHeight + 10;

    const tableBody = treatmentOutcomes.map(t => {
        return [
            t.name,
            `${t.data[0].value}%`,
            `${t.data[1].value}%`,
            `${t.data[2].value}%`,
        ];
    });

    autoTable(doc, {
        startY: tableY,
        head: [['Treatment', 'Rarely or never leaking', 'Leaking once a week or more', 'Leaking once a day or more']],
        body: tableBody,
        theme: 'grid',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let summaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Summary', margin, summaryY);
    summaryY += 6;
    doc.setFontSize(10);

    treatmentOutcomes.forEach(treatment => {
        const summaryText = `For men who choose ${treatment.name}: ${treatment.data.map(d => `${d.value}% will be ${d.name.toLowerCase()}`).join(', ')}.`;
        const splitText = doc.splitTextToSize(summaryText, doc.internal.pageSize.getWidth() - margin * 2);
        doc.text(splitText, margin, summaryY);
        summaryY += (splitText.length * 5) + 5;
    });
};

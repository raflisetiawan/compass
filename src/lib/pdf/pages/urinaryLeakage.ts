import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderChartToImage } from '../utils';
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

    const canvases = [];
    for (const treatment of treatmentOutcomes) {
        canvases.push(await renderChartToImage(UrinaryLeakageChartForPdf, { treatment }));
    }

    const colGutter = 5; // Reduced gutter for 4 columns
    const fourColWidth = (pdfWidth - (margin * 2) - (colGutter * 3)) / 4;

    const getSafeHeight = (canvas: HTMLCanvasElement, width: number) => {
        if (!canvas || !canvas.width) return 0;
        return (canvas.height * width) / canvas.width;
    };

    const imgHeight1 = getSafeHeight(canvases[0], fourColWidth);
    const imgHeight2 = getSafeHeight(canvases[1], fourColWidth);
    const imgHeight3 = getSafeHeight(canvases[2], fourColWidth);
    const imgHeight4 = getSafeHeight(canvases[3], fourColWidth);

    const yPos = 45;

    doc.addImage(canvases[0].toDataURL('image/jpeg', 0.85), 'JPEG', margin, yPos, fourColWidth, imgHeight1);
    doc.addImage(canvases[1].toDataURL('image/jpeg', 0.85), 'JPEG', margin + fourColWidth + colGutter, yPos, fourColWidth, imgHeight2);
    doc.addImage(canvases[2].toDataURL('image/jpeg', 0.85), 'JPEG', margin + (fourColWidth + colGutter) * 2, yPos, fourColWidth, imgHeight3);
    doc.addImage(canvases[3].toDataURL('image/jpeg', 0.85), 'JPEG', margin + (fourColWidth + colGutter) * 3, yPos, fourColWidth, imgHeight4);

    const rowMaxHeight = Math.max(imgHeight1, imgHeight2, imgHeight3, imgHeight4);
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

import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderChartToImage } from '../utils';
import urinaryBotherData from "@/assets/urinary_bother.json";
import { UrinaryBotherChartForPdf } from '@/features/results/components/UrinaryBotherChartForPdf';

export const addUrinaryBotherPage = async ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 5: Bother with urinary function at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Bother with urinary function at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same urinary bother as you. The icon plot shows how their urinary bother changes at 1 year from starting their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    const baselineBotherStatus = (() => {
        const bother = answers.urine_problem || 'No problem';
        if (String(bother).includes("Very/small")) return "Very/small problem";
        if (String(bother).includes("Moderate/big")) return "Moderate/big problem";
        return "No problem";
    })();

    const botherTreatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];
    const botherTreatmentOutcomes = botherTreatments.map((treatment) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const treatmentData = (urinaryBotherData as any)[treatment]["Baseline urinary bother"][baselineBotherStatus];
        let noProblem = Math.round(treatmentData["No problem"]);
        const smallProblem = Math.round(treatmentData["Very/small problem"]);
        const bigProblem = Math.round(treatmentData["Moderate/big problem"]);

        const total = noProblem + smallProblem + bigProblem;
        if (total !== 100) {
            noProblem -= total - 100;
        }

        return {
            name: treatment,
            data: [
                { name: "No problem", value: noProblem, color: "#1B5E20" },
                { name: "Very/small problem", value: smallProblem, color: "#FBC02D" },
                { name: "Moderate/big problem", value: bigProblem, color: "#D32F2F" },
            ],
        };
    });

    const botherCanvases = [];
    for (const treatment of botherTreatmentOutcomes) {
        botherCanvases.push(await renderChartToImage(UrinaryBotherChartForPdf, { treatment }));
    }

    const colGutter = 5;
    const fourColWidth = (pdfWidth - (margin * 2) - (colGutter * 3)) / 4;

    const getSafeHeight = (canvas: HTMLCanvasElement, width: number) => {
        if (!canvas || !canvas.width) return 0;
        return (canvas.height * width) / canvas.width;
    };

    const botherImgHeight1 = getSafeHeight(botherCanvases[0], fourColWidth);
    const botherImgHeight2 = getSafeHeight(botherCanvases[1], fourColWidth);
    const botherImgHeight3 = getSafeHeight(botherCanvases[2], fourColWidth);
    const botherImgHeight4 = getSafeHeight(botherCanvases[3], fourColWidth);

    const yPos = 45;

    doc.addImage(botherCanvases[0].toDataURL('image/jpeg', 0.85), 'JPEG', margin, yPos, fourColWidth, botherImgHeight1);
    doc.addImage(botherCanvases[1].toDataURL('image/jpeg', 0.85), 'JPEG', margin + fourColWidth + colGutter, yPos, fourColWidth, botherImgHeight2);
    doc.addImage(botherCanvases[2].toDataURL('image/jpeg', 0.85), 'JPEG', margin + (fourColWidth + colGutter) * 2, yPos, fourColWidth, botherImgHeight3);
    doc.addImage(botherCanvases[3].toDataURL('image/jpeg', 0.85), 'JPEG', margin + (fourColWidth + colGutter) * 3, yPos, fourColWidth, botherImgHeight4);

    const botherRowMaxHeight = Math.max(botherImgHeight1, botherImgHeight2, botherImgHeight3, botherImgHeight4);
    const botherTableY = yPos + botherRowMaxHeight + 10;

    const botherTableBody = botherTreatmentOutcomes.map(t => {
        return [
            t.name,
            `${t.data[0].value}%`,
            `${t.data[1].value}%`,
            `${t.data[2].value}%`,
        ];
    });

    autoTable(doc, {
        startY: botherTableY,
        head: [['Treatment', 'No problem', 'Very/small problem', 'Moderate/big problem']],
        body: botherTableBody,
        theme: 'grid',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let botherSummaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Summary', margin, botherSummaryY);
    botherSummaryY += 6;
    doc.setFontSize(10);

    botherTreatmentOutcomes.forEach(treatment => {
        const summaryText = `For men who choose ${treatment.name}: ${treatment.data.map(d => `${d.value}% will have ${d.name.toLowerCase()}`).join(', ')}.`;
        const splitText = doc.splitTextToSize(summaryText, pdfWidth - margin * 2);
        doc.text(splitText, margin, botherSummaryY);
        botherSummaryY += (splitText.length * 5) + 5;
    });
};

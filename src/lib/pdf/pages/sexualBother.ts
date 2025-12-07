import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderChartToImage } from '../utils';
import erectileBotherData from "@/assets/erectile_bother.json";
import { SexualBotherChartForPdf } from '@/features/results/components/SexualBotherChartForPdf';

export const addSexualBotherPage = async ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 7: Bother with erectile function at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Bother with erectile function at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same degree of bother with their erectile function as you. The icon plot shows how the degree of their sexual bother changes at 1 year from starting their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    const baselineSexualBotherStatus = (() => {
        const bother = answers.erection_bother || "Not a problem";
        if (String(bother).includes("Moderate") || String(bother).includes("big")) return "Moderate/big problem";
        if (String(bother).includes("Very") || String(bother).includes("small")) return "Very/small problem";
        return "No problem";
    })();

    const sbTreatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sbData: any = erectileBotherData;

    const sbTreatmentOutcomes = sbTreatments.map((treatment) => {
        const treatmentData = sbData[treatment]["Baseline sexual bother"][baselineSexualBotherStatus];
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
                { name: "Very small or small problem", value: smallProblem, color: "#FBC02D" },
                { name: "Moderate or big problem", value: bigProblem, color: "#D32F2F" },
            ],
        };
    });

    const sbCanvases = [];
    for (const treatment of sbTreatmentOutcomes) {
        sbCanvases.push(await renderChartToImage(SexualBotherChartForPdf, { treatment }));
    }

    const colGutter = 5;
    const fourColWidth = (pdfWidth - (margin * 2) - (colGutter * 3)) / 4;

    const getSafeHeight = (canvas: HTMLCanvasElement, width: number) => {
        if (!canvas || !canvas.width) return 0;
        return (canvas.height * width) / canvas.width;
    };

    const sbImgHeight1 = getSafeHeight(sbCanvases[0], fourColWidth);
    const sbImgHeight2 = getSafeHeight(sbCanvases[1], fourColWidth);
    const sbImgHeight3 = getSafeHeight(sbCanvases[2], fourColWidth);
    const sbImgHeight4 = getSafeHeight(sbCanvases[3], fourColWidth);

    const yPos = 45;

    doc.addImage(sbCanvases[0].toDataURL('image/jpeg', 0.85), 'JPEG', margin, yPos, fourColWidth, sbImgHeight1);
    doc.addImage(sbCanvases[1].toDataURL('image/jpeg', 0.85), 'JPEG', margin + fourColWidth + colGutter, yPos, fourColWidth, sbImgHeight2);
    doc.addImage(sbCanvases[2].toDataURL('image/jpeg', 0.85), 'JPEG', margin + (fourColWidth + colGutter) * 2, yPos, fourColWidth, sbImgHeight3);
    doc.addImage(sbCanvases[3].toDataURL('image/jpeg', 0.85), 'JPEG', margin + (fourColWidth + colGutter) * 3, yPos, fourColWidth, sbImgHeight4);

    const sbRowMaxHeight = Math.max(sbImgHeight1, sbImgHeight2, sbImgHeight3, sbImgHeight4);
    const sbTableY = yPos + sbRowMaxHeight + 10;

    const sbTableBody = sbTreatmentOutcomes.map(t => {
        return [
            t.name,
            `${t.data[0].value}%`,
            `${t.data[1].value}%`,
            `${t.data[2].value}%`,
        ];
    });

    autoTable(doc, {
        startY: sbTableY,
        head: [['Treatment', 'No problem', 'Very small or small problem', 'Moderate or big problem']],
        body: sbTableBody,
        theme: 'grid',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sbSummaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Summary', margin, sbSummaryY);
    sbSummaryY += 6;
    doc.setFontSize(10);

    const sbSummaryIntro = `Based on the information you have entered, for men who are currently experiencing ${baselineSexualBotherStatus.toLowerCase()}, the outcomes at 1 year after treatment are:`;
    const splitSbIntro = doc.splitTextToSize(sbSummaryIntro, pdfWidth - margin * 2);
    doc.text(splitSbIntro, margin, sbSummaryY);
    sbSummaryY += (splitSbIntro.length * 5) + 5;

    sbTreatmentOutcomes.forEach(treatment => {
        doc.setFont('helvetica', 'bold');
        doc.text(`For men who choose ${treatment.name}:`, margin, sbSummaryY);
        sbSummaryY += 5;
        doc.setFont('helvetica', 'normal');

        treatment.data.forEach(d => {
            const bulletText = `• ${d.value}% will experience ${d.name.toLowerCase()}.`;
            const splitBullet = doc.splitTextToSize(bulletText, pdfWidth - margin * 2 - 5);
            doc.text(splitBullet, margin + 5, sbSummaryY);
            sbSummaryY += (splitBullet.length * 5);
        });
        sbSummaryY += 3;
    });
};

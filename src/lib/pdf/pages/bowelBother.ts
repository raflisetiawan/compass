import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderChartToImage } from '../utils';
import bowelBotherData from "@/assets/bowel_bother.json";
import { BowelBotherChartForPdf } from '@/features/results/components/BowelBotherChartForPdf';

export const addBowelBotherPage = async ({ doc, answers, margin, gutter, imgWidth, pdfWidth }: PdfPageProps) => {
    // Page 9: Bowel bother at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Bowel bother at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same degree of bother with their bowel function as you. The icon plot shows how the degree of their bowel bother changes at 1 year from starting their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    const baselineBowelBotherStatus = (() => {
        const bother = answers.bowel_bother || "Not a problem";
        if (String(bother).includes("Moderate") || String(bother).includes("big")) return "Moderate/big problem";
        if (String(bother).includes("Very") || String(bother).includes("small")) return "Very/small problem";
        return "No problem";
    })();

    const bbTreatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bbData: any = bowelBotherData;

    const bbTreatmentOutcomes = bbTreatments.map((treatment) => {
        const treatmentData = bbData[treatment]["Baseline bowel bother"][baselineBowelBotherStatus];
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

    const bbCanvases = await Promise.all(bbTreatmentOutcomes.map(async (treatment) => {
        return renderChartToImage(BowelBotherChartForPdf, { treatment });
    }));

    const bbImgHeight1 = (bbCanvases[0].height * imgWidth) / bbCanvases[0].width;
    const bbImgHeight2 = (bbCanvases[1].height * imgWidth) / bbCanvases[1].width;

    doc.addImage(bbCanvases[0].toDataURL('image/jpeg', 0.85), 'JPEG', margin, 45, imgWidth, bbImgHeight1);
    doc.addImage(bbCanvases[1].toDataURL('image/jpeg', 0.85), 'JPEG', margin + imgWidth + gutter, 45, imgWidth, bbImgHeight2);

    const bbRow1MaxHeight = Math.max(bbImgHeight1, bbImgHeight2);
    const bbYPosRow2 = 45 + bbRow1MaxHeight + 10;

    const bbImgHeight3 = (bbCanvases[2].height * imgWidth) / bbCanvases[2].width;
    const bbImgHeight4 = (bbCanvases[3].height * imgWidth) / bbCanvases[3].width;

    doc.addImage(bbCanvases[2].toDataURL('image/jpeg', 0.85), 'JPEG', margin, bbYPosRow2, imgWidth, bbImgHeight3);
    doc.addImage(bbCanvases[3].toDataURL('image/jpeg', 0.85), 'JPEG', margin + imgWidth + gutter, bbYPosRow2, imgWidth, bbImgHeight4);

    const bbRow2MaxHeight = Math.max(bbImgHeight3, bbImgHeight4);
    const bbTableY = bbYPosRow2 + bbRow2MaxHeight + 10;

    const bbTableBody = bbTreatmentOutcomes.map(t => {
        return [
            t.name,
            `${t.data[0].value}%`,
            `${t.data[1].value}%`,
            `${t.data[2].value}%`,
        ];
    });

    autoTable(doc, {
        startY: bbTableY,
        head: [['Treatment', 'No problem', 'Very small or small problem', 'Moderate or big problem']],
        body: bbTableBody,
        theme: 'grid',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bbSummaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Summary', margin, bbSummaryY);
    bbSummaryY += 6;
    doc.setFontSize(10);

    const bbSummaryIntro = `Based on the information you have entered, for men who are currently experiencing ${baselineBowelBotherStatus.toLowerCase()}, the outcomes at 1 year after treatment are:`;
    const splitBbIntro = doc.splitTextToSize(bbSummaryIntro, pdfWidth - margin * 2);
    doc.text(splitBbIntro, margin, bbSummaryY);
    bbSummaryY += (splitBbIntro.length * 5) + 5;

    bbTreatmentOutcomes.forEach(treatment => {
        doc.setFont('helvetica', 'bold');
        doc.text(`For men who choose ${treatment.name}:`, margin, bbSummaryY);
        bbSummaryY += 5;
        doc.setFont('helvetica', 'normal');

        treatment.data.forEach(d => {
            const bulletText = `• ${d.value}% will experience ${d.name.toLowerCase()}.`;
            const splitBullet = doc.splitTextToSize(bulletText, pdfWidth - margin * 2 - 5);
            doc.text(splitBullet, margin + 5, bbSummaryY);
            bbSummaryY += (splitBullet.length * 5);
        });
        bbSummaryY += 3;
    });
};

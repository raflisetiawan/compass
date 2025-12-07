import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderChartToImage } from '../utils';
import problemWithUrgencyData from "@/assets/problem_with_bowel_urgency.json";
import { ProblemWithUrgencyChartForPdf } from '@/features/results/components/ProblemWithUrgencyChartForPdf';

export const addBowelUrgencyPage = async ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 8: Problem with bowel urgency at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Problem with bowel urgency at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same problem with bowel urgency as you. The icon plot show how their degree of problem with bowel urgency changes at 1 year from starting their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    const baselineUrgencyStatus = (() => {
        const urgency = answers.bowel_urgency || "No problem";
        if (urgency === "No problem") return "No_problem";
        if (urgency === "Very small" || urgency === "Small") return "Very_small_problem";
        if (urgency === "Moderate" || urgency === "Big problem") return "Moderate_big_problem";
        return "No_problem";
    })();

    const urgencyTreatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const urgencyData: any = {
        "Active Surveillance": problemWithUrgencyData.Active_Surveillance,
        "Focal Therapy": problemWithUrgencyData.Focal,
        "Surgery": problemWithUrgencyData.Surgery,
        "Radiotherapy": problemWithUrgencyData.EBRT,
    };

    const urgencyTreatmentOutcomes = urgencyTreatments.map((treatment) => {
        const treatmentData = urgencyData[treatment].Baseline[baselineUrgencyStatus];

        let noProblem = Math.round(treatmentData["No_problem_%"]);
        const smallProblem = Math.round(treatmentData["Very_small_problem_%"]);
        const bigProblem = Math.round(treatmentData["Moderate_big_problem_%"]);

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

    const urgencyCanvases = [];
    for (const treatment of urgencyTreatmentOutcomes) {
        urgencyCanvases.push(await renderChartToImage(ProblemWithUrgencyChartForPdf, { treatment }));
    }

    const colGutter = 5;
    const fourColWidth = (pdfWidth - (margin * 2) - (colGutter * 3)) / 4;

    const getSafeHeight = (canvas: HTMLCanvasElement, width: number) => {
        if (!canvas || !canvas.width) return 0;
        return (canvas.height * width) / canvas.width;
    };

    const urgencyImgHeight1 = getSafeHeight(urgencyCanvases[0], fourColWidth);
    const urgencyImgHeight2 = getSafeHeight(urgencyCanvases[1], fourColWidth);
    const urgencyImgHeight3 = getSafeHeight(urgencyCanvases[2], fourColWidth);
    const urgencyImgHeight4 = getSafeHeight(urgencyCanvases[3], fourColWidth);

    const yPos = 45;

    doc.addImage(urgencyCanvases[0].toDataURL('image/jpeg', 0.85), 'JPEG', margin, yPos, fourColWidth, urgencyImgHeight1);
    doc.addImage(urgencyCanvases[1].toDataURL('image/jpeg', 0.85), 'JPEG', margin + fourColWidth + colGutter, yPos, fourColWidth, urgencyImgHeight2);
    doc.addImage(urgencyCanvases[2].toDataURL('image/jpeg', 0.85), 'JPEG', margin + (fourColWidth + colGutter) * 2, yPos, fourColWidth, urgencyImgHeight3);
    doc.addImage(urgencyCanvases[3].toDataURL('image/jpeg', 0.85), 'JPEG', margin + (fourColWidth + colGutter) * 3, yPos, fourColWidth, urgencyImgHeight4);

    const urgencyRowMaxHeight = Math.max(urgencyImgHeight1, urgencyImgHeight2, urgencyImgHeight3, urgencyImgHeight4);
    const urgencyTableY = yPos + urgencyRowMaxHeight + 10;

    const urgencyTableBody = urgencyTreatmentOutcomes.map(t => {
        return [
            t.name,
            `${t.data[0].value}%`,
            `${t.data[1].value}%`,
            `${t.data[2].value}%`,
        ];
    });

    autoTable(doc, {
        startY: urgencyTableY,
        head: [['Treatment', 'No problem', 'Very small or small problem', 'Moderate or big problem']],
        body: urgencyTableBody,
        theme: 'grid',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let urgencySummaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Summary', margin, urgencySummaryY);
    urgencySummaryY += 6;
    doc.setFontSize(10);

    const urgencySummaryIntro = `Based on the information you have entered, for men who are currently experiencing a "${baselineUrgencyStatus.replace(/_/g, ' ').toLowerCase()}", the outcomes at 1 year after treatment are:`;
    const splitUrgencyIntro = doc.splitTextToSize(urgencySummaryIntro, pdfWidth - margin * 2);
    doc.text(splitUrgencyIntro, margin, urgencySummaryY);
    urgencySummaryY += (splitUrgencyIntro.length * 5) + 5;

    urgencyTreatmentOutcomes.forEach(treatment => {
        doc.setFont('helvetica', 'bold');
        doc.text(`For men who choose ${treatment.name}:`, margin, urgencySummaryY);
        urgencySummaryY += 5;
        doc.setFont('helvetica', 'normal');

        treatment.data.forEach(d => {
            const bulletText = `• ${d.value}% will experience a "${d.name.toLowerCase()}".`;
            const splitBullet = doc.splitTextToSize(bulletText, pdfWidth - margin * 2 - 5);
            doc.text(splitBullet, margin + 5, urgencySummaryY);
            urgencySummaryY += (splitBullet.length * 5);
        });
        urgencySummaryY += 3;
    });
};

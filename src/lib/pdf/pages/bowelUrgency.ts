import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderChartToImage } from '../utils';
import problemWithUrgencyData from "@/assets/problem_with_bowel_urgency.json";
import { ProblemWithUrgencyChartForPdf } from '@/features/results/components/ProblemWithUrgencyChartForPdf';
import WaterClosetOutlined from "@/components/icons/WaterClosetOutlined";
import WaterClosetGray from "@/components/icons/WaterClosetGray";
import WaterClosetBlack from "@/components/icons/WaterClosetBlack";
import React from 'react';

export const addBowelUrgencyPage = async ({ doc, answers, margin, gutter, imgWidth, pdfWidth }: PdfPageProps) => {
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { name: "No problem", value: noProblem, color: "black", Icon: (props: any) => React.createElement(WaterClosetOutlined, { ...props }) },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { name: "Very small or small problem", value: smallProblem, color: "#808080", Icon: (props: any) => React.createElement(WaterClosetGray, { ...props }) },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { name: "Moderate or big problem", value: bigProblem, color: "black", Icon: (props: any) => React.createElement(WaterClosetBlack, { ...props }) },
            ],
        };
    });

    const urgencyCanvases = await Promise.all(urgencyTreatmentOutcomes.map(async (treatment) => {
        return renderChartToImage(ProblemWithUrgencyChartForPdf, { treatment });
    }));

    const urgencyImgHeight1 = (urgencyCanvases[0].height * imgWidth) / urgencyCanvases[0].width;
    const urgencyImgHeight2 = (urgencyCanvases[1].height * imgWidth) / urgencyCanvases[1].width;

    doc.addImage(urgencyCanvases[0].toDataURL('image/jpeg', 0.85), 'JPEG', margin, 45, imgWidth, urgencyImgHeight1);
    doc.addImage(urgencyCanvases[1].toDataURL('image/jpeg', 0.85), 'JPEG', margin + imgWidth + gutter, 45, imgWidth, urgencyImgHeight2);

    const urgencyRow1MaxHeight = Math.max(urgencyImgHeight1, urgencyImgHeight2);
    const urgencyYPosRow2 = 45 + urgencyRow1MaxHeight + 10;

    const urgencyImgHeight3 = (urgencyCanvases[2].height * imgWidth) / urgencyCanvases[2].width;
    const urgencyImgHeight4 = (urgencyCanvases[3].height * imgWidth) / urgencyCanvases[3].width;

    doc.addImage(urgencyCanvases[2].toDataURL('image/jpeg', 0.85), 'JPEG', margin, urgencyYPosRow2, imgWidth, urgencyImgHeight3);
    doc.addImage(urgencyCanvases[3].toDataURL('image/jpeg', 0.85), 'JPEG', margin + imgWidth + gutter, urgencyYPosRow2, imgWidth, urgencyImgHeight4);

    const urgencyRow2MaxHeight = Math.max(urgencyImgHeight3, urgencyImgHeight4);
    const urgencyTableY = urgencyYPosRow2 + urgencyRow2MaxHeight + 10;

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

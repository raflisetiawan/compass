import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderChartToImage, toDataURL } from '../utils';
import urinaryPadData from "@/assets/use_of_urinary_pads_at_one_year.json";
import { UrinaryPadUsageChartForPdf } from '@/features/results/components/UrinaryPadUsageChartForPdf';

export const addUrinaryPadPage = async ({ doc, answers, margin, gutter, imgWidth, pdfWidth }: PdfPageProps) => {
    // Page 4: Use of urinary pads at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Use of urinary pads at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same pad usage as you. The icon plot shows how their pad usage changes at 1 year from starting their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    const baselinePadStatus = (() => {
        const padUsage = answers.pad_usage || 'No pads';
        if (String(padUsage).includes("2 or more")) return "Using two or more pads a day";
        if (String(padUsage).includes("1 pad")) return "Using one pad a day";
        return "Not using pad";
    })();

    const padTreatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];


    const padTreatmentOutcomes = padTreatments.map((treatment) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const treatmentData = (urinaryPadData as any)[treatment]["Pad status at baseline"][baselinePadStatus];
        let noPads = Math.round(treatmentData["Not using pad"]);
        const onePad = Math.round(treatmentData["Using one pad a day"]);
        const twoOrMorePads = Math.round(treatmentData["Using two or more pads a day"]);

        const total = noPads + onePad + twoOrMorePads;
        if (total !== 100) {
            noPads -= total - 100;
        }

        return {
            name: treatment,
            data: [
                { name: "No use of pad; rarely or never leaking urine", value: noPads, color: "#1B5E20" },
                { name: "1 pad used per day; any degree of leaking urine", value: onePad, color: "#FBC02D" },
                { name: ">=2 pad used per day; any degree of leaking urine", value: twoOrMorePads, color: "#D32F2F" },
            ],
        };
    });

    const padCanvases = await Promise.all(padTreatmentOutcomes.map(async (treatment) => {
        return renderChartToImage(UrinaryPadUsageChartForPdf, { treatment });
    }));

    const padImgHeight1 = (padCanvases[0].height * imgWidth) / padCanvases[0].width;
    const padImgHeight2 = (padCanvases[1].height * imgWidth) / padCanvases[1].width;

    doc.addImage(padCanvases[0].toDataURL('image/jpeg', 0.85), 'JPEG', margin, 45, imgWidth, padImgHeight1);
    doc.addImage(padCanvases[1].toDataURL('image/jpeg', 0.85), 'JPEG', margin + imgWidth + gutter, 45, imgWidth, padImgHeight2);

    const padRow1MaxHeight = Math.max(padImgHeight1, padImgHeight2);
    const padYPosRow2 = 45 + padRow1MaxHeight + 10;

    const padImgHeight3 = (padCanvases[2].height * imgWidth) / padCanvases[2].width;
    const padImgHeight4 = (padCanvases[3].height * imgWidth) / padCanvases[3].width;

    doc.addImage(padCanvases[2].toDataURL('image/jpeg', 0.85), 'JPEG', margin, padYPosRow2, imgWidth, padImgHeight3);
    doc.addImage(padCanvases[3].toDataURL('image/jpeg', 0.85), 'JPEG', margin + imgWidth + gutter, padYPosRow2, imgWidth, padImgHeight4);

    const padRow2MaxHeight = Math.max(padImgHeight3, padImgHeight4);
    const padTableY = padYPosRow2 + padRow2MaxHeight + 10;

    const padTableBody = padTreatmentOutcomes.map(t => {
        return [
            t.name,
            `${t.data[0].value}%`,
            `${t.data[1].value}%`,
            `${t.data[2].value}%`,
        ];
    });

    autoTable(doc, {
        startY: padTableY,
        head: [['Treatment', 'No use of pad; rarely or never leaking urine', '1 pad used per day; any degree of leaking urine', '>=2 pad used per day; any degree of leaking urine']],
        body: padTableBody,
        theme: 'grid',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let padSummaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Summary', margin, padSummaryY);
    padSummaryY += 6;
    doc.setFontSize(10);

    const padSummaryIntro = `Based on the information you have entered, for men who are currently ${baselinePadStatus.toLowerCase()}, the outcomes at 1 year after treatment are:`;
    const splitPadIntro = doc.splitTextToSize(padSummaryIntro, pdfWidth - margin * 2);
    doc.text(splitPadIntro, margin, padSummaryY);
    padSummaryY += (splitPadIntro.length * 5) + 5;

    padTreatmentOutcomes.forEach(treatment => {
        doc.setFont('helvetica', 'bold');
        doc.text(`For men who choose ${treatment.name}:`, margin, padSummaryY);
        padSummaryY += 5;
        doc.setFont('helvetica', 'normal');

        treatment.data.forEach(d => {
            const bulletText = `• ${d.value}%: ${d.name}`;
            const splitBullet = doc.splitTextToSize(bulletText, pdfWidth - margin * 2 - 5);
            doc.text(splitBullet, margin + 5, padSummaryY);
            padSummaryY += (splitBullet.length * 5);
        });
        padSummaryY += 3; // Add some space between treatments
    });
};

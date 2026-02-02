import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderMultipleChartsToDataUrl } from '../canvas';
import urinaryPadData from "@/assets/use_of_urinary_pads_at_one_year.json";

export const addUrinaryPadPage = ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 4: Use of urinary pads at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Use of urinary pads at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same pad usage as you. The icon plot shows how their pad usage changes at 1 year from starting their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    // Check if urinary pad usage question was answered
    if (!answers.pad_usage) {
        // Display "Data not available" message
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 128, 128);
        doc.text('Data not available', margin, 50);
        doc.setFontSize(10);
        doc.text('The urinary pad usage question was not answered in the questionnaire.', margin, 60);
        doc.text('Please complete the questionnaire to see personalized predictions.', margin, 68);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        return;
    }

    // Helper function to get display name for baseline status
    const getBaselineDisplayName = (status: string): string => {
        if (status === "Not using pad") return "No use of pad; rarely or never leaking urine";
        if (status === "Using one pad a day") return "1 pad used per day; any degree of leaking urine";
        if (status === "Using two or more pads a day") return "≥2 pad used per day; any degree of leaking urine";
        return status;
    };

    // Helper function to get color for baseline status
    const getBaselineColor = (status: string): { r: number, g: number, b: number } => {
        if (status === "Not using pad") return { r: 27, g: 94, b: 32 }; // #1B5E20
        if (status === "Using one pad a day") return { r: 251, g: 192, b: 45 }; // #FBC02D
        return { r: 211, g: 47, b: 47 }; // #D32F2F
    };

    const baselinePadStatus = (() => {
        const padUsage = answers.pad_usage;
        if (String(padUsage).includes("2 or more") || String(padUsage).includes("3 or more")) return "Using two or more pads a day";
        if (String(padUsage).includes("1 pad")) return "Using one pad a day";
        return "Not using pad";
    })();

    // Draw current status box
    const statusBoxY = 42;
    const statusColor = getBaselineColor(baselinePadStatus);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Your current use of pad and leaking status:', margin, statusBoxY);
    
    // Draw colored circle
    const circleX = margin + 3;
    const circleY = statusBoxY + 7;
    doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
    doc.circle(circleX, circleY, 2.5, 'F');
    
    // Draw status text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(getBaselineDisplayName(baselinePadStatus), circleX + 5, circleY + 1);

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
                { name: "No use of pad; rarely or never leaking urine", value: noPads, color: "#1B5E20", iconType: 'circle' as const },
                { name: "1 pad used per day; any degree of leaking urine", value: onePad, color: "#FBC02D", iconType: 'circle' as const },
                { name: ">=2 pad used per day; any degree of leaking urine", value: twoOrMorePads, color: "#D32F2F", iconType: 'circle' as const },
            ],
        };
    });

    // Render all charts using direct canvas (synchronous, no html2canvas)
    const chartConfigs = padTreatmentOutcomes.map(treatment => ({
        title: treatment.name,
        data: treatment.data
    }));
    const chartResults = renderMultipleChartsToDataUrl(chartConfigs);

    const colGutter = 5;
    const fourColWidth = (pdfWidth - (margin * 2) - (colGutter * 3)) / 4;
    
    // Calculate height based on actual aspect ratio from first chart to preserve circle shapes
    const firstChart = chartResults[0];
    const aspectRatio = firstChart ? firstChart.height / firstChart.width : 1.5;
    const imgHeight = fourColWidth * aspectRatio;

    const yPos = 58; // Adjusted to accommodate status box

    chartResults.forEach((chartResult, idx) => {
        const xPos = margin + (fourColWidth + colGutter) * idx;
        doc.addImage(chartResult.dataUrl, 'JPEG', xPos, yPos, fourColWidth, imgHeight);
    });

    const padRowMaxHeight = imgHeight;
    const padTableY = yPos + padRowMaxHeight + 10;

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

import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderMultipleChartsToDataUrl } from '../canvas';
import urinaryPadData from "@/assets/use_of_urinary_pads_at_one_year.json";
import underwearIcon from "@/assets/img/icons/underwear.svg";
import padIcon from "@/assets/img/icons/pad.svg";
import darkPadIcon from "@/assets/img/icons/dark-pad.svg";
import { loadImages } from '../utils';

export const addUrinaryPadPage = async ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 4: Use of urinary pads at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Use of urinary pads at 1 year', 14, 22);

    // Check if urinary pad usage question was answered
    if (!answers.pad_usage) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 128, 128);
        const skippedMsg = 'No information has been entered for these parameters and as a result no personalised prediction is available. If you would like to have a personalised prediction, you can answer the questionnaire again.';
        const skippedLines = doc.splitTextToSize(skippedMsg, doc.internal.pageSize.getWidth() - margin * 2);
        doc.text(skippedLines, margin, 35);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        return;
    }

    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same pad usage as you. The icon plot shows how their pad usage changes at 1 year from starting their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    // Load SVG icon images for rendering
    const [underwearImg, padImg, darkPadImg] = await loadImages([underwearIcon, padIcon, darkPadIcon]);

    // Helper function to get display name for baseline status
    const getBaselineDisplayName = (status: string): string => {
        if (status === "Not using pad") return "No use of pad; rarely or never leaking urine";
        if (status === "Using one pad a day") return "1 pad used per day; any degree of leaking urine";
        if (status === "Using two or more pads a day") return "≥2 pad used per day; any degree of leaking urine";
        return status;
    };

    const baselinePadStatus = (() => {
        const padUsage = answers.pad_usage;
        if (String(padUsage).includes("2 or more") || String(padUsage).includes("3 or more")) return "Using two or more pads a day";
        if (String(padUsage).includes("1 pad")) return "Using one pad a day";
        return "Not using pad";
    })();

    // Draw current status box
    const statusBoxY = 42;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Your current use of pad and leaking status:', margin, statusBoxY);
    
    // Draw baseline icon image - convert SVG to PNG via canvas for jsPDF
    const baselineIconImg = baselinePadStatus.includes("two or more") ? darkPadImg :
        baselinePadStatus.includes("one pad") ? padImg : underwearImg;
    const iconSize = 5;
    const iconY = statusBoxY + 3;
    // Render the SVG image to a canvas to get a PNG data URL (jsPDF can't use SVG directly)
    const legendCanvas = document.createElement('canvas');
    legendCanvas.width = 40;
    legendCanvas.height = 40;
    const legendCtx = legendCanvas.getContext('2d');
    if (legendCtx) {
        legendCtx.drawImage(baselineIconImg, 0, 0, 40, 40);
        const legendDataUrl = legendCanvas.toDataURL('image/png');
        doc.addImage(legendDataUrl, 'PNG', margin + 1, iconY, iconSize, iconSize);
    }
    
    // Draw status text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(getBaselineDisplayName(baselinePadStatus), margin + iconSize + 4, iconY + 3.5);

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
                { name: "No use of pad; rarely or never leaking urine", value: noPads, color: "#FFFFFF", iconType: 'image' as const, imageElement: underwearImg },
                { name: "1 pad used per day; any degree of leaking urine", value: onePad, color: "#64B5F6", iconType: 'image' as const, imageElement: padImg },
                { name: ">=2 pad used per day; any degree of leaking urine", value: twoOrMorePads, color: "#1976D2", iconType: 'image' as const, imageElement: darkPadImg },
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
        styles: { fontSize: 11, cellPadding: 3 },
        headStyles: { fontSize: 10 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let padSummaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, padSummaryY);
    padSummaryY += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const padSummaryIntro = `Out of 100 men like you who are currently ${baselinePadStatus.toLowerCase()}, the outcomes at 1 year after treatment are:`;
    const splitPadIntro = doc.splitTextToSize(padSummaryIntro, pdfWidth - margin * 2);
    doc.text(splitPadIntro, margin, padSummaryY);
    padSummaryY += (splitPadIntro.length * 5) + 3;

    // 2-column layout for treatment summaries
    const summaryColWidth = (pdfWidth - margin * 2 - 10) / 2;
    const leftX = margin;
    const rightX = margin + summaryColWidth + 10;

    const leftTreatments = padTreatmentOutcomes.slice(0, 2);
    const rightTreatments = padTreatmentOutcomes.slice(2);

    const renderColumn = (treatments: typeof padTreatmentOutcomes, startX: number, startY: number) => {
        let y = startY;
        treatments.forEach(treatment => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(`For men who choose ${treatment.name}:`, startX, y);
            y += 4;
            doc.setFont('helvetica', 'normal');

            treatment.data.forEach(d => {
                const bulletText = `• ${d.value} out of 100: ${d.name}`;
                const splitBullet = doc.splitTextToSize(bulletText, summaryColWidth - 5);
                doc.text(splitBullet, startX + 3, y);
                y += splitBullet.length * 4;
            });
            y += 2;
        });
    };

    renderColumn(leftTreatments, leftX, padSummaryY);
    renderColumn(rightTreatments, rightX, padSummaryY);
};

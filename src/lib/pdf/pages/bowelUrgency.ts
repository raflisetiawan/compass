import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderMultipleChartsToDataUrl } from '../canvas';
import { drawPaperRoll } from '../canvas';
import problemWithUrgencyData from "@/assets/problem_with_bowel_urgency.json";

export const addBowelUrgencyPage = ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 8: Problem with bowel urgency at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Problem with bowel urgency at 1 year', 14, 22);

    // Check if bowel urgency question was answered
    if (!answers.bowel_urgency) {
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
    doc.text('The following graphs represent 100 men with the same problem with bowel urgency as you. The icon plot show how their degree of problem with bowel urgency changes at 1 year from starting their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    // Helper function to get display name for baseline status
    const getBaselineDisplayName = (status: string): string => {
        if (status === "No_problem") return "No problem";
        if (status === "Very_small_problem") return "Very small or small problem";
        if (status === "Moderate_big_problem") return "Moderate or big problem";
        return status.replace(/_/g, ' ');
    };

    // Helper function to get color for baseline status
    const getBaselineColor = (status: string): { r: number, g: number, b: number } => {
        if (status === "No_problem") return { r: 27, g: 94, b: 32 }; // #1b5e20
        if (status === "Very_small_problem") return { r: 255, g: 193, b: 7 }; // #ffc107
        return { r: 220, g: 53, b: 69 }; // #dc3545
    };

    const baselineUrgencyStatus = (() => {
        const urgency = answers.bowel_urgency;
        if (String(urgency).includes("No problem") || String(urgency).includes("Not a problem")) return "No_problem";
        if (String(urgency).includes("Very") || String(urgency).includes("small") || String(urgency).includes("Small")) return "Very_small_problem";
        if (String(urgency).includes("Moderate") || String(urgency).includes("Big") || String(urgency).includes("big")) return "Moderate_big_problem";
        return "No_problem";
    })();

    // Draw current status box
    const statusBoxY = 42;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Your current bowel urgency status:', margin, statusBoxY);
    
    // Draw paper roll icon for status
    const iconSize = 10;
    const iconY = statusBoxY + 3;
    const statusColor = getBaselineColor(baselineUrgencyStatus);
    
    // Create a small canvas and draw the paper roll, then add as image to PDF
    const miniCanvas = document.createElement('canvas');
    const canvasSize = 40;
    miniCanvas.width = canvasSize;
    miniCanvas.height = canvasSize;
    const miniCtx = miniCanvas.getContext('2d');
    if (miniCtx) {
        drawPaperRoll(miniCtx, { x: 0, y: 0, size: canvasSize, color: `rgb(${statusColor.r},${statusColor.g},${statusColor.b})` });
        const miniDataUrl = miniCanvas.toDataURL('image/png');
        doc.addImage(miniDataUrl, 'PNG', margin + 1, iconY, iconSize, iconSize);
    }
    
    // Draw status text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(getBaselineDisplayName(baselineUrgencyStatus), margin + iconSize + 4, iconY + 4);

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
                { name: "No problem", value: noProblem, color: "#1b5e20", iconType: 'paperroll' as const },

                { name: "Very small or small problem", value: smallProblem, color: "#ffc107", iconType: 'paperroll' as const },

                { name: "Moderate or big problem", value: bigProblem, color: "#dc3545", iconType: 'paperroll' as const },
            ],
        };
    });

    // Render all charts using direct canvas (synchronous, no html2canvas)
    const chartConfigs = urgencyTreatmentOutcomes.map(treatment => ({
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

    const urgencyRowMaxHeight = imgHeight;
    const urgencyTableY = yPos + urgencyRowMaxHeight + 10;

    // Table - matching webpage layout: treatments as columns, outcomes as rows
    const outcomeNames = ['No problem', 'Very small or small problem', 'Moderate or big problem'];
    const urgencyTableHead = ['Outcome', ...urgencyTreatmentOutcomes.map(t => t.name)];
    const urgencyTableBody = outcomeNames.map((outcomeName, idx) => {
        return [
            outcomeName,
            ...urgencyTreatmentOutcomes.map(t => `${t.data[idx].value}%`),
        ];
    });

    autoTable(doc, {
        startY: urgencyTableY,
        head: [urgencyTableHead],
        body: urgencyTableBody,
        theme: 'grid',
        styles: { fontSize: 11, cellPadding: 3 },
        headStyles: { fontSize: 10 },
        columnStyles: { 0: { cellWidth: 'auto' } },
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

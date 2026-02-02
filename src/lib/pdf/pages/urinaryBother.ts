import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderMultipleChartsToDataUrl } from '../canvas';
import urinaryBotherData from "@/assets/urinary_bother.json";

export const addUrinaryBotherPage = ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 5: Bother with urinary function at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Bother with urinary function at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same urinary bother as you. The icon plot shows how their urinary bother changes at 1 year from starting their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    // Check if urinary bother question was answered
    if (!answers.urine_problem) {
        // Display "Data not available" message
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 128, 128);
        doc.text('Data not available', margin, 50);
        doc.setFontSize(10);
        doc.text('The urinary bother question was not answered in the questionnaire.', margin, 60);
        doc.text('Please complete the questionnaire to see personalized predictions.', margin, 68);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        return;
    }

    // Helper function to get display name for baseline status
    const getBaselineDisplayName = (status: string): string => {
        if (status === "No problem") return "No problem";
        if (status === "Very/small problem") return "Very small or small problem";
        if (status === "Moderate/big problem") return "Moderate or big problem";
        return status;
    };

    // Helper function to get color for baseline status
    const getBaselineColor = (status: string): { r: number, g: number, b: number } => {
        if (status === "No problem") return { r: 27, g: 94, b: 32 }; // #1b5e20
        if (status === "Very/small problem") return { r: 255, g: 193, b: 7 }; // #ffc107
        return { r: 220, g: 53, b: 69 }; // #dc3545
    };

    const baselineBotherStatus = (() => {
        const bother = answers.urine_problem;
        if (String(bother).includes("Moderate") || String(bother).includes("big") || String(bother).includes("Big")) 
            return "Moderate/big problem";
        if (String(bother).includes("Very") || String(bother).includes("small") || String(bother).includes("Small"))
            return "Very/small problem";
        return "No problem";
    })();

    // Draw current status box
    const statusBoxY = 42;
    const statusColor = getBaselineColor(baselineBotherStatus);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Your current urinary bother status:', margin, statusBoxY);
    
    // Draw colored circle
    const circleX = margin + 3;
    const circleY = statusBoxY + 7;
    doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
    doc.circle(circleX, circleY, 2.5, 'F');
    
    // Draw status text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(getBaselineDisplayName(baselineBotherStatus), circleX + 5, circleY + 1);

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
                { name: "No problem", value: noProblem, color: "#1b5e20" },
                { name: "Very small or small problem", value: smallProblem, color: "#ffc107" },
                { name: "Moderate or big problem", value: bigProblem, color: "#dc3545" },
            ],
        };
    });

    // Render all charts using direct canvas (synchronous, no html2canvas)
    const chartConfigs = botherTreatmentOutcomes.map(treatment => ({
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

    const botherRowMaxHeight = imgHeight;
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
        head: [['Treatment', 'No problem', 'Very small or small problem', 'Moderate or big problem']],
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

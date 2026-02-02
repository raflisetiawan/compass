import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderMultipleChartsToDataUrl } from '../canvas';
import problemWithUrgencyData from "@/assets/problem_with_bowel_urgency.json";

export const addBowelUrgencyPage = ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 8: Problem with bowel urgency at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Problem with bowel urgency at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same problem with bowel urgency as you. The icon plot show how their degree of problem with bowel urgency changes at 1 year from starting their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    // Check if bowel urgency question was answered
    if (!answers.bowel_urgency) {
        // Display "Data not available" message
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 128, 128);
        doc.text('Data not available', margin, 50);
        doc.setFontSize(10);
        doc.text('The bowel urgency question was not answered in the questionnaire.', margin, 60);
        doc.text('Please complete the questionnaire to see personalized predictions.', margin, 68);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        return;
    }

    // Helper function to get display name for baseline status
    const getBaselineDisplayName = (status: string): string => {
        if (status === "No_problem") return "No problem";
        if (status === "Very_small_problem") return "Very small or small problem";
        if (status === "Moderate_big_problem") return "Moderate or big problem";
        return status.replace(/_/g, ' ');
    };

    // Helper function to get color for baseline status
    const getBaselineColor = (status: string): { r: number, g: number, b: number } => {
        if (status === "No_problem") return { r: 27, g: 94, b: 32 }; // #1B5E20
        if (status === "Very_small_problem") return { r: 251, g: 192, b: 45 }; // #FBC02D
        return { r: 211, g: 47, b: 47 }; // #D32F2F
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
    const statusColor = getBaselineColor(baselineUrgencyStatus);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Your current bowel urgency status:', margin, statusBoxY);
    
    // Draw colored circle
    const circleX = margin + 3;
    const circleY = statusBoxY + 7;
    doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
    doc.circle(circleX, circleY, 2.5, 'F');
    
    // Draw status text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(getBaselineDisplayName(baselineUrgencyStatus), circleX + 5, circleY + 1);

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

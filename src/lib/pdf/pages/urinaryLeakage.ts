import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderMultipleChartsToDataUrl, type IconData } from '../canvas';
import urinaryLeakageData from "@/assets/leaking_urine_at_one_year.json";

export const addUrinaryLeakagePage = ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 3: Leaking urine at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Leaking urine at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same leaking status as you. The icon plot shows how their leaking status changes at 1 year from starting their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    // Check if urinary leakage question was answered
    if (!answers.urine_leak) {
        // Display "Data not available" message
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 128, 128);
        doc.text('Data not available', margin, 50);
        doc.setFontSize(10);
        doc.text('The urinary leakage question was not answered in the questionnaire.', margin, 60);
        doc.text('Please complete the questionnaire to see personalized predictions.', margin, 68);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        return;
    }

    // Helper function to get display name for baseline status
    const getBaselineDisplayName = (status: string): string => {
        if (status === "Rarely or never") return "Rarely or never leaking";
        if (status === "At least once a week") return "Leaking once a week or more";
        if (status === "At least once a day") return "Leaking once a day or more";
        return status;
    };

    // Helper function to get color for baseline status
    const getBaselineColor = (status: string): { r: number, g: number, b: number } => {
        if (status === "Rarely or never") return { r: 255, g: 193, b: 7 }; // #FFC107 (sun/yellow)
        if (status === "At least once a week") return { r: 100, g: 181, b: 246 }; // #64B5F6 (light blue)
        return { r: 25, g: 118, b: 210 }; // #1976D2 (dark blue)
    };

    const baselineLeakageStatus = (() => {
        const leakage = answers.urine_leak;
        if (String(leakage).includes("day")) return "At least once a day";
        if (String(leakage).includes("week")) return "At least once a week";
        return "Rarely or never";
    })();

    // Draw current status box
    const statusBoxY = 42;
    const statusColor = getBaselineColor(baselineLeakageStatus);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Your current leaking urine status:', margin, statusBoxY);
    
    // Draw water droplet icon
    const dropletX = margin + 3;
    const dropletY = statusBoxY + 5;
    const dropletSize = 2.5;
    
    doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
    
    // Draw droplet shape using lines (teardrop shape)
    // Start from top point, curve down to rounded bottom
    doc.triangle(
        dropletX, dropletY,                           // Top point
        dropletX - dropletSize, dropletY + dropletSize * 1.5,  // Bottom left
        dropletX + dropletSize, dropletY + dropletSize * 1.5,  // Bottom right
        'F'
    );
    // Draw bottom circle to complete the droplet
    doc.circle(dropletX, dropletY + dropletSize * 1.5, dropletSize, 'F');
    
    // Draw status text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(getBaselineDisplayName(baselineLeakageStatus), dropletX + 5, dropletY + 3);

    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];
    const treatmentOutcomes = treatments.map((treatment) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const treatmentData = (urinaryLeakageData as any)[treatment]["Baseline urine leakage"][baselineLeakageStatus];
        let rarely = Math.round(treatmentData["Rarely or never"]);
        const weekly = Math.round(treatmentData["At least once a week"]);
        const daily = Math.round(treatmentData["At least once a day"]);

        const total = rarely + weekly + daily;
        if (total !== 100) {
            rarely -= total - 100;
        }

        return {
            name: treatment,
            data: [
                { name: "Rarely or never leaking", value: rarely, color: "#FFC107", iconType: 'sun' as const },
                { name: "Leaking once a week or more", value: weekly, color: "#64B5F6", iconType: 'droplet' as const },
                { name: "Leaking once a day or more", value: daily, color: "#1976D2", iconType: 'droplet' as const },
            ] as IconData[],
        };
    });

    // Render all charts using direct canvas (synchronous, no html2canvas)
    const chartConfigs = treatmentOutcomes.map(treatment => ({
        title: treatment.name === "RadioTherapy" ? "Radiotherapy" : treatment.name,
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

    const rowMaxHeight = imgHeight;
    const tableY = yPos + rowMaxHeight + 10;

    const tableBody = treatmentOutcomes.map(t => {
        return [
            t.name,
            `${t.data[0].value}%`,
            `${t.data[1].value}%`,
            `${t.data[2].value}%`,
        ];
    });

    autoTable(doc, {
        startY: tableY,
        head: [['Treatment', 'Rarely or never leaking', 'Leaking once a week or more', 'Leaking once a day or more']],
        body: tableBody,
        theme: 'grid',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let summaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Summary', margin, summaryY);
    summaryY += 6;
    doc.setFontSize(10);

    treatmentOutcomes.forEach(treatment => {
        const summaryText = `For men who choose ${treatment.name}: ${treatment.data.map(d => `${d.value}% will be ${d.name.toLowerCase()}`).join(', ')}.`;
        const splitText = doc.splitTextToSize(summaryText, doc.internal.pageSize.getWidth() - margin * 2);
        doc.text(splitText, margin, summaryY);
        summaryY += (splitText.length * 5) + 5;
    });
};


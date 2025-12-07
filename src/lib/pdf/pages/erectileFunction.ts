import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderMultipleChartsToDataUrl, type IconData } from '../canvas';
import erectileFunctionData from "@/assets/erectile_function_with_assist.json";

export const addErectileFunctionPage = ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 6: Erectile function at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Erectile function at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same erectile function as you. The icon plot shows how erectile function changes at 1 year from their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    const baselineErectileStatus = (() => {
        const quality = answers.erection_quality || "Firm enough for intercourse";
        const useMedication = answers.sex_medication === "Yes";

        if (quality === "Firm enough for intercourse") {
            return useMedication ? "Firm for intercourse - with assist" : "Firm for intercourse - no assist";
        }
        if (quality === "Firm enough for masturbation and foreplay only") {
            return useMedication ? "Firm for masturbation - with assist" : "Firm for masturbation - no assist";
        }
        if (quality === "Not firm enough for any sexual activity") {
            return useMedication ? "Not firm - with assist" : "Not firm - no assist";
        }
        if (quality === "None at all") {
            return useMedication ? "None at all - with assist" : "None at all - no assist";
        }
        
        // Default fallback
        return "Firm for intercourse - no assist";
    })();

    // Helper function to get color for baseline status
    const getBaselineColor = (status: string): { r: number, g: number, b: number } => {
        if (status.includes("Firm for intercourse")) return { r: 27, g: 94, b: 32 }; // #1b5e20
        if (status.includes("Firm for masturbation")) return { r: 255, g: 193, b: 7 }; // #ffc107
        return { r: 220, g: 53, b: 69 }; // #dc3545
    };

    // Draw current status box
    const statusBoxY = 42;
    const statusColor = getBaselineColor(baselineErectileStatus);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Your current erectile function status:', margin, statusBoxY);
    
    // Draw colored circle
    const circleX = margin + 3;
    const circleY = statusBoxY + 7;
    const circleRadius = 2.5;
    doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
    doc.circle(circleX, circleY, circleRadius, 'F');
    
    // Check if "with assist" - draw pill icon INSIDE the circle
    const isWithAssist = baselineErectileStatus.includes("with assist");
    let textStartX = circleX + 5;
    
    if (isWithAssist) {
        // Draw pill inside the circle (matching iconRenderers.ts drawCircleWithPill)
        const size = circleRadius * 2; // diameter
        const pillWidth = size * 0.6;
        const pillHeight = size * 0.35;
        const pillRadius = pillHeight / 2;
        const pillX = circleX - pillWidth / 2;
        const pillY = circleY - pillHeight / 2;
        
        // Left half (blue)
        doc.setFillColor(0, 123, 255); // #007bff
        doc.roundedRect(pillX, pillY, pillWidth / 2 + pillRadius/2, pillHeight, pillRadius, pillRadius, 'F');
        
        // Right half (white) - draw slightly overlapping to avoid gap
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(pillX + pillWidth / 2 - pillRadius/2, pillY, pillWidth / 2 + pillRadius/2, pillHeight, pillRadius, pillRadius, 'F');
        
        // Draw outline
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.roundedRect(pillX, pillY, pillWidth, pillHeight, pillRadius, pillRadius, 'S');
        
        // Center dividing line
        doc.line(pillX + pillWidth / 2, pillY, pillX + pillWidth / 2, pillY + pillHeight);
        
        textStartX = circleX + 5;
    }
    
    // Draw status text (using the getBaselineDisplayName helper defined later)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const statusDisplayName = (() => {
        if (baselineErectileStatus.includes("Firm for intercourse")) {
            return baselineErectileStatus.includes("with assist") 
                ? "Firm enough for intercourse (with medication/device)"
                : "Firm enough for intercourse";
        }
        if (baselineErectileStatus.includes("Firm for masturbation")) {
            return baselineErectileStatus.includes("with assist")
                ? "Firm enough for masturbation only (with medication/device)"
                : "Firm enough for masturbation only";
        }
        if (baselineErectileStatus.includes("Not firm")) {
            return baselineErectileStatus.includes("with assist")
                ? "Not firm enough for any sexual activity (with medication/device)"
                : "Not firm enough for any sexual activity";
        }
        if (baselineErectileStatus.includes("None at all")) {
            return baselineErectileStatus.includes("with assist")
                ? "None at all (with medication/device)"
                : "None at all";
        }
        return baselineErectileStatus;
    })();
    doc.text(statusDisplayName, textStartX, circleY + 1);

    const efTreatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];
    const efData = erectileFunctionData;

    const efTreatmentOutcomes = efTreatments.map((treatment) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const treatmentData = (efData as any)[treatment]["Baseline quality of erection"][baselineErectileStatus];
        const N = treatmentData.N;

        if (N === 0) {
            return {
                name: treatment,
                data: [
                    { name: "Firm enough for intercourse", value: 0, color: '#1b5e20' },
                    { name: "Firm enough for masturbation only", value: 0, color: '#ffc107' },
                    { name: "Not firm enough for any sexual activity or none at all", value: 0, color: '#dc3545' },
                ] as IconData[]
            };
        }

        // Detailed categories matching Web logic
        const categories = [
            {
                name: "Firm for intercourse - no assist",
                displayName: "Firm enough for intercourse",
                value: treatmentData["Firm for intercourse - no assist"],
                color: "#1b5e20",
                iconType: 'circle' as const
            },
            {
                name: "Firm for intercourse - with assist",
                displayName: "Firm enough for intercourse (with assist)",
                value: treatmentData["Firm for intercourse - with assist"],
                color: "#1b5e20",
                iconType: 'pill' as const
            },
            {
                name: "Firm for masturbation - no assist",
                displayName: "Firm enough for masturbation only",
                value: treatmentData["Firm for masturbation - no assist"],
                color: "#ffc107",
                iconType: 'circle' as const
            },
            {
                name: "Firm for masturbation - with assist",
                displayName: "Firm enough for masturbation only (with assist)",
                value: treatmentData["Firm for masturbation - with assist"],
                color: "#ffc107",
                iconType: 'pill' as const
            },
            {
                name: "Not firm - no assist",
                displayName: "Not firm enough for any sexual activity",
                value: treatmentData["Not firm - no assist"],
                color: "#dc3545",
                iconType: 'circle' as const
            },
            {
                name: "Not firm - with assist",
                displayName: "Not firm enough for any sexual activity (with assist)",
                value: treatmentData["Not firm - with assist"],
                color: "#dc3545",
                iconType: 'pill' as const
            },
            {
                name: "None at all - no assist",
                displayName: "None at all",
                value: treatmentData["None at all - no assist"],
                color: "#dc3545",
                iconType: 'circle' as const
            },
            {
                name: "None at all - with assist",
                displayName: "None at all (with assist)",
                value: treatmentData["None at all - with assist"],
                color: "#dc3545",
                iconType: 'pill' as const
            }
        ];

        // Round each value
        const roundedData = categories.map(item => ({
            ...item,
            value: Math.round(item.value)
        }));

        // Adjust total to ensure it equals 100%
        const total = roundedData.reduce((sum, item) => sum + item.value, 0);
        const diff = total - 100;

        if (diff !== 0) {
            // Find the item with the highest value to adjust
            const maxIndex = roundedData.reduce((maxIdx, item, idx, arr) =>
                item.value > arr[maxIdx].value ? idx : maxIdx, 0);
            roundedData[maxIndex].value -= diff;
        }

        // Return all 8 categories (no filtering)
        const displayData = roundedData.map(item => ({
            name: item.displayName,
            value: item.value,
            color: item.color,
            iconType: item.iconType
        })) as IconData[];

        return {
            name: treatment,
            data: displayData,
            rawData: roundedData, // Keep raw data for table
        };
    });

    // Render all charts using direct canvas (synchronous, no html2canvas)
    const chartConfigs = efTreatmentOutcomes.map(treatment => ({
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

    const efRowMaxHeight = imgHeight;
    const efTableY = yPos + efRowMaxHeight + 10;

    // Build table with all 8 columns matching web
    const efTableBody = efTreatmentOutcomes.map(t => {
        return [
            t.name,
            `${t.data[0]?.value || 0}%`,  // Firm for intercourse - no assist
            `${t.data[1]?.value || 0}%`,  // Firm for intercourse - with assist
            `${t.data[2]?.value || 0}%`,  // Firm for masturbation - no assist
            `${t.data[3]?.value || 0}%`,  // Firm for masturbation - with assist
            `${t.data[4]?.value || 0}%`,  // Not firm - no assist
            `${t.data[5]?.value || 0}%`,  // Not firm - with assist
            `${t.data[6]?.value || 0}%`,  // None at all - no assist
            `${t.data[7]?.value || 0}%`,  // None at all - with assist
        ];
    });

    autoTable(doc, {
        startY: efTableY,
        head: [[
            'Treatment',
            'Firm intercourse (no assist)',
            'Firm intercourse (with assist)',
            'Firm masturbation (no assist)',
            'Firm masturbation (with assist)',
            'Not firm (no assist)',
            'Not firm (with assist)',
            'None (no assist)',
            'None (with assist)'
        ]],
        body: efTableBody,
        theme: 'grid',
        styles: { fontSize: 7 },
        headStyles: { fontSize: 6 },
    });

    // Helper function to get user-friendly baseline name
    const getBaselineDisplayName = (status: string): string => {
        if (status.includes("Firm for intercourse")) {
            return status.includes("with assist") 
                ? "firm enough for intercourse (with medication/device)"
                : "firm enough for intercourse";
        }
        if (status.includes("Firm for masturbation")) {
            return status.includes("with assist")
                ? "firm enough for masturbation and foreplay only (with medication/device)"
                : "firm enough for masturbation and foreplay only";
        }
        if (status.includes("Not firm")) {
            return status.includes("with assist")
                ? "not firm enough for any sexual activity (with medication/device)"
                : "not firm enough for any sexual activity";
        }
        if (status.includes("None at all")) {
            return status.includes("with assist")
                ? "none at all (with medication/device)"
                : "none at all";
        }
        return status.toLowerCase();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let efSummaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Summary', margin, efSummaryY);
    efSummaryY += 6;
    doc.setFontSize(10);

    const efSummaryIntro = `Based on the information you have entered, for men who currently have erections that are ${getBaselineDisplayName(baselineErectileStatus)}, the outcomes at 1 year after treatment are:`;
    const splitEfIntro = doc.splitTextToSize(efSummaryIntro, pdfWidth - margin * 2);
    doc.text(splitEfIntro, margin, efSummaryY);
    efSummaryY += (splitEfIntro.length * 5) + 5;

    efTreatmentOutcomes.forEach(treatment => {
        doc.setFont('helvetica', 'bold');
        doc.text(`For men who choose ${treatment.name}:`, margin, efSummaryY);
        efSummaryY += 5;
        doc.setFont('helvetica', 'normal');

        treatment.data.forEach(d => {
            const bulletText = `• ${d.value}% will have erections that are ${d.name.toLowerCase()}.`;
            const splitBullet = doc.splitTextToSize(bulletText, pdfWidth - margin * 2 - 5);
            doc.text(splitBullet, margin + 5, efSummaryY);
            efSummaryY += (splitBullet.length * 5);
        });
        efSummaryY += 3;
    });
};

import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderMultipleChartsToDataUrl, type IconData } from '../canvas';
import erectileFunctionData from "@/assets/erectile_function_with_assist.json";

export const addErectileFunctionPage = ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 6: Erectile function at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Erectile function at 1 year', 14, 22);

    // Check if erectile function question was answered
    if (!answers.erection_quality) {
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
    doc.text('The following graphs represent 100 men with the same erectile function as you. The icon plot shows how erectile function changes at 1 year from their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    const baselineErectileStatus = (() => {
        const quality = answers.erection_quality;
        const useMedication = answers.sex_medication === "Yes";

        if (quality === "Firm enough for intercourse") {
            return useMedication ? "Firm for intercourse - with assist" : "Firm for intercourse - no assist";
        }
        if (quality === "Firm enough for masturbation and foreplay only") {
            return useMedication ? "Firm for masturbation - with assist" : "Firm for masturbation - no assist";
        }
        if (quality === "Not firm enough for any sexual activity" || quality === "None at all") {
            return useMedication ? "Not firm or none - with assist" : "Not firm or none - no assist";
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
        if (baselineErectileStatus.includes("Not firm or none") || baselineErectileStatus.includes("Not firm") || baselineErectileStatus.includes("None at all")) {
            return baselineErectileStatus.includes("with assist")
                ? "Not firm enough for any sexual activity or none at all (with medication/device)"
                : "Not firm enough for any sexual activity or none at all";
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
                displayName: "Firm enough for intercourse (with medication/device)",
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
                displayName: "Firm enough for masturbation only (with medication/device)",
                value: treatmentData["Firm for masturbation - with assist"],
                color: "#ffc107",
                iconType: 'pill' as const
            },
            {
                name: "Not firm or none - no assist",
                displayName: "Not firm enough for any sexual activity or none at all",
                value: treatmentData["Not firm or none - no assist"],
                color: "#dc3545",
                iconType: 'circle' as const
            },
            {
                name: "Not firm or none - with assist",
                displayName: "Not firm enough for any sexual activity or none at all (with medication/device)",
                value: treatmentData["Not firm or none - with assist"],
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

    // Build table with 6 columns matching web
    const efTableBody = efTreatmentOutcomes.map(t => {
        return [
            t.name,
            `${t.data[0]?.value || 0}%`,  // Firm for intercourse - no assist
            `${t.data[1]?.value || 0}%`,  // Firm for intercourse - with assist
            `${t.data[2]?.value || 0}%`,  // Firm for masturbation - no assist
            `${t.data[3]?.value || 0}%`,  // Firm for masturbation - with assist
            `${t.data[4]?.value || 0}%`,  // Not firm or none - no assist
            `${t.data[5]?.value || 0}%`,  // Not firm or none - with assist
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
            'Not firm / None (no assist)',
            'Not firm / None (with assist)'
        ]],
        body: efTableBody,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fontSize: 9 },
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
        if (status.includes("Not firm or none") || status.includes("Not firm") || status.includes("None at all")) {
            return status.includes("with assist")
                ? "not firm enough for any sexual activity or none at all (with medication/device)"
                : "not firm enough for any sexual activity or none at all";
        }
        return status.toLowerCase();
    };

    // Summary on a new page (erectile function has 6 categories per treatment, too long for same page)
    doc.addPage();
    let efSummaryY = 22;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary - Erectile function at 1 year', margin, efSummaryY);
    efSummaryY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const efSummaryIntro = `Out of 100 men like you who currently have erections that are ${getBaselineDisplayName(baselineErectileStatus)}, the outcomes at 1 year after treatment are:`;
    const splitEfIntro = doc.splitTextToSize(efSummaryIntro, pdfWidth - margin * 2);
    doc.text(splitEfIntro, margin, efSummaryY);
    efSummaryY += (splitEfIntro.length * 5) + 3;

    // 2-column layout for treatment summaries
    const summaryColWidth = (pdfWidth - margin * 2 - 10) / 2;
    const leftX = margin;
    const rightX = margin + summaryColWidth + 10;

    const leftTreatments = efTreatmentOutcomes.slice(0, 2);
    const rightTreatments = efTreatmentOutcomes.slice(2);

    const renderColumn = (treatments: typeof efTreatmentOutcomes, startX: number, startY: number) => {
        let y = startY;
        treatments.forEach(treatment => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(`For men who choose ${treatment.name}:`, startX, y);
            y += 4;
            doc.setFont('helvetica', 'normal');

            treatment.data.forEach(d => {
                const bulletText = `• ${d.value} out of 100 will have erections that are ${d.name.toLowerCase()}.`;
                const splitBullet = doc.splitTextToSize(bulletText, summaryColWidth - 5);
                doc.text(splitBullet, startX + 3, y);
                y += splitBullet.length * 4;
            });
            y += 2;
        });
    };

    renderColumn(leftTreatments, leftX, efSummaryY);
    renderColumn(rightTreatments, rightX, efSummaryY);
};

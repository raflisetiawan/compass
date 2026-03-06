import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderMultipleChartsToDataUrl } from '../canvas';
import { drawDashedBorder } from '../canvas/iconRenderers';
import { calculateAllStrategies } from '@/utils/riskRetreatmentUtils';

export const addRiskRetreatmentPage = ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Risk & Retreatment Equations', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs show the predicted treatment outcomes based on your clinical parameters. Each icon plot represents 100 patients with similar characteristics, showing the probability distribution of requiring additional treatment or retreatment.', 14, 30, { maxWidth: 180 });

    // Calculate outcomes
    const strategyResults = calculateAllStrategies(answers);
    const treatmentOutcomes = [
        { name: "Active Surveillance", ...strategyResults.activeSurveillance },
        { name: "Focal Therapy", ...strategyResults.focalTherapy },
        { name: "Surgery", ...strategyResults.surgery },
        { name: "Radiotherapy", ...strategyResults.radiotherapy },
    ];

    // Legend
    let legendY = 46;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('What Icon Means:', margin, legendY);
    legendY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const legendItems = [
        { color: '#1b5e20', label: 'No treatment (i.e. Active surveillance only)' },
        { color: '#90EE90', label: 'First treatment only (i.e. Focal therapy, Prostatectomy, Radiotherapy)' },
        { color: '#FFEB3B', label: 'Second round of additional focal treatment' },
        { color: '#FFEB3B', label: 'Progressed to radiotherapy or surgery after a second round of additional focal therapy', borderColor: '#FF9800' },
        { color: '#FF9800', label: 'Progressed to different treatment' },
    ];

    legendItems.forEach(item => {
        // Draw circle
        const hexColor = item.color.replace('#', '');
        const r = parseInt(hexColor.substring(0, 2), 16);
        const g = parseInt(hexColor.substring(2, 4), 16);
        const b = parseInt(hexColor.substring(4, 6), 16);

        doc.setFillColor(r, g, b);
        doc.circle(margin + 3, legendY, 2.5, 'F');

        if (item.borderColor) {
            // Draw dashed border via canvas (jsPDF doesn't support dashed circles natively)
            const dashCanvas = document.createElement('canvas');
            const dashSize = 40;
            dashCanvas.width = dashSize;
            dashCanvas.height = dashSize;
            const dashCtx = dashCanvas.getContext('2d');
            if (dashCtx) {
                // Draw filled circle first
                dashCtx.beginPath();
                dashCtx.arc(dashSize / 2, dashSize / 2, dashSize / 2, 0, Math.PI * 2);
                dashCtx.fillStyle = item.color;
                dashCtx.fill();
                // Draw dashed border
                drawDashedBorder(dashCtx, { x: 0, y: 0, size: dashSize, color: item.color }, item.borderColor);
                const dashDataUrl = dashCanvas.toDataURL('image/png');
                // Replace the solid circle with this dashed one
                doc.addImage(dashDataUrl, 'PNG', margin + 0.5, legendY - 2.5, 5, 5);
            }
        }

        doc.setTextColor(0, 0, 0);
        const lines = doc.splitTextToSize(item.label, pdfWidth - margin * 2 - 12);
        doc.text(lines, margin + 8, legendY + 1);
        legendY += lines.length * 4 + 2;
    });

    // Render icon arrays for treatments without errors
    const validTreatments = treatmentOutcomes.filter(t => !t.error);

    if (validTreatments.length > 0) {
        const chartConfigs = validTreatments.map(treatment => ({
            title: treatment.name,
            data: treatment.data.map(d => ({
                name: d.name,
                value: d.value,
                color: d.color,
                borderColor: d.borderColor,
            }))
        }));
        const chartResults = renderMultipleChartsToDataUrl(chartConfigs);

        const colGutter = 5;
        const colCount = validTreatments.length;
        const colWidth = (pdfWidth - (margin * 2) - (colGutter * (colCount - 1))) / colCount;

        const firstChart = chartResults[0];
        const aspectRatio = firstChart ? firstChart.height / firstChart.width : 1.5;
        const imgHeight = colWidth * aspectRatio;

        const yPos = legendY + 5;

        chartResults.forEach((chartResult, idx) => {
            const xPos = margin + (colWidth + colGutter) * idx;
            doc.addImage(chartResult.dataUrl, 'JPEG', xPos, yPos, colWidth, imgHeight);
        });

        // Table - matching webpage layout: treatments as columns, outcomes as rows
        const tableY = yPos + imgHeight + 10;

        // Get all unique outcome names from all treatments
        const outcomeNames = Array.from(
            new Set(validTreatments.flatMap(t => t.data.map(d => d.name)))
        );

        const tableHead = ['Outcome', ...validTreatments.map(t => t.name)];
        const tableBody = outcomeNames.map(outcomeName => {
            return [
                outcomeName,
                ...validTreatments.map(treatment => {
                    const item = treatment.data.find(d => d.name === outcomeName);
                    return item ? `${item.value}%` : '-';
                })
            ];
        });

        autoTable(doc, {
            startY: tableY,
            head: [tableHead],
            body: tableBody,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 'auto' },
            },
        });

        // Summary
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let summaryY = (doc as any).lastAutoTable.finalY + 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary', margin, summaryY);
        summaryY += 5;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        const summaryIntro = 'Based on your clinical parameters, here is the predicted probability of requiring additional treatment for each treatment option:';
        const splitIntro = doc.splitTextToSize(summaryIntro, pdfWidth - margin * 2);
        doc.text(splitIntro, margin, summaryY);
        summaryY += (splitIntro.length * 4) + 3;

        // 2-column layout for treatment summaries
        const summaryColWidth = (pdfWidth - margin * 2 - 10) / 2; // 10 = gutter between columns
        const leftX = margin;
        const rightX = margin + summaryColWidth + 10;

        // Split treatments into left and right columns
        const leftTreatments = treatmentOutcomes.slice(0, 2);
        const rightTreatments = treatmentOutcomes.slice(2);

        const renderTreatmentColumn = (treatments: typeof treatmentOutcomes, startX: number, startY: number): number => {
            let y = startY;
            treatments.forEach(treatment => {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.text(`${treatment.name}:`, startX, y);
                y += 4;
                doc.setFont('helvetica', 'normal');

                if (treatment.error) {
                    const errorLines = doc.splitTextToSize(treatment.error, summaryColWidth - 5);
                    doc.text(errorLines, startX + 3, y);
                    y += errorLines.length * 4;
                } else {
                    treatment.data.forEach(d => {
                        const bulletText = `• ${d.value}% - ${d.name}`;
                        const splitBullet = doc.splitTextToSize(bulletText, summaryColWidth - 5);
                        doc.text(splitBullet, startX + 3, y);
                        y += splitBullet.length * 4;
                    });
                }
                y += 2;
            });
            return y;
        };

        renderTreatmentColumn(leftTreatments, leftX, summaryY);
        renderTreatmentColumn(rightTreatments, rightX, summaryY);
    } else {
        // All treatments have errors
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 128, 128);
        doc.text('Insufficient data to generate risk retreatment predictions.', margin, legendY + 10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
    }
};

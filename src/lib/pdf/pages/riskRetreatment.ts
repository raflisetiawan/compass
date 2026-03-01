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

    // Clinical parameters box
    const boxY = 42;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Clinical Parameters:', margin, boxY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    let paramY = boxY + 6;
    const paramData = [
        { label: 'T Stage', value: answers.cancer_stage || answers.t_stage || 'Not specified' },
        { label: 'Gleason Score', value: answers.gleason_score || answers.gleason || 'Not specified' },
        { label: 'PSA', value: answers.psa ? `${answers.psa} ng/mL` : 'Not specified' },
        { label: 'MRI Visibility', value: answers.mri_pirad_score || answers.mri_visibility || 'Not specified' },
        { label: 'Max Cancer Core Length', value: answers.max_cancer_core_length ? `${answers.max_cancer_core_length} mm` : 'Not specified' },
        {
            label: 'PSA Density',
            value: answers.psa && answers.prostate_volume
                ? (parseFloat(String(answers.psa)) / parseFloat(String(answers.prostate_volume))).toFixed(2)
                : 'Not specified'
        },
    ];

    paramData.forEach(p => {
        doc.text(`${p.label}: ${p.value}`, margin, paramY);
        paramY += 5;
    });

    // Calculate outcomes
    const strategyResults = calculateAllStrategies(answers);
    const treatmentOutcomes = [
        { name: "Active Surveillance", ...strategyResults.activeSurveillance },
        { name: "Focal Therapy", ...strategyResults.focalTherapy },
        { name: "Surgery", ...strategyResults.surgery },
        { name: "Radiotherapy", ...strategyResults.radiotherapy },
    ];

    // Legend
    let legendY = paramY + 4;
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

        // Table
        const tableY = yPos + imgHeight + 10;

        // Get all unique outcome names from all treatments
        const outcomeNames = Array.from(
            new Set(treatmentOutcomes.flatMap(t => t.error ? [] : t.data.map(d => d.name)))
        );

        const tableHead = ['Treatment', ...outcomeNames];
        const tableBody = treatmentOutcomes.map(t => {
            if (t.error) {
                return [t.name, t.error, ...Array(outcomeNames.length - 1).fill('')];
            }
            return [
                t.name,
                ...outcomeNames.map(name => {
                    const item = t.data.find(d => d.name === name);
                    return item ? `${item.value}%` : '-';
                })
            ];
        });

        autoTable(doc, {
            startY: tableY,
            head: [tableHead],
            body: tableBody,
            theme: 'grid',
            styles: { fontSize: 7 },
            headStyles: { fontSize: 7 },
        });

        // Summary
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let summaryY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary', margin, summaryY);
        summaryY += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const summaryIntro = 'Based on your clinical parameters, here is the predicted probability of requiring additional treatment for each treatment option:';
        const splitIntro = doc.splitTextToSize(summaryIntro, pdfWidth - margin * 2);
        doc.text(splitIntro, margin, summaryY);
        summaryY += (splitIntro.length * 5) + 3;

        treatmentOutcomes.forEach(treatment => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${treatment.name}:`, margin, summaryY);
            summaryY += 5;
            doc.setFont('helvetica', 'normal');

            if (treatment.error) {
                doc.text(treatment.error, margin + 5, summaryY);
                summaryY += 5;
            } else {
                treatment.data.forEach(d => {
                    const bulletText = `• ${d.value}% - ${d.name}`;
                    const splitBullet = doc.splitTextToSize(bulletText, pdfWidth - margin * 2 - 5);
                    doc.text(splitBullet, margin + 5, summaryY);
                    summaryY += (splitBullet.length * 5);
                });
            }
            summaryY += 3;
        });
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

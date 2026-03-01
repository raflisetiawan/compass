import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { drawStickMan } from '../canvas';
import { getAgeGroup, getPSARange, getGradeGroup } from '@/services/prediction';
import survivalData from '@/assets/survival_calculation.json';
import type { SurvivalData } from '@/types';
import { calculateAllStrategies } from '@/utils/riskRetreatmentUtils';

export const addSurvivalRetreatmentSummaryPage = ({ doc, answers, margin }: PdfPageProps) => {
    doc.addPage();
    const pdfWidth = doc.internal.pageSize.getWidth();

    // ─── Page Title ───
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Survival and Additional Treatment Summary', margin, 22);
    let currentY = 30;

    // ═══════════════════════════════════════════════
    // ─── Section 1: Survival after prostate cancer ───
    // ═══════════════════════════════════════════════
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Survival after prostate cancer diagnosis', margin, currentY);
    currentY += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const survivalDesc = 'The table below shows the predicted survival outcomes 5 years after receiving a diagnosis of prostate cancer, for 100 men with a cancer like yours.';
    const descLines = doc.splitTextToSize(survivalDesc, pdfWidth - margin * 2);
    doc.text(descLines, margin, currentY);
    currentY += descLines.length * 4 + 4;

    // ─── Clinical Parameters Box ───
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary of clinical parameters used:', margin, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const survivalParams = [
        { label: 'Age', value: String(answers.age || 'Not specified') },
        { label: 'T Stage', value: String(answers.cancer_stage || 'Not specified') },
        { label: 'Gleason Score', value: String(answers.gleason_score || 'Not specified') },
        { label: 'PSA', value: answers.psa ? `${answers.psa} ng/mL` : 'Not specified' },
    ];

    const colWidth = (pdfWidth - margin * 2) / 2;
    survivalParams.forEach((param, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = margin + col * colWidth;
        const y = currentY + row * 5;
        doc.setFont('helvetica', 'normal');
        doc.text(`${param.label}: `, x, y);
        const labelW = doc.getTextWidth(`${param.label}: `);
        doc.setFont('helvetica', 'bold');
        doc.text(param.value, x + labelW, y);
    });
    currentY += Math.ceil(survivalParams.length / 2) * 5 + 4;

    // ─── Survival Calculation ───
    const age = parseInt(String(answers.age || '65'), 10);
    const psa = parseFloat(String(answers.psa || '8'));
    const tStage = String(answers.cancer_stage || 'T2').replace('T', '');
    // T4 and Unknown are not in the dataset
    const isUnsupportedTStage = tStage === '4' || tStage === 'Unknown';
    const effectiveTStage = isUnsupportedTStage ? tStage : ((tStage === '1 or 2' || tStage.toLowerCase().includes('1 or t2')) ? '2' : tStage);
    const gleasonScore = String(answers.gleason_score || '3+4');

    const ageGroup = getAgeGroup(age);
    const psaRange = getPSARange(psa);
    const gradeGroup = getGradeGroup(gleasonScore);

    let survivalOutcome = isUnsupportedTStage ? undefined : (survivalData.Survival as SurvivalData[]).find(
        (item) =>
            item['Age Group'] === ageGroup &&
            String(item['T Stage']) === effectiveTStage &&
            item['Grade Group'] === gradeGroup &&
            item['PSA'] === psaRange
    );

    const hasValidData = (data: SurvivalData | undefined) =>
        data && data['Alive (%)'] !== '' && data['Alive (%)'] != null;

    if (!hasValidData(survivalOutcome) && !isUnsupportedTStage) {
        if (gradeGroup === 1) {
            const fallback = (survivalData.Survival as SurvivalData[]).find(
                (item) =>
                    item['Age Group'] === ageGroup &&
                    String(item['T Stage']) === effectiveTStage &&
                    item['Grade Group'] === 2 &&
                    item['PSA'] === psaRange
            );
            if (hasValidData(fallback)) survivalOutcome = fallback;
        }
    }

    if (survivalOutcome) {
        const survivalIconData = [
            { name: 'Alive', value: Number(survivalOutcome['Alive (%)']), color: '#6B8E23' },
            { name: 'Death (from prostate cancer)', value: Number(survivalOutcome['PCa Death (%)']), color: '#D32F2F' },
            { name: 'Death (from other causes)', value: Number(survivalOutcome['Other Death (%)']), color: '#9E9E9E' },
        ];

        // ─── Legend with stickman icons ───
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('What the icons mean', margin, currentY);
        currentY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        survivalIconData.forEach((item) => {
            const iconSize = 8;
            const miniCanvas = document.createElement('canvas');
            const canvasSize = 40;
            miniCanvas.width = canvasSize;
            miniCanvas.height = canvasSize;
            const miniCtx = miniCanvas.getContext('2d');
            if (miniCtx) {
                drawStickMan(miniCtx, { x: 0, y: 0, size: canvasSize, color: item.color });
                const miniDataUrl = miniCanvas.toDataURL('image/png');
                doc.addImage(miniDataUrl, 'PNG', margin, currentY - iconSize / 2 - 1, iconSize, iconSize);
            }
            doc.setTextColor(0, 0, 0);
            doc.text(`${item.name}: ${item.value.toFixed(1)}%`, margin + iconSize + 3, currentY + 1);
            currentY += 7;
        });

        currentY += 2;

        // ─── Oncological Outcomes Table (matching OncologicalOutcomesTable.tsx) ───
        autoTable(doc, {
            startY: currentY,
            head: [
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [{ content: 'Oncological Outcomes', colSpan: 2, styles: { halign: 'center', fillColor: [74, 111, 165] as any, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 11 } }],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [{ content: 'Time point: 5 years', styles: { fillColor: [212, 197, 226] as any, textColor: [0, 0, 0], fontStyle: 'normal' } },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 { content: '% men', styles: { halign: 'center', fillColor: [164, 217, 108] as any, textColor: [0, 0, 0], fontStyle: 'bold' } }],
            ],
            body: survivalIconData.map(item => [
                { content: item.name, styles: { fontStyle: 'bold' } },
                { content: `${item.value.toFixed(1)}%`, styles: { halign: 'center' } },
            ]),
            theme: 'grid',
            styles: { fontSize: 9 },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            bodyStyles: { fillColor: [248, 229, 241] as any },
            margin: { left: margin, right: margin },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentY = (doc as any).lastAutoTable.finalY + 8;
    } else {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 128, 128);
        doc.text('Survival data is not available for the given clinical parameters.', margin, currentY);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        currentY += 10;
    }

    // ─── Divider ───
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pdfWidth - margin, currentY);
    currentY += 8;

    // ═══════════════════════════════════════════════
    // ─── Section 2: Need for additional treatment ───
    // ═══════════════════════════════════════════════
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Need for additional treatment', margin, currentY);
    currentY += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const treatmentDesc = 'The table below shows the predicted treatment outcomes based on your clinical parameters, including the probability of requiring additional treatment or retreatment.';
    const treatmentDescLines = doc.splitTextToSize(treatmentDesc, pdfWidth - margin * 2);
    doc.text(treatmentDescLines, margin, currentY);
    currentY += treatmentDescLines.length * 4 + 4;

    // ─── Clinical Parameters ───
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Clinical Parameters:', margin, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const retreatmentParams = [
        { label: 'T Stage', value: String(answers.cancer_stage || answers.t_stage || 'Not specified') },
        { label: 'Gleason Score', value: String(answers.gleason_score || answers.gleason || 'Not specified') },
        { label: 'PSA', value: answers.psa ? `${answers.psa} ng/mL` : 'Not specified' },
        { label: 'MRI Visibility', value: String(answers.mri_pirad_score || answers.mri_visibility || 'Not specified') },
        { label: 'Max Cancer Core Length', value: answers.max_cancer_core_length ? `${answers.max_cancer_core_length} mm` : 'Not specified' },
        {
            label: 'PSA Density',
            value: answers.psa && answers.prostate_volume
                ? (parseFloat(String(answers.psa)) / parseFloat(String(answers.prostate_volume))).toFixed(2)
                : 'Not specified',
        },
    ];

    retreatmentParams.forEach((param, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = margin + col * colWidth;
        const y = currentY + row * 5;
        doc.setFont('helvetica', 'normal');
        doc.text(`${param.label}: `, x, y);
        const labelW = doc.getTextWidth(`${param.label}: `);
        doc.setFont('helvetica', 'bold');
        doc.text(param.value, x + labelW, y);
    });
    currentY += Math.ceil(retreatmentParams.length / 2) * 5 + 4;

    // ─── Calculate risk & retreatment ───
    const strategyResults = calculateAllStrategies(answers);
    const treatmentOutcomes = [
        { name: 'Active Surveillance', ...strategyResults.activeSurveillance },
        { name: 'Focal Therapy', ...strategyResults.focalTherapy },
        { name: 'Surgery', ...strategyResults.surgery },
        { name: 'Radiotherapy', ...strategyResults.radiotherapy },
    ];

    const validTreatments = treatmentOutcomes.filter(t => !t.error && t.data.length > 0);

    if (validTreatments.length > 0) {
        // Get all unique outcome names
        const allOutcomeNames = Array.from(
            new Set(validTreatments.flatMap(t => t.data.map(d => d.name)))
        );

        // Build RiskRetreatmentTable: rows = outcomes, columns = treatments
        const tableHead = ['Outcome', ...validTreatments.map(t => t.name)];
        const tableBody = allOutcomeNames.map(outcomeName => {
            return [
                outcomeName,
                ...validTreatments.map(treatment => {
                    const item = treatment.data.find(d => d.name === outcomeName);
                    return item ? `${item.value}%` : '-';
                }),
            ];
        });

        autoTable(doc, {
            startY: currentY,
            head: [tableHead],
            body: tableBody,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 2 },
            headStyles: { fontSize: 7, fillColor: [243, 244, 246], textColor: [0, 0, 0] },
            columnStyles: {
                0: { cellWidth: 55 },
            },
            margin: { left: margin, right: margin },
        });
    } else {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 128, 128);
        doc.text('No data available for the selected clinical parameters.', margin, currentY);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
    }
};

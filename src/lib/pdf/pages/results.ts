import autoTable from 'jspdf-autotable';
import { type PdfPageProps } from '../types';

export const addResultsPage = ({ doc, answers }: PdfPageProps) => {
    // Page 1: Results
    doc.setFontSize(22);
    doc.text('Results', doc.internal.pageSize.width / 2, 22, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(14, 25, doc.internal.pageSize.width - 14, 25);

    const clinicalParams = [
        { id: 'age', label: 'Age' },
        { id: 'psa', label: 'PSA' },
        { id: 'prostate_volume', label: 'Prostate volume' },
        { id: 'gleason_score', label: 'Gleason Score' },
        { id: 'cancer_stage', label: 'T Stage' },
        { id: 'mri_visibility', label: 'MRI visibility' },
        { id: 'maximal_cancer_core_length', label: 'Maximal Cancer Core Length' },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clinicalParamsBody = clinicalParams.map(param => [(answers as any)[param.id] || 'Unknown', param.label]);
    autoTable(doc, {
        startY: 30,
        head: [['Clinical Parameters', '']],
        body: clinicalParamsBody.map(row => [row[1], row[0]]),
        theme: 'plain',
        headStyles: { fontStyle: 'bold', fontSize: 12 },
        columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.line(14, (doc as any).lastAutoTable.finalY + 5, doc.internal.pageSize.width - 14, (doc as any).lastAutoTable.finalY + 5);

    const baselineFunctions = [
        { id: 'urine_leak', label: 'Leakage' },
        { id: 'pad_usage', label: 'Pad' },
        { id: 'urine_problem', label: 'Bother with urinary function' },
        { id: 'erection_quality', label: 'Erectile function' },
        { id: 'sex_medication', label: 'Sexual Medication or devices' },
        { id: 'erection_bother', label: 'Bother with erectile function' },
        { id: 'bowel_bother', label: 'Bother with Bowel function' },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baselineFunctionsBody = baselineFunctions.map(func => [func.label, (answers as any)[func.id] || 'Unknown']);
    autoTable(doc, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Baseline genito-urinary-bowel function', '']],
        body: baselineFunctionsBody,
        theme: 'plain',
        headStyles: { fontStyle: 'bold', fontSize: 12 },
        columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.line(14, (doc as any).lastAutoTable.finalY + 5, doc.internal.pageSize.width - 14, (doc as any).lastAutoTable.finalY + 5);
};

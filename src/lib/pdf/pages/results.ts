import autoTable from 'jspdf-autotable';
import { type PdfPageProps } from '../types';

export const addResultsPage = ({ doc, answers }: PdfPageProps) => {
    // Add new page for Results (comes after Treatment Options)
    doc.addPage();
    
    // Page: Answers to pre-treatment assessment questions
    doc.setFontSize(16);
    doc.text('Answers to pre-treatment assessment questions', doc.internal.pageSize.width / 2, 22, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(14, 25, doc.internal.pageSize.width - 14, 25);

    const clinicalParams = [
        { id: 'age', label: 'Age', unit: 'years' },
        { id: 'psa', label: 'PSA', unit: 'ng/mL' },
        { id: 'prostate_volume', label: 'Prostate volume', unit: 'mL' },
        { id: 'gleason_score', label: 'Gleason score', unit: '' },
        { id: 'cancer_stage', label: 'T stage', unit: '' },
        { id: 'mri_visibility', label: 'MRI visibility', unit: '' },
        { id: 'max_cancer_core_length', label: 'Maximal cancer core length', unit: 'mm' },
    ];
    
    // Helper function to format value with unit
    const formatValueWithUnit = (value: string | number | undefined, unit: string): string => {
        if (!value || value === 'Unknown') return 'Unknown';
        return unit ? `${value} ${unit}` : String(value);
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clinicalParamsBody = clinicalParams.map(param => {
        const value = (answers as any)[param.id];
        const formattedValue = formatValueWithUnit(value, param.unit);
        return [param.label, formattedValue];
    });
    
    autoTable(doc, {
        startY: 30,
        head: [['Clinical Parameters', '']],
        body: clinicalParamsBody,
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
        { id: 'sex_medication', label: 'Sexual medication or devices' },
        { id: 'erection_bother', label: 'Bother with erectile function' },
        { id: 'bowel_urgency', label: 'Bowel urgency' },
        { id: 'bowel_bother', label: 'Bother with bowel function' },
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

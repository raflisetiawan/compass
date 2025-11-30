import autoTable from 'jspdf-autotable';
import { type PdfPageProps } from '../types';
import { calculateOutcomes } from '@/services/outcomes';

export const addSummaryPage = ({ doc, answers }: PdfPageProps) => {
    // Add new page for summary
    doc.addPage();

    // Recalculate outcomes to ensure fresh data
    const outcomes = calculateOutcomes(answers);

    // Page title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const title = 'Functional Outcomes*';
    const titleWidth = doc.getTextWidth(title);
    const xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(title, xPosition, 20);

    // Define table headers
    const headers = [
        [
            { content: 'TREATMENT', rowSpan: 2, styles: { halign: 'center' as const, valign: 'middle' as const, fontStyle: 'bold' as const } },
            { content: 'DOMAIN', rowSpan: 2, styles: { halign: 'center' as const, valign: 'middle' as const, fontStyle: 'bold' as const } },
            { content: 'URINARY', colSpan: 3, styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
            { content: 'SEXUAL', colSpan: 2, styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
            { content: 'BOWEL', colSpan: 2, styles: { halign: 'center' as const, fontStyle: 'bold' as const } }
        ],
        [
            { content: 'Time', styles: { halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 8 } },
            { content: 'Leak-free', styles: { halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 8 } },
            { content: 'Pad-Free', styles: { halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 8 } },
            { content: 'Free from Urinary Bother', styles: { halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 7 } },
            { content: 'Erections sufficient for intercourse', styles: { halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 7 } },
            { content: 'Free from Sexual Bother', styles: { halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 7 } },
            { content: 'Free from Problem with urgency', styles: { halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 7 } },
            { content: 'Free from Bowel bother', styles: { halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 7 } }
        ]
    ];

    // Calculate percentages for each treatment
    const getPercentage = (treatment: string, category: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const outcomeMap: { [key: string]: any } = {
            'urinary': outcomes.urinary,
            'erectile': outcomes.erectile,
            'bowel': outcomes.bowel
        };

        const categoryData = outcomeMap[category]?.[treatment];
        if (!categoryData) return '-';

        const noProblem = categoryData['No problem'] || 0;
        return `${noProblem}%`;
    };

    // Prepare table data
    const tableData = [
        [
            { content: 'ACTIVE SURVEILLANCE', styles: { fillColor: [200, 255, 200] as [number, number, number], fontStyle: 'bold' as const, halign: 'center' as const } },
            { content: '1 year', styles: { halign: 'center' as const } },
            getPercentage('Active Surveillance', 'urinary'), // Leak-free (urinary no problem)
            getPercentage('Active Surveillance', 'urinary'), // Pad-free (urinary no problem)
            getPercentage('Active Surveillance', 'urinary'), // Free from urinary bother
            getPercentage('Active Surveillance', 'erectile'), // Erections sufficient
            getPercentage('Active Surveillance', 'erectile'), // Free from sexual bother
            getPercentage('Active Surveillance', 'bowel'), // Free from bowel urgency
            getPercentage('Active Surveillance', 'bowel')  // Free from bowel bother
        ],
        [
            { content: 'FOCAL THERAPY', styles: { fillColor: [230, 230, 255] as [number, number, number], fontStyle: 'bold' as const, halign: 'center' as const } },
            { content: '1 year', styles: { halign: 'center' as const } },
            getPercentage('Focal Therapy', 'urinary'),
            getPercentage('Focal Therapy', 'urinary'),
            getPercentage('Focal Therapy', 'urinary'),
            getPercentage('Focal Therapy', 'erectile'),
            getPercentage('Focal Therapy', 'erectile'),
            getPercentage('Focal Therapy', 'bowel'),
            getPercentage('Focal Therapy', 'bowel')
        ],
        [
            { content: 'ROBOTIC PROSTATECTOMY', styles: { fillColor: [220, 220, 255] as [number, number, number], fontStyle: 'bold' as const, halign: 'center' as const } },
            { content: '1 year', styles: { halign: 'center' as const } },
            getPercentage('Surgery', 'urinary'),
            getPercentage('Surgery', 'urinary'),
            getPercentage('Surgery', 'urinary'),
            getPercentage('Surgery', 'erectile'),
            getPercentage('Surgery', 'erectile'),
            getPercentage('Surgery', 'bowel'),
            getPercentage('Surgery', 'bowel')
        ],
        [
            { content: 'EXTERNAL BEAM RADIOTHERAPY', styles: { fillColor: [180, 200, 255] as [number, number, number], fontStyle: 'bold' as const, halign: 'center' as const } },
            { content: '1 year', styles: { halign: 'center' as const } },
            getPercentage('Radiotherapy', 'urinary'),
            getPercentage('Radiotherapy', 'urinary'),
            getPercentage('Radiotherapy', 'urinary'),
            getPercentage('Radiotherapy', 'erectile'),
            getPercentage('Radiotherapy', 'erectile'),
            getPercentage('Radiotherapy', 'bowel'),
            getPercentage('Radiotherapy', 'bowel')
        ]
    ];

    // Generate the table
    autoTable(doc, {
        startY: 30,
        head: headers,
        body: tableData,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle'
        },
        headStyles: {
            fillColor: [100, 150, 200],
            textColor: [255, 255, 255],
            fontStyle: 'bold' as const,
            halign: 'center' as const
        },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 15 },
            2: { cellWidth: 18 },
            3: { cellWidth: 18 },
            4: { cellWidth: 18 },
            5: { cellWidth: 18 },
            6: { cellWidth: 18 },
            7: { cellWidth: 18 },
            8: { cellWidth: 18 }
        },
        margin: { left: 14, right: 14 }
    });

    // Add footnote
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('* Percentages represent likelihood of achieving the stated outcome at 1 year post-treatment', 14, finalY);
};

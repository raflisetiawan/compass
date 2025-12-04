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
    let currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('* Percentages represent likelihood of achieving the stated outcome at 1 year post-treatment', 14, currentY);

    // Add definitions section
    currentY += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Definitions:', 14, currentY);

    currentY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const lineHeight = 5;
    const margin = 14;
    const maxWidth = doc.internal.pageSize.getWidth() - (margin * 2);

    // Leak-free definition
    const leakFreeText = 'Leak free: % of men who rarely or never leak';
    doc.text(leakFreeText, margin, currentY);
    currentY += lineHeight;

    // Pad-free definition
    const padFreeText = 'Pad-Free: % of men who wear no pad';
    doc.text(padFreeText, margin, currentY);
    currentY += lineHeight;

    // Urinary bother definition
    const urinaryBotherText = 'Urinary Bother: % of men for whom their urinary function is not considered to be a problem';
    const urinaryBotherLines = doc.splitTextToSize(urinaryBotherText, maxWidth);
    doc.text(urinaryBotherLines, margin, currentY);
    currentY += lineHeight * urinaryBotherLines.length;

    currentY += 2; // Extra spacing

    // Erectile function definition
    const erectileText = 'Sufficient erections for intercourse: % of men whose erections are sufficient for intercourse with or without use of medications or sexual devices';
    const erectileLines = doc.splitTextToSize(erectileText, maxWidth);
    doc.text(erectileLines, margin, currentY);
    currentY += lineHeight * erectileLines.length;

    // Sexual bother definition
    const sexualBotherText = 'Sexual bother: % of men for whom their sexual function is not considered to be a problem';
    const sexualBotherLines = doc.splitTextToSize(sexualBotherText, maxWidth);
    doc.text(sexualBotherLines, margin, currentY);
    currentY += lineHeight * sexualBotherLines.length;

    currentY += 2; // Extra spacing

    // Bowel urgency definition
    const bowelUrgencyText = 'Problem with urgency: % of men for whom their urgency to have a bowel movement is not considered to be a problem';
    const bowelUrgencyLines = doc.splitTextToSize(bowelUrgencyText, maxWidth);
    doc.text(bowelUrgencyLines, margin, currentY);
    currentY += lineHeight * bowelUrgencyLines.length;

    // Bowel bother definition
    const bowelBotherText = 'Bowel bother: % of men for whom their bowel function is not considered to be a problem';
    const bowelBotherLines = doc.splitTextToSize(bowelBotherText, maxWidth);
    doc.text(bowelBotherLines, margin, currentY);
    currentY += lineHeight * bowelBotherLines.length;

    currentY += 4; // Extra spacing before final note

    // Add EPIC-26 note
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const epicNoteText = 'These definitions correspond to the lowest score (1 out of 5) of their corresponding EPIC-26 questions.';
    const epicNoteLines = doc.splitTextToSize(epicNoteText, maxWidth);
    doc.text(epicNoteLines, margin, currentY);
};

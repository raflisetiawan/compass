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
    // --- Helper functions for Current Status ---
    const getLeakageText = (a: typeof answers) => {
        const val = String(a.urine_leak || "").toLowerCase();
        if (val.includes("rarely") || val.includes("never")) return "No\nleakage";
        if (val.includes("day")) return "Daily\nleakage";
        if (val.includes("week")) return "Weekly\nleakage";
        return "No\nleakage";
    };

    const getPadText = (a: typeof answers) => {
        const val = String(a.pad_usage || "").toLowerCase();
        if (val.includes("0") || val.includes("no")) return "No pad";
        if (val.includes("1")) return "1 pad";
        if (val.includes("2")) return "2+ pads";
        return "No pad";
    };

    const getUrinaryBotherText = (a: typeof answers) => {
        const val = String(a.urine_problem || "").toLowerCase();
        if (val.includes("no")) return "No\nbother";
        if (val.includes("small") || val.includes("very")) return "Small\nbother";
        if (val.includes("moderate") || val.includes("big")) return "Big\nbother";
        return "No\nbother";
    };

    const getErectionText = (a: typeof answers) => {
        const val = String(a.erection_quality || "").toLowerCase();
        if (val.includes("intercourse")) return "Good\nerections";
        if (val.includes("masturbation")) return "Poor\nerections";
        if (val.includes("none") || val.includes("not firm")) return "None";
        return "None";
    };

    const getSexualBotherText = (a: typeof answers) => {
        const val = String(a.erection_bother || "").toLowerCase();
        if (val.includes("no")) return "No\nproblem";
        if (val.includes("small") || val.includes("very")) return "Small\nproblem";
        if (val.includes("moderate") || val.includes("big")) return "Big\nproblem";
        return "No\nproblem";
    };

    const getBowelUrgencyText = (a: typeof answers) => {
        const val = String(a.bowel_urgency || "").toLowerCase();
        if (val.includes("no")) return "No\nproblem";
        if (val.includes("small") || val.includes("very")) return "Small\nproblem";
        if (val.includes("moderate") || val.includes("big")) return "Big\nproblem";
        return "No\nproblem";
    };

    const getBowelBotherText = (a: typeof answers) => {
        const val = String(a.bowel_bother || "").toLowerCase();
        if (val.includes("no")) return "No\nproblem";
        if (val.includes("small") || val.includes("very")) return "Small\nproblem";
        if (val.includes("moderate") || val.includes("big")) return "Big\nproblem";
        return "No\nproblem";
    };

    // --- Table Headers ---
    const headers = [
        [
            { content: '', styles: { fillColor: [220, 230, 240] } }, // Empty top-left
            { content: 'URINARY', colSpan: 3, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [220, 230, 240] } },
            { content: 'SEXUAL', colSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [220, 230, 240] } },
            { content: 'BOWEL', colSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [220, 230, 240] } }
        ],
        [
            { content: 'Current status*', styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fillColor: [230, 235, 245] } },
            { content: getLeakageText(answers), styles: { halign: 'center', valign: 'middle', fillColor: [255, 240, 245] } },
            { content: getPadText(answers), styles: { halign: 'center', valign: 'middle', fillColor: [255, 240, 245] } },
            { content: getUrinaryBotherText(answers), styles: { halign: 'center', valign: 'middle', fillColor: [255, 240, 245] } },
            { content: getErectionText(answers), styles: { halign: 'center', valign: 'middle', fillColor: [255, 240, 245] } },
            { content: getSexualBotherText(answers), styles: { halign: 'center', valign: 'middle', fillColor: [255, 240, 245] } },
            { content: getBowelUrgencyText(answers), styles: { halign: 'center', valign: 'middle', fillColor: [255, 240, 245] } },
            { content: getBowelBotherText(answers), styles: { halign: 'center', valign: 'middle', fillColor: [255, 240, 245] } },
        ],
        [
            { content: 'TREATMENT', styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fillColor: [210, 220, 235] } },
            { content: 'No\nLeaking', styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [255, 235, 235] } },
            { content: 'No\nPad\nused', styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [255, 235, 235] } },
            { content: 'No\nproblem\nwith\nurinary\nfunction', styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [255, 235, 235] } },
            { content: 'Erections\nsufficient\nfor\nintercourse', styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [255, 235, 235] } },
            { content: 'No\nproblem\nwith\nerectile\nfunction', styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [255, 235, 235] } },
            { content: 'No\nbowel\nurgency', styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [255, 235, 235] } },
            { content: 'No\nproblem\nwith\nbowel\nfunction', styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [255, 235, 235] } },
        ]
    ];

    // Helper to get formatted percentage
    const getVal = (val: number | undefined) => (val !== undefined ? `${val}%` : '-');

    // Prepare table data
    const tableData = [
        [
            { content: 'ACTIVE\nSURVEILLANCE', styles: { fillColor: [180, 230, 180], fontStyle: 'bold', halign: 'center', valign: 'middle' } },
            getVal(outcomes.urinaryLeakage?.['Active Surveillance']?.['Rarely or never']),
            getVal(outcomes.urinaryPad?.['Active Surveillance']?.['No pads']),
            getVal(outcomes.urinary?.['Active Surveillance']?.['No problem']),
            getVal(outcomes.erectileFunction?.['Active Surveillance']?.['Firm for intercourse']),
            getVal(outcomes.erectile?.['Active Surveillance']?.['No problem']),
            getVal(outcomes.bowelUrgency?.['Active Surveillance']?.['No problem']),
            getVal(outcomes.bowel?.['Active Surveillance']?.['No problem'])
        ],
        [
            { content: 'FOCAL\nTHERAPY', styles: { fillColor: [220, 230, 255], fontStyle: 'bold', halign: 'center', valign: 'middle' } },
            getVal(outcomes.urinaryLeakage?.['Focal Therapy']?.['Rarely or never']),
            getVal(outcomes.urinaryPad?.['Focal Therapy']?.['No pads']),
            getVal(outcomes.urinary?.['Focal Therapy']?.['No problem']),
            getVal(outcomes.erectileFunction?.['Focal Therapy']?.['Firm for intercourse']),
            getVal(outcomes.erectile?.['Focal Therapy']?.['No problem']),
            getVal(outcomes.bowelUrgency?.['Focal Therapy']?.['No problem']),
            getVal(outcomes.bowel?.['Focal Therapy']?.['No problem'])
        ],
        [
            { content: 'SURGERY', styles: { fillColor: [220, 245, 245], fontStyle: 'bold', halign: 'center', valign: 'middle' } },
            getVal(outcomes.urinaryLeakage?.['Surgery']?.['Rarely or never']),
            getVal(outcomes.urinaryPad?.['Surgery']?.['No pads']),
            getVal(outcomes.urinary?.['Surgery']?.['No problem']),
            getVal(outcomes.erectileFunction?.['Surgery']?.['Firm for intercourse']),
            getVal(outcomes.erectile?.['Surgery']?.['No problem']),
            getVal(outcomes.bowelUrgency?.['Surgery']?.['No problem']),
            getVal(outcomes.bowel?.['Surgery']?.['No problem'])
        ],
        [
            { content: 'RADIOTHERAPY', styles: { fillColor: [140, 170, 230], fontStyle: 'bold', halign: 'center', valign: 'middle' } },
            getVal(outcomes.urinaryLeakage?.['Radiotherapy']?.['Rarely or never']),
            getVal(outcomes.urinaryPad?.['Radiotherapy']?.['No pads']),
            getVal(outcomes.urinary?.['Radiotherapy']?.['No problem']),
            getVal(outcomes.erectileFunction?.['Radiotherapy']?.['Firm for intercourse']),
            getVal(outcomes.erectile?.['Radiotherapy']?.['No problem']),
            getVal(outcomes.bowelUrgency?.['Radiotherapy']?.['No problem']),
            getVal(outcomes.bowel?.['Radiotherapy']?.['No problem'])
        ]
    ];

    // Generate the table
    autoTable(doc, {
        startY: 30,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        head: headers as any[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: tableData as any[],
        theme: 'plain', // Check if grid is better or manual styling
        styles: {
            fontSize: 9,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle',
            lineWidth: 0.1, // Add borders
            lineColor: [255, 255, 255] // White borders like the image
        },
        // We set styles inline in data, but global defaults here help
        columnStyles: {
            0: { cellWidth: 35 }, // Treatment column
            // Others auto
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

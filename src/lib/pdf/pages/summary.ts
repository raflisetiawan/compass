import autoTable from 'jspdf-autotable';
import { type PdfPageProps } from '../types';

// Import all data files directly (same as FinalSummaryTablePage.tsx)
import urinaryLeakageData from '@/assets/leaking_urine_at_one_year.json';
import urinaryPadData from '@/assets/use_of_urinary_pads_at_one_year.json';
import urinaryBotherData from '@/assets/urinary_bother.json';
import erectileFunctionData from '@/assets/erectile_function_with_assist.json';
import erectileBotherData from '@/assets/erectile_bother.json';
import bowelUrgencyData from '@/assets/problem_with_bowel_urgency.json';
import bowelBotherData from '@/assets/bowel_bother.json';

// Type aliases matching FinalSummaryTablePage.tsx
type LeakageData = typeof urinaryLeakageData;
type PadData = typeof urinaryPadData;
type UrinaryBotherData = typeof urinaryBotherData;
type ErectileFunctionDataType = typeof erectileFunctionData;
type ErectileBotherData = typeof erectileBotherData;
type BowelUrgencyDataType = typeof bowelUrgencyData;
type BowelBotherDataType = typeof bowelBotherData;

const treatments = [
    { key: "Active Surveillance", urgencyKey: "Active_Surveillance", label: "ACTIVE\nSURVEILLANCE", fillColor: [224, 242, 254] },  // bg-sky-100
    { key: "Focal Therapy", urgencyKey: "Focal", label: "FOCAL\nTHERAPY", fillColor: [220, 252, 231] },  // bg-green-100
    { key: "Surgery", urgencyKey: "Surgery", label: "SURGERY", fillColor: [255, 237, 213] },  // bg-orange-100
    { key: "Radiotherapy", urgencyKey: "EBRT", label: "RADIOTHERAPY", fillColor: [254, 226, 226] },  // bg-red-100
] as const;

export const addSummaryPage = ({ doc, answers }: PdfPageProps) => {
    doc.addPage();

    // Page title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const title = 'Functional Outcomes*';
    const titleWidth = doc.getTextWidth(title);
    const xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(title, xPosition, 20);

    // --- Calculate baseline statuses (same logic as FinalSummaryTablePage.tsx) ---

    // Urinary Leakage
    const leakage = answers.urine_leak;
    let leakageStatus: string | null = null;
    let leakageLabel = "Not answered";
    if (leakage) {
        if (String(leakage).includes("day")) {
            leakageStatus = "At least once a day";
            leakageLabel = "Leaks daily";
        } else if (String(leakage).includes("week")) {
            leakageStatus = "At least once a week";
            leakageLabel = "Leaks weekly";
        } else {
            leakageStatus = "Rarely or never";
            leakageLabel = "No leakage";
        }
    }

    // Pad Usage
    const padUsage = answers.pad_usage;
    let padStatus: string | null = null;
    let padLabel = "Not answered";
    if (padUsage) {
        if (String(padUsage).includes("2 or more") || String(padUsage).includes("3 or more")) {
            padStatus = "Using two or more pads a day";
            padLabel = "2+ pads/day";
        } else if (String(padUsage).includes("1 pad")) {
            padStatus = "Using one pad a day";
            padLabel = "1 pad/day";
        } else {
            padStatus = "Not using pad";
            padLabel = "No pad";
        }
    }

    // Urinary Bother
    const urinaryBother = answers.urine_problem;
    let urinaryBotherStatus: string | null = null;
    let urinaryBotherLabel = "Not answered";
    if (urinaryBother) {
        if (String(urinaryBother).includes("Moderate") || String(urinaryBother).includes("big") || String(urinaryBother).includes("Big")) {
            urinaryBotherStatus = "Moderate/big problem";
            urinaryBotherLabel = "Moderate/big problem";
        } else if (String(urinaryBother).includes("Small") || String(urinaryBother).includes("small")) {
            urinaryBotherStatus = "Very/small problem";
            urinaryBotherLabel = "Small problem";
        } else if (String(urinaryBother).includes("Very")) {
            urinaryBotherStatus = "Very/small problem";
            urinaryBotherLabel = "Very small problem";
        } else {
            urinaryBotherStatus = "No problem";
            urinaryBotherLabel = "No problem";
        }
    }

    // Erectile Function
    const quality = answers.erection_quality;
    const useMedication = answers.sex_medication === "Yes";
    let erectileStatus: string | null = null;
    let erectileLabel = "Not answered";
    if (quality) {
        if (quality === "Firm enough for intercourse") {
            erectileStatus = useMedication ? "Firm for intercourse - with assist" : "Firm for intercourse - no assist";
            erectileLabel = "Firm for intercourse";
        } else if (quality === "Firm enough for masturbation and foreplay only") {
            erectileStatus = useMedication ? "Firm for masturbation - with assist" : "Firm for masturbation - no assist";
            erectileLabel = "Firm for masturbation only";
        } else {
            // Both "Not firm enough for any sexual activity" and "None at all" map to
            // the same JSON key family "Not firm or none - ..."
            erectileStatus = useMedication ? "Not firm or none - with assist" : "Not firm or none - no assist";
            erectileLabel = quality === "Not firm enough for any sexual activity" ? "Not firm enough" : "No erections";
        }
    }

    // Erectile Bother (Sexual Bother)
    const erectileBother = answers.erection_bother;
    let erectileBotherStatus: string | null = null;
    let erectileBotherLabel = "Not answered";
    if (erectileBother) {
        if (String(erectileBother).includes("Moderate") || String(erectileBother).includes("big") || String(erectileBother).includes("Big")) {
            erectileBotherStatus = "Moderate/big problem";
            erectileBotherLabel = "Moderate/big problem";
        } else if (String(erectileBother).includes("Small") || String(erectileBother).includes("small")) {
            erectileBotherStatus = "Very/small problem";
            erectileBotherLabel = "Small problem";
        } else if (String(erectileBother).includes("Very")) {
            erectileBotherStatus = "Very/small problem";
            erectileBotherLabel = "Very small problem";
        } else {
            erectileBotherStatus = "No problem";
            erectileBotherLabel = "No problem";
        }
    }

    // Bowel Urgency
    const urgency = answers.bowel_urgency;
    let urgencyStatus: string | null = null;
    let urgencyLabel = "Not answered";
    if (urgency) {
        if (urgency === "No problem") {
            urgencyStatus = "No_problem";
            urgencyLabel = "No problem";
        } else if (String(urgency).includes("Very small")) {
            urgencyStatus = "Very_small_problem";
            urgencyLabel = "Very small problem";
        } else if (String(urgency).includes("Small")) {
            urgencyStatus = "Very_small_problem";
            urgencyLabel = "Small problem";
        } else if (String(urgency).includes("Moderate")) {
            urgencyStatus = "Moderate_big_problem";
            urgencyLabel = "Moderate problem";
        } else if (String(urgency).includes("Big") || String(urgency).includes("big")) {
            urgencyStatus = "Moderate_big_problem";
            urgencyLabel = "Big problem";
        }
    }

    // Bowel Bother
    const bowelBother = answers.bowel_bother;
    let bowelBotherStatus: string | null = null;
    let bowelBotherLabel = "Not answered";
    if (bowelBother) {
        if (String(bowelBother).includes("Moderate") || String(bowelBother).includes("big") || String(bowelBother).includes("Big")) {
            bowelBotherStatus = "Moderate/big problem";
            bowelBotherLabel = "Moderate/big problem";
        } else if (String(bowelBother).includes("Small") || String(bowelBother).includes("small")) {
            bowelBotherStatus = "Very/small problem";
            bowelBotherLabel = "Small problem";
        } else if (String(bowelBother).includes("Very")) {
            bowelBotherStatus = "Very/small problem";
            bowelBotherLabel = "Very small problem";
        } else {
            bowelBotherStatus = "No problem";
            bowelBotherLabel = "No problem";
        }
    }

    // --- "Your Current Function" section above the table ---
    const margin = 14;
    let currentY = 28;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Current Function:', margin, currentY);
    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const statusItems = [
        { label: 'Urinary leakage', value: leakageLabel },
        { label: 'Pad usage', value: padLabel },
        { label: 'Urinary bother', value: urinaryBotherLabel },
        { label: 'Erectile function', value: erectileLabel },
        { label: 'Sexual bother', value: erectileBotherLabel },
        { label: 'Bowel urgency', value: urgencyLabel },
        { label: 'Bowel bother', value: bowelBotherLabel },
    ];

    // Draw in two columns
    const colWidth = (doc.internal.pageSize.getWidth() - margin * 2) / 2;
    const startY = currentY;
    statusItems.forEach((item, idx) => {
        const col = idx < 4 ? 0 : 1;
        const row = idx < 4 ? idx : idx - 4;
        const x = margin + col * colWidth;
        const y = startY + row * 5;
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.label}: `, x, y);
        const labelWidth = doc.getTextWidth(`${item.label}: `);
        doc.setFont('helvetica', 'bold');
        doc.text(item.value, x + labelWidth, y);
    });

    currentY = startY + 4 * 5 + 4;

    // --- Calculate outcomes from JSON data (same as FinalSummaryTablePage.tsx) ---
    const formatVal = (val: number | null) => (val !== null ? `${val}%` : '-');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableData: any[][] = treatments.map(({ key: treatmentName, urgencyKey, label, fillColor }) => {
        // Urinary leakage — show % who maintain the patient's own current leakage status
        let noLeaking: number | null = null;
        if (leakageStatus) {
            const leakageResult = (urinaryLeakageData as LeakageData)[treatmentName as keyof LeakageData];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            noLeaking = (leakageResult?.["Baseline urine leakage"] as any)?.[leakageStatus]?.[leakageStatus] ?? null;
        }

        // Pad usage — show % who maintain the patient's own current pad status
        let noPadUsed: number | null = null;
        if (padStatus) {
            const padOutcome = (urinaryPadData as PadData)[treatmentName as keyof PadData];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            noPadUsed = (padOutcome?.["Pad status at baseline"] as any)?.[padStatus]?.[padStatus] ?? null;
        }

        // Urinary bother — show % who maintain the patient's own current bother status
        let noUrinaryProblem: number | null = null;
        if (urinaryBotherStatus) {
            const urinaryBotherOutcome = (urinaryBotherData as UrinaryBotherData)[treatmentName as keyof UrinaryBotherData];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            noUrinaryProblem = (urinaryBotherOutcome?.["Baseline urinary bother"] as any)?.[urinaryBotherStatus]?.[urinaryBotherStatus] ?? null;
        }

        // Erections — show % who maintain the patient's own erection quality tier
        let erectionsSufficient: number | null = null;
        if (erectileStatus) {
            const erectileOutcome = (erectileFunctionData as ErectileFunctionDataType)[treatmentName as keyof ErectileFunctionDataType];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const baselineErection = (erectileOutcome?.["Baseline quality of erection"] as any)?.[erectileStatus];
            if (baselineErection) {
                if (erectileStatus.startsWith("Firm for intercourse")) {
                    erectionsSufficient = (baselineErection["Firm for intercourse - no assist"] ?? 0) + (baselineErection["Firm for intercourse - with assist"] ?? 0);
                } else if (erectileStatus.startsWith("Firm for masturbation")) {
                    erectionsSufficient = (baselineErection["Firm for masturbation - no assist"] ?? 0) + (baselineErection["Firm for masturbation - with assist"] ?? 0);
                } else {
                    erectionsSufficient = (baselineErection["Not firm or none - no assist"] ?? 0) + (baselineErection["Not firm or none - with assist"] ?? 0);
                }
            }
        }

        // Erectile bother — show % who maintain the patient's own current bother status
        let noErectileProblem: number | null = null;
        if (erectileBotherStatus) {
            const erectileBotherOutcome = (erectileBotherData as ErectileBotherData)[treatmentName as keyof ErectileBotherData];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            noErectileProblem = (erectileBotherOutcome?.["Baseline sexual bother"] as any)?.[erectileBotherStatus]?.[erectileBotherStatus] ?? null;
        }

        // Bowel urgency — show % who maintain the patient's own current urgency status
        let noBowelUrgency: number | null = null;
        if (urgencyStatus) {
            const urgencyOutcome = (bowelUrgencyData as BowelUrgencyDataType)[urgencyKey as keyof BowelUrgencyDataType];
            const urgencyPctKey = (urgencyStatus + "_%") as "No_problem_%" | "Very_small_problem_%" | "Moderate_big_problem_%";
            noBowelUrgency = urgencyOutcome?.Baseline?.[urgencyStatus as keyof typeof urgencyOutcome.Baseline]?.[urgencyPctKey] ?? null;
        }

        // Bowel bother — show % who maintain the patient's own current bowel bother status
        let noBowelProblem: number | null = null;
        if (bowelBotherStatus) {
            const bowelBotherOutcome = (bowelBotherData as BowelBotherDataType)[treatmentName as keyof BowelBotherDataType];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            noBowelProblem = (bowelBotherOutcome?.["Baseline bowel bother"] as any)?.[bowelBotherStatus]?.[bowelBotherStatus] ?? null;
        }

        return [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: label, styles: { fillColor: fillColor as any, fontStyle: 'bold', halign: 'center', valign: 'middle' } },
            formatVal(noLeaking),
            formatVal(noPadUsed),
            formatVal(noUrinaryProblem),
            formatVal(erectionsSufficient),
            formatVal(noErectileProblem),
            formatVal(noBowelUrgency),
            formatVal(noBowelProblem),
        ];
    });

    // --- Table Headers (matching web page - no "Current status" row) ---
    // bg-blue-600 = #2563eb = [37, 99, 235]
    // bg-gray-100 = #f3f4f6 = [243, 244, 246]
    const headers = [
        [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: '', styles: { fillColor: [37, 99, 235] as any, textColor: [255, 255, 255] } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: 'Functional Outcomes at 1 year after treatment', colSpan: 7, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [37, 99, 235] as any, textColor: [255, 255, 255] } },
        ],
        [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: '', styles: { fillColor: [243, 244, 246] as any, textColor: [0, 0, 0] } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: 'URINARY', colSpan: 3, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [243, 244, 246] as any, textColor: [0, 0, 0] } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: 'SEXUAL', colSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [243, 244, 246] as any, textColor: [0, 0, 0] } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: 'BOWEL', colSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [243, 244, 246] as any, textColor: [0, 0, 0] } }
        ],
        [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: 'TREATMENT', styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [243, 244, 246] as any, textColor: [0, 0, 0] } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: leakageLabel, styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fillColor: [243, 244, 246] as any, textColor: [0, 0, 0] } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: padLabel, styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fillColor: [243, 244, 246] as any, textColor: [0, 0, 0] } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: urinaryBotherLabel, styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fillColor: [243, 244, 246] as any, textColor: [0, 0, 0] } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: erectileLabel, styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fillColor: [243, 244, 246] as any, textColor: [0, 0, 0] } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: erectileBotherLabel, styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fillColor: [243, 244, 246] as any, textColor: [0, 0, 0] } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: urgencyLabel, styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fillColor: [243, 244, 246] as any, textColor: [0, 0, 0] } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { content: bowelBotherLabel, styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fillColor: [243, 244, 246] as any, textColor: [0, 0, 0] } },
        ]
    ];

    // Generate the table
    autoTable(doc, {
        startY: currentY,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        head: headers as any[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: tableData as any[],
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle',
            lineWidth: 0.3,
            lineColor: [200, 200, 200],
        },
        columnStyles: {
            0: { cellWidth: 30 },
        },
        margin: { left: margin, right: margin }
    });

    // --- Definitions section ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let defY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Definitions:', margin, defY);

    defY += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    const lineHeight = 5;
    const bulletIndent = 18;
    const maxWidth = doc.internal.pageSize.getWidth() - bulletIndent - margin;

    const definitions = [
        'No leakage: % of men who rarely or never leak',
        'No Pad used: % of men who do not wear any pad for urinary leakage',
        'No problem with urinary function: % of men who do not consider their current urinary function to be a problem',
        'Erections sufficient for intercourse: % of men whose erections are sufficient for intercourse (whether or not they are using any tablets or other medical devices to help)',
        'No problem with erectile function: % of men who do not consider their current degree of erectile function to be a problem',
        'No problem with bowel urgency: % of men who do not consider their current degree of bowel urgency to be a problem',
        'No problem with bowel function: % of men who do not consider their bowel function to be a problem',
    ];

    definitions.forEach((definition) => {
        doc.text('•', margin, defY);
        const lines = doc.splitTextToSize(definition, maxWidth);
        doc.text(lines, bulletIndent, defY);
        defY += lineHeight * lines.length;
    });

    defY += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const epicNoteText = 'These definitions correspond to the lowest score (1 out of 5) of their corresponding EPIC-26 questions.';
    const epicNoteLines = doc.splitTextToSize(epicNoteText, doc.internal.pageSize.getWidth() - (margin * 2));
    doc.text(epicNoteLines, margin, defY);
};

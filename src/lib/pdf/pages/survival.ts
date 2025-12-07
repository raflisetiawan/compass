import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderIconArrayToDataUrl } from '../canvas';
import { getAgeGroup, getPSARange, getGradeGroup } from '@/services/prediction';
import survivalData from "@/assets/survival_calculation.json";
import type { SurvivalData } from "@/types";

export const addSurvivalPage = ({ doc, answers }: PdfPageProps) => {
    // Page 2: Survival After Treatment
    doc.addPage();

    const age = parseInt(String(answers.age || "65"), 10);
    const psa = parseFloat(String(answers.psa || "8"));
    let tStage = String(answers.cancer_stage || "T2").replace("T", "");
    if (tStage === "4") {
        tStage = "3b"; // Map T4 to 3b as T4 is not in the dataset
    }
    if (tStage === "Unknown") {
        tStage = "2"; // Default to T2 if unknown
    }
    // Handle "T1 or T2" option - use T2 data
    if (tStage === "1 or 2" || tStage.toLowerCase().includes("1 or t2")) {
        tStage = "2";
    }
    const gleasonScore = String(answers.gleason_score || "3+4");

    let ageGroup = getAgeGroup(age);
    // Fix: Map age groups 65- and 70- to 60- as the JSON only supports 60-
    if (ageGroup === '65-' || ageGroup === '70-') {
        ageGroup = '60-';
    }
    const psaRange = getPSARange(psa);
    const gradeGroup = getGradeGroup(gleasonScore);

    let survivalOutcome = (survivalData.Survival as SurvivalData[]).find(
        (item) =>
            item["Age Group"] === ageGroup &&
            String(item["T Stage"]) === tStage &&
            item["Grade Group"] === gradeGroup &&
            item["PSA"] === psaRange
    );

    // Fallback mechanisms for missing data
    const hasValidData = (data: SurvivalData | undefined) => {
        return data && data["Alive (%)"] !== "" && data["Alive (%)"] != null;
    };

    if (!hasValidData(survivalOutcome)) {
        // Fallback 1: If Grade Group is 1, try using Grade Group 2
        if (gradeGroup === 1) {
            const fallbackResult = (survivalData.Survival as SurvivalData[]).find(
                (item) =>
                    item["Age Group"] === ageGroup &&
                    String(item["T Stage"]) === tStage &&
                    item["Grade Group"] === 2 &&
                    item["PSA"] === psaRange
            );
            if (hasValidData(fallbackResult)) {
                survivalOutcome = fallbackResult;
            }
        }
    }

    doc.setFontSize(16);
    doc.text('Survival after prostate cancer treatment', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graph represents 100 men with the same characteristics that you have indicated. The icon plot shows what happens those men after 5 years from receiving their diagnosis of prostate cancer.', 14, 30, { maxWidth: 180 });

    if (survivalOutcome) {
        const iconArrayData = [
            { name: "Alive", value: Math.round(Number(survivalOutcome["Alive (%)"])), color: "#1B5E20" },
            { name: "Death (from prostate cancer)", value: Math.round(Number(survivalOutcome["PCa Death (%)"])), color: "#D32F2F" },
            { name: "Death (from other causes)", value: Math.round(Number(survivalOutcome["Other Death (%)"])), color: "#9E9E9E" },
        ];

        // Use direct canvas rendering - no html2canvas needed
        const { dataUrl: imageDataUrl, width: chartWidth, height: chartHeight } = renderIconArrayToDataUrl(iconArrayData);

        const pdfWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        const legendWidth = 70; // Width reserved for legend
        const chartDisplayWidth = pdfWidth - margin * 2 - legendWidth - 10; // 10px gap between chart and legend
        
        // Calculate height based on actual aspect ratio to preserve circle shapes
        const aspectRatio = chartHeight / chartWidth;
        const chartDisplayHeight = chartDisplayWidth * aspectRatio;
        
        // Draw chart on left side
        doc.addImage(imageDataUrl, 'JPEG', margin, 45, chartDisplayWidth, chartDisplayHeight);

        // Draw legend on right side
        const legendX = margin + chartDisplayWidth + 15;
        let legendY = 50;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('What the icons mean', legendX, legendY);
        legendY += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Draw legend items with colored circles
        iconArrayData.forEach((item) => {
            // Draw colored circle
            const circleRadius = 4;
            // Parse hex color to RGB
            const hexColor = item.color.replace('#', '');
            const r = parseInt(hexColor.substring(0, 2), 16);
            const g = parseInt(hexColor.substring(2, 4), 16);
            const b = parseInt(hexColor.substring(4, 6), 16);
            
            doc.setFillColor(r, g, b);
            doc.circle(legendX + circleRadius, legendY, circleRadius, 'F');
            
            // Draw label with percentage
            doc.setTextColor(0, 0, 0);
            const percentage = Number(survivalOutcome![item.name === "Alive" ? "Alive (%)" : 
                item.name === "Death (from prostate cancer)" ? "PCa Death (%)" : "Other Death (%)"]).toFixed(1);
            doc.text(`${item.name}: ${percentage}%`, legendX + circleRadius * 2 + 4, legendY + 1, { maxWidth: legendWidth - 15 });
            
            legendY += 14;
        });

        // Table starts below the chart
        const tableY = 45 + chartDisplayHeight + 10;

        autoTable(doc, {
            startY: tableY,
            head: [['', 'Percentage']],
            body: [
                ['Alive', `${Number(survivalOutcome['Alive (%)']).toFixed(1)}%`],
                ['Death (from prostate cancer)', `${Number(survivalOutcome['PCa Death (%)']).toFixed(1)}%`],
                ['Death (from other causes)', `${Number(survivalOutcome['Other Death (%)']).toFixed(1)}%`],
            ],
            theme: 'grid',
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const summaryY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        const dynamicSummary = `Based on the information you have entered, ${iconArrayData[0].value} out of 100 men are alive at 5 years after diagnosis. Of the men who would not survive, ${iconArrayData[1].value} would die due to prostate cancer and ${iconArrayData[2].value} would die due to other causes.`;
        doc.text(dynamicSummary, 14, summaryY, { maxWidth: 180 });
    }
};

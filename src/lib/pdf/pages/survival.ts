import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderChartToImage } from '../utils';
import { getAgeGroup, getPSARange, getGradeGroup } from '@/services/prediction';
import survivalData from "@/assets/survival_calculation.json";
import type { SurvivalData } from "@/types";
import { SurvivalChartForPdf } from '@/features/results/components/SurvivalChartForPdf';

export const addSurvivalPage = async ({ doc, answers }: PdfPageProps) => {
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

        const canvas = await renderChartToImage(SurvivalChartForPdf, { data: iconArrayData });

        const pdfWidth = doc.internal.pageSize.getWidth();
        const imgWidth = pdfWidth - 28;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(canvas.toDataURL('image/jpeg', 0.85), 'JPEG', 14, 45, imgWidth, imgHeight);

        autoTable(doc, {
            startY: 45 + imgHeight + 10,
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

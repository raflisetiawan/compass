import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderChartsNonBlocking } from '../utils';
import erectileFunctionData from "@/assets/erectile_function_with_assist.json";
import { ErectileFunctionChartForPdf } from '@/features/results/components/ErectileFunctionChartForPdf';

export const addErectileFunctionPage = async ({ doc, answers, margin, pdfWidth }: PdfPageProps) => {
    // Page 6: Erectile function at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Erectile function at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same erectile function as you. The icon plot shows how erectile function changes at 1 year from their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    const baselineErectileStatus = (() => {
        const quality = answers.erection_quality || "Firm enough for intercourse";
        const useMedication = answers.sex_medication === "Yes";

        if (quality === "Firm enough for intercourse") {
            return useMedication ? "Firm for intercourse - with assist" : "Firm for intercourse - no assist";
        }
        if (quality === "Firm enough for masturbation and foreplay only") {
            return useMedication ? "Firm for masturbation - with assist" : "Firm for masturbation - no assist";
        }
        if (quality === "Not firm enough for any sexual activity") {
            return useMedication ? "Not firm - with assist" : "Not firm - no assist";
        }
        if (quality === "None at all") {
            return useMedication ? "None at all - with assist" : "None at all - no assist";
        }
        
        // Default fallback
        return "Firm for intercourse - no assist";
    })();

    const efTreatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];
    const efData = erectileFunctionData;

    const efTreatmentOutcomes = efTreatments.map((treatment) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const treatmentData = (efData as any)[treatment]["Baseline quality of erection"][baselineErectileStatus];
        const N = treatmentData.N;

        if (N === 0) {
            return {
                name: treatment,
                data: [
                    { name: "Firm enough for intercourse", value: 0, color: '#1b5e20', showPill: false },
                    { name: "Firm enough for masturbation only", value: 0, color: '#ffc107', showPill: false },
                    { name: "Not firm enough for any sexual activity or none at all", value: 0, color: '#dc3545', showPill: false },
                    { name: "Using sexual medication or device", value: 0, color: '#007bff', showPill: false },
                ]
            };
        }

        // Detailed categories matching Web logic
        const categories = [
            {
                name: "Firm for intercourse - no assist",
                displayName: "Firm enough for intercourse",
                value: treatmentData["Firm for intercourse - no assist"],
                color: "#1b5e20",
                showPill: false
            },
            {
                name: "Firm for intercourse - with assist",
                displayName: "Firm enough for intercourse (with assist)",
                value: treatmentData["Firm for intercourse - with assist"],
                color: "#1b5e20",
                showPill: true
            },
            {
                name: "Firm for masturbation - no assist",
                displayName: "Firm enough for masturbation only",
                value: treatmentData["Firm for masturbation - no assist"],
                color: "#ffc107",
                showPill: false
            },
            {
                name: "Firm for masturbation - with assist",
                displayName: "Firm enough for masturbation only (with assist)",
                value: treatmentData["Firm for masturbation - with assist"],
                color: "#ffc107",
                showPill: true
            },
            {
                name: "Not firm - no assist",
                displayName: "Not firm enough for any sexual activity",
                value: treatmentData["Not firm - no assist"],
                color: "#dc3545",
                showPill: false
            },
            {
                name: "Not firm - with assist",
                displayName: "Not firm enough for any sexual activity (with assist)",
                value: treatmentData["Not firm - with assist"],
                color: "#dc3545",
                showPill: true
            },
            {
                name: "None at all - no assist",
                displayName: "None at all",
                value: treatmentData["None at all - no assist"],
                color: "#dc3545",
                showPill: false
            },
            {
                name: "None at all - with assist",
                displayName: "None at all (with assist)",
                value: treatmentData["None at all - with assist"],
                color: "#dc3545",
                showPill: true
            }
        ];

        // Round each value
        const roundedData = categories.map(item => ({
            ...item,
            value: Math.round(item.value)
        }));

        // Adjust total to ensure it equals 100%
        const total = roundedData.reduce((sum, item) => sum + item.value, 0);
        const diff = total - 100;

        if (diff !== 0) {
            // Find the item with the highest value to adjust
            const maxIndex = roundedData.reduce((maxIdx, item, idx, arr) =>
                item.value > arr[maxIdx].value ? idx : maxIdx, 0);
            roundedData[maxIndex].value -= diff;
        }

        // Filter out items with 0 value and create final display data
        const displayData = roundedData
            .filter(item => item.value > 0)
            .map(item => ({
                name: item.displayName,
                value: item.value,
                color: item.color,
                showPill: item.showPill
            }));

        return {
            name: treatment,
            data: displayData,
        };
    });

    // Render all charts with non-blocking approach
    const chartConfigs = efTreatmentOutcomes.map(treatment => ({
        Component: ErectileFunctionChartForPdf,
        props: { treatment }
    }));
    const chartResults = await renderChartsNonBlocking(chartConfigs);

    const colGutter = 5;
    const fourColWidth = (pdfWidth - (margin * 2) - (colGutter * 3)) / 4;
    
    // Calculate height based on actual aspect ratio from first chart to preserve circle shapes
    const firstChart = chartResults[0];
    const aspectRatio = firstChart ? firstChart.height / firstChart.width : 1.5;
    const imgHeight = fourColWidth * aspectRatio;

    const yPos = 45;

    chartResults.forEach((chartResult, idx) => {
        const xPos = margin + (fourColWidth + colGutter) * idx;
        doc.addImage(chartResult.dataUrl, 'JPEG', xPos, yPos, fourColWidth, imgHeight);
    });

    const efRowMaxHeight = imgHeight;
    const efTableY = yPos + efRowMaxHeight + 10;

    const efTableBody = efTreatmentOutcomes.map(t => {
        // Aggregate back to 3 categories for the table
        let firmIntercourse = 0;
        let firmMasturbation = 0;
        let notFirm = 0;

        t.data.forEach(d => {
            if (d.name.includes("intercourse")) {
                firmIntercourse += d.value;
            } else if (d.name.includes("masturbation")) {
                firmMasturbation += d.value;
            } else {
                notFirm += d.value;
            }
        });

        return [
            t.name,
            `${firmIntercourse}%`,
            `${firmMasturbation}%`,
            `${notFirm}%`,
        ];
    });

    autoTable(doc, {
        startY: efTableY,
        head: [['Treatment', 'Firm enough for intercourse', 'Firm enough for masturbation only', 'Not firm enough for any sexual activity or none at all']],
        body: efTableBody,
        theme: 'grid',
    });

    // Helper function to get user-friendly baseline name
    const getBaselineDisplayName = (status: string): string => {
        if (status.includes("Firm for intercourse")) {
            return status.includes("with assist") 
                ? "firm enough for intercourse (with medication/device)"
                : "firm enough for intercourse";
        }
        if (status.includes("Firm for masturbation")) {
            return status.includes("with assist")
                ? "firm enough for masturbation and foreplay only (with medication/device)"
                : "firm enough for masturbation and foreplay only";
        }
        if (status.includes("Not firm")) {
            return status.includes("with assist")
                ? "not firm enough for any sexual activity (with medication/device)"
                : "not firm enough for any sexual activity";
        }
        if (status.includes("None at all")) {
            return status.includes("with assist")
                ? "none at all (with medication/device)"
                : "none at all";
        }
        return status.toLowerCase();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let efSummaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Summary', margin, efSummaryY);
    efSummaryY += 6;
    doc.setFontSize(10);

    const efSummaryIntro = `Based on the information you have entered, for men who currently have erections that are ${getBaselineDisplayName(baselineErectileStatus)}, the outcomes at 1 year after treatment are:`;
    const splitEfIntro = doc.splitTextToSize(efSummaryIntro, pdfWidth - margin * 2);
    doc.text(splitEfIntro, margin, efSummaryY);
    efSummaryY += (splitEfIntro.length * 5) + 5;

    efTreatmentOutcomes.forEach(treatment => {
        doc.setFont('helvetica', 'bold');
        doc.text(`For men who choose ${treatment.name}:`, margin, efSummaryY);
        efSummaryY += 5;
        doc.setFont('helvetica', 'normal');

        treatment.data.forEach(d => {
            const bulletText = `• ${d.value}% will have erections that are ${d.name.toLowerCase()}.`;
            const splitBullet = doc.splitTextToSize(bulletText, pdfWidth - margin * 2 - 5);
            doc.text(splitBullet, margin + 5, efSummaryY);
            efSummaryY += (splitBullet.length * 5);
        });
        efSummaryY += 3;
    });
};

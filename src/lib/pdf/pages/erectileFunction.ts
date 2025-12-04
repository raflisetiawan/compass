import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderChartToImage } from '../utils';
import erectileFunctionData from "@/assets/erectile_function_with_assist.json";
import { ErectileFunctionChartForPdf } from '@/features/results/components/ErectileFunctionChartForPdf';

export const addErectileFunctionPage = async ({ doc, answers, margin, gutter, imgWidth, pdfWidth }: PdfPageProps) => {
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
                    { name: "Firm enough for intercourse", value: 0, color: '#28a745' },
                    { name: "Firm enough for masturbation only", value: 0, color: '#ffc107' },
                    { name: "Not firm enough for any sexual activity or none at all", value: 0, color: '#dc3545' },
                ]
            };
        }

        // Aggregate all categories
        const firmIntercourse = Math.round(
            (treatmentData["Firm for intercourse - no assist"] || 0) +
            (treatmentData["Firm for intercourse - with assist"] || 0)
        );
        const firmMasturbation = Math.round(
            (treatmentData["Firm for masturbation - no assist"] || 0) +
            (treatmentData["Firm for masturbation - with assist"] || 0)
        );
        const notFirmOrNone = Math.round(
            (treatmentData["Not firm - no assist"] || 0) +
            (treatmentData["Not firm - with assist"] || 0) +
            (treatmentData["None at all - no assist"] || 0) +
            (treatmentData["None at all - with assist"] || 0)
        );

        // Adjust to ensure total is 100
        const total = firmIntercourse + firmMasturbation + notFirmOrNone;
        let adjustedFirmIntercourse = firmIntercourse;
        let adjustedFirmMasturbation = firmMasturbation;
        let adjustedNotFirmOrNone = notFirmOrNone;

        if (total !== 100) {
            const diff = total - 100;
            // Adjust the largest value
            if (firmIntercourse >= firmMasturbation && firmIntercourse >= notFirmOrNone) {
                adjustedFirmIntercourse -= diff;
            } else if (firmMasturbation >= notFirmOrNone) {
                adjustedFirmMasturbation -= diff;
            } else {
                adjustedNotFirmOrNone -= diff;
            }
        }

        return {
            name: treatment,
            data: [
                { name: "Firm enough for intercourse", value: adjustedFirmIntercourse, color: "#28a745" },
                { name: "Firm enough for masturbation only", value: adjustedFirmMasturbation, color: "#ffc107" },
                { name: "Not firm enough for any sexual activity or none at all", value: adjustedNotFirmOrNone, color: "#dc3545" },
            ],
        };
    });

    const efCanvases = await Promise.all(efTreatmentOutcomes.map(async (treatment) => {
        return renderChartToImage(ErectileFunctionChartForPdf, { treatment });
    }));

    const efImgHeight1 = (efCanvases[0].height * imgWidth) / efCanvases[0].width;
    const efImgHeight2 = (efCanvases[1].height * imgWidth) / efCanvases[1].width;

    doc.addImage(efCanvases[0].toDataURL('image/jpeg', 0.85), 'JPEG', margin, 45, imgWidth, efImgHeight1);
    doc.addImage(efCanvases[1].toDataURL('image/jpeg', 0.85), 'JPEG', margin + imgWidth + gutter, 45, imgWidth, efImgHeight2);

    const efRow1MaxHeight = Math.max(efImgHeight1, efImgHeight2);
    const efYPosRow2 = 45 + efRow1MaxHeight + 10;

    const efImgHeight3 = (efCanvases[2].height * imgWidth) / efCanvases[2].width;
    const efImgHeight4 = (efCanvases[3].height * imgWidth) / efCanvases[3].width;

    doc.addImage(efCanvases[2].toDataURL('image/jpeg', 0.85), 'JPEG', margin, efYPosRow2, imgWidth, efImgHeight3);
    doc.addImage(efCanvases[3].toDataURL('image/jpeg', 0.85), 'JPEG', margin + imgWidth + gutter, efYPosRow2, imgWidth, efImgHeight4);

    const efRow2MaxHeight = Math.max(efImgHeight3, efImgHeight4);
    const efTableY = efYPosRow2 + efRow2MaxHeight + 10;

    const efTableBody = efTreatmentOutcomes.map(t => {
        return [
            t.name,
            `${t.data[0].value}%`,
            `${t.data[1].value}%`,
            `${t.data[2].value}%`,
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

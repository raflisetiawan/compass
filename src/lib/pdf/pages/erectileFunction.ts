import autoTable from 'jspdf-autotable';
import type { PdfPageProps } from '../types';
import { renderChartToImage } from '../utils';
import erectileFunctionData from "@/assets/erectile_function_with_assist.json";
import { ErectileFunctionChartForPdf } from '@/features/results/components/ErectileFunctionChartForPdf';
import ErectionFunctionIcon from '@/components/icons/ErectionFunctionIcon';
import React from 'react';

export const addErectileFunctionPage = async ({ doc, answers, margin, gutter, imgWidth, pdfWidth }: PdfPageProps) => {
    // Page 6: Erectile function at 1 year
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Erectile function at 1 year', 14, 22);
    doc.setFontSize(10);
    doc.text('The following graphs represent 100 men with the same erectile function as you. The icon plot shows how erectile function changes at 1 year from their prostate cancer treatment.', 14, 30, { maxWidth: 180 });

    const baselineErectileStatus = (() => {
        const quality = answers.erection_quality || "Firm enough for intercourse";
        const medication = answers.sex_medication || "No";

        if (quality === "Firm enough for intercourse") return "Firm intercourse";
        if (quality === "Firm enough for masturbation/foreplay only") return "Firm masturbation";
        if (quality === "Not firm enough for any sexual activity" || quality === "None at all") {
            if (medication === "Yes") return "Not firm - with assist";
            return "Not firm - no assist";
        }
        return "Firm intercourse"; // Default
    })();

    const efTreatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const efData: any = { ...erectileFunctionData, "Active Surveillance": (erectileFunctionData as any).TOTAL };

    const efTreatmentOutcomes = efTreatments.map((treatment) => {
        const treatmentData = efData[treatment]["Baseline erectile quality"][baselineErectileStatus];
        const N = treatmentData.N;

        if (N === 0) {
            return {
                name: treatment,
                data: [
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    { name: "Firm enough for intercourse", value: 0, color: '#28a745', Icon: (props: any) => React.createElement(ErectionFunctionIcon, { ...props, withAssist: false }) },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    { name: "Firm enough for masturbation only", value: 0, color: '#ffc107', Icon: (props: any) => React.createElement(ErectionFunctionIcon, { ...props, withAssist: false }) },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    { name: "Not firm enough for any sexual activity", value: 0, color: '#dc3545', Icon: (props: any) => React.createElement(ErectionFunctionIcon, { ...props, withAssist: false }) },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    { name: "Not firm enough, using medication/device", value: 0, color: '#dc3545', Icon: (props: any) => React.createElement(ErectionFunctionIcon, { ...props, withAssist: true }) },
                ]
            };
        }

        const percentages = {
            firmIntercourse: (treatmentData["Firm intercourse"] / N) * 100,
            firmMasturbation: (treatmentData["Firm masturbation"] / N) * 100,
            notFirmNoAssist: (treatmentData["Not firm - no assist"] / N) * 100,
            notFirmWithAssist: (treatmentData["Not firm - with assist"] / N) * 100,
        };

        const roundedPercentages = {
            firmIntercourse: Math.round(percentages.firmIntercourse),
            firmMasturbation: Math.round(percentages.firmMasturbation),
            notFirmNoAssist: Math.round(percentages.notFirmNoAssist),
            notFirmWithAssist: Math.round(percentages.notFirmWithAssist),
        };

        const total = Object.values(roundedPercentages).reduce((sum, p) => sum + p, 0);
        const diff = total - 100;

        if (diff !== 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const keyToAdjust = Object.keys(percentages).reduce((a, b) => (percentages as any)[a] > (percentages as any)[b] ? a : b);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (roundedPercentages as any)[keyToAdjust] -= diff;
        }

        const { firmIntercourse, firmMasturbation, notFirmNoAssist, notFirmWithAssist } = roundedPercentages;

        return {
            name: treatment,
            data: [
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { name: "Firm enough for intercourse", value: firmIntercourse, color: "#28a745", Icon: (props: any) => React.createElement(ErectionFunctionIcon, { ...props, withAssist: false }) },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { name: "Firm enough for masturbation only", value: firmMasturbation, color: "#ffc107", Icon: (props: any) => React.createElement(ErectionFunctionIcon, { ...props, withAssist: false }) },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { name: "Not firm enough for any sexual activity", value: notFirmNoAssist, color: "#dc3545", Icon: (props: any) => React.createElement(ErectionFunctionIcon, { ...props, withAssist: false }) },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { name: "Not firm enough, using medication/device", value: notFirmWithAssist, color: "#dc3545", Icon: (props: any) => React.createElement(ErectionFunctionIcon, { ...props, withAssist: true }) },
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
            `${t.data[3].value}%`,
        ];
    });

    autoTable(doc, {
        startY: efTableY,
        head: [['Treatment', 'Firm enough for intercourse', 'Firm enough for masturbation only', 'Not firm enough for any sexual activity', 'Not firm enough, using medication/device']],
        body: efTableBody,
        theme: 'grid',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let efSummaryY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Summary', margin, efSummaryY);
    efSummaryY += 6;
    doc.setFontSize(10);

    const efSummaryIntro = `Based on the information you have entered, for men who currently have erections that are ${baselineErectileStatus.toLowerCase()}, the outcomes at 1 year after treatment are:`;
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

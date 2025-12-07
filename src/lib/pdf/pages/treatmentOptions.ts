import autoTable from 'jspdf-autotable';
import { type PdfPageProps } from '../types';

// Treatment data - Definition table
const definitionData = [
    {
        name: 'ACTIVE SURVEILLANCE',
        definition: 'Monitoring disease with regular tests.',
        details: 'This means avoiding treatment while closely monitoring the prostate cancer. This allows prompt identification of disease progression that will then require treatment.',
        goal: 'Avoid the side effects associated with treatment. Treatment is postponed (or even avoided).',
        suitability: 'Low and some intermediate risk cancers.'
    },
    {
        name: 'FOCAL THERAPY',
        definition: 'Treatment of only the area in the prostate containing cancer.',
        details: 'Treatment limited to area of prostate containing cancer and its surrounding margin, while leaving the rest of the prostate untouched.',
        goal: 'Limiting the side-effects of treatment by preserving the portion of the prostate that does not contain worrisome cancer.',
        suitability: 'Intermediate risk cancer that are visible at imaging and generally localised to one area of the prostate only.'
    },
    {
        name: 'SURGERY',
        definition: 'Surgical removal of the entire prostate.',
        details: 'Removal of whole prostate and seminal vesicles with surgery (most commonly mini-invasive robotic surgery).',
        goal: 'Eradicating the prostate cancer by removing the whole prostate with surgery, without leaving traces behind.',
        suitability: 'Most intermediate and high-risk cancers.'
    },
    {
        name: 'RADIOTHERAPY',
        definition: 'Radiation delivered to the entire prostate.',
        details: 'Irradiation of the whole prostate delivered by an external machine. May need addition of hormone (anti-testosterone) treatment.',
        goal: 'Eradicating the whole prostate cancer by destroying the whole prostate without removing it with surgery (i.e. avoiding invasive procedures).',
        suitability: 'Most intermediate and high-risk cancers.'
    }
];

// Treatment data - Delivery table
const deliveryData = [
    {
        name: 'ACTIVE SURVEILLANCE',
        location: 'Usually managed by your local urology team',
        delivery: 'No immediate treatment (close monitoring with PSA, MRI and biopsy, if needed).',
        sessions: 'None',
        anaesthesia: 'Not required'
    },
    {
        name: 'FOCAL THERAPY',
        location: 'May require referral to specialised NHS centre offering focal therapy',
        delivery: 'Multiple energy available using ultrasounds delivered from rectum (i.e. HIFU = High-Intensity Focused Ultrasound) OR needles through the perineum (i.e. Cryotherapy; IRE = Irreversible electroporation)',
        sessions: 'One (Day-surgery)',
        anaesthesia: 'General anaesthesia'
    },
    {
        name: 'SURGERY',
        location: 'Usually performed by the robotic urology team of your hospital or a local affiliated centre',
        delivery: 'Most commonly minimally-invasive (key-hole) surgery using robotic assistance.',
        sessions: 'One (Overnight hospital stay required)',
        anaesthesia: 'General anaesthesia'
    },
    {
        name: 'RADIOTHERAPY',
        location: 'Usually managed by the clinical oncology team of your hospital or a local affiliated centre',
        delivery: 'Delivered by external machine targeting the prostate from multiple angles while patient lies on a table',
        sessions: 'Between 5, 20 and 37 sessions: requires daily hospital attendance (Mon to Fri) for 4-8 weeks',
        anaesthesia: 'Not required (awake)'
    }
];

// Treatment data - Post-Treatment table
const postTreatmentData = [
    {
        name: 'ACTIVE SURVEILLANCE',
        management: 'None',
        activities: 'Immediate (no need to interrupt activities)',
        complications: 'None'
    },
    {
        name: 'FOCAL THERAPY',
        management: 'Urinary catheter for 5-7 days.\nMedication: Laxatives, mild pain-killers and antibiotics for 1 week',
        activities: 'Rest for 2 days; moderate discomfort for 1-2 weeks with returning to full activities in 1-3 weeks',
        complications: 'Acute urinary retention; Infection; Urethral stricture; Rectal fistula (rare)'
    },
    {
        name: 'SURGERY',
        management: 'Urinary catheter for 7-14 days.\nMedication: Pain killers, anti-thrombotic medication, pelvic floor physiotherapy',
        activities: 'Mild-to-moderate pain for 1 week requiring rest for 1 week. Full return after 4 weeks',
        complications: 'Acute urinary retention; infection; Bladder neck stricture; Damage to surrounding organs; rectal fistula (rare)'
    },
    {
        name: 'RADIOTHERAPY',
        management: 'Medication: laxatives, anti-spasmodics for bladder, pain-killers',
        activities: 'Daily activities disrupted by daily hospital attendance. Usually mild-to-no discomfort at the beginning, progressively increasing towards the end of treatment.',
        complications: 'TBD'
    }
];

// Treatment data - Follow-Up table
const followUpData = [
    {
        name: 'ACTIVE SURVEILLANCE',
        schedule: 'Regular PSA (every 3-6 months)\nMRI (every 1-3 years)\nBiopsy (as needed)',
        investigations: 'If PSA and/or MRI progression, biopsy will be repeated',
        furtherTreatment: 'All treatment options, according to up-to-date disease evaluation'
    },
    {
        name: 'FOCAL THERAPY',
        schedule: 'Regular PSA (every 3-6 months)\nMRI (every 1-3 years)\nBiopsy (as needed)',
        investigations: 'If PSA and/or MRI progression, biopsy will be repeated',
        furtherTreatment: 'Repeat focal therapy;\nRadiotherapy;\nSurgery (possibly more difficult);\nHormones'
    },
    {
        name: 'SURGERY',
        schedule: 'PSA every 3-6 months',
        investigations: 'If PSA >0.1ng/mL, PSMA-PET will performed',
        furtherTreatment: 'Radiotherapy\nHormones'
    },
    {
        name: 'RADIOTHERAPY',
        schedule: 'PSA every 3-6 months',
        investigations: "If PSA rises above clinician's determined threshold, PSMA-PET will performed",
        furtherTreatment: 'Surgery (rarely an option)\nRadiotherapy (rarely an option)\nHormones'
    }
];

export const addTreatmentOptionsPages = ({ doc }: PdfPageProps) => {
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add new page for Treatment Options
    doc.addPage();

    // Page title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Information on Treatment Options for Localised Prostate Cancer', pageWidth / 2, 22, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(margin, 25, pageWidth - margin, 25);

    // Table 1: Definition - "What is the treatment doing?"
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('What is the treatment doing?', margin, 35);

    autoTable(doc, {
        startY: 40,
        head: [['Treatment', 'Definition', 'Details', 'Goal', 'Suitability']],
        body: definitionData.map(t => [t.name, t.definition, t.details, t.goal, t.suitability]),
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [220, 220, 220], fontStyle: 'bold', fontSize: 7 },
        columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold' },
            1: { cellWidth: 30 },
            2: { cellWidth: 50 },
            3: { cellWidth: 40 },
            4: { cellWidth: 35 }
        },
        margin: { left: margin, right: margin }
    });

    // Table 2: Delivery - "How is the treatment delivered?" 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('How is the treatment delivered?', margin, currentY);

    autoTable(doc, {
        startY: currentY + 5,
        head: [['Treatment', 'Location', 'Delivery', 'Number of sessions', 'Anaesthesia']],
        body: deliveryData.map(t => [t.name, t.location, t.delivery, t.sessions, t.anaesthesia]),
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [220, 220, 220], fontStyle: 'bold', fontSize: 7 },
        columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold' },
            1: { cellWidth: 35 },
            2: { cellWidth: 55 },
            3: { cellWidth: 30 },
            4: { cellWidth: 25 }
        },
        margin: { left: margin, right: margin }
    });

    // Add new page for remaining tables
    doc.addPage();

    // Page title for second page
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Information on Treatment Options (continued)', pageWidth / 2, 22, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(margin, 25, pageWidth - margin, 25);

    // Table 3: Post-Treatment - "What to expect after treatment?"
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('What to expect after treatment?', margin, 35);

    autoTable(doc, {
        startY: 40,
        head: [['Treatment', 'Post-Treatment Management', 'Return to everyday activities', 'Possible complications']],
        body: postTreatmentData.map(t => [t.name, t.management, t.activities, t.complications]),
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [220, 220, 220], fontStyle: 'bold', fontSize: 7 },
        columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold' },
            1: { cellWidth: 55 },
            2: { cellWidth: 50 },
            3: { cellWidth: 50 }
        },
        margin: { left: margin, right: margin }
    });

    // Table 4: Follow-Up - "What does the follow-up involve?"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('What does the follow-up involve?', margin, currentY);

    autoTable(doc, {
        startY: currentY + 5,
        head: [['Treatment', 'Exam Schedule', 'Further investigations', 'Further treatment available']],
        body: followUpData.map(t => [t.name, t.schedule, t.investigations, t.furtherTreatment]),
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [220, 220, 220], fontStyle: 'bold', fontSize: 7 },
        columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold' },
            1: { cellWidth: 45 },
            2: { cellWidth: 55 },
            3: { cellWidth: 50 }
        },
        margin: { left: margin, right: margin }
    });
};

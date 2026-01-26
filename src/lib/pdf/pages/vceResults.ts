import { type PdfPageProps } from '../types';

const SIDE_EFFECTS_QUESTIONS = [
  { key: 'urinaryLeakage' as const, label: 'Urinary leakage (including wearing pads)' },
  { key: 'urinaryFrequency' as const, label: 'Passing urine frequently or having to rush to the toilet' },
  { key: 'bowelMovements' as const, label: 'Problems with my bowel movements (urgency, discomfort)' },
  { key: 'reducedEnergy' as const, label: 'Reduced energy levels, mood swings or reduced sex drive' },
  { key: 'erectileProblems' as const, label: 'Problems with erections' },
];

const LOGISTICS_QUESTIONS = [
  { key: 'dailyHospitalTravel' as const, label: 'Travelling to the hospital every day for several weeks' },
  { key: 'distantHospitalTravel' as const, label: 'Travelling to a distant hospital a few times to receive a specific treatment' },
  { key: 'timeAwayFromActivities' as const, label: 'Taking time away from usual activities (work, caring for others, social activities, etc)' },
];

const IMPORTANCE_ORDER = {
  very: 0,
  somewhat: 1,
  less: 2,
  null: 3,
};

const IMPORTANCE_LABELS = {
  very: 'Very Important',
  somewhat: 'Somewhat Important',
  less: 'Less Important',
};

export const addVceResultsPage = ({ doc, vceAnswers }: PdfPageProps) => {
  // Use vceAnswers from props
  const treatmentPhilosophy = vceAnswers?.treatmentPhilosophy ?? null;
  const sideEffectsImportance = vceAnswers?.sideEffectsImportance ?? {
    urinaryLeakage: null,
    urinaryFrequency: null,
    bowelMovements: null,
    reducedEnergy: null,
    erectileProblems: null,
  };
  const logisticsImportance = vceAnswers?.logisticsImportance ?? {
    dailyHospitalTravel: null,
    distantHospitalTravel: null,
    timeAwayFromActivities: null,
  };

  // Start new page
  doc.addPage();

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const maxWidth = pageWidth - (margin * 2);
  let currentY = 25;

  // === Title ===
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('What is most important to me?', margin, currentY);
  currentY += 12;

  // === Intro ===
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const introText = 'This section shows your responses to the value clarification exercise. Your answers can help guide discussions with your clinician about treatment options.';
  const introLines = doc.splitTextToSize(introText, maxWidth);
  doc.text(introLines, margin, currentY);
  currentY += introLines.length * 5 + 10;

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // === Question 1: Treatment Philosophy ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('1. Treatment Philosophy', margin, currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  if (treatmentPhilosophy === 'active') {
    doc.text('Your preference: Active treatment', margin, currentY);
    currentY += 5;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const activeText = '"I would like to actively do something to treat my prostate cancer, even if I may have some side effects"';
    const activeLines = doc.splitTextToSize(activeText, maxWidth - 10);
    doc.text(activeLines, margin + 5, currentY);
    currentY += activeLines.length * 4 + 5;
  } else if (treatmentPhilosophy === 'monitoring') {
    doc.text('Your preference: Monitoring/Watchful waiting', margin, currentY);
    currentY += 5;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const monitorText = '"I would like to hold off having treatment for as long as it is safe to do so"';
    const monitorLines = doc.splitTextToSize(monitorText, maxWidth - 10);
    doc.text(monitorLines, margin + 5, currentY);
    currentY += monitorLines.length * 4 + 5;
  } else {
    doc.setTextColor(150, 150, 150);
    doc.text('Not answered', margin, currentY);
    currentY += 8;
  }

  currentY += 8;

  // === Question 2: Side Effects Importance ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('2. Side Effects - Importance of Avoiding', margin, currentY);
  currentY += 8;

  // Sort by importance
  const sortedSideEffects = [...SIDE_EFFECTS_QUESTIONS].sort((a, b) => {
    const aValue = sideEffectsImportance[a.key];
    const bValue = sideEffectsImportance[b.key];
    return IMPORTANCE_ORDER[aValue ?? 'null'] - IMPORTANCE_ORDER[bValue ?? 'null'];
  });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  sortedSideEffects.forEach((question) => {
    const value = sideEffectsImportance[question.key];
    const label = value ? IMPORTANCE_LABELS[value] : 'Not answered';
    
    doc.setTextColor(60, 60, 60);
    const questionLines = doc.splitTextToSize(`• ${question.label}`, maxWidth - 60);
    doc.text(questionLines, margin, currentY);
    
    // Importance level on the right
    doc.setFont('helvetica', 'bold');
    if (value === 'very') {
      doc.setTextColor(0, 100, 0); // Green for very important
    } else if (value === 'somewhat') {
      doc.setTextColor(150, 100, 0); // Orange for somewhat
    } else if (value === 'less') {
      doc.setTextColor(100, 100, 100); // Gray for less
    } else {
      doc.setTextColor(180, 180, 180);
    }
    doc.text(label, pageWidth - margin, currentY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    currentY += Math.max(questionLines.length * 4, 6) + 2;
  });

  currentY += 8;

  // === Question 3: Logistics Importance ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('3. Logistics - Importance of Avoiding', margin, currentY);
  currentY += 8;

  // Sort by importance
  const sortedLogistics = [...LOGISTICS_QUESTIONS].sort((a, b) => {
    const aValue = logisticsImportance[a.key];
    const bValue = logisticsImportance[b.key];
    return IMPORTANCE_ORDER[aValue ?? 'null'] - IMPORTANCE_ORDER[bValue ?? 'null'];
  });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  sortedLogistics.forEach((question) => {
    const value = logisticsImportance[question.key];
    const label = value ? IMPORTANCE_LABELS[value] : 'Not answered';
    
    doc.setTextColor(60, 60, 60);
    const questionLines = doc.splitTextToSize(`• ${question.label}`, maxWidth - 60);
    doc.text(questionLines, margin, currentY);
    
    // Importance level on the right
    doc.setFont('helvetica', 'bold');
    if (value === 'very') {
      doc.setTextColor(0, 100, 0);
    } else if (value === 'somewhat') {
      doc.setTextColor(150, 100, 0);
    } else if (value === 'less') {
      doc.setTextColor(100, 100, 100);
    } else {
      doc.setTextColor(180, 180, 180);
    }
    doc.text(label, pageWidth - margin, currentY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    currentY += Math.max(questionLines.length * 4, 6) + 2;
  });

  // Reset text color to black for subsequent pages
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
};

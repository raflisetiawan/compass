import { jsPDF } from 'jspdf';
import type { Answers } from '@/types/questionnaire';

export interface PdfPageProps {
    doc: jsPDF;
    answers: Answers;
    pdfWidth: number;
    margin: number;
    gutter: number;
    imgWidth: number;
}

export interface OutcomeData {
    name: string;
    value: number;
    color: string;
    Icon?: React.ElementType;
    iconUrl?: string;
}

export interface TreatmentOutcome {
    name: string;
    data: OutcomeData[];
}

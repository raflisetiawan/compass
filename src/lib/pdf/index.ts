import jsPDF from 'jspdf';
import { useQuestionnaireStore } from '@/stores/questionnaireStore';
import { useUserStore } from '@/stores/userStore';
import { addIntroductionPage } from './pages/introduction';
import { addTreatmentOptionsPages } from './pages/treatmentOptions';
import { addResultsPage } from './pages/results';
import { addSummaryPage } from './pages/summary';
import { addSurvivalPage } from './pages/survival';
import { addUrinaryLeakagePage } from './pages/urinaryLeakage';
import { addUrinaryPadPage } from './pages/urinaryPad';
import { addUrinaryBotherPage } from './pages/urinaryBother';
import { addErectileFunctionPage } from './pages/erectileFunction';
import { addSexualBotherPage } from './pages/sexualBother';
import { addBowelUrgencyPage } from './pages/bowelUrgency';
import { addBowelBotherPage } from './pages/bowelBother';


export const generatePdf = (onProgress?: (progress: number) => void) => {
    const doc = new jsPDF({
        compress: true // Enable PDF compression
    });
    const questionnaireState = useQuestionnaireStore.getState();
    const { answers } = questionnaireState;

    const pdfWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const gutter = 10;
    const imgWidth = (pdfWidth - (margin * 2) - gutter) / 2;

    const pageProps = {
        doc,
        answers,
        pdfWidth,
        margin,
        gutter,
        imgWidth,
    };

    const totalSteps = 12;
    let currentStep = 0;

    const updateProgress = () => {
        currentStep++;
        if (onProgress) {
            const percentage = Math.round((currentStep / totalSteps) * 100);
            onProgress(percentage);
        }
    };

    // === A) Introduction of the tool ===
    // Page 1: Introduction (no heavy processing)
    addIntroductionPage(pageProps);
    updateProgress();

    // === B) Information on treatment options (all four tables) ===
    // Pages 2-3: Treatment Options tables
    addTreatmentOptionsPages(pageProps);
    updateProgress();

    // === C) Answers to pre-treatment assessment questions ===
    // Page 4: Results (no heavy processing)
    addResultsPage(pageProps);
    updateProgress();

    // === D) Result of predicted outcomes ===
    // Page 5: Survival - now uses direct canvas rendering (fast!)
    addSurvivalPage(pageProps);
    updateProgress();

    // Functional Outcomes - all now use direct canvas rendering:
    // Page 6: Urinary Leakage
    addUrinaryLeakagePage(pageProps);
    updateProgress();

    // Page 7: Urinary Pad
    addUrinaryPadPage(pageProps);
    updateProgress();

    // Page 8: Urinary Bother
    addUrinaryBotherPage(pageProps);
    updateProgress();

    // Page 9: Erectile Function
    addErectileFunctionPage(pageProps);
    updateProgress();

    // Page 10: Sexual Bother
    addSexualBotherPage(pageProps);
    updateProgress();

    // Page 11: Bowel Urgency
    addBowelUrgencyPage(pageProps);
    updateProgress();

    // Page 12: Bowel Bother
    addBowelBotherPage(pageProps);
    updateProgress();

    // Page 13: Summary table (Functional Outcomes summary)
    addSummaryPage(pageProps);
    updateProgress();

    // Add User ID and Timestamp to all pages
    const totalPages = doc.getNumberOfPages();
    const user = useUserStore.getState().user;
    const date = new Date().toLocaleString();
    
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128); // Grey color for header

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const userIdText = `User ID: ${user?.accessCode || 'N/A'}`;
        const dateText = `Exported: ${date}`;
        
        doc.text(userIdText, 14, 10);
        
        // Align date to the right
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(dateText, pageWidth - 14, 10, { align: 'right' });
    }

    doc.save('BeSpoke-results.pdf');
};


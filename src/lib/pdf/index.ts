import jsPDF from 'jspdf';
import { useQuestionnaireStore } from '@/stores/questionnaireStore';
import { useUserStore } from '@/stores/userStore';
import { useVceStore, type VceAnswers } from '@/stores/vceStore';
import { loadLatestQuestionnaireSession } from '@/services/firebase';
import { addIntroductionPage } from './pages/introduction';
import { addVceResultsPage } from './pages/vceResults';
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


export const generatePdf = async (onProgress?: (progress: number) => void) => {
    const doc = new jsPDF({
        compress: true // Enable PDF compression
    });
    const questionnaireState = useQuestionnaireStore.getState();
    const { answers, patientId } = questionnaireState;
    
    // Get access code for Firebase query
    const accessCode = patientId || useUserStore.getState().user?.accessCode;
    
    // Try to get VCE answers from Firebase first, fallback to store
    let vceAnswers: VceAnswers | undefined;
    
    if (accessCode) {
        try {
            const session = await loadLatestQuestionnaireSession(accessCode);
            if (session?.vceAnswers) {
                vceAnswers = session.vceAnswers;
                console.log('VCE answers loaded from Firebase for PDF:', vceAnswers);
            }
        } catch (error) {
            console.error('Error loading VCE answers from Firebase:', error);
        }
    }
    
    // Fallback to store if Firebase didn't have data
    if (!vceAnswers) {
        const vceState = useVceStore.getState();
        vceAnswers = {
            treatmentPhilosophy: vceState.treatmentPhilosophy,
            sideEffectsImportance: vceState.sideEffectsImportance,
            logisticsImportance: vceState.logisticsImportance,
            mostImportantSideEffect: vceState.mostImportantSideEffect,
        };
        console.log('VCE answers loaded from store for PDF:', vceAnswers);
    }

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
        vceAnswers,
    };

    const totalSteps = 13;
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

    // Page 2: VCE Results (What is most important to me?)
    addVceResultsPage(pageProps);
    updateProgress();

    // === B) Information on treatment options (all four tables) ===
    // Pages 3-4: Treatment Options tables
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


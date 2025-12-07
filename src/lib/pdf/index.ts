import jsPDF from 'jspdf';
import { useQuestionnaireStore } from '@/stores/questionnaireStore';
import { useUserStore } from '@/stores/userStore';
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

    const totalSteps = 10;
    let currentStep = 0;

    const updateProgress = () => {
        currentStep++;
        if (onProgress) {
            const percentage = Math.round((currentStep / totalSteps) * 100);
            onProgress(percentage);
        }
    };

    addResultsPage(pageProps);
    updateProgress();

    addSummaryPage(pageProps);
    updateProgress();

    await addSurvivalPage(pageProps);
    updateProgress();

    await addUrinaryLeakagePage(pageProps);
    updateProgress();

    await addUrinaryPadPage(pageProps);
    updateProgress();

    await addUrinaryBotherPage(pageProps);
    updateProgress();

    await addErectileFunctionPage(pageProps);
    updateProgress();

    await addSexualBotherPage(pageProps);
    updateProgress();

    await addBowelUrgencyPage(pageProps);
    updateProgress();

    await addBowelBotherPage(pageProps);
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

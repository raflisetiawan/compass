import jsPDF from 'jspdf';
import { useQuestionnaireStore } from '@/stores/questionnaireStore';
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

    doc.save('BeSpoke-results.pdf');
};

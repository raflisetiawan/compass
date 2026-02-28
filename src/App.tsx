import SurvivalAfterTreatmentPage from "./pages/SurvivalAfterTreatmentPage";
import RiskRetreatmentPage from "./pages/RiskRetreatmentPage";
import UrinaryLeakagePage from "./pages/UrinaryLeakagePage";
import UrinaryPadUsagePage from "./pages/UrinaryPadUsagePage";
import UrinaryBotherPage from "./pages/UrinaryBotherPage";
import SexualBotherPage from "./pages/SexualBotherPage";
import BowelBotherPage from "./pages/BowelBotherPage";
import ErectileFunctionPage from "./pages/ErectileFunctionPage";
import ProblemWithUrgencyPage from "./pages/ProblemWithUrgencyPage";
import FinalSummaryTablePage from "./pages/FinalSummaryTablePage";
import SurvivalRetreatmentSummaryPage from "./pages/SurvivalRetreatmentSummaryPage";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import AnimatedPage from "./components/AnimatedPage";
import QuestionnairePage from "./pages/QuestionnairePage";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { useEffect } from "react";

import LoginPage from "./pages/LoginPage";
import SelectPatientPage from "./pages/SelectPatientPage";
import IntroductionPage from "./pages/IntroductionPage";
import PatientInfoPage from "./pages/PatientInfoPage";
import PersonalisedInfoIntroPage from "./pages/PersonalisedInfoIntroPage";
import TreatmentOptionsDefinitionPage from "./pages/TreatmentOptionsDefinitionPage";
import TreatmentOptionsDeliveryPage from "./pages/TreatmentOptionsDeliveryPage";
import TreatmentOptionsPostTreatmentPage from "./pages/TreatmentOptionsPostTreatmentPage";
import TreatmentOptionsFollowUpPage from "./pages/TreatmentOptionsFollowUpPage";
import ResultsPage from "./pages/ResultsPage";
import AboutPage from "./pages/AboutPage";
import VCEIntroPage from "./pages/VCEIntroPage";
import VCEQuestionsPage from "./pages/VCEQuestionsPage";
import VCEResultsPage from "./pages/VCEResultsPage";

function App() {
  const location = useLocation();

  // Set page title based on route
  useEffect(() => {
    let title = "COMPASS";
    const pathParts = location.pathname.split("/").filter(Boolean);

    switch (`/${pathParts[0]}`) {
      case "/login":
        title = "Login | COMPASS";
        break;
      case "/select-patient": // Add title for the new page
        title = "Select Patient | COMPASS";
        break;
      case "/introduction":
        title = "Introduction | COMPASS";
        break;
      case "/patient-info":
        title = "Patient Info | COMPASS";
        break;
      case "/personalised-info-intro":
        title = "Personalised Information | COMPASS";
        break;
      case "/vce":
        if (pathParts[1] === "intro") {
          title = "Value Clarification Exercise | COMPASS";
        } else if (pathParts[1] === "questions") {
          title = "VCE Questions | COMPASS";
        } else if (pathParts[1] === "results") {
          title = "VCE Results | COMPASS";
        }
        break;
      case "/treatment-options/definition":
        title = "Treatment Options - Definition | COMPASS";
        break;
      case "/treatment-options/delivery":
        title = "Treatment Options - Delivery | COMPASS";
        break;
      case "/treatment-options/post-treatment":
        title = "Treatment Options - Post Treatment | COMPASS";
        break;
      case "/treatment-options/follow-up":
        title = "Treatment Options - Follow Up | COMPASS";
        break;
      case "/questionnaire":
        title = "Questionnaire | COMPASS";
        break;
      case "/results":
        title = "Results | COMPASS";
        break;
      case "/about":
        title = "About | COMPASS";
        break;
      case "/functional-outcome":
        if (pathParts[1] === "leaking-urine-at-one-year") {
          title = "Urinary Leakage Outcome | COMPASS";
        } else if (pathParts[1] === "use-of-urinary-pads-at-one-year") {
          title = "Urinary Pad Usage | COMPASS";
        } else {
          const outcomeTitle = pathParts[1]
            ? pathParts[1]
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
            : "Detail";
          title = `${outcomeTitle} | COMPASS`;
        }
        break;
    }
    document.title = title;
  }, [location.pathname]);

  return (
    <>
      <Toaster />
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={
              <AnimatedPage>
                <LoginPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/select-patient"
            element={
              <ProtectedRoute>
                <SelectPatientPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/introduction"
            element={
              <ProtectedRoute>
                <IntroductionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-info"
            element={
              <ProtectedRoute>
                <PatientInfoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personalised-info-intro"
            element={
              <ProtectedRoute>
                <PersonalisedInfoIntroPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vce/intro"
            element={
              <ProtectedRoute>
                <VCEIntroPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vce/questions"
            element={
              <ProtectedRoute>
                <VCEQuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vce/results"
            element={
              <ProtectedRoute>
                <VCEResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treatment-options/definition"
            element={
              <ProtectedRoute>
                <TreatmentOptionsDefinitionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treatment-options/delivery"
            element={
              <ProtectedRoute>
                <TreatmentOptionsDeliveryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treatment-options/post-treatment"
            element={
              <ProtectedRoute>
                <TreatmentOptionsPostTreatmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treatment-options/follow-up"
            element={
              <ProtectedRoute>
                <TreatmentOptionsFollowUpPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questionnaire"
            element={
              <ProtectedRoute>
                <QuestionnairePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <AboutPage />
            }
          />
          <Route
            path="/functional-outcome/leaking-urine-at-one-year"
            element={
              <ProtectedRoute>
                <UrinaryLeakagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/use-of-urinary-pads-at-one-year"
            element={
              <ProtectedRoute>
                <UrinaryPadUsagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/urinary-bother"
            element={
              <ProtectedRoute>
                <UrinaryBotherPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/sexual-bother"
            element={
              <ProtectedRoute>
                <SexualBotherPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/bowel-bother"
            element={
              <ProtectedRoute>
                <BowelBotherPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/sufficient-erections-for-intercourse"
            element={
              <ProtectedRoute>
                <ErectileFunctionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/problem-with-urgency"
            element={
              <ProtectedRoute>
                <ProblemWithUrgencyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/survival-after-prostate-cancer-treatment"
            element={
              <ProtectedRoute>
                <SurvivalAfterTreatmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/risk-retreatment-equations"
            element={
              <ProtectedRoute>
                <RiskRetreatmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/survival-retreatment-summary"
            element={
              <ProtectedRoute>
                <SurvivalRetreatmentSummaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/final-summary-table"
            element={
              <ProtectedRoute>
                <FinalSummaryTablePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/vce-results"
            element={
              <ProtectedRoute>
                <VCEResultsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
    </>
  );
}

export default App;

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
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import AnimatedPage from "./components/AnimatedPage";
import QuestionnairePage from "./pages/QuestionnairePage";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
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
      <AnimatePresence mode="wait">
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
                <AnimatedPage>
                  <SelectPatientPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
            <Route
            path="/introduction"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <IntroductionPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-info"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <PatientInfoPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/personalised-info-intro"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <PersonalisedInfoIntroPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vce/intro"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <VCEIntroPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vce/questions"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <VCEQuestionsPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vce/results"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <VCEResultsPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/treatment-options/definition"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <TreatmentOptionsDefinitionPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/treatment-options/delivery"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <TreatmentOptionsDeliveryPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/treatment-options/post-treatment"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <TreatmentOptionsPostTreatmentPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/treatment-options/follow-up"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <TreatmentOptionsFollowUpPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/questionnaire"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <QuestionnairePage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <ResultsPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <AnimatedPage>
                <AboutPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/functional-outcome/leaking-urine-at-one-year"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <UrinaryLeakagePage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/use-of-urinary-pads-at-one-year"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <UrinaryPadUsagePage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/urinary-bother"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <UrinaryBotherPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/sexual-bother"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <SexualBotherPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/bowel-bother"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <BowelBotherPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/sufficient-erections-for-intercourse"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <ErectileFunctionPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/problem-with-urgency"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <ProblemWithUrgencyPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/survival-after-prostate-cancer-treatment"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <SurvivalAfterTreatmentPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/risk-retreatment-equations"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <RiskRetreatmentPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/functional-outcome/final-summary-table"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <FinalSummaryTablePage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;

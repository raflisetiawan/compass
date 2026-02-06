import { useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Info, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useFetchOutcomePageData } from "@/hooks/useFetchOutcomePageData";
import { OutcomePageDataContext } from "@/contexts/OutcomePageDataContext";
import { ResultsSidebar } from "@/features/results/components/ResultsSidebar";
import { ResultsMobileHeader } from "@/features/results/components/ResultsMobileHeader";
import { ResultsDesktopHeader } from "@/features/results/components/ResultsDesktopHeader";
import { ResultsModal } from "@/features/results/components/ResultsModal";
import { TreatmentCategoryLegend } from "@/features/results/components/TreatmentCategoryLegend";
import type { ModalContentType } from "@/types";

// Define the order of functional outcome pages
const FUNCTIONAL_OUTCOME_PAGES = [
  { slug: "survival-after-prostate-cancer-treatment", title: "Survival" },
  { slug: "risk-retreatment-equations", title: "Risk & Retreatment" },
  { slug: "leaking-urine-at-one-year", title: "Leaking Urine" },
  { slug: "use-of-urinary-pads-at-one-year", title: "Urinary Pads" },
  { slug: "urinary-bother", title: "Urinary Bother" },
  { slug: "sufficient-erections-for-intercourse", title: "Erectile Function" },
  { slug: "sexual-bother", title: "Sexual Bother" },
  { slug: "problem-with-urgency", title: "Bowel Urgency" },
  { slug: "bowel-bother", title: "Bowel Bother" },
  { slug: "final-summary-table", title: "Summary" },
];

interface FunctionalOutcomePageLayoutProps {
  title: string;
  children: ReactNode;
}

export const FunctionalOutcomePageLayout = ({ title, children }: FunctionalOutcomePageLayoutProps) => {
  const pageData = useFetchOutcomePageData();
  const {
    isLoading,
    reset,
    clinicalParameters,
    baselineGenitoUrinaryBowelFunction,
  } = pageData;
  const navigate = useNavigate();
  const location = useLocation();
  const [modalContent, setModalContent] = useState<ModalContentType>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isCategoryLegendOpen, setIsCategoryLegendOpen] = useState(false);

  // Get current page index from URL
  const currentPath = location.pathname;
  const currentSlug = currentPath.split("/functional-outcome/")[1] || "";
  const currentIndex = FUNCTIONAL_OUTCOME_PAGES.findIndex(page => page.slug === currentSlug);

  // Calculate previous and next pages
  const prevPage = currentIndex > 0 ? FUNCTIONAL_OUTCOME_PAGES[currentIndex - 1] : null;
  const nextPage = currentIndex < FUNCTIONAL_OUTCOME_PAGES.length - 1 ? FUNCTIONAL_OUTCOME_PAGES[currentIndex + 1] : null;

  const handleBack = () => {
    if (prevPage) {
      navigate(`/functional-outcome/${prevPage.slug}`);
    } else {
      // First page - go back to VCE Results
      navigate("/vce/results");
    }
  };

  const handleNext = () => {
    if (nextPage) {
      navigate(`/functional-outcome/${nextPage.slug}`);
    }
  };

  const handleStartOver = () => {
    reset();
    navigate("/introduction");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Loading details...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <OutcomePageDataContext.Provider value={pageData}>
      <MainLayout>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow p-4 md:p-8 bg-gray-50">
            <ResultsMobileHeader onModalOpen={setModalContent} onStartOver={handleStartOver} />
            <ResultsDesktopHeader />
            <div className="flex md:gap-8">
              <ResultsSidebar
                isExpanded={isSidebarExpanded}
                onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                clinicalParameters={clinicalParameters}
                baselineGenitoUrinaryBowelFunction={baselineGenitoUrinaryBowelFunction}
              />
              <div className={`w-full transition-all duration-300 ${isSidebarExpanded ? "md:w-2/3" : "md:w-[calc(100%-5rem)]"}`}>
                {/* Top navigation buttons */}
                <div className="flex justify-between items-center mb-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {prevPage ? `Back to ${prevPage.title}` : "Back to VCE Results"}
                  </Button>
                  {nextPage ? (
                    <Button onClick={handleNext} className="bg-[#C2E2E9] text-black hover:bg-[#a8d4de]">
                      Next: {nextPage.title}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate("/questionnaire")} 
                      className="bg-[#C2E2E9] text-black hover:bg-[#a8d4de]"
                    >
                      Finish
                    </Button>
                  )}
                </div>
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setIsCategoryLegendOpen(true)} className="ml-2">
                        <Info className="h-5 w-5" />
                      </Button>
                    </div>
                    {/* Page indicator */}
                    <p className="text-sm text-gray-500">
                      Page {currentIndex + 1} of {FUNCTIONAL_OUTCOME_PAGES.length}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {children}
                  </CardContent>
                  {/* Navigation Footer */}
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" onClick={handleBack}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    {nextPage ? (
                      <Button onClick={handleNext} className="bg-[#C2E2E9] text-black hover:bg-[#a8d4de]">
                        Next: {nextPage.title}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => navigate("/questionnaire")} 
                        className="bg-[#C2E2E9] text-black hover:bg-[#a8d4de]"
                      >
                        Finish
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </div>
          </main>
        </div>
        <ResultsModal
          modalContent={modalContent}
          onClose={() => setModalContent(null)}
          clinicalParameters={clinicalParameters}
          baselineGenitoUrinaryBowelFunction={baselineGenitoUrinaryBowelFunction}
        />
        <TreatmentCategoryLegend
          isOpen={isCategoryLegendOpen}
          onClose={() => setIsCategoryLegendOpen(false)}
        />
      </MainLayout>
    </OutcomePageDataContext.Provider>
  );
};

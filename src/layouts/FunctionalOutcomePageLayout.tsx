import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info, ChevronLeft, Loader2 } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFetchOutcomePageData } from "@/hooks/useFetchOutcomePageData";
import { OutcomePageDataContext } from "@/contexts/OutcomePageDataContext";
import { ResultsSidebar } from "@/features/results/components/ResultsSidebar";
import { ResultsMobileHeader } from "@/features/results/components/ResultsMobileHeader";
import { ResultsDesktopHeader } from "@/features/results/components/ResultsDesktopHeader";
import { ResultsModal } from "@/features/results/components/ResultsModal";
import { TreatmentCategoryLegend } from "@/features/results/components/TreatmentCategoryLegend";
import type { ModalContentType } from "@/types";

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
  const [modalContent, setModalContent] = useState<ModalContentType>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isCategoryLegendOpen, setIsCategoryLegendOpen] = useState(false);

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
            <ResultsDesktopHeader onStartOver={handleStartOver} />
            <div className="flex md:gap-8">
              <ResultsSidebar
                isExpanded={isSidebarExpanded}
                onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                clinicalParameters={clinicalParameters}
                baselineGenitoUrinaryBowelFunction={baselineGenitoUrinaryBowelFunction}
              />
              <div className={`w-full transition-all duration-300 ${isSidebarExpanded ? "md:w-2/3" : "md:w-[calc(100%-5rem)]"}`}>
                <Button asChild variant="outline" className="mb-4">
                  <Link to="/results">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Results
                  </Link>
                </Button>
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setIsCategoryLegendOpen(true)} className="ml-2">
                        <Info className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {children}
                  </CardContent>
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { generatePdf } from "@/lib/pdf";
import { Loader2 } from "lucide-react";
import { PdfGenerationWarningDialog } from "@/components/PdfGenerationWarningDialog";


export const ResultsDesktopHeader = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showWarningDialog, setShowWarningDialog] = useState(false);


  const handleDownloadClick = () => {
    setShowWarningDialog(true);
  };

  const handleConfirmGenerate = async (includeVce: boolean) => {
    setShowWarningDialog(false);
    setIsGenerating(true);
    setProgress(0);
    try {
      await generatePdf((p) => setProgress(p), { includeVce });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };



  return (
    <>
      <div className="hidden md:flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold w-sm">Results</h1>
        <div className="flex flex-col gap-2 flex-1 ml-8">
          <div className="flex justify-end items-center w-full">
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/functional-outcome/final-summary-table")} disabled={isGenerating}>
                VIEW SUMMARY
              </Button>
              <Button variant="default" onClick={handleDownloadClick} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF... {progress}%
                  </>
                ) : (
                  "DOWNLOAD PDF"
                )}
              </Button>
            </div>
          </div>
          {isGenerating && (
            <span className="text-xs text-gray-600 text-right">
              Please wait 1-2 minutes. Do not close this tab.
            </span>
          )}
        </div>
      </div>

      <PdfGenerationWarningDialog
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        onConfirm={handleConfirmGenerate}
      />
    </>
  );
};

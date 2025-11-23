import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generatePdf } from "@/lib/pdf";
import { Loader2 } from "lucide-react";
import { PdfGenerationWarningDialog } from "@/components/PdfGenerationWarningDialog";

interface ResultsDesktopHeaderProps {
  onStartOver: () => void;
}

export const ResultsDesktopHeader = ({ onStartOver }: ResultsDesktopHeaderProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  const handleDownloadClick = () => {
    setShowWarningDialog(true);
  };

  const handleConfirmGenerate = async () => {
    setShowWarningDialog(false);
    setIsGenerating(true);
    setProgress(0);
    try {
      await generatePdf((p) => setProgress(p));
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
        <h1 className="text-4xl font-bold">Results</h1>
        <div className="flex gap-4 flex-col items-end">
          <div className="flex gap-4">
            <Button variant="outline" onClick={onStartOver} disabled={isGenerating}>
              START OVER
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

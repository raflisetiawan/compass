import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { generatePdf } from "@/lib/pdf";
import type { ModalContentType } from "@/types";

interface ResultsMobileHeaderProps {
  onModalOpen: (content: ModalContentType) => void;
  onStartOver: () => void;
}

export const ResultsMobileHeader = ({
  onModalOpen,
  onStartOver,
}: ResultsMobileHeaderProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
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
    <div className="md:hidden mb-4">
      <h1 className="text-2xl font-bold mb-4">Results</h1>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onModalOpen("clinical")} disabled={isGenerating}>
            Clinical Parameters
          </Button>
          <Button variant="outline" onClick={() => onModalOpen("baseline")} disabled={isGenerating}>
            Baseline Function
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onStartOver} disabled={isGenerating}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            disabled={isGenerating}
            className="relative"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      {isGenerating && (
        <div className="mt-2 text-xs text-center text-gray-600">
          Generating PDF... {progress}%
        </div>
      )}
    </div>
  );
};

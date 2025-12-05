import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Loader2, ClipboardList } from "lucide-react";
import { generatePdf } from "@/lib/pdf";
import type { ModalContentType } from "@/types";
import { PdfGenerationWarningDialog } from "@/components/PdfGenerationWarningDialog";

interface ResultsMobileHeaderProps {
    onModalOpen: (content: ModalContentType) => void;
    onStartOver: () => void;
}

export const ResultsMobileHeader = ({
    onModalOpen,
    onStartOver,
}: ResultsMobileHeaderProps) => {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const handleQuestionnaireClick = () => {
        navigate("/questionnaire");
    };

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
            <div className="md:hidden mb-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Results</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={onStartOver} disabled={isGenerating}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleQuestionnaireClick} disabled={isGenerating}>
                            <ClipboardList className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleDownloadClick}
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
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => onModalOpen("clinical")} disabled={isGenerating} className="w-full">
                        Clinical Parameters
                    </Button>
                    <Button variant="outline" onClick={() => onModalOpen("baseline")} disabled={isGenerating} className="w-full">
                        Baseline Function
                    </Button>
                </div>
                {isGenerating && (
                    <div className="mt-2 text-xs text-center">
                        <div className="text-gray-600 font-semibold">Generating PDF... {progress}%</div>
                        <div className="text-gray-500 mt-1">Please wait 1-2 minutes. Do not close this tab.</div>
                    </div>
                )}
            </div>

            <PdfGenerationWarningDialog
                open={showWarningDialog}
                onOpenChange={setShowWarningDialog}
                onConfirm={handleConfirmGenerate}
            />
        </>
    );
};

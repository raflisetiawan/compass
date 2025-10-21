import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import type { ModalContentType } from "@/types";

interface ResultsMobileHeaderProps {
  onModalOpen: (content: ModalContentType) => void;
  onStartOver: () => void;
}

export const ResultsMobileHeader = ({
  onModalOpen,
  onStartOver,
}: ResultsMobileHeaderProps) => (
  <div className="md:hidden mb-4">
    <h1 className="text-2xl font-bold mb-4">Results</h1>
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => onModalOpen("clinical")}>
          Clinical Parameters
        </Button>
        <Button variant="outline" onClick={() => onModalOpen("baseline")}>
          Baseline Function
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={onStartOver}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

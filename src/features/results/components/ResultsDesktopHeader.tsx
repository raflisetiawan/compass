import { Button } from "@/components/ui/button";

interface ResultsDesktopHeaderProps {
  onStartOver: () => void;
}

export const ResultsDesktopHeader = ({ onStartOver }: ResultsDesktopHeaderProps) => (
  <div className="hidden md:flex justify-between items-center mb-6">
    <h1 className="text-4xl font-bold">Results</h1>
    <div className="flex gap-4">
      <Button variant="outline" onClick={onStartOver}>
        START OVER
      </Button>
      <Button variant="default">DOWNLOAD</Button>
    </div>
  </div>
);

import { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PdfGenerationWarningDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (includeVce: boolean) => void;
}

export const PdfGenerationWarningDialog = ({
    open,
    onOpenChange,
    onConfirm,
}: PdfGenerationWarningDialogProps) => {
    const [includeVce, setIncludeVce] = useState(true);

    // Reset checkbox state when dialog opens
    useEffect(() => {
        if (open) {
            setIncludeVce(true);
        }
    }, [open]);

    const handleConfirm = () => {
        onConfirm(includeVce);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Generate PDF Report</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                        <p className="font-semibold text-foreground">
                            PDF generation will take approximately 1-2 minutes.
                        </p>
                        <div>
                            <p className="font-medium text-foreground mb-2">Please DO NOT:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Close this tab</li>
                                <li>Navigate away from this page</li>
                                <li>Refresh the browser</li>
                            </ul>
                        </div>
                        <p className="text-sm">
                            The PDF will automatically download when generation is complete.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* VCE Checkbox Option */}
                <div className="flex items-center space-x-3 py-3 px-1 border-t border-gray-200 mt-2">
                    <Checkbox
                        id="include-vce"
                        checked={includeVce}
                        onCheckedChange={(checked: boolean | "indeterminate") => setIncludeVce(checked === true)}
                    />
                    <Label
                        htmlFor="include-vce"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        Include VCE Questionnaire Results
                    </Label>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>
                        Generate PDF
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

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

interface PdfGenerationWarningDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export const PdfGenerationWarningDialog = ({
    open,
    onOpenChange,
    onConfirm,
}: PdfGenerationWarningDialogProps) => {
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
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Generate PDF
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

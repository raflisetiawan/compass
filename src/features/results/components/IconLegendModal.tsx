import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface IconLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  legendData: {
    name: string;
    value: number;
    color: string;
    Icon?: React.ElementType;
    iconUrl?: string;
  }[];
}

export const IconLegendModal = ({
  isOpen,
  onClose,
  title,
  legendData,
}: IconLegendModalProps) => {
  if (!isOpen || !legendData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative pb-2">
          <CardTitle>{title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-4">
            {legendData.map((item) => (
              <div key={item.name} className="flex items-center">
                {item.iconUrl ? (
                  <img
                    src={item.iconUrl}
                    alt={item.name}
                    className="w-6 h-6 mr-3"
                  />
                ) : item.Icon ? (
                  <item.Icon
                    className="h-6 w-6 mr-3"
                    style={{ color: item.color }}
                  />
                ) : null}
                <span className="text-base">{`${item.value}% - ${item.name}`}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Application {
  applicationId: string;
  companyName: string;
}

interface ApplicationBadgeListProps {
  applications: Application[];
  onRemove?: (applicationId: string) => void;
  showRemoveButton?: boolean;
}

export function ApplicationBadgeList({
  applications,
  onRemove,
  showRemoveButton = false,
}: ApplicationBadgeListProps) {
  return (
    <div>
      <Label className="mb-3 block font-medium">
        {showRemoveButton ? "Selected Applications" : "Recipients"} (
        {applications.length})
      </Label>
      <div className="flex flex-wrap gap-2">
        {applications.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No applications selected
          </p>
        ) : (
          applications.map((app) => (
            <Badge
              className={showRemoveButton ? "gap-1 pr-1" : ""}
              key={app.applicationId}
              variant="secondary"
            >
              {app.companyName}
              {showRemoveButton && onRemove && (
                <Button
                  className="ml-1 h-4 w-4"
                  onClick={() => onRemove(app.applicationId)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

export function PaginationControls({
  page,
  totalPages,
  canPrev,
  canNext,
  onPrev,
  onNext,
  className = "",
}: PaginationControlsProps) {
  return (
    <div
      className={`flex items-center justify-end space-x-2 py-4 ${className}`}
    >
      <div className="flex-1 text-sm text-muted-foreground hidden sm:block">
        Page {page} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!canPrev}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm font-medium sm:hidden">
          {page} / {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canNext}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

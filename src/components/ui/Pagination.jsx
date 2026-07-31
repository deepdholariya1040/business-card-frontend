import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button.jsx";

export const Pagination = ({ page, totalPages, onChange, total }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3">
      <p className="text-xs text-ink-400">
        Page {page} of {totalPages}
        {typeof total === "number" && <span> · {total} total</span>}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;

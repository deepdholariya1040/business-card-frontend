import { useMemo, useState } from "react";

// The backend never paginates list endpoints server-side (no
// page/limit params are read anywhere in the controllers), so every
// list page paginates client-side over the full result set.
export const usePagination = (items = [], pageSize = 10) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    page: safePage,
    setPage,
    totalPages,
    pageItems,
    total: items.length,
  };
};

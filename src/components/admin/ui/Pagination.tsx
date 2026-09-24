type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
};

const ELLIPSIS = "ellipsis" as const;

function buildPageList(
  currentPage: number,
  totalPages: number,
): (number | typeof ELLIPSIS)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([
    1,
    2,
    totalPages - 1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const withEllipsis: (number | typeof ELLIPSIS)[] = [];

  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];

    if (previous !== undefined && page - previous > 1) {
      withEllipsis.push(ELLIPSIS);
    }

    withEllipsis.push(page);
  });

  return withEllipsis;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageList = buildPageList(currentPage, totalPages);

  const rangeStart =
    totalItems !== undefined && pageSize !== undefined
      ? (currentPage - 1) * pageSize + 1
      : null;

  const rangeEnd =
    totalItems !== undefined && pageSize !== undefined
      ? Math.min(currentPage * pageSize, totalItems)
      : null;

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {rangeStart !== null && rangeEnd !== null && totalItems !== undefined && (
        <p className="text-xs text-[var(--muted)]">
          Showing <span className="font-medium text-[var(--ink)]">{rangeStart}</span>–
          <span className="font-medium text-[var(--ink)]">{rangeEnd}</span> of{" "}
          <span className="font-medium text-[var(--ink)]">{totalItems}</span>
        </p>
      )}

      <nav
        aria-label="Pagination"
        className="flex items-center gap-1"
      >
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 text-xs font-medium text-[var(--ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--line)] disabled:hover:text-[var(--ink)]"
          aria-label="Previous page"
        >
          Prev
        </button>

        {pageList.map((page, index) =>
          page === ELLIPSIS ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1.5 text-xs text-[var(--muted)]"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors ${
                page === currentPage
                  ? "bg-[var(--brand)] text-white"
                  : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 text-xs font-medium text-[var(--ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--line)] disabled:hover:text-[var(--ink)]"
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    </div>
  );
}

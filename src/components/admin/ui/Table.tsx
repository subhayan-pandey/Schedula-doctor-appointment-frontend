"use client";

import type { ReactNode } from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";

export type TableColumn<T> = {
  /** Unique column key, also used as the React key for header/cell. */
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

export type TableStatus = "loading" | "error" | "ready";

type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;

  status?: TableStatus;

  loadingMessage?: string;

  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;

  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;

  onRowClick?: (row: T) => void;
  className?: string;
};

export default function Table<T>({
  columns,
  rows,
  keyExtractor,
  status = "ready",
  loadingMessage,
  errorTitle,
  errorDescription,
  onRetry,
  emptyTitle = "No records found",
  emptyDescription,
  emptyAction,
  onRowClick,
  className = "",
}: TableProps<T>) {
  if (status === "loading") {
    return <LoadingState message={loadingMessage} />;
  }

  if (status === "error") {
    return (
      <ErrorState
        title={errorTitle}
        description={errorDescription}
        action={
          onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] ${className}`}
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] bg-[var(--canvas)]">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)] ${
                  column.headerClassName ?? ""
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-[var(--line)] transition-colors last:border-b-0 ${
                onRowClick
                  ? "cursor-pointer hover:bg-[var(--brand-soft)]/40"
                  : ""
              }`}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 align-middle text-[var(--ink)] ${
                    column.className ?? ""
                  }`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

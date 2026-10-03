import type { ReportCell, ReportColumn, ReportRow } from "@/types/admin/reports";

/**
 * Spreadsheet apps execute cells that start with = + - @ as formulas.
 * Text cells (names, reasons, references) are prefixed with an apostrophe
 * so exported data can never run as a formula. Numbers are left alone.
 */
function neutraliseFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function escapeCsv(cell: ReportCell): string {
  const text = typeof cell === "number" ? String(cell) : neutraliseFormula(cell);

  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(columns: ReportColumn[], rows: ReportRow[]): string {
  const lines = [
    columns.map((column) => escapeCsv(column.header)).join(","),
    ...rows.map((row) =>
      columns.map((column) => escapeCsv(row.cells[column.key] ?? "")).join(","),
    ),
  ];

  // Leading BOM so Excel opens the file as UTF-8; CRLF per RFC 4180.
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

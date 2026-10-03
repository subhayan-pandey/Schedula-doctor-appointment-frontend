import { buildCsv } from "@/lib/admin/export/csv";
import { buildPdf } from "@/lib/admin/export/pdf";
import { buildXlsx } from "@/lib/admin/export/xlsx";

import type { ExportFormat, ReportResult } from "@/types/admin/reports";

const MIME: Record<ExportFormat, string> = {
  csv: "text/csv;charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: "CSV",
  xlsx: "Excel (.xlsx)",
  pdf: "PDF",
};

export function buildReportFilename(
  result: ReportResult,
  format: ExportFormat,
): string {
  const stamp = result.generatedAt.slice(0, 10);

  return `schedula-${result.type}-report-${stamp}.${format}`;
}

export function buildReportFile(
  result: ReportResult,
  format: ExportFormat,
): BlobPart {
  switch (format) {
    case "csv":
      return buildCsv(result.columns, result.rows);
    case "xlsx":
      return buildXlsx(result) as BlobPart;
    case "pdf":
      return buildPdf(result) as BlobPart;
  }
}

/** Builds the file in memory and triggers a browser download. */
export function downloadReport(
  result: ReportResult,
  format: ExportFormat,
): string {
  const filename = buildReportFilename(result, format);
  const blob = new Blob([buildReportFile(result, format)], {
    type: MIME[format],
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Give the browser a moment to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);

  return filename;
}

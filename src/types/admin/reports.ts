export type ReportType = "appointments" | "payments";

export type ReportCell = string | number;

export type ReportColumnKind = "text" | "number" | "currency";

export type ReportColumn = {
  key: string;
  /** Header text. Currency columns say "(INR)" here so exports are self-describing. */
  header: string;
  kind: ReportColumnKind;
  /** Relative width weight used by the PDF export. */
  weight: number;
};

export type ReportRow = {
  id: string;
  cells: Record<string, ReportCell>;
  /** Tone for the status badge in the on-screen table. */
  statusTone?: "neutral" | "brand" | "success" | "warning" | "danger";
};

export type ReportSummaryItem = {
  label: string;
  /** Shown on screen (₹ formatting). */
  display: string;
  /** Used in exports (no ₹ glyph, which PDF base fonts cannot draw). */
  plain: string;
};

export type ReportFilters = {
  type: ReportType;
  /** ISO date (YYYY-MM-DD) or "". */
  from: string;
  to: string;
  /** Appointment: "online" | "in-person". Payment: "card" | "upi". "all" = no filter. */
  kind: string;
  /** Appointment status, or payment status (paid/failed/refund-pending/refunded). "all" = no filter. */
  status: string;
  search: string;
};

export type ReportResult = {
  type: ReportType;
  title: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  summary: ReportSummaryItem[];
  /** Human-readable filter lines, e.g. "Status: Completed". */
  filterLines: string[];
  generatedAt: string;
};

export type ExportFormat = "csv" | "xlsx" | "pdf";

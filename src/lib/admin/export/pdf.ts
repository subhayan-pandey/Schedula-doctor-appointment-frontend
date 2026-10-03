import type { ReportResult } from "@/types/admin/reports";

/**
 * Dependency-free PDF writer: landscape A4, standard Helvetica fonts
 * (no embedding needed), repeating table header, page numbers.
 *
 * Standard fonts only cover Latin-1 text. Anything else (e.g. the ₹ sign,
 * emoji, non-Latin scripts) is replaced with "?" — report data uses
 * "INR" instead of ₹ for exactly that reason.
 */

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const MARGIN = 36;
const ROW_HEIGHT = 17;
const FONT_SIZE = 8.5;
const HEADER_FONT_SIZE = 8;

// Helvetica advance widths (per 1000 em) for ASCII 32–126.
const HELVETICA_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278,
  278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584,
  584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556,
  833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278,
  278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222,
  500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500,
  500, 334, 260, 334, 584,
];

// Characters outside ASCII that exist in WinAnsi at a different code.
const WIN_ANSI_MAP: Record<string, number> = {
  "–": 0x96,
  "—": 0x97,
  "‘": 0x91,
  "’": 0x92,
  "“": 0x93,
  "”": 0x94,
  "•": 0x95,
  "…": 0x85,
};

function toWinAnsi(text: string): string {
  let output = "";

  for (const char of text.normalize("NFC")) {
    const code = char.codePointAt(0) ?? 63;

    if (code === 9 || code === 10 || code === 13) {
      output += " ";
    } else if (code >= 32 && code <= 126) {
      output += char;
    } else if (WIN_ANSI_MAP[char] !== undefined) {
      output += String.fromCharCode(WIN_ANSI_MAP[char]);
    } else if (code >= 160 && code <= 255) {
      output += char;
    } else {
      output += "?";
    }
  }

  return output;
}

function charWidth(char: string): number {
  const code = char.charCodeAt(0);

  return code >= 32 && code <= 126 ? HELVETICA_WIDTHS[code - 32] : 556;
}

function textWidth(text: string, size: number, bold = false): number {
  let width = 0;

  for (const char of text) {
    width += charWidth(char);
  }

  return ((width * (bold ? 1.06 : 1)) / 1000) * size;
}

function fitText(text: string, maxWidth: number, size: number, bold = false) {
  const clean = toWinAnsi(text);

  if (textWidth(clean, size, bold) <= maxWidth) {
    return clean;
  }

  const ellipsis = "...";
  let result = clean;

  while (
    result.length > 0 &&
    textWidth(result + ellipsis, size, bold) > maxWidth
  ) {
    result = result.slice(0, -1);
  }

  return result.trimEnd() + ellipsis;
}

function escapePdfString(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function num(value: number): string {
  return Number(value.toFixed(2)).toString();
}

type Align = "left" | "right";

class PageBuilder {
  private ops: string[] = [];

  fill(r: number, g: number, b: number) {
    this.ops.push(`${num(r)} ${num(g)} ${num(b)} rg`);
  }

  stroke(r: number, g: number, b: number) {
    this.ops.push(`${num(r)} ${num(g)} ${num(b)} RG`);
  }

  rect(x: number, y: number, w: number, h: number, mode: "f" | "S" = "f") {
    this.ops.push(`${num(x)} ${num(y)} ${num(w)} ${num(h)} re ${mode}`);
  }

  line(x1: number, y1: number, x2: number, y2: number) {
    this.ops.push(`${num(x1)} ${num(y1)} m ${num(x2)} ${num(y2)} l S`);
  }

  text(
    text: string,
    x: number,
    y: number,
    size: number,
    bold = false,
    align: Align = "left",
    width = 0,
  ) {
    const safe = toWinAnsi(text);
    const startX =
      align === "right" ? x + width - textWidth(safe, size, bold) : x;

    this.ops.push(
      `BT /${bold ? "F2" : "F1"} ${num(size)} Tf ${num(startX)} ${num(y)} Td (${escapePdfString(safe)}) Tj ET`,
    );
  }

  build(): string {
    return this.ops.join("\n");
  }
}

const INK: [number, number, number] = [0.07, 0.14, 0.17];
const MUTED: [number, number, number] = [0.39, 0.45, 0.47];
const BRAND: [number, number, number] = [0.06, 0.56, 0.64];
const HEADER_BG: [number, number, number] = [0.91, 0.97, 0.98];
const ZEBRA: [number, number, number] = [0.97, 0.98, 0.98];
const LINE: [number, number, number] = [0.88, 0.91, 0.92];

export function buildPdf(result: ReportResult): Uint8Array {
  const { columns, rows } = result;
  const pages: PageBuilder[] = [];

  const contentWidth = PAGE_WIDTH - MARGIN * 2;
  const totalWeight = columns.reduce((sum, column) => sum + column.weight, 0);
  const columnWidths = columns.map(
    (column) => (column.weight / totalWeight) * contentWidth,
  );
  const columnX = columnWidths.map((_, index) =>
    columnWidths.slice(0, index).reduce((sum, width) => sum + width, 0) + MARGIN,
  );

  const CELL_PAD = 5;

  function drawTableHeader(page: PageBuilder, top: number) {
    page.fill(...HEADER_BG);
    page.rect(MARGIN, top - ROW_HEIGHT, contentWidth, ROW_HEIGHT);
    page.fill(...INK);

    columns.forEach((column, index) => {
      page.text(
        fitText(
          column.header,
          columnWidths[index] - CELL_PAD * 2,
          HEADER_FONT_SIZE,
          true,
        ),
        columnX[index] + CELL_PAD,
        top - ROW_HEIGHT + 5.5,
        HEADER_FONT_SIZE,
        true,
        column.kind === "text" ? "left" : "right",
        columnWidths[index] - CELL_PAD * 2,
      );
    });
  }

  /* ---------------- Page 1: title, filters, summary ---------------- */

  let page = new PageBuilder();

  pages.push(page);

  let y = PAGE_HEIGHT - MARGIN;

  page.fill(...BRAND);
  page.text("Schedula Admin", MARGIN, y - 9, 9, true);

  y -= 30;
  page.fill(...INK);
  page.text(result.title, MARGIN, y, 18, true);

  y -= 16;
  page.fill(...MUTED);
  page.text(
    `Generated ${new Date(result.generatedAt).toLocaleString("en-US")}  |  ${rows.length} record${rows.length === 1 ? "" : "s"}`,
    MARGIN,
    y,
    9,
  );

  y -= 14;
  page.text(
    `Filters: ${result.filterLines.length > 0 ? result.filterLines.join("  |  ") : "none"}`,
    MARGIN,
    y,
    9,
  );

  y -= 26;
  page.fill(...INK);
  page.text("Summary", MARGIN, y, 11, true);

  y -= 8;
  page.stroke(...LINE);
  page.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  // Summary as a tidy grid of label / value pairs, 3 per row.
  const SUMMARY_COLS = 3;
  const summaryColWidth = contentWidth / SUMMARY_COLS;

  result.summary.forEach((item, index) => {
    const col = index % SUMMARY_COLS;
    const row = Math.floor(index / SUMMARY_COLS);
    const x = MARGIN + col * summaryColWidth;
    const top = y - 16 - row * 34;

    page.fill(...MUTED);
    page.text(fitText(item.label, summaryColWidth - 12, 8), x, top, 8);
    page.fill(...INK);
    page.text(fitText(item.plain, summaryColWidth - 12, 13, true), x, top - 15, 13, true);
  });

  y -= 16 + Math.ceil(result.summary.length / SUMMARY_COLS) * 34 + 14;

  page.fill(...INK);
  page.text("Details", MARGIN, y, 11, true);
  y -= 8;

  /* ---------------- Detail table (paginated) ----------------------- */

  const bottomLimit = MARGIN + 18;

  drawTableHeader(page, y);
  y -= ROW_HEIGHT;

  if (rows.length === 0) {
    page.fill(...MUTED);
    page.text("No records match the selected filters.", MARGIN + CELL_PAD, y - 12, 9);
  }

  rows.forEach((row, rowIndex) => {
    if (y - ROW_HEIGHT < bottomLimit) {
      page = new PageBuilder();
      pages.push(page);
      y = PAGE_HEIGHT - MARGIN;
      drawTableHeader(page, y);
      y -= ROW_HEIGHT;
    }

    if (rowIndex % 2 === 1) {
      page.fill(...ZEBRA);
      page.rect(MARGIN, y - ROW_HEIGHT, contentWidth, ROW_HEIGHT);
    }

    page.fill(...INK);

    columns.forEach((column, index) => {
      const value = row.cells[column.key] ?? "";
      const display =
        typeof value === "number"
          ? new Intl.NumberFormat("en-IN").format(value)
          : value;

      page.text(
        fitText(display, columnWidths[index] - CELL_PAD * 2, FONT_SIZE),
        columnX[index] + CELL_PAD,
        y - ROW_HEIGHT + 5.5,
        FONT_SIZE,
        false,
        column.kind === "text" ? "left" : "right",
        columnWidths[index] - CELL_PAD * 2,
      );
    });

    page.stroke(...LINE);
    page.line(MARGIN, y - ROW_HEIGHT, PAGE_WIDTH - MARGIN, y - ROW_HEIGHT);

    y -= ROW_HEIGHT;
  });

  // Footer on every page.
  pages.forEach((builder, index) => {
    builder.fill(...MUTED);
    builder.text(`Schedula Admin - ${result.title}`, MARGIN, 20, 8);
    builder.text(
      `Page ${index + 1} of ${pages.length}`,
      MARGIN,
      20,
      8,
      false,
      "right",
      contentWidth,
    );
  });

  /* ---------------- Assemble the file ------------------------------- */

  // Object ids: 1 catalog, 2 pages, 3 Helvetica, 4 Helvetica-Bold,
  // then (page, content) pairs.
  const objects: string[] = [];
  const pageIds = pages.map((_, index) => 5 + index * 2);

  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;
  objects[4] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`;

  pages.forEach((builder, index) => {
    const pageId = 5 + index * 2;
    const contentId = pageId + 1;
    const stream = builder.build();

    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  // Every character is < 256, so string length === byte length.
  let output = "%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n";
  const offsets: number[] = [];

  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = output.length;
    output += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = output.length;

  output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;

  for (let id = 1; id < objects.length; id += 1) {
    output += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }

  output += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const bytes = new Uint8Array(output.length);

  for (let i = 0; i < output.length; i += 1) {
    bytes[i] = output.charCodeAt(i) & 0xff;
  }

  return bytes;
}

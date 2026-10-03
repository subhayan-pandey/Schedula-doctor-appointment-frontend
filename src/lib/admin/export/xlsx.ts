import { createZip } from "@/lib/admin/export/zip";

import type {
  ReportColumn,
  ReportResult,
  ReportRow,
} from "@/types/admin/reports";

/** Excel 2007+ (.xlsx) writer — no dependencies. */

// Strip characters XML 1.0 cannot represent.
// eslint-disable-next-line no-control-regex
const ILLEGAL_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;

function escapeXml(value: string): string {
  return value
    .replace(ILLEGAL_XML, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function columnLetter(index: number): string {
  let n = index + 1;
  let letters = "";

  while (n > 0) {
    const remainder = (n - 1) % 26;

    letters = String.fromCharCode(65 + remainder) + letters;
    n = Math.floor((n - 1) / 26);
  }

  return letters;
}

// Style ids defined in STYLES below.
const STYLE_HEADER = 1;
const STYLE_NUMBER = 2;
const STYLE_TITLE = 3;
const STYLE_LABEL = 4;

function textCell(ref: string, value: string, style = 0): string {
  const styleAttr = style ? ` s="${style}"` : "";

  return `<c r="${ref}" t="inlineStr"${styleAttr}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function numberCell(ref: string, value: number, style = STYLE_NUMBER): string {
  return Number.isFinite(value)
    ? `<c r="${ref}" s="${style}"><v>${value}</v></c>`
    : textCell(ref, "");
}

type SheetOptions = {
  rows: string[];
  columnWidths: number[];
  freezeHeaderRow?: number;
  autoFilterRef?: string;
};

function sheetXml({
  rows,
  columnWidths,
  freezeHeaderRow,
  autoFilterRef,
}: SheetOptions): string {
  const cols = columnWidths
    .map(
      (width, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`,
    )
    .join("");

  const pane = freezeHeaderRow
    ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${freezeHeaderRow}" topLeftCell="A${freezeHeaderRow + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${pane}<cols>${cols}</cols><sheetData>${rows.join("")}</sheetData>${
    autoFilterRef ? `<autoFilter ref="${autoFilterRef}"/>` : ""
  }</worksheet>`;
}

function detailRows(columns: ReportColumn[], rows: ReportRow[]): string[] {
  const header = `<row r="1">${columns
    .map((column, index) =>
      textCell(`${columnLetter(index)}1`, column.header, STYLE_HEADER),
    )
    .join("")}</row>`;

  const body = rows.map((row, rowIndex) => {
    const excelRow = rowIndex + 2;

    return `<row r="${excelRow}">${columns
      .map((column, index) => {
        const ref = `${columnLetter(index)}${excelRow}`;
        const value = row.cells[column.key] ?? "";

        return typeof value === "number"
          ? numberCell(ref, value)
          : textCell(ref, value);
      })
      .join("")}</row>`;
  });

  return [header, ...body];
}

function summaryRows(result: ReportResult): string[] {
  const rows: string[] = [];
  let r = 1;

  rows.push(`<row r="${r}">${textCell(`A${r}`, result.title, STYLE_TITLE)}</row>`);
  r += 1;
  rows.push(
    `<row r="${r}">${textCell(`A${r}`, "Generated", STYLE_LABEL)}${textCell(
      `B${r}`,
      new Date(result.generatedAt).toLocaleString("en-US"),
    )}</row>`,
  );
  r += 1;

  (result.filterLines.length > 0
    ? result.filterLines
    : ["No filters applied"]
  ).forEach((line, index) => {
    rows.push(
      `<row r="${r}">${textCell(
        `A${r}`,
        index === 0 ? "Filters" : "",
        STYLE_LABEL,
      )}${textCell(`B${r}`, line)}</row>`,
    );
    r += 1;
  });

  r += 1;
  rows.push(`<row r="${r}">${textCell(`A${r}`, "Summary", STYLE_HEADER)}${textCell(`B${r}`, "", STYLE_HEADER)}</row>`);
  r += 1;

  result.summary.forEach((item) => {
    rows.push(
      `<row r="${r}">${textCell(`A${r}`, item.label)}${textCell(
        `B${r}`,
        item.plain,
      )}</row>`,
    );
    r += 1;
  });

  return rows;
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="14"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE7F8FB"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="5">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

export function buildXlsx(result: ReportResult): Uint8Array {
  const { columns, rows } = result;
  const lastColumn = columnLetter(Math.max(columns.length - 1, 0));

  const summarySheet = sheetXml({
    rows: summaryRows(result),
    columnWidths: [26, 44],
  });

  const detailSheet = sheetXml({
    rows: detailRows(columns, rows),
    columnWidths: columns.map((column) =>
      Math.min(Math.max(Math.round(column.weight * 14), 12), 40),
    ),
    freezeHeaderRow: 1,
    autoFilterRef: rows.length > 0 ? `A1:${lastColumn}${rows.length + 1}` : undefined,
  });

  return createZip([
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Summary" sheetId="1" r:id="rId1"/><sheet name="Details" sheetId="2" r:id="rId2"/></sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    { name: "xl/styles.xml", content: STYLES },
    { name: "xl/worksheets/sheet1.xml", content: summarySheet },
    { name: "xl/worksheets/sheet2.xml", content: detailSheet },
  ]);
}

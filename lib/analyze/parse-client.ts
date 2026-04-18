// Client-side file parsing. Files never leave the browser unparsed.
//
// For xlsx/csv/docx/txt/md we produce a `text` payload (markdown-ish).
// For pdf we keep the original bytes as base64 for Claude's `document` block.
//
// Parsers are dynamically imported so they don't inflate initial bundle.

export type ParsedFile =
  | {
      kind: "text";
      name: string;
      mime: string;
      size: number;
      text: string;
      truncated: boolean;
    }
  | {
      kind: "pdf";
      name: string;
      mime: string;
      size: number;
      base64: string;
    };

// Keep the chat payload sane. ~12k tokens per file ≈ 40k chars of English text.
const MAX_TEXT_CHARS = 40_000;
const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB hard cap to avoid 500k-page PDFs

function truncate(s: string): { text: string; truncated: boolean } {
  if (s.length <= MAX_TEXT_CHARS) return { text: s, truncated: false };
  return {
    text: s.slice(0, MAX_TEXT_CHARS) + "\n\n[...truncated. Upload a smaller extract if you need the rest analyzed...]",
    truncated: true,
  };
}

function arrayBufferToBase64(ab: ArrayBuffer): string {
  const bytes = new Uint8Array(ab);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

async function parseXlsx(file: File): Promise<string> {
  const ExcelJS = (await import("exceljs")).default;
  const ab = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(ab);
  const out: string[] = [];
  wb.eachSheet((sheet) => {
    out.push(`## sheet: ${sheet.name}`);
    const rows: string[][] = [];
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const values = (row.values as unknown[]).slice(1).map((v) => {
        if (v === null || v === undefined) return "";
        if (typeof v === "object" && v !== null && "text" in (v as Record<string, unknown>)) {
          return String((v as { text: unknown }).text ?? "");
        }
        if (v instanceof Date) return v.toISOString();
        return String(v);
      });
      rows.push(values);
    });
    if (rows.length === 0) {
      out.push("_(empty)_");
      return;
    }
    // render as a simple pipe table so Claude parses it naturally
    const cols = Math.max(...rows.map((r) => r.length));
    const header = rows[0].concat(Array(cols - rows[0].length).fill(""));
    const sep = header.map(() => "---");
    const body = rows.slice(1).map((r) => r.concat(Array(cols - r.length).fill("")));
    out.push(`| ${header.join(" | ")} |`);
    out.push(`| ${sep.join(" | ")} |`);
    for (const r of body) out.push(`| ${r.join(" | ")} |`);
  });
  return out.join("\n");
}

async function parseCsv(file: File): Promise<string> {
  const Papa = (await import("papaparse")).default;
  const text = await file.text();
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
  const rows = parsed.data as string[][];
  if (rows.length === 0) return "_(empty csv)_";
  const cols = Math.max(...rows.map((r) => r.length));
  const header = rows[0].concat(Array(cols - rows[0].length).fill(""));
  const sep = header.map(() => "---");
  const body = rows.slice(1).map((r) => r.concat(Array(cols - r.length).fill("")));
  const lines: string[] = [];
  lines.push(`| ${header.join(" | ")} |`);
  lines.push(`| ${sep.join(" | ")} |`);
  for (const r of body) lines.push(`| ${r.join(" | ")} |`);
  return lines.join("\n");
}

async function parseDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser.js");
  const ab = await file.arrayBuffer();
  const { value } = await mammoth.convertToMarkdown({ arrayBuffer: ab });
  return value;
}

async function parsePlain(file: File): Promise<string> {
  return (await file.text()).replace(/\r\n/g, "\n");
}

async function parsePdf(file: File): Promise<string> {
  const ab = await file.arrayBuffer();
  return arrayBufferToBase64(ab);
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const name = file.name;
  const lower = name.toLowerCase();
  const size = file.size;
  const mime = file.type || "application/octet-stream";

  if (lower.endsWith(".pdf") || mime === "application/pdf") {
    if (size > MAX_PDF_BYTES) throw new Error(`${name}: PDF too large (max 25 MB).`);
    const base64 = await parsePdf(file);
    return { kind: "pdf", name, mime: "application/pdf", size, base64 };
  }

  let text: string;
  if (lower.endsWith(".xlsx") || lower.endsWith(".xlsm")) {
    text = await parseXlsx(file);
  } else if (lower.endsWith(".csv")) {
    text = await parseCsv(file);
  } else if (lower.endsWith(".docx")) {
    text = await parseDocx(file);
  } else if (lower.endsWith(".txt") || lower.endsWith(".md") || mime.startsWith("text/")) {
    text = await parsePlain(file);
  } else {
    throw new Error(`${name}: unsupported file type. Use xlsx, csv, pdf, docx, txt, or md.`);
  }

  const { text: finalText, truncated } = truncate(text);
  return { kind: "text", name, mime, size, text: finalText, truncated };
}

export function summarizeFileList(files: ParsedFile[]): string {
  return files
    .map((f) => `${f.name} (${Math.round(f.size / 1024)} KB)${f.kind === "text" && f.truncated ? " — truncated" : ""}`)
    .join(", ");
}

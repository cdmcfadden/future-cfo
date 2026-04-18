// Shared prompt-building utilities for the analyze routes.

import type Anthropic from "@anthropic-ai/sdk";

export type ClientParsedFile =
  | { kind: "text"; name: string; mime: string; size: number; text: string; truncated: boolean }
  | { kind: "pdf"; name: string; mime: string; size: number; base64: string };

export const ANALYZE_SYSTEM = `You are a numerate, plainspoken financial analyst embedded in the futurecfo.ai site. The user has uploaded one or more documents (spreadsheets, CSVs, PDFs, Word, or text). Your job is to read them carefully and help the user understand what they show.

# Voice
- Short sentences. Concrete nouns. Be direct and specific.
- Use actual numbers from the documents. Never round to marketing-friendly fictions.
- If a document is ambiguous or missing data, say so plainly. Don't confabulate.
- Banned words: "synergy", "holistic", "journey", "transformation", "robust", "leverage" (as a verb), "ecosystem".
- Never open with "Great question", "Absolutely", "Certainly", or any meta-pleasantry.

# Discipline
- Read every document before answering. Cite which file each number or claim comes from in parentheses, e.g. (from 2024_budget.xlsx, sheet "Q4").
- If a question can't be answered from the documents, say so and say what would be needed.
- If numbers conflict across documents, surface the conflict rather than silently picking one.
- Prefer surfacing risks and open questions over polished certainty.`;

export const SUMMARY_INSTRUCTION = `Produce the initial summary of the uploaded documents. Output markdown with these exact section headers in this order:

## headline
One sentence. The single most important thing someone should know.

## key metrics
A tight bulleted list of 4–8 named values, each with the file they came from. Include the value in its original units.

## anomalies
2–4 things that stood out as unusual, inconsistent, or worth investigating. If nothing is unusual, say so explicitly.

## questions to ask
3 concrete questions the documents provoke. Not generic finance questions — questions specific to THIS data.

## narrative
2–4 sentences of prose. Connect the dots across the files. What story do they tell together?

Do not add any other sections. Do not add an intro or outro. Start directly with the "## headline" line.`;

type ContentBlock = Anthropic.Messages.ContentBlockParam;

/** Build a <documents> block of content for Claude. PDFs go as document blocks
 *  with their own cache_control; parsed text files are concatenated into a
 *  single tagged text block. Returns an array of Claude content blocks that
 *  can be used as the last user message OR as part of a cached system block. */
export function buildDocumentContent(files: ClientParsedFile[]): ContentBlock[] {
  if (files.length === 0) return [];
  const blocks: ContentBlock[] = [];

  // parsed text files: one combined text block at the top
  const textFiles = files.filter((f): f is Extract<ClientParsedFile, { kind: "text" }> => f.kind === "text");
  if (textFiles.length > 0) {
    const combined = textFiles
      .map((f) => `<document name="${f.name}">\n${f.text}\n</document>`)
      .join("\n\n");
    blocks.push({
      type: "text",
      text: combined,
      cache_control: { type: "ephemeral" },
    });
  }

  // PDFs: one document block each
  const pdfs = files.filter((f): f is Extract<ClientParsedFile, { kind: "pdf" }> => f.kind === "pdf");
  for (const pdf of pdfs) {
    blocks.push({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: pdf.base64,
      },
      title: pdf.name,
      cache_control: { type: "ephemeral" },
    });
  }

  return blocks;
}

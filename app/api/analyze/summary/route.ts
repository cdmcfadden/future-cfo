import Anthropic from "@anthropic-ai/sdk";
import { hasValidAuthCookie } from "@/lib/analyze/auth";
import { ANALYZE_SYSTEM, SUMMARY_INSTRUCTION, buildDocumentContent, type ClientParsedFile } from "@/lib/analyze/prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  if (!(await hasValidAuthCookie())) {
    return new Response(JSON.stringify({ error: "Unauthorized. Enter the password." }), { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Chat not configured. Set ANTHROPIC_API_KEY." }), { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as { files?: ClientParsedFile[] };
  const files = body.files ?? [];
  if (files.length === 0 || files.length > 5) {
    return new Response(JSON.stringify({ error: "Upload between 1 and 5 files." }), { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const docBlocks = buildDocumentContent(files);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          temperature: 0.4,
          system: [{ type: "text", text: ANALYZE_SYSTEM }],
          messages: [
            {
              role: "user",
              content: [
                ...docBlocks,
                { type: "text", text: SUMMARY_INSTRUCTION },
              ],
            },
          ],
        });
        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error("analyze/summary error", err);
        const msg = err instanceof Error ? err.message : "summary failed";
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

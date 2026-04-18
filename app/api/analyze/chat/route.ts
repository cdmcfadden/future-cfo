import Anthropic from "@anthropic-ai/sdk";
import { hasValidAuthCookie } from "@/lib/analyze/auth";
import { ANALYZE_SYSTEM, buildDocumentContent, type ClientParsedFile } from "@/lib/analyze/prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type ChatMessage = { role: "user" | "assistant"; content: string };
const MAX_HISTORY = 24;

export async function POST(req: Request) {
  if (!(await hasValidAuthCookie())) {
    return new Response(JSON.stringify({ error: "Unauthorized." }), { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Chat not configured." }), { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    files?: ClientParsedFile[];
    messages?: ChatMessage[];
  };
  const files = body.files ?? [];
  if (files.length === 0 || files.length > 5) {
    return new Response(JSON.stringify({ error: "Upload files first." }), { status: 400 });
  }
  const all = (body.messages ?? []).filter((m) => m.content?.trim());
  if (all.length === 0) {
    return new Response(JSON.stringify({ error: "No messages." }), { status: 400 });
  }
  let history = all.slice(-MAX_HISTORY);
  while (history.length > 0 && history[0].role !== "user") history = history.slice(1);
  if (history.length === 0) history = [all[all.length - 1]];

  const client = new Anthropic({ apiKey });
  const docBlocks = buildDocumentContent(files);

  // Inject documents into the FIRST user turn so cache_control works cleanly
  // on the documents + everything-up-to-them. Subsequent turns keep the
  // documents cached across requests within the 5-minute TTL.
  const [firstUser, ...rest] = history;
  const turns = [
    {
      role: "user" as const,
      content: [...docBlocks, { type: "text" as const, text: firstUser.content }],
    },
    ...rest.map((m) => ({ role: m.role, content: m.content })),
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1600,
          temperature: 0.4,
          system: [{ type: "text", text: ANALYZE_SYSTEM }],
          messages: turns,
        });
        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error("analyze/chat error", err);
        const msg = err instanceof Error ? err.message : "chat failed";
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

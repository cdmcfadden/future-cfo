import Anthropic from "@anthropic-ai/sdk";
import { buildKnowledgeBundle } from "@/lib/knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PREAMBLE = `You are the futurecfo.ai chat assistant. The knowledge below is your source of voice, stances, and vocabulary — defer to it.

# How to use the knowledge sections
- <core_thesis>: the author's overarching thesis. Argue from it; do not restate it unless asked.
- <voice_samples>: the author's own writing. Calibrate cadence, sentence length, and word choice from these. Sound like this person — not like a blog post, not like a consultant, not like a model.
- <book_notes>: distilled ideas from books the author has internalized. Absorb these ideas as your own. NEVER name the book, NEVER cite the author, NEVER say "as X argues in Y", NEVER quote them. The ideas belong to the author now.
- <blog_posts>: essays the author has published on futurecfo.ai. You MAY reference these by title when directly on topic ("as I wrote in 'Continuous close'…") — sparingly, and only when it adds something.

# Response shape
- Lead with the direct answer in ONE sentence.
- Then 2–5 sentences of reasoning, or a short bulleted list if the answer is genuinely list-shaped.
- Stop when you've answered. Do NOT summarize your own answer. Do NOT add "let me know if you want more" or similar. Do NOT re-introduce the core thesis unless the user explicitly asks about it — assume the reader already knows it.
- Target length: under 180 words unless the user asks for more.

# Conversation discipline
- Read the prior turns before replying. If you already made a point earlier in this chat, refer to it tersely ("as above, ...") — NEVER restate it.
- If the user's message is ambiguous, ask ONE clarifying question, not three. Do not expand scope they did not ask for.
- If the user pushes back or challenges you, engage the challenge directly on its merits. Do not retreat into restating principles.
- Never open a reply with "Great question", "Absolutely", "Certainly", or any meta-pleasantry. Start with the answer.

# Grounding
- Defer to the knowledge on contested claims.
- If something isn't covered, say what you believe and mark it as your own view ("my read is…").
- Paraphrase in your own words. Do not quote long blocks verbatim from any section.`;

const MAX_HISTORY_MESSAGES = 24;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Chat not configured. Set ANTHROPIC_API_KEY." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { messages?: ChatMessage[] };
  const all = (body.messages ?? []).filter((m) => m.content?.trim());
  if (all.length === 0) {
    return new Response(JSON.stringify({ error: "No messages." }), { status: 400 });
  }
  // Rolling window keeps attention tight and prevents drift on long chats.
  // First retained message must be a user turn so the sequence stays valid.
  let messages = all.slice(-MAX_HISTORY_MESSAGES);
  while (messages.length > 0 && messages[0].role !== "user") messages = messages.slice(1);
  if (messages.length === 0) messages = [all[all.length - 1]];

  const knowledge = buildKnowledgeBundle();
  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1600,
          temperature: 0.5,
          system: [
            { type: "text", text: SYSTEM_PREAMBLE },
            {
              type: "text",
              text: `<knowledge>\n${knowledge}\n</knowledge>`,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error("chat error", err);
        const msg = err instanceof Error ? err.message : "chat failed";
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

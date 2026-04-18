"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I start a continuous close?",
  "Should agents live on the headcount plan?",
  "What metrics should I track in an AI-native org?",
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function reset() {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages([]);
  }

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || streaming) return;

    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `request failed: ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const last = m[m.length - 1];
          if (!last || last.role !== "assistant") return m;
          return [...m.slice(0, -1), { ...last, content: last.content + chunk }];
        });
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      const errMsg = `[error: ${e instanceof Error ? e.message : "unknown"}]`;
      setMessages((m) => {
        const last = m[m.length - 1];
        if (!last || last.role !== "assistant" || last.content !== "") return m;
        return [...m.slice(0, -1), { ...last, content: errMsg }];
      });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setStreaming(false);
    }
  }

  return (
    <div className="glass rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-10rem)] max-h-[820px]">
      <div className="px-6 py-4 border-b border-line/60 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-accent shadow-glow animate-pulse-slow" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">future CFO</div>
          <div className="text-xs font-mono text-muted">grounded in /knowledge/futurecfo.md</div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={reset}
            className="text-xs font-mono text-muted hover:text-accent border border-line hover:border-accent/50 px-3 py-1.5 rounded-full transition"
            title="Clear this conversation and start over"
          >
            reset ↺
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {messages.length === 0 && (
          <div className="max-w-xl">
            <p className="text-muted leading-relaxed">
              Ask about capital allocation in the era of agents, the continuous close,
              the org chart of an AI-native company, or how the CFO role rewires when
              software compounds faster than headcount.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left px-4 py-3 rounded-xl bg-surface/70 border border-line hover:border-accent/50 hover:text-accent text-sm text-white/90 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isUser = m.role === "user";
          const isEmpty = !m.content;
          const showDots = isEmpty && streaming && i === messages.length - 1;
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 leading-relaxed ${
                  isUser
                    ? "bg-accent text-ink font-medium whitespace-pre-wrap"
                    : "bg-surface2/80 border border-line text-white"
                }`}
              >
                {isUser ? (
                  m.content
                ) : showDots ? (
                  <TypingDots />
                ) : (
                  <AssistantMarkdown content={m.content} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-line/60 p-4 flex gap-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the future CFO…"
          className="flex-1 px-4 py-3 rounded-full bg-surface/80 border border-line focus:border-accent/60 outline-none text-white placeholder:text-muted transition"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="px-5 py-3 rounded-full bg-accent text-ink font-medium hover:shadow-glow disabled:opacity-40 transition"
        >
          {streaming ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}

function AssistantMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...p }) => (
          <a {...p} target="_blank" rel="noreferrer" className="text-accent underline" />
        ),
        code: ({ className, children, ...p }) =>
          className ? (
            <code className={className} {...p}>{children}</code>
          ) : (
            <code className="font-mono text-accent bg-surface/60 px-1 py-0.5 rounded" {...p}>
              {children}
            </code>
          ),
        ul: ({ node, ...p }) => <ul {...p} className="list-disc pl-5 space-y-1 my-2" />,
        ol: ({ node, ...p }) => <ol {...p} className="list-decimal pl-5 space-y-1 my-2" />,
        li: ({ node, ...p }) => <li {...p} className="marker:text-accent" />,
        p: ({ node, ...p }) => <p {...p} className="mb-2 last:mb-0" />,
        h1: ({ node, ...p }) => <h3 {...p} className="text-lg font-semibold mt-3 mb-1" />,
        h2: ({ node, ...p }) => <h3 {...p} className="text-base font-semibold mt-3 mb-1" />,
        h3: ({ node, ...p }) => <h3 {...p} className="text-base font-semibold mt-3 mb-1" />,
        blockquote: ({ node, ...p }) => (
          <blockquote {...p} className="border-l-2 border-accent/40 pl-3 text-muted my-2" />
        ),
        strong: ({ node, ...p }) => <strong {...p} className="text-white font-semibold" />,
        hr: () => <hr className="my-3 border-line" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 text-muted">
      <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" />
    </span>
  );
}

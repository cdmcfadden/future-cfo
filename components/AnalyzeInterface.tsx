"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PasswordGate from "@/components/PasswordGate";
import FileUpload from "@/components/FileUpload";
import type { ParsedFile } from "@/lib/analyze/parse-client";

type Msg = { role: "user" | "assistant"; content: string };

export default function AnalyzeInterface() {
  const [authed, setAuthed] = useState(false);
  const [files, setFiles] = useState<ParsedFile[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [summaryStreaming, setSummaryStreaming] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [chatStreaming, setChatStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatStreaming]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const runSummary = useCallback(async () => {
    if (files.length === 0 || summaryStreaming) return;
    setSummary("");
    setMessages([]);
    setSummaryStreaming(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/analyze/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `request failed: ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setSummary((s) => s + chunk);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setSummary((s) => s + `\n\n[error: ${e instanceof Error ? e.message : "unknown"}]`);
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
      setSummaryStreaming(false);
    }
  }, [files, summaryStreaming]);

  async function sendChat(text: string) {
    const clean = text.trim();
    if (!clean || chatStreaming || files.length === 0) return;
    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setChatStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/analyze/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, messages: next }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `request failed: ${res.status}`);
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
      setMessages((m) => {
        const last = m[m.length - 1];
        if (!last || last.role !== "assistant" || last.content !== "") return m;
        const errMsg = `[error: ${e instanceof Error ? e.message : "unknown"}]`;
        return [...m.slice(0, -1), { ...last, content: errMsg }];
      });
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
      setChatStreaming(false);
    }
  }

  function resetAll() {
    abortRef.current?.abort();
    setFiles([]);
    setSummary("");
    setMessages([]);
    setSummaryStreaming(false);
    setChatStreaming(false);
  }

  if (!authed) return <PasswordGate onAuthed={() => setAuthed(true)} />;

  const anyBusy = summaryStreaming || chatStreaming;
  const hasSummary = summary.length > 0;

  return (
    <div className="space-y-8">
      <FileUpload files={files} setFiles={setFiles} disabled={anyBusy} />

      {files.length > 0 && !hasSummary && (
        <div className="flex justify-end">
          <button
            onClick={runSummary}
            disabled={summaryStreaming}
            className="px-5 py-3 rounded-full bg-accent text-ink font-medium hover:shadow-glow disabled:opacity-60 transition"
          >
            {summaryStreaming ? "analyzing…" : "analyze →"}
          </button>
        </div>
      )}

      {hasSummary && (
        <section className="glass rounded-3xl p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-mono text-accent uppercase tracking-widest">/ summary</div>
            <button
              onClick={resetAll}
              className="text-xs font-mono text-muted hover:text-accent border border-line hover:border-accent/50 px-3 py-1.5 rounded-full transition"
              title="Clear files and start over"
            >
              reset ↺
            </button>
          </div>
          <div className="prose prose-invert prose-invert-tweaks max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
          </div>
        </section>
      )}

      {hasSummary && (
        <section className="glass rounded-3xl overflow-hidden flex flex-col" style={{ minHeight: 400 }}>
          <div className="px-6 py-4 border-b border-line/60 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-accent shadow-glow animate-pulse-slow" />
            <div>
              <div className="text-sm font-semibold text-white">ask about these files</div>
              <div className="text-xs font-mono text-muted">context: {files.length} file{files.length === 1 ? "" : "s"}, cached for this session</div>
            </div>
          </div>
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 max-h-[520px]">
            {messages.length === 0 && (
              <p className="text-muted text-sm">
                Ask a follow-up: "explain the margin compression", "reconcile revenue across the two files", "what's the biggest risk here?"
              </p>
            )}
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              const isEmpty = !m.content;
              const showDots = isEmpty && chatStreaming && i === messages.length - 1;
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
                      <div className="prose prose-invert prose-invert-tweaks max-w-none prose-p:my-2 prose-ul:my-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); sendChat(input); }}
            className="border-t border-line/60 p-4 flex gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ask a follow-up about the files…"
              className="flex-1 px-4 py-3 rounded-full bg-surface/80 border border-line focus:border-accent/60 outline-none text-white placeholder:text-muted transition"
            />
            <button
              type="submit"
              disabled={chatStreaming || !input.trim()}
              className="px-5 py-3 rounded-full bg-accent text-ink font-medium hover:shadow-glow disabled:opacity-40 transition"
            >
              {chatStreaming ? "…" : "send"}
            </button>
          </form>
        </section>
      )}
    </div>
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

"use client";

import { useEffect, useState } from "react";

type Props = { onAuthed: () => void };

export default function PasswordGate({ onAuthed }: Props) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "err">("idle");
  const [msg, setMsg] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/analyze/auth", { method: "GET" });
        const data = await res.json();
        if (cancelled) return;
        setConfigured(!!data.configured);
        if (data.authenticated) onAuthed();
      } catch {
        setConfigured(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onAuthed]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/analyze/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "incorrect password");
      onAuthed();
    } catch (err) {
      setStatus("err");
      setMsg(err instanceof Error ? err.message : "something went wrong");
    }
  }

  if (configured === false) {
    return (
      <div className="glass rounded-3xl p-10 max-w-xl mx-auto text-center">
        <div className="text-xs font-mono text-accent3 uppercase tracking-widest">/ not configured</div>
        <h2 className="mt-4 text-2xl font-semibold text-white">Analyze is offline.</h2>
        <p className="mt-3 text-muted">
          Set <span className="font-mono text-accent">ANALYZE_PASSWORD</span> in your environment and redeploy.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-10 max-w-xl mx-auto">
      <div className="text-xs font-mono text-accent uppercase tracking-widest">/ password</div>
      <h2 className="mt-3 text-2xl font-semibold text-white">Locked.</h2>
      <p className="mt-2 text-muted">
        This tool is gated. Enter the shared password to upload documents.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          type="password"
          required
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 px-5 py-3 rounded-full bg-surface/80 border border-line focus:border-accent/60 outline-none text-white placeholder:text-muted transition"
        />
        <button
          type="submit"
          disabled={status === "loading" || !password}
          className="px-6 py-3 rounded-full bg-accent text-ink font-medium hover:shadow-glow disabled:opacity-60 transition"
        >
          {status === "loading" ? "checking…" : "unlock →"}
        </button>
      </div>
      {msg && <p className="mt-4 text-sm font-mono text-accent3">{msg}</p>}
    </form>
  );
}

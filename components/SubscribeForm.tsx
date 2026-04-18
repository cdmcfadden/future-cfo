"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "subscription failed");
      setStatus("ok");
      setMsg("You're on the list. Welcome to the thesis.");
      setEmail("");
    } catch (err) {
      setStatus("err");
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto">
      <input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-5 py-3 rounded-full bg-surface/80 border border-line focus:border-accent/60 outline-none text-white placeholder:text-muted transition"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-6 py-3 rounded-full bg-accent text-ink font-medium hover:shadow-glow disabled:opacity-60 transition"
      >
        {status === "loading" ? "Signing you up…" : "Subscribe →"}
      </button>
      {msg && (
        <p className={`sm:absolute sm:translate-y-14 text-sm font-mono ${status === "ok" ? "text-accent" : "text-accent3"}`}>
          {msg}
        </p>
      )}
    </form>
  );
}

import Link from "next/link";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink/60 border-b border-line/60">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 font-mono text-sm tracking-wider">
          <span className="inline-block w-2 h-2 rounded-full bg-accent shadow-glow animate-pulse-slow" />
          <span className="glow-text font-semibold">futurecfo.ai</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link href="/blog" className="hover:text-white transition">Essays</Link>
          <Link href="/chat" className="hover:text-white transition">Chat</Link>
          <Link
            href="/#subscribe"
            className="px-3 py-1.5 rounded-full border border-accent/40 text-accent hover:bg-accent/10 transition"
          >
            Subscribe
          </Link>
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-10 pb-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] animate-fade-in">
          Ushering in the <span className="glow-text">future</span> of finance.
        </h1>
        <p className="mt-8 text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed animate-fade-in">
          Capital allocation, systems thinking, and a tolerance for ambiguity:
          CFOs already hold the operating primitives that matter most when
          software writes software. This is where that future gets mapped.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 justify-center animate-fade-in">
          <Link
            href="/blog"
            className="px-5 py-3 rounded-full bg-white text-ink font-medium hover:bg-accent hover:shadow-glow transition"
          >
            Read the essays →
          </Link>
          <Link
            href="/chat"
            className="px-5 py-3 rounded-full glass text-white hover:ring-accent transition"
          >
            Ask the future CFO ◎
          </Link>
          <Link
            href="#subscribe"
            className="px-5 py-3 rounded-full border border-line text-white/90 hover:border-accent/60 hover:text-accent transition"
          >
            Subscribe
          </Link>
        </div>
      </div>

      {/* floating stat chips */}
      <div className="mt-20 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { k: "1:1", v: "leverage in the AI-native org", sub: "capital ↔ compute" },
          { k: "Δ", v: "close → continuous", sub: "books in real time" },
          { k: "∞", v: "agents under your P&L", sub: "your new headcount" },
        ].map((s, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-6 hover:ring-accent transition group"
          >
            <div className="font-mono text-accent text-2xl">{s.k}</div>
            <div className="mt-2 text-white font-medium">{s.v}</div>
            <div className="mt-1 text-xs text-muted font-mono uppercase tracking-wider">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";

export default function AboutOperator() {
  return (
    <section className="max-w-5xl mx-auto px-6 mt-32">
      <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        {/* photo */}
        <div className="relative mx-auto md:mx-0">
          <div
            className="absolute -inset-6 rounded-[2rem] blur-2xl opacity-60 -z-10"
            style={{ background: "radial-gradient(circle, rgba(229,120,111,0.55) 0%, transparent 70%)" }}
          />
          <img
            src="/blog-images/nyse.png"
            alt="NYSE floor badge — Christopher McFadden"
            className="rounded-2xl w-full max-w-sm shadow-glow-nyse border-2 border-nyse/40"
          />
        </div>

        {/* copy */}
        <div>
          <div className="text-xs font-mono text-nyse uppercase tracking-widest">/ the operator</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
            <span className="text-nyse">CFO</span>-obsessed guidance and insights.
          </h2>
          <p className="mt-5 text-muted leading-relaxed">
            Site run by Chris McFadden, who was mugshotted here leaving the
            NYSE floor. He and his team of advisory CFO&apos;s are constantly
            innovating on behalf of the CFO role to advocate for this as the
            single most critical executive function.
          </p>
          <p className="mt-4 text-muted leading-relaxed">
            futurecfo.ai is the working field guide. The essays, the chat, and
            the <Link href="/analyze" className="text-nyse hover:text-accent transition underline decoration-dashed underline-offset-4">analyze tool</Link>{" "}
            are all one experiment: how do we leapfrog finance into the agentic
            age?
          </p>
        </div>
      </div>
    </section>
  );
}

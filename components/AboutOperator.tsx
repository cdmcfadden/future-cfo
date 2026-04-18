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
            className="rounded-2xl w-full max-w-sm rotate-[-2deg] shadow-glow-nyse border-2 border-nyse/40"
          />
          <div className="mt-3 text-center font-mono text-xs text-muted uppercase tracking-widest">
            field credentials · floor 11 · nyse
          </div>
        </div>

        {/* copy */}
        <div>
          <div className="text-xs font-mono text-nyse uppercase tracking-widest">/ the operator</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
            Before the agents, there was the <span className="text-nyse">floor</span>.
          </h2>
          <p className="mt-5 text-muted leading-relaxed">
            I'm Chris McFadden. This is a real photo of me with a real NYSE badge
            from when markets still closed on a bell. I've spent the years since
            building and financing operating companies — and now I'm making the
            case that the CFO is the right hands on the wheel for the next era.
          </p>
          <p className="mt-4 text-muted leading-relaxed">
            futurecfo.ai is the working field guide. The essays, the chat, and
            the <Link href="/analyze" className="text-nyse hover:text-accent transition underline decoration-dashed underline-offset-4">analyze tool</Link>{" "}
            are all one experiment: what does finance look like when software
            compounds faster than headcount?
          </p>
          <div className="mt-6 font-mono text-xs text-muted">
            — signed, still pink about it
          </div>
        </div>
      </div>
    </section>
  );
}

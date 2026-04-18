import Hero from "@/components/Hero";
import BlogCard from "@/components/BlogCard";
import SubscribeForm from "@/components/SubscribeForm";
import AboutOperator from "@/components/AboutOperator";
import { getAllPosts } from "@/lib/blog";
import Link from "next/link";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);
  return (
    <>
      <div className="max-w-6xl mx-auto px-6 pt-5 pb-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted">
        <img
          src="/blog-images/nyse.png"
          alt="NYSE badge — Christopher McFadden"
          className="w-10 h-10 rounded-full object-cover ring-2 ring-nyse/60 shadow-glow-nyse"
          style={{ objectPosition: "14% center" }}
        />
        <span className="inline-flex items-center gap-2 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-glow" />
          a thesis on the AI-native enterprise
        </span>
        <span className="text-muted/40 hidden sm:inline">·</span>
        <span className="font-mono">© {new Date().getFullYear()} futurecfo.ai · chris mcfadden</span>
      </div>

      <Hero />

      <section className="max-w-6xl mx-auto px-6 mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-mono text-accent uppercase tracking-widest">/ essays</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold">Recent thinking</h2>
          </div>
          <Link href="/blog" className="text-sm text-muted hover:text-accent font-mono">all posts →</Link>
        </div>
        {posts.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-muted">
            Drop MDX files into <span className="font-mono text-accent">/content/blog</span> to see posts here.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => <BlogCard key={p.slug} post={p} />)}
          </div>
        )}
      </section>

      <AboutOperator />

      <section id="subscribe" className="max-w-3xl mx-auto px-6 mt-32 text-center">
        <div className="text-xs font-mono text-accent uppercase tracking-widest">/ subscribe</div>
        <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
          Get the <span className="glow-text">thesis</span> in your inbox.
        </h2>
        <p className="mt-4 text-muted">
          One essay per drop. No fluff, no listicles, no AI-generated bromides.
          A working field guide for CFOs leading in the era of agents.
        </p>
        <div className="mt-8 relative">
          <SubscribeForm />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-32">
        <div className="glass rounded-3xl p-10 md:p-14 text-center ring-accent">
          <div className="text-xs font-mono text-accent uppercase tracking-widest">/ live chat</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold">Talk to a future-CFO-in-residence.</h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto">
            A native chat interface, grounded in a working knowledge base, answering
            in the voice of a CFO who actually understands what software is becoming.
          </p>
          <Link
            href="/chat"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-ink font-medium hover:shadow-glow transition"
          >
            Open chat ◎
          </Link>
        </div>
      </section>
    </>
  );
}

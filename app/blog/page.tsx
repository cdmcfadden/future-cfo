import BlogCard from "@/components/BlogCard";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Essays — futurecfo.ai",
  description: "Essays on the AI-native enterprise, from the CFO's desk.",
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
      <div className="text-xs font-mono text-accent uppercase tracking-widest">/ essays</div>
      <h1 className="mt-3 text-4xl md:text-6xl font-semibold tracking-tight">
        Field notes from the <span className="glow-text">AI-native</span> P&L.
      </h1>
      <p className="mt-5 text-muted max-w-2xl">
        Long-form writing on capital allocation, org design, and what the CFO role
        becomes when software compounds faster than headcount.
      </p>

      <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => <BlogCard key={p.slug} post={p} />)}
        {posts.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center text-muted col-span-full">
            No posts yet. Drop an MDX file into <span className="font-mono text-accent">content/blog/</span>.
          </div>
        )}
      </div>
    </section>
  );
}

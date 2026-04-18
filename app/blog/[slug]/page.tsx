import { getAllPosts, getPost } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import Link from "next/link";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title} — futurecfo.ai`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.image] },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-6 pt-16 pb-24">
      <Link href="/blog" className="text-sm font-mono text-muted hover:text-accent">← all essays</Link>

      <header className="mt-8">
        <div className="text-xs font-mono text-accent uppercase tracking-widest flex gap-3">
          <span>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          <span>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-tight">{post.title}</h1>
      </header>

      <div
        className="mt-10 rounded-3xl overflow-hidden aspect-[16/9] bg-cover bg-center ring-accent"
        style={{ backgroundImage: `url(${post.image})` }}
      />

      <div className="prose prose-invert prose-invert-tweaks prose-lg mt-12 max-w-none">
        <MDXRemote source={post.content} />
      </div>

      <hr className="my-16 border-line" />
      <div className="glass rounded-2xl p-8 text-center">
        <div className="text-xs font-mono text-accent uppercase tracking-widest">/ keep reading</div>
        <p className="mt-3 text-white">Subscribe for the next essay, or ask the future CFO your question.</p>
        <div className="mt-5 flex gap-3 justify-center">
          <Link href="/#subscribe" className="px-4 py-2 rounded-full bg-accent text-ink font-medium hover:shadow-glow transition">Subscribe</Link>
          <Link href="/chat" className="px-4 py-2 rounded-full border border-line hover:border-accent text-white transition">Open chat ◎</Link>
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

export default function BlogCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative overflow-hidden rounded-3xl glass hover:ring-accent transition flex flex-col"
    >
      <div
        className="aspect-[16/9] w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${post.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
      </div>
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-3 text-xs font-mono text-muted uppercase tracking-wider">
          <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          <span>·</span>
          <span>{post.readingMinutes} min</span>
        </div>
        <h3 className="text-xl md:text-2xl font-semibold text-white leading-tight group-hover:text-accent transition">
          {post.title}
        </h3>
        <p className="text-muted text-sm leading-relaxed flex-1">{post.excerpt}</p>
        <div className="text-accent text-sm font-mono mt-2">read →</div>
      </div>
    </Link>
  );
}

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const CORE_FILE = path.join(ROOT, "knowledge", "futurecfo.md");
const BOOKS_DIR = path.join(ROOT, "knowledge", "books");
const VOICE_DIR = path.join(ROOT, "knowledge", "voice-samples");
const BLOG_DIR = path.join(ROOT, "content", "blog");

type Doc = { title?: string; body: string };

function readMarkdownDir(dir: string): Doc[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => (f.endsWith(".md") || f.endsWith(".mdx")) && f.toLowerCase() !== "readme.md")
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, content } = matter(raw);
      return { title: (data.title as string) ?? f.replace(/\.(md|mdx)$/, ""), body: content.trim() };
    })
    .filter((d) => d.body.length > 0);
}

function readOptedInBlogPosts(): Doc[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf8");
      const { data, content } = matter(raw);
      return { include: data.includeInChat === true, title: data.title as string | undefined, body: content.trim() };
    })
    .filter((p) => p.include && p.body.length > 0)
    .map(({ title, body }) => ({ title, body }));
}

function section(tag: string, docs: Doc[]): string {
  if (docs.length === 0) return "";
  const inner = docs
    .map((d) => (d.title ? `## ${d.title}\n\n${d.body}` : d.body))
    .join("\n\n---\n\n");
  return `<${tag}>\n${inner}\n</${tag}>`;
}

export function buildKnowledgeBundle(): string {
  const core = fs.existsSync(CORE_FILE) ? fs.readFileSync(CORE_FILE, "utf8").trim() : "";
  const books = readMarkdownDir(BOOKS_DIR);
  const voice = readMarkdownDir(VOICE_DIR);
  const blog = readOptedInBlogPosts();

  const parts = [
    core ? `<core_thesis>\n${core}\n</core_thesis>` : "",
    section("voice_samples", voice),
    section("book_notes", books),
    section("blog_posts", blog),
  ].filter(Boolean);

  return parts.join("\n\n");
}

// Future: when total knowledge bundle exceeds ~500k input tokens or per-
// request cost matters more than recall, swap the route from
// buildKnowledgeBundle() to this, passing the latest user message.
// Implementation sketch: chunk all sources, embed with Voyage or OpenAI,
// store in pgvector / LanceDB, and retrieve top-k by cosine similarity.
export async function retrieveRelevantChunks(_query: string, _k = 8): Promise<string> {
  throw new Error("RAG retrieval not yet implemented — see lib/knowledge.ts");
}

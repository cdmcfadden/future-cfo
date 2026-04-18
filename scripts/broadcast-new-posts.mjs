#!/usr/bin/env node
// Called by .github/workflows/broadcast-blog.yml after a push to main.
// Receives newly-added blog post paths as CLI args; composes one broadcast
// email per post and sends it to the Resend segment immediately.
//
// Env: RESEND_API_KEY, RESEND_SEGMENT_ID, RESEND_FROM, NEXT_PUBLIC_SITE_URL

import fs from "node:fs";
import path from "node:path";
import { Resend } from "resend";

const API_KEY = process.env.RESEND_API_KEY;
const SEGMENT_ID = process.env.RESEND_SEGMENT_ID;
const FROM = process.env.RESEND_FROM;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://futurecfo.ai";

if (!API_KEY || !SEGMENT_ID || !FROM) {
  console.error("Missing required env: RESEND_API_KEY, RESEND_SEGMENT_ID, RESEND_FROM");
  process.exit(1);
}

const files = process.argv
  .slice(2)
  .map((f) => f.trim())
  .filter((f) => f && f.startsWith("content/blog/") && (f.endsWith(".mdx") || f.endsWith(".md")));

if (files.length === 0) {
  console.log("No new blog posts to broadcast.");
  process.exit(0);
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]+?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.+)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[kv[1]] = v;
  }
  return out;
}

function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderHtml({ title, excerpt, url }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f7f9;">
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#111;">
      <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#666;letter-spacing:0.12em;text-transform:uppercase;">new on futurecfo.ai</div>
      <h1 style="font-size:26px;font-weight:600;margin:18px 0 0;line-height:1.3;letter-spacing:-0.01em;">${escapeHtml(title)}</h1>
      <p style="font-size:16px;line-height:1.6;color:#333;margin:16px 0 28px;">${escapeHtml(excerpt)}</p>
      <a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:500;font-size:15px;">read the essay →</a>
      <p style="font-size:13px;line-height:1.6;color:#999;margin:40px 0 0;">you subscribed at <a href="${SITE_URL}" style="color:#999;">futurecfo.ai</a></p>
    </div>
  </body>
</html>`;
}

function renderText({ title, excerpt, url }) {
  return `${title}\n\n${excerpt}\n\nread → ${url}\n\nyou subscribed at ${SITE_URL}`;
}

const resend = new Resend(API_KEY);
let failed = 0;

for (const file of files) {
  const slug = path.basename(file).replace(/\.(mdx|md)$/, "");
  const url = `${SITE_URL}/blog/${slug}`;
  const raw = fs.readFileSync(file, "utf8");
  const fm = parseFrontmatter(raw);
  const title = fm.title || slug;
  const excerpt = fm.excerpt || "";

  console.log(`Broadcasting: ${slug}`);
  try {
    const { data, error } = await resend.broadcasts.create({
      segmentId: SEGMENT_ID,
      from: FROM,
      subject: title,
      html: renderHtml({ title, excerpt, url }),
      text: renderText({ title, excerpt, url }),
      name: `post: ${slug}`,
      send: true,
    });
    if (error) throw new Error(JSON.stringify(error));
    console.log(`  ok: ${data?.id ?? "(no id)"}`);
  } catch (e) {
    console.error(`  FAILED: ${e.message ?? e}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`${failed} broadcast(s) failed`);
  process.exit(1);
}
console.log(`Sent ${files.length} broadcast(s).`);

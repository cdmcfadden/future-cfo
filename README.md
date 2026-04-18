# futurecfo.ai

A Next.js site for futurecfo.ai — essays, email subscriptions, and a native chat
interface grounded in a markdown knowledge base, speaking in the voice of a
wise tech CFO.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS (dark / neon-gradient aesthetic)
- MDX blog posts under `content/blog/` (via `gray-matter` + `next-mdx-remote`)
- Resend for email subscriptions (`/api/subscribe`)
- Anthropic Claude + prompt caching for the chat (`/api/chat`)

## Local dev

```bash
cd ~/Developer/futurecfo
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

Then open http://localhost:3000.

## Environment variables

Create `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
RESEND_SEGMENT_ID=...
NEXT_PUBLIC_SITE_URL=https://futurecfo.ai
```

- **ANTHROPIC_API_KEY** — from https://console.anthropic.com
- **RESEND_API_KEY** and **RESEND_SEGMENT_ID** — create a free account at
  https://resend.com, create a Segment in the dashboard, copy the segment id
  and an API key. Resend migrated from Audiences to Segments — the subscribe
  route uses the new `segments: [{ id }]` contact-create shape
- If `RESEND_*` are missing, `/api/subscribe` logs the email to the server and
  returns success (useful for dev)

## Writing blog posts

Drop a `.mdx` file into `content/blog/`:

```mdx
---
title: "Your post title"
date: "2026-05-01"
excerpt: "One-line summary used in cards and OG tags."
image: "/blog-images/your-post.svg"
---

Your essay goes here. Full MDX — use headers, lists, quotes, etc.
```

Put the hero image under `public/blog-images/`. PNG, JPG, or SVG all work.

## Shaping the chat

The chat is grounded in `knowledge/futurecfo.md`. Edit that file to change the
voice, stances, or scope of what the chat knows. The file is passed as a cached
system prompt, so edits take effect on the next request and are cheap to serve.

## Deploy to Vercel + point futurecfo.ai at it

1. Create a GitHub repo and push this directory:
   ```bash
   cd ~/Developer/futurecfo
   git init && git add -A && git commit -m "initial"
   gh repo create futurecfo --public --source=. --push
   ```
2. Go to https://vercel.com/new, import the repo (Next.js is auto-detected).
3. In Vercel → Settings → Environment Variables, add the four values above.
4. Deploy. You'll get a `*.vercel.app` URL — confirm everything works there.
5. In Vercel → Settings → Domains, add `futurecfo.ai` and `www.futurecfo.ai`.
6. At your domain registrar (wherever futurecfo.ai is registered), set DNS to
   the values Vercel shows you. Typically:
   - `A` record for `@` → `76.76.21.21`
   - `CNAME` record for `www` → `cname.vercel-dns.com`
   (Vercel will display the exact records — trust those over this README.)
7. Wait 5–60 min for DNS to propagate. Vercel will auto-issue an SSL cert.

## Project layout

```
app/
  layout.tsx          root layout, aurora background, nav, footer
  page.tsx            home (hero + featured posts + subscribe + chat CTA)
  blog/
    page.tsx          blog index
    [slug]/page.tsx   post view (MDX rendered)
  chat/page.tsx       chat interface page
  api/
    subscribe/route.ts  POST { email } → Resend
    chat/route.ts       POST { messages } → Claude (streamed)
components/          Nav, Hero, SubscribeForm, ChatInterface, BlogCard
content/blog/        *.mdx files — one per post
knowledge/           futurecfo.md — edit to shape the chat
lib/blog.ts          MDX loader
public/blog-images/  hero images per post
```

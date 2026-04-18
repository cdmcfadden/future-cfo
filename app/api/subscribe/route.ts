import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const WELCOME_SUBJECT = "you're on the list — futurecfo.ai";

function welcomeHtml(siteUrl: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f7f9;">
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#111;">
      <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#666;letter-spacing:0.12em;text-transform:uppercase;">futurecfo.ai</div>
      <h1 style="font-size:26px;font-weight:600;margin:18px 0 0;line-height:1.2;letter-spacing:-0.01em;">you're on the list.</h1>
      <p style="font-size:16px;line-height:1.6;color:#333;margin:16px 0 0;">
        one essay per drop. no fluff, no listicles, no ai-generated bromides — a working field guide for cfos leading in the era of agents.
      </p>
      <p style="font-size:16px;line-height:1.6;color:#333;margin:16px 0 0;">
        first dispatch lands when the next post ships.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#666;margin:40px 0 0;">
        — <a href="${siteUrl}" style="color:#0066cc;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a>
      </p>
    </div>
  </body>
</html>`;
}

function welcomeText(siteUrl: string): string {
  return [
    "you're on the list.",
    "",
    "one essay per drop. no fluff, no listicles, no ai-generated bromides — a working field guide for cfos leading in the era of agents.",
    "",
    "first dispatch lands when the next post ships.",
    "",
    `— ${siteUrl}`,
  ].join("\n");
}

export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_SEGMENT_ID;
  const from = process.env.RESEND_FROM;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://futurecfo.ai";

  if (!apiKey || !segmentId) {
    console.warn("subscribe: missing RESEND_API_KEY or RESEND_SEGMENT_ID — logging only", email);
    return NextResponse.json({ ok: true, mode: "log-only" });
  }

  const resend = new Resend(apiKey);

  try {
    const { error: contactErr } = await resend.contacts.create({
      email,
      segments: [{ id: segmentId }],
      unsubscribed: false,
    });
    if (contactErr) {
      console.error("resend contacts.create error", contactErr);
      return NextResponse.json({ error: "Subscription failed. Try again." }, { status: 500 });
    }
  } catch (e) {
    console.error("subscribe contacts.create exception", e);
    return NextResponse.json({ error: "Subscription failed. Try again." }, { status: 500 });
  }

  // Welcome email. Logged-but-not-fatal if it fails — we already captured the
  // contact, and Resend will surface send failures (e.g. unverified domain) in
  // its own dashboard. Returning success here is the right call so the UI
  // confirms the subscription rather than erroring on a recoverable issue.
  if (!from) {
    console.warn("subscribe: RESEND_FROM not set — skipping welcome email");
    return NextResponse.json({ ok: true, welcome: "skipped-no-from" });
  }

  try {
    const { error: sendErr } = await resend.emails.send({
      from,
      to: email,
      subject: WELCOME_SUBJECT,
      html: welcomeHtml(siteUrl),
      text: welcomeText(siteUrl),
    });
    if (sendErr) {
      console.error("resend emails.send error (welcome)", sendErr);
      return NextResponse.json({ ok: true, welcome: "failed" });
    }
    return NextResponse.json({ ok: true, welcome: "sent" });
  } catch (e) {
    console.error("subscribe welcome-send exception", e);
    return NextResponse.json({ ok: true, welcome: "failed" });
  }
}

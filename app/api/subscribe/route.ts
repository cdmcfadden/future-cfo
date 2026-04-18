import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_SEGMENT_ID;

  if (!apiKey || !segmentId) {
    console.warn("subscribe: missing RESEND_API_KEY or RESEND_SEGMENT_ID — logging only", email);
    return NextResponse.json({ ok: true, mode: "log-only" });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.contacts.create({
      email,
      segments: [{ id: segmentId }],
      unsubscribed: false,
    });
    if (error) {
      console.error("resend error", error);
      return NextResponse.json({ error: "Subscription failed. Try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("subscribe exception", e);
    return NextResponse.json({ error: "Subscription failed. Try again." }, { status: 500 });
  }
}

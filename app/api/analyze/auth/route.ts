import { NextResponse } from "next/server";
import { passwordMatches, setAuthCookie, hasValidAuthCookie, clearAuthCookie } from "@/lib/analyze/auth";

export const runtime = "nodejs";

export async function GET() {
  const ok = await hasValidAuthCookie();
  const configured = !!process.env.ANALYZE_PASSWORD;
  return NextResponse.json({ authenticated: ok, configured });
}

export async function POST(req: Request) {
  const configured = !!process.env.ANALYZE_PASSWORD;
  if (!configured) {
    return NextResponse.json(
      { error: "Analyze is not configured. Set ANALYZE_PASSWORD on the server." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { password?: string };
  if (!body.password || !passwordMatches(body.password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  await setAuthCookie();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}

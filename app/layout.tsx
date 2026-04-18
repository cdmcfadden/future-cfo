import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "futurecfo.ai — Ushering in the future of finance",
  description:
    "Essays, tools, and a native chat on why CFOs are uniquely poised to lead enterprises into the age of AI.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://futurecfo.ai"),
  openGraph: {
    title: "futurecfo.ai",
    description:
      "Ushering in the future of finance.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "futurecfo.ai" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="aurora"><div className="pink" /><div className="nyse" /></div>
        <div className="fixed inset-0 grid-bg pointer-events-none -z-10" />
        <Nav />
        <main className="relative">{children}</main>
        <footer className="mt-32 border-t border-line/60">
          <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-muted flex flex-col sm:flex-row justify-between gap-4">
            <span>© {new Date().getFullYear()} futurecfo.ai</span>
            <span className="font-mono">built in the era of AI-native finance</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

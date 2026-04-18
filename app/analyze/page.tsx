import AnalyzeInterface from "@/components/AnalyzeInterface";

export const metadata = {
  title: "Analyze — futurecfo.ai",
  description: "Upload spreadsheets and documents to get a financial summary and ask questions about what they show.",
};

export default function AnalyzePage() {
  return (
    <section className="max-w-3xl mx-auto px-6 pt-12 pb-16">
      <div className="text-xs font-mono text-accent uppercase tracking-widest">/ analyze</div>
      <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
        Upload. <span className="glow-text">Summarize.</span> Interrogate.
      </h1>
      <p className="mt-3 text-muted max-w-2xl">
        Drop up to five documents — spreadsheets, PDFs, Word, CSV — and get a
        structured financial summary. Then ask whatever you want about what
        the files show.
      </p>
      <p className="mt-2 text-xs font-mono text-muted">
        files are parsed in your browser and passed to the model per-session. nothing is persisted.
      </p>

      <div className="mt-10">
        <AnalyzeInterface />
      </div>
    </section>
  );
}

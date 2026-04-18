import ChatInterface from "@/components/ChatInterface";

export const metadata = {
  title: "Chat — futurecfo.ai",
  description: "Talk to a future-CFO-in-residence. Grounded in a working knowledge base.",
};

export default function ChatPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-12 pb-16">
      <div className="text-xs font-mono text-accent uppercase tracking-widest">/ chat</div>
      <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
        Ask the <span className="glow-text">future CFO</span>.
      </h1>
      <p className="mt-3 text-muted max-w-2xl">
        A native chat, grounded in a knowledge base you control. Edit
        <span className="font-mono text-accent"> knowledge/futurecfo.md </span>
        to sharpen the voice.
      </p>
      <div className="mt-8">
        <ChatInterface />
      </div>
    </section>
  );
}

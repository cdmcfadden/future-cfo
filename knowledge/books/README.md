# Book notes

Drop one markdown file per book. Any `.md` file in this folder is included
in the chat's grounding bundle on the next request. This `README.md` is
ignored.

## Format

```markdown
---
title: "Book title (author)"
---

A 1–3 page distillation of the book's ideas, in your voice. Think: how you
would explain the book to a sharp friend over coffee. Focus on the two or
three frames you actually use in your own thinking.
```

The `title` field is optional but helps you keep the folder organized.

## How the chat uses these

The assistant **absorbs** the ideas and speaks them as its own — it does
NOT cite the book, quote the author, or say "as X argues in Y." If you want
the chat to sound like you, write the summaries the way you talk. The
voice you use here is the voice you'll hear back.

## Examples of good summaries

- *Principles* (Dalio) → "Write down every decision rule after you make it.
  Revisit them when you're wrong. Principles compound; intuition decays."
- *Ben Horowitz — The Hard Thing About Hard Things* → "Peacetime and
  wartime CEOs are different jobs. If your company is at war and your CEO
  is still optimizing for team harmony, replace the CEO."

One paragraph per key idea is often enough. Three pages max.

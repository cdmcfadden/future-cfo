"use client";

import { useCallback, useRef, useState } from "react";
import { parseFile, type ParsedFile } from "@/lib/analyze/parse-client";

type Props = {
  files: ParsedFile[];
  setFiles: (f: ParsedFile[]) => void;
  disabled?: boolean;
};

const MAX_FILES = 5;
const ACCEPT = ".xlsx,.xlsm,.csv,.pdf,.docx,.txt,.md";

export default function FileUpload({ files, setFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errs, setErrs] = useState<string[]>([]);

  const addFiles = useCallback(async (picked: FileList | File[]) => {
    if (disabled) return;
    const list = Array.from(picked);
    const room = MAX_FILES - files.length;
    if (room <= 0) {
      setErrs([`Max ${MAX_FILES} files.`]);
      return;
    }
    const toParse = list.slice(0, room);
    const skipped = list.length - toParse.length;
    setBusy(true);
    setErrs([]);
    const errors: string[] = [];
    if (skipped > 0) errors.push(`Skipped ${skipped}: ${MAX_FILES}-file limit.`);
    const parsed: ParsedFile[] = [];
    for (const f of toParse) {
      try {
        const p = await parseFile(f);
        parsed.push(p);
      } catch (e) {
        errors.push(e instanceof Error ? e.message : `failed: ${f.name}`);
      }
    }
    setFiles([...files, ...parsed]);
    if (errors.length > 0) setErrs(errors);
    setBusy(false);
  }, [files, setFiles, disabled]);

  function remove(i: number) {
    const next = [...files];
    next.splice(i, 1);
    setFiles(next);
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) void addFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`glass rounded-2xl border border-dashed transition cursor-pointer px-6 py-10 text-center ${
          dragOver ? "border-accent ring-accent" : "border-line hover:border-accent/50"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="text-xs font-mono text-accent uppercase tracking-widest">/ upload</div>
        <p className="mt-3 text-white">
          {busy ? "parsing…" : "drag files here, or click to pick"}
        </p>
        <p className="mt-2 text-xs text-muted font-mono">
          xlsx · csv · pdf · docx · txt · md — up to {MAX_FILES} files
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = ""; // allow re-picking the same file
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between glass rounded-xl px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-accent text-xs">{fileBadge(f)}</span>
                <span className="text-white truncate">{f.name}</span>
                <span className="text-muted text-xs font-mono shrink-0">
                  {Math.round(f.size / 1024)} KB{f.kind === "text" && f.truncated ? " · truncated" : ""}
                </span>
              </div>
              <button
                onClick={() => remove(i)}
                disabled={disabled}
                className="text-muted hover:text-accent3 font-mono text-xs disabled:opacity-40"
              >
                remove ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {errs.length > 0 && (
        <ul className="mt-3 text-sm font-mono text-accent3 space-y-1">
          {errs.map((e, i) => <li key={i}>• {e}</li>)}
        </ul>
      )}
    </div>
  );
}

function fileBadge(f: ParsedFile): string {
  if (f.kind === "pdf") return "pdf";
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "txt";
  return ext;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { EASE } from "./ui";

type Msg = { role: "user" | "assistant"; text: string };

const STARTERS = ["Where is the faculty count claimed vs found?", "Which clause does the land flag cite?", "Draft the deficiency letter in plain words", "What would make this file fast-track?"];

export default function Copilot({ appId }: { appId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", text: "Ask me anything about this file. I answer only from the documents, the registry responses and the handbook, and I cite where each answer came from." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<string>("");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" }); }, [msgs]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...msgs, { role: "user", text }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const r = await fetch("/api/copilot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ appId, messages: next.map((m) => ({ role: m.role, content: m.text })) }) });
      const j = await r.json();
      setMode(j.mode || "");
      setMsgs((m) => [...m, { role: "assistant", text: j.reply || "No answer came back." }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "The copilot could not be reached. Try again." }]);
    } finally { setBusy(false); }
  }

  return (
    <div className="flex h-[560px] flex-col">
      <div ref={box} className="flex-1 space-y-3 overflow-y-auto p-1">
        {msgs.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "ink-sheet rounded-br-md" : "sheet-strong rounded-bl-md"}`}>{m.text}</div>
          </motion.div>
        ))}
        {busy && <div className="mono text-xs text-[var(--text-3)]">reading the file…</div>}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {STARTERS.map((s) => <button key={s} className="btn btn-sm" onClick={() => send(s)}>{s}</button>)}
      </div>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <input className="input" placeholder="Ask about this application" value={input} onChange={(e) => setInput(e.target.value)} aria-label="Message the copilot" />
        <button className="btn btn-accent" type="submit" disabled={busy}>Ask</button>
      </form>
      <div className="mono mt-2 text-[10px] uppercase tracking-[0.16em] text-[var(--text-3)]">{mode === "llm" ? "answers by the language model, grounded in this file" : mode === "scripted" ? "answers from this file’s own records" : "copilot answers only from the file and the handbook"}</div>
    </div>
  );
}

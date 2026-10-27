"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { appById, instById } from "@/lib/data";
import DocPaper, { type Layer } from "@/components/DocPaper";
import { Bar, EASE, Kicker, Panel, Reveal, Stamp } from "@/components/ui";
import { pulse } from "@/components/Background";

const LAYERS: { k: Layer; label: string; blurb: string }[] = [
  { k: "original", label: "Original", blurb: "Hover to look through the forensic lens" },
  { k: "ela", label: "Error level", blurb: "Re-saved regions glow; an untouched scan is flat" },
  { k: "copymove", label: "Copy-move", blurb: "Blocks that repeat elsewhere on the page" },
  { k: "meta", label: "Metadata", blurb: "Producer, dates, edit history" },
];

export default function DocPage() {
  const { id, docId } = useParams<{ id: string; docId: string }>();
  const app = appById(id);
  const doc = app?.docs.find((d) => d.id === docId);
  const [layer, setLayer] = useState<Layer>("original");
  const [verdict, setVerdict] = useState("");
  if (!app || !doc) return <main id="main" className="p-8">No such document. <Link href="/review" className="underline">Back</Link>.</main>;
  const inst = instById(app.instId);
  const flags = app.flags.filter((f) => f.docId === doc.id);
  const bad = doc.status === "discrepancy";

  return (
    <main id="main" tabIndex={-1}>
      <Reveal><Link href={`/review/${app.id}`} className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-3)] hover:text-[var(--ink)]">← {inst.short}… · {app.id}</Link></Reveal>
      <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <Reveal delay={0.05}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><h1 className="display text-2xl" style={{ fontWeight: 700 }}>{doc.type}</h1><div className="mono text-[11px] text-[var(--text-3)]">{doc.file} · {doc.pages} pages · uploaded {doc.uploadedAt}</div></div>
              <div className="scroll-x sheet flex gap-1 rounded-full p-1">{LAYERS.map((l) => <button key={l.k} className="tab" data-active={layer === l.k} onClick={() => setLayer(l.k)}>{l.label}</button>)}</div>
            </div>
          </Reveal>
          <motion.div initial={{ opacity: 0, y: 16, rotateX: 6 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 }} style={{ perspective: 1200 }}>
            <DocPaper doc={doc} inst={inst} layer={layer} />
          </motion.div>
          <div className="mono mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-[var(--text-3)]">{LAYERS.find((l) => l.k === layer)!.blurb}</div>
          {layer === "meta" && (
            <Reveal className="mt-4"><Panel className="p-4"><Kicker>Metadata</Kicker><dl className="mt-2 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">{[["Producer", doc.forensic.metadata.split("·")[0]], ["History", doc.forensic.metadata.split("·")[1] || "none"], ["Fonts", `${doc.forensic.fontBreaks} break${doc.forensic.fontBreaks === 1 ? "" : "s"}`], ["Pages", doc.pages]].map(([k, v]) => <div key={String(k)}><dt className="kicker" style={{ fontSize: "0.58rem" }}>{k}</dt><dd className="mt-0.5">{v}</dd></div>)}</dl></Panel></Reveal>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <Reveal delay={0.15}>
            <Panel strong className="p-5">
              <div className="flex items-center justify-between"><Kicker>Verdict</Kicker><Stamp tone={bad ? "bad" : doc.status === "review" ? "warn" : "ok"}>{bad ? "discrepancy" : doc.status === "review" ? "re-check" : "verified"}</Stamp></div>
              <ul className="mt-4 flex flex-col gap-3">
                {doc.checks.map((c) => (
                  <li key={c.id} className="flex gap-3">
                    <i className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: c.status === "pass" ? "var(--ok)" : c.status === "fail" ? "var(--bad)" : "var(--warn)" }} />
                    <div><div className="text-sm font-medium">{c.label}</div><div className="text-xs leading-relaxed text-[var(--text-2)]">{c.detail}</div></div>
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
          <Reveal delay={0.25}>
            <Panel className="p-5">
              <Kicker>Forensic gauges</Kicker>
              <div className="mt-3 flex flex-col gap-3">
                {[["Error-level analysis", doc.forensic.ela, 0.4], ["Copy-move", doc.forensic.copyMove, 0.35], ["Synthetic image", doc.forensic.aiGenerated, 0.5]].map(([k, v, th], i) => (
                  <div key={String(k)}><div className="flex justify-between text-xs"><span>{k}</span><span className="mono" style={{ color: Number(v) > Number(th) ? "var(--bad)" : "var(--text-3)" }}>{Number(v).toFixed(2)} / {Number(th).toFixed(2)}</span></div><div className="mt-1"><Bar value={Number(v) * 100} color={Number(v) > Number(th) ? "var(--bad)" : "var(--ok)"} delay={0.3 + i * 0.1} /></div></div>
                ))}
                <div className="text-xs text-[var(--text-3)]">Thresholds are tuned on the reviewer feedback loop; a flag above the line is a question for a human, not a verdict.</div>
              </div>
            </Panel>
          </Reveal>
          {flags.length > 0 && (
            <Reveal delay={0.3}><Panel className="p-5"><Kicker>Flags on this document</Kicker><ul className="mt-2 space-y-2">{flags.map((f) => <li key={f.id} className="text-sm"><span className="font-medium">{f.title}</span>{f.clause && <span className="mono ml-2 text-[10px] text-[var(--accent)]">{f.clause}</span>}</li>)}</ul></Panel></Reveal>
          )}
          <Reveal delay={0.35}>
            <Panel className="p-5">
              <Kicker>Reviewer actions</Kicker>
              <div className="mt-3 flex flex-col gap-2">
                <button className="btn" onClick={(e) => { setVerdict("fresh copy requested"); pulse("#2f45c4", e.clientX, e.clientY); }}>Request a fresh copy from the issuer</button>
                <button className="btn" onClick={(e) => { setVerdict("marked verified"); pulse("#2e7d5b", e.clientX, e.clientY); }}>Mark as verified by eye</button>
                <button className="btn" onClick={(e) => { setVerdict("sent to senior review"); pulse("#b23a2f", e.clientX, e.clientY); }}>Escalate to senior reviewer</button>
                {verdict && <div className="mono text-center text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)]">{verdict} · logged to the audit chain</div>}
              </div>
            </Panel>
          </Reveal>
        </aside>
      </div>
    </main>
  );
}

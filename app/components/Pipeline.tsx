"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { pulse } from "./Background";

export const STEPS = [
  { k: "intake", label: "Intake", detail: "9 documents, 61 pages received", ms: 400 },
  { k: "classify", label: "Classify", detail: "Each upload named by what it is, not its filename", ms: 1100 },
  { k: "ocr", label: "Read", detail: "OCR in English, Hindi and Marathi; tables kept intact", ms: 3800 },
  { k: "extract", label: "Extract", detail: "Names, areas, amounts, dates, UDINs, survey numbers", ms: 1900 },
  { k: "consistency", label: "Cross-check", detail: "Every number compared with every other document", ms: 900 },
  { k: "forensics", label: "Forensics", detail: "Error-level, copy-move, fonts, metadata, synthetic images", ms: 2600 },
  { k: "registries", label: "Registries", detail: "DigiLocker, UDIN, EPFO, Bhulekh, Bhuvan, university NOC", ms: 5200 },
  { k: "graph", label: "Faculty graph", detail: "PAN, DOB, face and timeline across every institution", ms: 2100 },
  { k: "rules", label: "Handbook", detail: "14 norms as code, each with its clause", ms: 600 },
  { k: "score", label: "Trust score", detail: "Weighted, explained, evidence-linked", ms: 200 },
];

/** The pipeline strip: each step fills in turn, timed to its real share of the run. */
export default function Pipeline({ run = true, speed = 1, onDone, compact = false }: { run?: boolean; speed?: number; onDone?: () => void; compact?: boolean }) {
  const [active, setActive] = useState(-1);
  const bars = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (!run) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = gsap.timeline({ onComplete: () => { setActive(STEPS.length); onDone?.(); } });
    STEPS.forEach((s, i) => {
      const el = bars.current[i];
      if (!el) return;
      tl.add(() => setActive(i));
      tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: reduced ? 0 : (s.ms / 1000) / speed, ease: "power1.inOut", transformOrigin: "left center" });
      if (s.k === "forensics" || s.k === "graph") tl.add(() => pulse(s.k === "graph" ? "#2f45c4" : "#b23a2f"));
    });
    return () => { tl.kill(); };
  }, [run, speed, onDone]);
  return (
    <ol className={`grid gap-2 ${compact ? "grid-cols-5 md:grid-cols-10" : "grid-cols-2 md:grid-cols-5"}`}>
      {STEPS.map((s, i) => {
        const done = active > i, now = active === i;
        return (
          <li key={s.k} className={`rounded-2xl border p-3 transition-colors ${done ? "border-[rgba(46,125,91,0.35)] bg-[var(--ok-muted)]" : now ? "border-[var(--accent)] bg-[var(--accent-muted)]" : "border-[var(--line)] bg-transparent"}`}>
            <div className="flex items-center justify-between">
              <span className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-3)]">{String(i + 1).padStart(2, "0")}</span>
              <span className="mono text-[10px] text-[var(--text-3)]">{(s.ms / 1000).toFixed(1)}s</span>
            </div>
            <div className="mt-1 text-sm font-medium">{s.label}</div>
            {!compact && <div className="mt-0.5 text-xs leading-snug text-[var(--text-3)]">{s.detail}</div>}
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[rgba(28,37,65,0.1)]">
              <div ref={(el) => { bars.current[i] = el; }} className="h-full w-full rounded-full" style={{ background: done ? "var(--ok)" : "var(--accent)", transform: "scaleX(0)" }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

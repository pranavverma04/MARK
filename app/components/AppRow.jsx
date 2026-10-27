"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { instById } from "@/lib/data";
import { EASE, tone, toneColor } from "./ui";
export function StatusBadge({ s }) {
    const cls = s === "recommended" ? "badge-ok" : s === "deficiency sent" || s === "referred to EVC" ? "badge-bad" : s === "in review" ? "badge-accent" : "badge-ink";
    return <span className={`badge ${cls}`}>{s}</span>;
}
export function FlagDots({ app }) {
    const c = app.flags.filter((f) => f.severity === "critical").length;
    const m = app.flags.filter((f) => f.severity === "major").length;
    const n = app.flags.filter((f) => f.severity === "minor").length;
    return (<span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-3)]">
      {c > 0 && <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: "var(--bad)" }}/>{c}</span>}
      {m > 0 && <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: "var(--warn)" }}/>{m}</span>}
      {n > 0 && <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: "var(--text-3)" }}/>{n}</span>}
      {app.flags.length === 0 && <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: "var(--ok)" }}/>clean</span>}
    </span>);
}
export default function AppRow({ app, i }) {
    const inst = instById(app.instId);
    const t = tone(app.score);
    return (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: Math.min(0.6, i * 0.035) }}>
      <Link href={`/review/${app.id}`} className="row-hover grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl px-3 py-3 md:grid-cols-[56px_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_110px]">
        <div className="relative flex h-12 w-12 items-center justify-center md:h-[52px] md:w-[52px]">
          <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90">
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(28,37,65,0.1)" strokeWidth="4"/>
            <circle cx="26" cy="26" r="22" fill="none" stroke={toneColor(t)} strokeWidth="4" strokeLinecap="round" strokeDasharray={2 * Math.PI * 22} strokeDashoffset={2 * Math.PI * 22 * (1 - app.score / 100)}/>
          </svg>
          <span className="display text-sm" style={{ fontWeight: 700, color: toneColor(t) }}>{app.score}</span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-medium text-[var(--ink)]">{inst.name}</div>
          <div className="truncate text-xs text-[var(--text-3)]">{inst.city}, {inst.state} · {inst.type} · intake {inst.intake}</div>
        </div>
        <div className="hidden text-sm text-[var(--text-2)] md:block">{app.kind}<div className="mono text-[10px] text-[var(--text-3)]">{app.id} · {app.submittedAt}</div></div>
        <div className="hidden md:block"><FlagDots app={app}/></div>
        <div className="hidden text-xs text-[var(--text-3)] md:block">{app.reviewer}</div>
        <div className="justify-self-end"><StatusBadge s={app.status}/></div>
      </Link>
    </motion.div>);
}

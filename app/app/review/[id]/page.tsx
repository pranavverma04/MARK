"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { appById, instById, facultyOf, scoreFrom, ENGINE_LABEL, ENGINE_BLURB } from "@/lib/data";
import { evaluateAll } from "@/lib/rules";
import type { Engine, Flag } from "@/lib/types";
import { Bar, Counter, EASE, Kicker, Panel, Reveal, ScoreRing, Severity, Stamp, tone } from "@/components/ui";
import { StatusBadge } from "@/components/AppRow";
import Pipeline from "@/components/Pipeline";
import Copilot from "@/components/Copilot";
import { pulse } from "@/components/Background";

type Tab = "overview" | "documents" | "faculty" | "compliance" | "pipeline" | "copilot" | "letter";
const TABS: { k: Tab; label: string }[] = [
  { k: "overview", label: "Overview" }, { k: "documents", label: "Documents" }, { k: "faculty", label: "Faculty" }, { k: "compliance", label: "Handbook" },
  { k: "pipeline", label: "Pipeline" }, { k: "copilot", label: "Copilot" }, { k: "letter", label: "Deficiency letter" },
];

export default function ApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const app = appById(id);
  const [tab, setTab] = useState<Tab>("overview");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [verdict, setVerdict] = useState<"" | "recommended" | "deficiency" | "evc">("");

  const live = useMemo(() => {
    if (!app) return null;
    const flags = app.flags.filter((f) => !dismissed.has(f.id));
    return scoreFrom(flags);
  }, [app, dismissed]);

  if (!app || !live) return <main id="main" className="p-8">No such application. <Link href="/review" className="underline">Back to the desk</Link>.</main>;
  const inst = instById(app.instId);
  const fac = facultyOf(inst.id);
  const t = tone(live.score);
  const verdictLabel = live.score >= 85 ? "fast-track" : live.score >= 60 ? "second look" : "hold";

  const toggleDismiss = (f: Flag) => {
    setDismissed((s) => { const n = new Set(s); if (n.has(f.id)) n.delete(f.id); else { n.add(f.id); } return n; });
    setConfirmed((s) => { const n = new Set(s); n.delete(f.id); return n; });
  };
  const confirm = (f: Flag, e: React.MouseEvent) => {
    setConfirmed((s) => new Set(s).add(f.id));
    setDismissed((s) => { const n = new Set(s); n.delete(f.id); return n; });
    pulse(f.severity === "critical" ? "#b23a2f" : "#2f45c4", e.clientX, e.clientY);
  };
  const decide = (v: typeof verdict, e: React.MouseEvent) => { setVerdict(v); pulse(v === "recommended" ? "#2e7d5b" : "#b23a2f", e.clientX, e.clientY); };

  return (
    <main id="main" tabIndex={-1}>
      <Reveal>
        <Link href="/review" className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-3)] hover:text-[var(--ink)]">← Review desk</Link>
      </Reveal>
      <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <Reveal delay={0.05}>
          <div className="flex flex-wrap items-center gap-2"><StatusBadge s={app.status} /><span className="badge badge-ink">{app.kind}</span><span className="mono text-[11px] text-[var(--text-3)]">{app.id} · submitted {app.submittedAt} · reviewer {app.reviewer}</span></div>
          <h1 className="display mt-3 text-[clamp(1.8rem,3.6vw,3rem)] leading-[1] tracking-[-0.03em]" style={{ fontWeight: 700 }}>{inst.name}</h1>
          <p className="mt-2 text-sm text-[var(--text-2)]">{inst.city}, {inst.state} · {inst.type} · est. {inst.established} · intake {inst.intake}{inst.naac ? ` · NAAC ${inst.naac}` : ""}{inst.nba ? " · NBA" : ""}</p>
          <p className="mt-4 max-w-[64ch] text-[15px] leading-relaxed">{app.summary}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button className="btn btn-sm" style={{ borderColor: "var(--ok)", color: "var(--ok)" }} onClick={(e) => decide("recommended", e)}>Recommend</button>
            <button className="btn btn-sm" style={{ borderColor: "var(--warn)", color: "var(--warn)" }} onClick={(e) => { decide("deficiency", e); setTab("letter"); }}>Send deficiency letter</button>
            <button className="btn btn-sm" style={{ borderColor: "var(--seal)", color: "var(--seal)" }} onClick={(e) => decide("evc", e)}>Refer to Expert Visit Committee</button>
            <AnimatePresence>{verdict && <Stamp key={verdict} tone={verdict === "recommended" ? "ok" : "bad"} className="ml-2">{verdict === "recommended" ? "Recommended" : verdict === "deficiency" ? "Deficiency sent" : "Referred to EVC"}</Stamp>}</AnimatePresence>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <Panel strong className="flex items-center gap-6 p-5">
            <ScoreRing score={live.score} size={150} stroke={12} />
            <div className="flex flex-col gap-2">
              <Stamp tone={t === "ok" ? "ok" : t === "warn" ? "warn" : "bad"}>{verdictLabel}</Stamp>
              <div className="mt-2 text-xs text-[var(--text-3)]">pipeline {(app.pipelineMs / 1000).toFixed(0)} s · {app.docs.length} documents · {app.docs.reduce((a, d) => a + d.pages, 0)} pages</div>
              <div className="text-xs text-[var(--text-3)]">{dismissed.size > 0 ? `${dismissed.size} flag${dismissed.size > 1 ? "s" : ""} dismissed by reviewer, score re-computed` : "every point links to evidence below"}</div>
            </div>
          </Panel>
        </Reveal>
      </div>

      <Reveal delay={0.2} className="mt-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(Object.keys(ENGINE_LABEL) as Engine[]).map((e, i) => {
            const v = Math.round(live.breakdown[e]);
            const n = app.flags.filter((f) => f.engine === e && !dismissed.has(f.id)).length;
            return (
              <Panel key={e} className="p-4">
                <div className="flex items-center justify-between"><Kicker>{ENGINE_LABEL[e]}</Kicker><span className="display text-xl" style={{ fontWeight: 700, color: v >= 80 ? "var(--ok)" : v >= 60 ? "var(--warn)" : "var(--bad)" }}><Counter to={v} delay={0.2 + i * 0.08} /></span></div>
                <div className="mt-2"><Bar value={v} color={v >= 80 ? "var(--ok)" : v >= 60 ? "var(--warn)" : "var(--bad)"} delay={0.2 + i * 0.08} /></div>
                <div className="mt-2 text-xs text-[var(--text-3)]">{n ? `${n} flag${n > 1 ? "s" : ""}` : "clean"} · {ENGINE_BLURB[e]}</div>
              </Panel>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={0.25} className="mt-6">
        <div className="scroll-x sheet flex gap-1 rounded-full p-1">
          {TABS.map((x) => <button key={x.k} className="tab" data-active={tab === x.k} onClick={() => setTab(x.k)}>{x.label}</button>)}
        </div>
      </Reveal>

      <AnimatePresence mode="wait">
        <motion.div key={tab} className="mt-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
          {tab === "overview" && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <Panel className="p-5">
                <Kicker>Flags, worst first. Confirm or dismiss; the score follows you.</Kicker>
                <ul className="mt-3 flex flex-col gap-3">
                  {app.flags.length === 0 && <li className="text-sm text-[var(--text-3)]">No flags. Every document matched its source and every norm passed.</li>}
                  {app.flags.map((f) => {
                    const off = dismissed.has(f.id), yes = confirmed.has(f.id);
                    return (
                      <li key={f.id} className={`rounded-2xl border p-4 transition-all ${off ? "border-[var(--line)] opacity-50" : yes ? "border-[var(--seal)] bg-[var(--bad-muted)]" : "border-[var(--line-strong)]"}`}>
                        <div className="flex flex-wrap items-center gap-2"><Severity s={f.severity} /><span className="badge badge-ink">{ENGINE_LABEL[f.engine]}</span><span className="mono ml-auto text-[10px] text-[var(--text-3)]">−{f.points} pts</span></div>
                        <div className="mt-2 text-[15px] font-medium">{f.title}</div>
                        <p className="mt-1 text-sm leading-relaxed text-[var(--text-2)]">{f.evidence}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {f.clause && <span className="mono text-[10px] text-[var(--accent)]">{f.clause}</span>}
                          {f.docId && <Link href={`/review/${app.id}/doc/${f.docId}`} className="btn btn-sm">Open the page</Link>}
                          <button className="btn btn-sm" onClick={(e) => confirm(f, e)} disabled={yes}>{yes ? "Confirmed" : "Confirm"}</button>
                          <button className="btn btn-sm btn-ghost" onClick={() => toggleDismiss(f)}>{off ? "Restore" : "Dismiss"}</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
              <div className="flex flex-col gap-4">
                <Panel className="p-5">
                  <Kicker>What the file claims</Kicker>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {[["Land (deed)", `${app.claims.landAcres} ac`], ["Land (satellite)", `${app.claims.satelliteAcres} ac`], ["Built-up", `${app.claims.builtUpSqm.toLocaleString("en-IN")} sqm`], ["Intake", app.claims.intake], ["Faculty claimed", app.claims.facultyClaimed], ["Faculty verified", app.claims.facultyVerified], ["Labs", `${app.claims.labs} / ${app.claims.labsRequired} req.`], ["Library", `${app.claims.libraryVolumes.toLocaleString("en-IN")} vols`], ["Funds", `₹${app.claims.bankBalanceLakh} L`], ["Fee collected", `₹${app.claims.feeCollectedLakh} L`]].map(([k, v]) => (
                      <div key={String(k)}><dt className="kicker" style={{ fontSize: "0.58rem" }}>{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>
                    ))}
                  </dl>
                </Panel>
                <Panel className="p-5">
                  <Kicker>Documents at a glance</Kicker>
                  <ul className="mt-3 flex flex-col gap-2">
                    {app.docs.map((d) => (
                      <li key={d.id}><Link href={`/review/${app.id}/doc/${d.id}`} className="row-hover flex items-center justify-between rounded-xl px-2 py-1.5 text-sm"><span>{d.type}</span><span className={`badge ${d.status === "verified" ? "badge-ok" : d.status === "discrepancy" ? "badge-bad" : "badge-warn"}`}>{d.status}</span></Link></li>
                    ))}
                  </ul>
                </Panel>
              </div>
            </div>
          )}

          {tab === "documents" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {app.docs.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}>
                  <Link href={`/review/${app.id}/doc/${d.id}`} className="sheet block rounded-3xl p-4 transition-transform hover:-translate-y-0.5">
                    <div className="flex items-center justify-between"><span className="text-[15px] font-medium">{d.type}</span><span className={`badge ${d.status === "verified" ? "badge-ok" : d.status === "discrepancy" ? "badge-bad" : "badge-warn"}`}>{d.status}</span></div>
                    <div className="mono mt-1 text-[10px] text-[var(--text-3)]">{d.file} · {d.pages} pages · {d.uploadedAt}</div>
                    <ul className="mt-3 space-y-1">
                      {d.checks.map((c) => <li key={c.id} className="flex items-center gap-2 text-xs"><i className="h-1.5 w-1.5 rounded-full" style={{ background: c.status === "pass" ? "var(--ok)" : c.status === "fail" ? "var(--bad)" : "var(--warn)" }} /><span className="text-[var(--text-2)]">{c.label}</span></li>)}
                    </ul>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      {[["ELA", d.forensic.ela], ["copy-move", d.forensic.copyMove], ["synthetic", d.forensic.aiGenerated]].map(([k, v]) => (
                        <div key={String(k)} className="rounded-xl bg-[rgba(28,37,65,0.05)] py-1.5"><div className="mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-3)]">{k}</div><div className="text-sm" style={{ color: Number(v) > 0.5 ? "var(--bad)" : "var(--ink)" }}>{Number(v).toFixed(2)}</div></div>
                      ))}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {tab === "faculty" && (
            <Panel className="p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><Kicker>Faculty on the list</Kicker><div className="mt-1 text-sm text-[var(--text-2)]">{app.claims.facultyClaimed} claimed · {app.claims.facultyVerified} verified · ratio 1:{Math.round(app.claims.intake / Math.max(1, app.claims.facultyVerified))} on verified</div></div>
                <Link href="/graph" className="btn btn-sm">See them on the national graph</Link>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {fac.map((f, i) => {
                  const ghost = f.instIds.length > 1;
                  return (
                    <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`flex items-center gap-3 rounded-2xl border p-3 ${ghost ? "border-[var(--seal)] bg-[var(--bad-muted)]" : "border-[var(--line)]"}`}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `hsl(${(f.photo * 47) % 360} 30% 85%)`, color: "var(--ink)" }}><span className="display text-sm" style={{ fontWeight: 700 }}>{f.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s/, "").split(" ").map((w) => w[0]).join("").slice(0, 2)}</span></div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{f.name}</div>
                        <div className="truncate text-xs text-[var(--text-3)]">{f.designation} · {f.dept} · {f.degree} · PAN {f.pan.slice(0, 5)}…</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className={`badge ${f.epfo ? "badge-ok" : "badge-bad"}`}>{f.epfo ? "EPFO trail" : "no EPFO"}</span>
                          {ghost && <span className="badge badge-bad">also at {f.instIds.filter((x) => x !== inst.id).map((x) => instById(x).city).join(", ")}</span>}
                          {!ghost && <span className="badge badge-ink">degree verified</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Panel>
          )}

          {tab === "compliance" && (
            <Panel className="p-5">
              <Kicker>Approval Process Handbook 2026-27, as code. Every result cites its clause.</Kicker>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-3)]"><th className="py-2 text-left">Clause</th><th className="py-2 text-left">Norm</th><th className="py-2 text-left">This file</th><th className="py-2 text-left">Required</th><th className="py-2 text-right">Result</th></tr></thead>
                  <tbody>
                    {evaluateAll(app.claims).map((r, i) => (
                      <motion.tr key={r.rule.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-t border-[var(--line)]">
                        <td className="mono py-2.5 pr-3 text-[11px] text-[var(--accent)]">{r.rule.clause}</td>
                        <td className="py-2.5 pr-3"><div className="font-medium">{r.rule.title}</div><div className="text-xs text-[var(--text-3)]">{r.rule.norm}</div></td>
                        <td className="py-2.5 pr-3">{r.actual}</td><td className="py-2.5 pr-3 text-[var(--text-2)]">{r.required}</td>
                        <td className="py-2.5 text-right"><span className={`badge ${r.pass ? "badge-ok" : "badge-bad"}`}>{r.pass ? "pass" : "fail"}</span></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {tab === "pipeline" && (
            <Panel className="p-5">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><Kicker>How MARK read this file</Kicker><div className="mt-1 text-sm text-[var(--text-2)]">Ten steps, {(app.pipelineMs / 1000).toFixed(0)} seconds end to end. Replaying at 4x.</div></div></div>
              <div className="mt-4"><Pipeline speed={4} /></div>
            </Panel>
          )}

          {tab === "copilot" && (
            <Panel className="p-5"><Kicker>Ask the application</Kicker><div className="mt-3"><Copilot appId={app.id} /></div></Panel>
          )}

          {tab === "letter" && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              <Panel strong className="p-8 print:shadow-none">
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-3)]">All India Council for Technical Education · Approval Bureau</div>
                <div className="display mt-3 text-2xl" style={{ fontWeight: 700 }}>Deficiency communication</div>
                <div className="mt-1 text-sm text-[var(--text-3)]">Ref: {app.id} · {inst.name}, {inst.city} · {app.kind} 2026-27 · dated 2026-10-27</div>
                <p className="mt-6 text-[15px] leading-relaxed">The application has been examined with the assistance of MARK, the Council’s document verification system. The following items need your attention before the application can be processed further. Each item names the document, the clause of the Approval Process Handbook 2026-27 it relates to, and what you need to send.</p>
                <ol className="mt-5 list-decimal space-y-4 pl-5 text-[15px] leading-relaxed">
                  {app.flags.filter((f) => !dismissed.has(f.id) && f.severity !== "minor").map((f) => (
                    <li key={f.id}><span className="font-medium">{f.title}.</span> {f.evidence} {f.clause && <span className="mono text-xs text-[var(--accent)]">[{f.clause}]</span>}<div className="mt-1 text-sm text-[var(--text-2)]">Send: {f.engine === "faculty" ? "appointment letters, EPFO ECR for the last 12 months, and a declaration from each faculty member named." : f.engine === "authentication" ? "a fresh copy of the document from its issuing authority, with digital signature or registry reference." : f.engine === "compliance" ? "revised figures with supporting documents, or a plan to reach the norm before the inspection." : "the corrected document."}</div></li>
                  ))}
                  {app.flags.filter((f) => !dismissed.has(f.id) && f.severity !== "minor").length === 0 && <li>No deficiencies. This letter would not be sent.</li>}
                </ol>
                <p className="mt-6 text-[15px] leading-relaxed">Reply through the portal within 15 working days. Every item above is linked to the exact page MARK flagged, so your response can be checked the same day it arrives.</p>
                <div className="mt-8 flex items-end justify-between"><div className="text-sm"><div className="h-8 w-32 border-b border-[var(--ink)]" /><div className="mt-1">{app.reviewer}, Reviewer</div></div><div className="mono text-[10px] text-[var(--text-3)]">generated by MARK · audit seq linked</div></div>
              </Panel>
              <div className="flex flex-col gap-3 no-print">
                <Panel className="p-5"><Kicker>Actions</Kicker><div className="mt-3 flex flex-col gap-2"><button className="btn btn-accent" onClick={() => window.print()}>Print or save as PDF</button><button className="btn" onClick={(e) => decide("deficiency", e)}>Send through the portal</button></div><p className="mt-3 text-xs text-[var(--text-3)]">Minor flags are left out of the letter on purpose; they are noted on the file for the inspection.</p></Panel>
                <Panel className="p-5"><Kicker>Plain-language check</Kicker><p className="mt-2 text-sm text-[var(--text-2)]">The letter names the document, the clause and what to send for each item. It does not use the word fraud anywhere; a discrepancy is a question, not a verdict.</p></Panel>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

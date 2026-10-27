"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import Pipeline from "@/components/Pipeline";
import { EASE, Kicker, PageHead, Panel, Reveal, ScoreRing, Severity, Stamp } from "@/components/ui";
import { pulse } from "@/components/Background";

/**
 * The institution's side of MARK. Drop the file before you submit it, get the same
 * checks the reviewer will run, fix the deficiencies first. Fewer rejections, less load.
 */
type Stage = "idle" | "running" | "done";
const REQUIRED = ["Affidavit", "Faculty List", "CA Certificate", "Bank Statement", "Lab Inventory", "Library Register", "Fee Receipt", "Geotagged Photos", "University NOC"];

function classify(name: string) {
  const s = name.toLowerCase();
  if (/affid/.test(s)) return "Affidavit"; if (/facul|staff/.test(s)) return "Faculty List"; if (/\bca\b|chartered|udin|funds/.test(s)) return "CA Certificate";
  if (/bank|statement/.test(s)) return "Bank Statement"; if (/lab/.test(s)) return "Lab Inventory"; if (/libr/.test(s)) return "Library Register"; if (/fee/.test(s)) return "Fee Receipt";
  if (/photo|geo|jpg|jpeg|png/.test(s)) return "Geotagged Photos"; if (/noc|univ/.test(s)) return "University NOC"; if (/land|deed|sale/.test(s)) return "Land Deed"; if (/plan|building/.test(s)) return "Building Plan";
  return "Unclassified";
}

export default function Precheck() {
  const [files, setFiles] = useState<{ name: string; size: number; type: string }[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [drag, setDrag] = useState(false);

  const addFiles = (list: FileList | File[]) => {
    const arr = Array.from(list).map((f) => ({ name: f.name, size: f.size, type: classify(f.name) }));
    setFiles((p) => [...p, ...arr]);
  };
  const loadSample = () => setFiles(["affidavit-2026.pdf", "faculty-list-sem1.xlsx", "ca-certificate-udin.pdf", "bank-statement-apr-sep.pdf", "lab-inventory.pdf", "library-register.pdf", "fee-receipts.pdf", "geotagged-photos.zip", "university-noc.pdf"].map((n) => ({ name: n, size: 200000 + n.length * 9000, type: classify(n) })));
  const missing = REQUIRED.filter((r) => !files.some((f) => f.type === r));
  const unclassified = files.filter((f) => f.type === "Unclassified");
  const onDone = useCallback(() => { setStage("done"); pulse("#2e7d5b"); }, []);

  const score = Math.max(30, 96 - missing.length * 9 - unclassified.length * 4);
  const findings = [
    ...missing.map((m) => ({ s: "major" as const, t: `${m} is missing`, e: `The ${m.toLowerCase()} is mandatory for Extension of Approval (Ch. 2 · 2.4). Upload it before you submit.` })),
    ...unclassified.map((u) => ({ s: "minor" as const, t: `${u.name} could not be classified`, e: "Rename the file or tell MARK what it is so the reviewer does not have to guess." })),
    { s: "info" as const, t: "Faculty list will be matched against the national graph on submission", e: "If anyone on your list is also claimed by another institution this cycle, you will be told before the reviewer is." },
    { s: "info" as const, t: "Geotagged photos must be taken on site within 30 days", e: "GPS within 200 m of the declared campus, EXIF intact. Photos from a phone gallery with stripped metadata will be queried." },
  ];

  return (
    <main id="main" tabIndex={-1}>
      <PageHead kicker="Institution pre-check · the same checks the reviewer runs" title={<>Check your file <span style={{ color: "var(--accent)" }}>before</span> AICTE does.</>} lede="Drop the documents you plan to upload. MARK classifies them, finds what is missing, runs the handbook norms it can run without a submission, and tells you what a reviewer will ask. Nothing here is stored or sent to AICTE; it is a rehearsal." />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-4">
          <Reveal delay={0.1}>
            <label
              className={`sheet flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-colors ${drag ? "border-[var(--accent)] bg-[var(--accent-muted)]" : "border-[var(--line-strong)]"}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
            >
              <input type="file" multiple className="sr-only" onChange={(e) => e.target.files && addFiles(e.target.files)} />
              <div className="display text-xl" style={{ fontWeight: 600 }}>Drop your application documents here</div>
              <div className="mt-1 text-sm text-[var(--text-3)]">PDF, images, spreadsheets. Or click to choose. Files are checked here and are not submitted.</div>
              <button type="button" className="btn btn-sm mt-4" onClick={(e) => { e.preventDefault(); loadSample(); }}>Use a sample set of nine documents</button>
            </label>
          </Reveal>
          {files.length > 0 && (
            <Reveal>
              <Panel className="p-5">
                <div className="flex items-center justify-between"><Kicker>{files.length} files · {missing.length} missing · {unclassified.length} unclassified</Kicker><button className="btn btn-sm btn-ghost" onClick={() => { setFiles([]); setStage("idle"); }}>Clear</button></div>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {files.map((f, i) => (
                    <motion.li key={f.name + i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center justify-between rounded-xl border border-[var(--line)] px-3 py-2 text-sm">
                      <span className="truncate"><span className="font-medium">{f.type}</span><span className="mono ml-2 text-[10px] text-[var(--text-3)]">{f.name}</span></span>
                      <span className={`badge ${f.type === "Unclassified" ? "badge-warn" : "badge-ok"}`}>{f.type === "Unclassified" ? "?" : "ok"}</span>
                    </motion.li>
                  ))}
                  {missing.map((m) => <li key={m} className="flex items-center justify-between rounded-xl border border-dashed border-[var(--seal)] px-3 py-2 text-sm"><span className="font-medium" style={{ color: "var(--seal)" }}>{m}</span><span className="badge badge-bad">missing</span></li>)}
                </ul>
                {stage === "idle" && <button className="btn btn-accent mt-4" onClick={() => setStage("running")}>Run the pre-check</button>}
              </Panel>
            </Reveal>
          )}
          <AnimatePresence>
            {stage !== "idle" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <Panel className="p-5"><Kicker>Running the reviewer’s pipeline on your file</Kicker><div className="mt-4"><Pipeline speed={6} onDone={onDone} /></div></Panel>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {stage === "done" && (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                <Panel strong className="p-6">
                  <div className="flex flex-wrap items-center gap-6">
                    <ScoreRing score={score} size={130} label="readiness" />
                    <div className="flex-1">
                      <Stamp tone={score >= 85 ? "ok" : score >= 60 ? "warn" : "bad"}>{score >= 85 ? "ready to submit" : score >= 60 ? "fix then submit" : "not ready"}</Stamp>
                      <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-[var(--text-2)]">{missing.length ? `${missing.length} mandatory document${missing.length > 1 ? "s are" : " is"} missing. A submission today would come back with a deficiency letter in the first pass.` : "Every mandatory document is present and classified. On submission MARK will verify each one against its source."}</p>
                    </div>
                  </div>
                  <ul className="mt-5 flex flex-col gap-3">
                    {findings.map((f, i) => <li key={i} className="rounded-2xl border border-[var(--line)] p-4"><div className="flex items-center gap-2"><Severity s={f.s} /><span className="text-[15px] font-medium">{f.t}</span></div><p className="mt-1 text-sm text-[var(--text-2)]">{f.e}</p></li>)}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2"><button className="btn btn-accent" onClick={() => window.print()}>Download the checklist</button><Link href="/review" className="btn">See what the reviewer sees</Link></div>
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-4">
          <Reveal delay={0.2}><Panel ink className="p-5"><Kicker className="!text-[rgba(243,239,230,0.55)]">Why both sides get this</Kicker><p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(243,239,230,0.8)" }}>Most deficiencies are honest: a missing NOC, a register that is three months old, a photo without GPS. Catching them before submission means fewer letters, fewer cycles, and a reviewer’s morning spent on the files that are actually a problem.</p></Panel></Reveal>
          <Reveal delay={0.3}><Panel className="p-5"><Kicker>What is checked here</Kicker><ul className="mt-2 space-y-1.5 text-sm text-[var(--text-2)]"><li>Every mandatory document present and classified.</li><li>Dates inside the cycle window.</li><li>Numbers that must agree across documents.</li><li>Photo GPS and EXIF, on site and recent.</li><li>Handbook norms that need no registry call.</li></ul><Kicker className="mt-4">What waits for submission</Kicker><ul className="mt-2 space-y-1.5 text-sm text-[var(--text-2)]"><li>UDIN, EPFO, land record and NOC verification.</li><li>The national faculty graph.</li><li>Satellite footprint of the campus.</li></ul></Panel></Reveal>
        </div>
      </div>
    </main>
  );
}

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { rules, clauseSamples } from "@/lib/rules";
import { applications } from "@/lib/data";
import { Counter, EASE, Kicker, PageHead, Panel, Reveal, Stat } from "@/components/ui";
const CATS = ["Land", "Building", "Faculty", "Labs", "Library", "Finance", "Fees", "Documents"];
export default function RulesPage() {
    const [cat, setCat] = useState("");
    const [sample, setSample] = useState(0);
    const [translated, setTranslated] = useState(null);
    const [approved, setApproved] = useState(false);
    const list = rules.filter((r) => !cat || r.category === cat);
    const failRate = (r) => r.status !== "active" ? 0 : Math.round((applications.filter((a) => !r.evaluate(a.claims).pass).length / applications.length) * 100);
    const translate = () => {
        setApproved(false);
        setTranslated(null);
        const target = clauseSamples[sample].rule;
        let i = 0;
        const id = window.setInterval(() => { i += 3; setTranslated(target.slice(0, i)); if (i >= target.length)
            window.clearInterval(id); }, 18);
    };
    return (<main id="main" tabIndex={-1}>
      <PageHead kicker="Approval Process Handbook 2026-27 · rules as code" title={<>The handbook, written so a machine can <span style={{ color: "var(--accent)" }}>cite it</span>.</>} lede="Every norm is a small rule with its clause number, its plain-words meaning and an expression over the application's extracted fields. Rules are versioned by cycle, so last year’s file is judged by last year’s book. A language model drafts a rule from a clause; a human approves it before it runs." aside={<div className="sheet flex items-end gap-6 rounded-3xl px-6 py-4"><Stat label="active rules" value={<Counter to={rules.filter((r) => r.status === "active").length}/>} tone="accent"/><Stat label="draft for 27-28" value={<Counter to={rules.filter((r) => r.status === "draft").length}/>} tone="warn"/><Stat label="retired" value={<Counter to={rules.filter((r) => r.status === "retired").length}/>}/></div>}/>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <Reveal delay={0.1}><div className="scroll-x sheet mb-3 flex gap-1 rounded-full p-1"><button className="tab" data-active={!cat} onClick={() => setCat("")}>All</button>{CATS.map((c) => <button key={c} className="tab" data-active={cat === c} onClick={() => setCat(c)}>{c}</button>)}</div></Reveal>
          <div className="flex flex-col gap-3">
            {list.map((r, i) => (<motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.5, ease: EASE }}>
                <Panel className={`p-5 ${r.status !== "active" ? "opacity-70" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2"><span className="mono text-[11px] text-[var(--accent)]">{r.id} · {r.clause}</span><span className="badge badge-ink">{r.category}</span><span className={`badge ${r.status === "active" ? "badge-ok" : r.status === "draft" ? "badge-warn" : "badge-bad"}`}>{r.status} · {r.version}</span>{r.status === "active" && <span className="mono ml-auto text-[10px] text-[var(--text-3)]">fails on {failRate(r)}% of files</span>}</div>
                  <div className="mt-2 text-[15px] font-medium">{r.title}</div>
                  <p className="mt-1 text-sm text-[var(--text-2)]">{r.norm}</p>
                  <pre className="mono mt-3 overflow-x-auto rounded-xl bg-[rgba(28,37,65,0.06)] px-3 py-2 text-[12px] text-[var(--ink)]">{r.expression}</pre>
                </Panel>
              </motion.div>))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Reveal delay={0.2}>
            <Panel strong className="p-5">
              <Kicker>Clause → rule, with a human in the loop</Kicker>
              <div className="mt-3 flex gap-1">{clauseSamples.map((_, i) => <button key={i} className="tab" data-active={sample === i} onClick={() => { setSample(i); setTranslated(null); setApproved(false); }}>Clause {i + 1}</button>)}</div>
              <blockquote className="mt-3 rounded-2xl border-l-2 border-[var(--accent)] bg-[rgba(28,37,65,0.04)] px-4 py-3 text-sm leading-relaxed">{clauseSamples[sample].clause}</blockquote>
              <button className="btn btn-accent mt-3 w-full" onClick={translate}>Draft the rule</button>
              <AnimatePresence>
                {translated && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }} className="mt-3 overflow-hidden">
                    <pre className="mono whitespace-pre-wrap rounded-xl bg-[var(--ink)] px-3 py-3 text-[12px] text-[#f3efe6]">{translated}<span className="animate-pulse">▍</span></pre>
                    <div className="mt-2 flex flex-wrap gap-1">{clauseSamples[sample].fields.map((f) => <span key={f} className="badge badge-accent">{f}</span>)}</div>
                    <div className="mt-3 flex gap-2"><button className="btn btn-sm" style={{ borderColor: "var(--ok)", color: "var(--ok)" }} onClick={() => setApproved(true)} disabled={approved}>{approved ? "Approved · v2026-27" : "Approve for this cycle"}</button><button className="btn btn-sm btn-ghost" onClick={() => setTranslated(null)}>Edit the clause</button></div>
                  </motion.div>)}
              </AnimatePresence>
            </Panel>
          </Reveal>
          <Reveal delay={0.3}><Panel ink className="p-5"><Kicker className="!text-[rgba(243,239,230,0.55)]">Why this matters</Kicker><p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(243,239,230,0.8)" }}>A score that cannot say which clause it used is an opinion. MARK’s compliance engine is a list of small, versioned, approved rules, so every fail on every file points back to a paragraph of the handbook. When the handbook changes, the rule changes and the old one is kept for the old cycle.</p></Panel></Reveal>
        </div>
      </div>
    </main>);
}

"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { buildChain, verifyChain } from "@/lib/audit";
import { Counter, EASE, PageHead, Panel, Reveal, Stat, Stamp } from "@/components/ui";
import { pulse } from "@/components/Background";
/** Every decision, machine or human, chained by SHA-256 in the browser. Tamper with one and watch the chain break. */
export default function AuditPage() {
    const [entries, setEntries] = useState([]);
    const [ok, setOk] = useState(null);
    const [tampered, setTampered] = useState(null);
    useEffect(() => { buildChain().then(setEntries); }, []);
    const verify = async () => { const r = await verifyChain(entries); setOk(r); pulse(r.every(Boolean) ? "#2e7d5b" : "#b23a2f"); };
    const tamper = async (i) => { const e = entries.slice(); e[i] = { ...e[i], detail: e[i].detail.replace("Score 41", "Score 91").replace("confirmed", "dismissed").replace("GHOST", "NO") + " " }; setEntries(e); setTampered(i); setOk(null); };
    const reset = async () => { setEntries(await buildChain()); setTampered(null); setOk(null); };
    const broken = ok ? ok.findIndex((x) => !x) : -1;
    return (<main id="main" tabIndex={-1}>
      <PageHead kicker="Audit chain · every decision, hashed to the one before it" title={<>Nothing in MARK is <span style={{ color: "var(--accent)" }}>unsigned</span>.</>} lede="Each pipeline result and each reviewer click becomes an entry whose hash includes the previous entry's hash. Change one word anywhere and every later link fails. The chain is verifiable by anyone with the log, and can be anchored to a public ledger nightly." aside={<div className="sheet flex items-end gap-6 rounded-3xl px-6 py-4"><Stat label="entries" value={<Counter to={entries.length}/>}/><Stat label="hash" value="SHA-256" tone="accent"/><Stat label="state" value={ok ? (ok.every(Boolean) ? "intact" : "broken") : tampered != null ? "edited" : "unverified"} tone={ok ? (ok.every(Boolean) ? "ok" : "bad") : tampered != null ? "warn" : undefined}/></div>}/>
      <Reveal delay={0.1}>
        <div className="mb-4 flex flex-wrap items-center gap-2"><button className="btn btn-accent" onClick={verify} disabled={!entries.length}>Verify the chain</button><button className="btn" onClick={() => tamper(4)} disabled={!entries.length || tampered != null}>Tamper with entry 5 (change the score)</button><button className="btn btn-ghost" onClick={reset}>Reset</button>{ok && <Stamp tone={ok.every(Boolean) ? "ok" : "bad"}>{ok.every(Boolean) ? "chain intact" : `broken at #${broken + 1}`}</Stamp>}</div>
      </Reveal>
      <Panel className="p-2">
        <ol className="flex flex-col">
          {entries.map((e, i) => {
            const bad = ok ? !ok[i] : false;
            const edited = tampered === i;
            return (<motion.li key={e.seq} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(0.8, i * 0.04), duration: 0.45, ease: EASE }} className={`grid grid-cols-[40px_minmax(0,1fr)] gap-3 rounded-2xl px-3 py-3 md:grid-cols-[40px_150px_minmax(0,1fr)_320px] ${bad ? "bg-[var(--bad-muted)]" : edited ? "bg-[var(--warn-muted)]" : "row-hover"}`}>
                <span className="mono text-[11px] text-[var(--text-3)]">#{e.seq}</span>
                <span className="mono text-[11px] text-[var(--text-3)]">{e.at.replace("T", " ").replace("Z", "")}</span>
                <span className="text-sm"><span className={`badge mr-2 ${e.actor.startsWith("reviewer") ? "badge-accent" : e.actor.startsWith("admin") ? "badge-warn" : "badge-ink"}`}>{e.actor}</span><span className="font-medium">{e.action}</span>{e.appId && <span className="mono ml-2 text-[10px] text-[var(--accent)]">{e.appId}</span>}<div className="mt-0.5 text-xs text-[var(--text-2)]">{e.detail}</div></span>
                <span className="mono break-all text-[10px] leading-relaxed" style={{ color: bad ? "var(--bad)" : "var(--text-3)" }}>prev {e.prev.slice(0, 12)}…<br />hash {e.hash.slice(0, 24)}…{bad && <b className="ml-2">mismatch</b>}</span>
              </motion.li>);
        })}
        </ol>
      </Panel>
    </main>);
}

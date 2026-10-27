"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { Counter, EASE, Kicker, PageHead, Panel, Reveal, Stat, Stamp } from "@/components/ui";
import { pulse } from "@/components/Background";
/**
 * Virtual inspection: a guided video walkthrough the institution records on a phone, with GPS
 * lock and liveness, that MARK watches before the Expert Visit Committee travels. The demo
 * walks through a storyboard of rooms and counts what it sees.
 */
const ROOMS = [
    { k: "gate", label: "Main gate and board", found: "Board with institution name, AICTE code visible", ok: true },
    { k: "class1", label: "Classroom block A", found: "6 classrooms, 60 seats each, projectors in 5", ok: true },
    { k: "lab-cs", label: "Computer lab", found: "64 terminals, 61 powered on, licence stickers", ok: true },
    { k: "lab-mech", label: "Mechanical workshop", found: "Lathe ×4, milling ×2, CNC absent (listed)", ok: false },
    { k: "library", label: "Library", found: "Stacks ~9,800 volumes by shelf count; register says 11,400", ok: false },
    { k: "faculty", label: "Faculty room", found: "11 of 22 listed faculty present on the roster board today", ok: false },
    { k: "hostel", label: "Hostel and common room", found: "Common room present, mess kitchen present", ok: true },
];
export default function InspectPage() {
    const [idx, setIdx] = useState(-1);
    const [done, setDone] = useState(false);
    const bar = useRef(null);
    const [running, setRunning] = useState(false);
    useEffect(() => {
        if (!running)
            return;
        const tl = gsap.timeline({ onComplete: () => { setDone(true); pulse("#2f45c4"); } });
        ROOMS.forEach((r, i) => { tl.add(() => setIdx(i)); tl.to(bar.current, { width: `${((i + 1) / ROOMS.length) * 100}%`, duration: 1.1, ease: "power1.inOut" }); if (!r.ok)
            tl.add(() => pulse("#b23a2f")); });
        return () => { tl.kill(); };
    }, [running]);
    const issues = ROOMS.filter((r) => !r.ok);
    return (<main id="main" tabIndex={-1}>
      <PageHead kicker="Virtual inspection · before the committee travels" title={<>A walkthrough on a phone, <span style={{ color: "var(--accent)" }}>counted</span> by MARK.</>} lede="The institution records a guided walk: gate, classrooms, labs, library, faculty room. The app locks GPS, checks liveness, and timestamps every frame. MARK counts rooms, seats, terminals and shelves against what the file claims, so the Expert Visit Committee arrives knowing what to look at." aside={<div className="sheet flex items-end gap-6 rounded-3xl px-6 py-4"><Stat label="rooms" value={ROOMS.length}/><Stat label="discrepancies" value={<Counter to={done ? issues.length : 0}/>} tone="bad"/><Stat label="site visit cost saved" value="~₹1.2 L" tone="ok" sub="per avoided travel"/></div>}/>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Reveal delay={0.1}>
          <Panel className="overflow-hidden p-0">
            <div className="relative aspect-video w-full" style={{ background: "linear-gradient(160deg, #26314f, #1c2541 60%, #141a30)" }}>
              {/* the frame: a stylised room that changes with each step */}
              <motion.div key={idx} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: EASE }}>
                <svg viewBox="0 0 160 90" className="h-full w-full" aria-hidden>
                  <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3efe6" stopOpacity="0.08"/><stop offset="1" stopColor="#f3efe6" stopOpacity="0.02"/></linearGradient></defs>
                  <polygon points="0,90 160,90 120,50 40,50" fill="url(#fl)"/>
                  <line x1="40" y1="50" x2="120" y2="50" stroke="#8fa0ff" strokeOpacity="0.4" strokeWidth="0.4"/>
                  {Array.from({ length: idx >= 0 ? 4 + (idx * 3) % 7 : 0 }).map((_, i) => <rect key={i} x={46 + i * 10} y={55 + (i % 2) * 8} width="7" height="10" rx="1" fill="#f3efe6" fillOpacity="0.12" stroke="#8fa0ff" strokeOpacity="0.5" strokeWidth="0.3"/>)}
                  {idx >= 0 && <rect x="20" y="8" width="52" height="8" rx="1" fill="none" stroke="#8fa0ff" strokeWidth="0.4" strokeDasharray="1 1"/>}
                </svg>
                {idx >= 0 && <div className="absolute left-4 top-4 rounded-md px-2 py-1 mono text-[10px] uppercase tracking-[0.16em]" style={{ background: "rgba(243,239,230,0.12)", color: "#f3efe6" }}>{ROOMS[idx].label}</div>}
                {idx >= 0 && <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between"><div className="rounded-xl px-3 py-2 text-sm" style={{ background: "rgba(28,37,65,0.75)", color: "#f3efe6" }}><span className="mono mr-2 text-[10px] uppercase tracking-[0.16em]" style={{ color: ROOMS[idx].ok ? "#7ee2b0" : "#ff8a7a" }}>{ROOMS[idx].ok ? "matches file" : "differs from file"}</span>{ROOMS[idx].found}</div><div className="mono text-[10px]" style={{ color: "rgba(243,239,230,0.6)" }}>22.72N 75.86E · live · 2026-10-27 10:4{idx}</div></div>}
                {idx < 0 && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"><div className="display text-xl" style={{ color: "#f3efe6", fontWeight: 600 }}>Walkthrough recording from Indore, 7 stops</div><button className="btn" style={{ background: "#f3efe6", color: "var(--ink)", borderColor: "#f3efe6" }} onClick={() => { setRunning(true); }}>▶ Watch MARK count the campus</button></div>}
              </motion.div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-[rgba(243,239,230,0.1)]"><div ref={bar} className="h-full bg-[#8fa0ff]" style={{ width: 0 }}/></div>
            </div>
            <ol className="grid grid-cols-7 gap-1 p-3">{ROOMS.map((r, i) => <li key={r.k} className="rounded-lg px-1 py-2 text-center" style={{ background: i <= idx ? (r.ok ? "var(--ok-muted)" : "var(--bad-muted)") : "rgba(28,37,65,0.05)" }}><div className="mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-3)]">{i + 1}</div><div className="truncate text-[11px]">{r.label}</div></li>)}</ol>
          </Panel>
        </Reveal>
        <div className="flex flex-col gap-4">
          <Reveal delay={0.2}>
            <Panel strong className="p-5">
              <div className="flex items-center justify-between"><Kicker>Findings</Kicker>{done && <Stamp tone="bad">EVC briefed</Stamp>}</div>
              <ul className="mt-3 flex flex-col gap-3">
                {(done ? issues : []).map((r) => <li key={r.k} className="rounded-2xl border border-[var(--seal)] bg-[var(--bad-muted)] p-3"><div className="text-sm font-medium">{r.label}</div><div className="text-xs text-[var(--text-2)]">{r.found}</div></li>)}
                {!done && <li className="text-sm text-[var(--text-3)]">Play the walkthrough. Findings land here as MARK counts.</li>}
              </ul>
            </Panel>
          </Reveal>
          <Reveal delay={0.3}><Panel className="p-5"><Kicker>Anti-staging</Kicker><ul className="mt-2 space-y-1.5 text-sm text-[var(--text-2)]"><li>GPS locked to the declared campus polygon.</li><li>Liveness: the recorder turns and speaks a nonce shown on screen.</li><li>No pauses, no splices; frame hashes chain like the audit log.</li><li>Same-day repeat on a random stop if counts disagree with the file.</li></ul></Panel></Reveal>
        </div>
      </div>
    </main>);
}

"use client";

import { useEffect, useState } from "react";
import { Kicker, PageHead, Panel, Reveal } from "@/components/ui";

const ROLES = ["Reviewer", "Senior reviewer", "Regional officer", "Institution", "Administrator"];
const INTEGRATIONS = [
  { k: "digilocker", name: "DigiLocker", what: "Issued documents straight from the issuer", on: true },
  { k: "udin", name: "ICAI UDIN", what: "Verifies every CA certificate", on: true },
  { k: "epfo", name: "EPFO", what: "Who actually pays the faculty", on: true },
  { k: "nad", name: "National Academic Depository", what: "Degree certificates by number", on: true },
  { k: "bhulekh", name: "State land records", what: "Survey numbers and ownership", on: true },
  { k: "bhuvan", name: "Bhuvan satellite", what: "Campus footprint on current imagery", on: true },
  { k: "mca", name: "MCA / Registrar of Societies", what: "Trusts and societies behind institutions", on: false },
  { k: "aicte", name: "AICTE approval portal", what: "Pulls applications, pushes recommendations", on: true },
];

export default function SettingsPage() {
  const [role, setRole] = useState("Reviewer");
  const [ints, setInts] = useState(INTEGRATIONS);
  const [thresh, setThresh] = useState({ fast: 85, hold: 60, face: 0.9, ela: 0.4 });
  const [privacy, setPrivacy] = useState({ mask: true, onprem: true, retain: 180, bias: true });
  useEffect(() => { try { setRole(localStorage.getItem("mark.role") || "Reviewer"); } catch {} }, []);
  const pickRole = (r: string) => { setRole(r); try { localStorage.setItem("mark.role", r); } catch {} window.dispatchEvent(new Event("mark:role")); };

  return (
    <main id="main" tabIndex={-1}>
      <PageHead kicker="Settings · who you are, what MARK can reach, where the lines are" title="Options" lede="MARK runs on-premise inside the Council's network. Registries are reached through consented, logged connectors. Thresholds are tuned from reviewer feedback; the values below are the current defaults." />
      <div className="grid gap-4 md:grid-cols-2">
        <Reveal delay={0.05}><Panel className="p-5"><Kicker>Role</Kicker><div className="mt-3 flex flex-wrap gap-2">{ROLES.map((r) => <button key={r} className="tab sheet" data-active={role === r} onClick={() => pickRole(r)}>{r}</button>)}</div><p className="mt-3 text-sm text-[var(--text-2)]">{role === "Institution" ? "Sees the pre-check and its own files only." : role === "Senior reviewer" ? "Sees holds first, can override a score with a signed reason." : role === "Administrator" ? "Manages rules, integrations and thresholds. Cannot touch a file's score." : role === "Regional officer" ? "Sees the map for their states and the queue." : "Sees the desk, the graph and every file assigned."}</p></Panel></Reveal>
        <Reveal delay={0.1}><Panel className="p-5"><Kicker>Thresholds</Kicker><div className="mt-3 flex flex-col gap-4 text-sm">
          {[["Fast-track at or above", "fast", 70, 95, 1], ["Hold below", "hold", 40, 75, 1], ["Face match threshold", "face", 0.8, 0.98, 0.01], ["Error-level flag above", "ela", 0.2, 0.7, 0.01]].map(([label, k, min, max, step]) => (
            <label key={String(k)} className="flex flex-col gap-1"><span className="flex justify-between"><span>{label}</span><span className="mono">{thresh[k as keyof typeof thresh]}</span></span><input type="range" min={Number(min)} max={Number(max)} step={Number(step)} value={thresh[k as keyof typeof thresh]} onChange={(e) => setThresh({ ...thresh, [k as string]: Number(e.target.value) })} className="accent-[var(--accent)]" /></label>
          ))}
        </div></Panel></Reveal>
        <Reveal delay={0.15}><Panel className="p-5"><Kicker>Integrations</Kicker><ul className="mt-3 flex flex-col gap-2">{ints.map((it) => <li key={it.k} className="flex items-center justify-between rounded-xl border border-[var(--line)] px-3 py-2"><div><div className="text-sm font-medium">{it.name}</div><div className="text-xs text-[var(--text-3)]">{it.what}</div></div><button role="switch" aria-checked={it.on} onClick={() => setInts(ints.map((x) => x.k === it.k ? { ...x, on: !x.on } : x))} className="relative h-6 w-11 rounded-full transition-colors" style={{ background: it.on ? "var(--accent)" : "rgba(28,37,65,0.2)" }}><span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: it.on ? 22 : 2 }} /></button></li>)}</ul></Panel></Reveal>
        <Reveal delay={0.2}><Panel className="p-5"><Kicker>Privacy and fairness</Kicker><ul className="mt-3 flex flex-col gap-3 text-sm">
          <li className="flex items-center justify-between"><span>Mask Aadhaar and PAN at rest and on screen</span><input type="checkbox" checked={privacy.mask} onChange={(e) => setPrivacy({ ...privacy, mask: e.target.checked })} className="accent-[var(--accent)]" /></li>
          <li className="flex items-center justify-between"><span>On-premise models only, no document leaves the network</span><input type="checkbox" checked={privacy.onprem} onChange={(e) => setPrivacy({ ...privacy, onprem: e.target.checked })} className="accent-[var(--accent)]" /></li>
          <li className="flex items-center justify-between"><span>Bias guard: score never sees institution name, state or owner</span><input type="checkbox" checked={privacy.bias} onChange={(e) => setPrivacy({ ...privacy, bias: e.target.checked })} className="accent-[var(--accent)]" /></li>
          <li className="flex items-center justify-between"><span>Retain raw uploads for</span><span className="mono">{privacy.retain} days</span></li>
          <li className="text-xs text-[var(--text-3)]">Built for the Digital Personal Data Protection Act, 2023: purpose-bound, consented, logged, deletable.</li>
        </ul></Panel></Reveal>
        <Reveal delay={0.25}><Panel ink className="p-5 md:col-span-2"><Kicker className="!text-[rgba(243,239,230,0.55)]">Models</Kicker><div className="mt-2 grid gap-3 text-sm md:grid-cols-4" style={{ color: "rgba(243,239,230,0.85)" }}><div><div className="font-medium">Reading</div><div className="text-xs opacity-70">Surya / PaddleOCR, Indic scripts, layout-aware tables</div></div><div><div className="font-medium">Forensics</div><div className="text-xs opacity-70">ELA, copy-move (SIFT), font profiling, synthetic-image detector</div></div><div><div className="font-medium">Faces and graph</div><div className="text-xs opacity-70">InsightFace embeddings, Neo4j, timeline overlap</div></div><div><div className="font-medium">Language</div><div className="text-xs opacity-70">LLM for clause-to-rule drafts, copilot and letters, grounded in the file</div></div></div></Panel></Reveal>
      </div>
    </main>
  );
}

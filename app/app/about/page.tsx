"use client";

import Link from "next/link";
import { motion } from "motion/react";
import Logo from "@/components/Logo";
import { EASE, Kicker, PageHead, Panel, Reveal } from "@/components/ui";

const EDGE = [
  { t: "Cross-institution graph", d: "Most teams check one file. MARK checks the file against every other file in the country. That is where ghost faculty live." },
  { t: "External truth, not only internal checks", d: "EPFO says who is paid. ICAI says which UDIN exists. Bhuvan says how big the campus is. A document cannot argue with those." },
  { t: "Rules you can cite", d: "The handbook as versioned code, each rule with its clause. The score is explainable to a committee and to a court." },
  { t: "Both sides of the counter", d: "Reviewers get a copilot and a letter. Institutions get a rehearsal. Fewer cycles for everyone." },
  { t: "A chain, not a log", d: "Every decision hashed to the previous one. Human in the loop always; the machine proposes, a person decides, and the record shows both." },
  { t: "Language that keeps trust", d: "MARK never says fraud. It says discrepancy, unverified, needs a fresh copy. A question, not a verdict." },
];
const ARCH = [
  ["Intake", "Portal pull, DigiLocker, drag-and-drop · MinIO object store"],
  ["Reading", "Classifier → OCR (Indic) → layout extraction → fields with page and box"],
  ["Validation", "Cross-document consistency, completeness, dates in cycle"],
  ["Authentication", "Forensics (ELA, copy-move, fonts, metadata, synthetic) · registries (UDIN, EPFO, NAD, Bhulekh, NOC) · satellite and EXIF geo"],
  ["Faculty graph", "PostgreSQL + Neo4j · PAN/DOB/degree/face match · timeline overlap"],
  ["Compliance", "Handbook rules-as-code, versioned per cycle, LLM-drafted, human-approved"],
  ["Score and copilot", "Weighted, explained, evidence-linked · LLM grounded in the file for chat and letters"],
  ["Governance", "SHA-256 audit chain · DPDP controls · bias guard · reviewer feedback loop"],
];

export default function About() {
  return (
    <main id="main" tabIndex={-1}>
      <PageHead kicker="AI-powered application validation · document authentication · regulatory compliance verification" title={<>What MARK sees that a <span style={{ color: "var(--accent)" }}>single file</span> cannot.</>} lede="AICTE approves thousands of institutions every cycle from paper: affidavits, deeds, faculty lists, CA certificates, photographs. Scrutiny is slow and uneven, and the same professor can appear on three payrolls without anyone noticing. MARK reads the file, proves each document, checks the handbook, finds the ghost, and shows the reviewer why." />
      <Reveal delay={0.1}>
        <Panel ink className="mb-6 flex flex-col items-center gap-4 p-8 text-center md:flex-row md:text-left">
          <Logo className="h-16 w-auto shrink-0" color="#f3efe6" seal="#8fa0ff" />
          <div><div className="display text-2xl" style={{ fontWeight: 700 }}>Multi-source Authentication and Regulatory Knowledge</div><div className="mt-1 text-sm" style={{ color: "rgba(243,239,230,0.75)" }}>Or simply: the mark an application earns when it is real.</div></div>
        </Panel>
      </Reveal>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {EDGE.map((e, i) => <motion.div key={e.t} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}><Panel className="h-full p-5"><div className="display text-lg" style={{ fontWeight: 600 }}>{e.t}</div><p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">{e.d}</p></Panel></motion.div>)}
      </div>
      <Reveal delay={0.5} className="mt-6">
        <Panel className="p-5">
          <Kicker>Architecture</Kicker>
          <ol className="mt-3 grid gap-2 md:grid-cols-2">{ARCH.map(([a, b], i) => <li key={a} className="flex gap-3 rounded-2xl border border-[var(--line)] p-3"><span className="mono text-[11px] text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span><div><div className="text-sm font-medium">{a}</div><div className="text-xs text-[var(--text-2)]">{b}</div></div></li>)}</ol>
          <div className="mt-4 text-xs text-[var(--text-3)]">Built on Next.js and React, with an LLM for grounded language tasks. Deployed on-premise inside the Council’s network.</div>
        </Panel>
      </Reveal>
      <Reveal delay={0.6} className="mt-6">
        <Panel strong className="p-5">
          <Kicker>A five-minute walkthrough</Kicker>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>Open the <Link href="/review" className="underline">review desk</Link>. Files sorted by risk, holds first.</li>
            <li>Open <Link href="/review/APP-2026-0417" className="underline">the Indore file</Link>. Trust 38. Confirm the ghost-faculty flag; dismiss the lab-count flag and watch the score move.</li>
            <li>Open the affidavit. Hover for the forensic lens; switch to error-level. The notary seal is a clone.</li>
            <li>Open the <Link href="/graph" className="underline">graph</Link>. Six people, three colleges, one semester.</li>
            <li>Back on the file: Handbook tab shows clause 4.5 failing at 1:31. Deficiency letter tab writes the letter. Refer to EVC; the <Link href="/audit" className="underline">audit chain</Link> records it.</li>
            <li>Close with the <Link href="/precheck" className="underline">pre-check</Link>: the institution would have caught most of this before submitting.</li>
          </ol>
        </Panel>
      </Reveal>
    </main>
  );
}

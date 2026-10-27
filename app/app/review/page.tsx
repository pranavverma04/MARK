"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { applications, heroAppId, instById, nationalStats, sharedFaculty, STATES, ENGINE_LABEL, ENGINE_BLURB } from "@/lib/data";
import type { Engine } from "@/lib/types";
import AppRow from "@/components/AppRow";
import { Counter, Kicker, PageHead, Panel, Reveal, Stat } from "@/components/ui";

type Band = "all" | "hold" | "look" | "fast";

export default function ReviewDesk() {
  const [band, setBand] = useState<Band>("all");
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [sort, setSort] = useState<"risk" | "newest" | "name">("risk");

  const rows = useMemo(() => {
    let r = applications.slice();
    if (band === "hold") r = r.filter((a) => a.score < 60);
    if (band === "look") r = r.filter((a) => a.score >= 60 && a.score < 85);
    if (band === "fast") r = r.filter((a) => a.score >= 85);
    if (state) r = r.filter((a) => instById(a.instId).stateCode === state);
    if (q.trim()) { const s = q.toLowerCase(); r = r.filter((a) => { const i = instById(a.instId); return i.name.toLowerCase().includes(s) || i.city.toLowerCase().includes(s) || a.id.toLowerCase().includes(s); }); }
    if (sort === "risk") r.sort((a, b) => a.score - b.score);
    if (sort === "newest") r.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    if (sort === "name") r.sort((a, b) => instById(a.instId).name.localeCompare(instById(b.instId).name));
    return r;
  }, [band, q, state, sort]);

  const s = nationalStats;
  const bands: { k: Band; label: string; n: number }[] = [
    { k: "all", label: "All files", n: applications.length },
    { k: "hold", label: "Hold (under 60)", n: s.hold },
    { k: "look", label: "Second look (60 to 84)", n: applications.length - s.hold - s.fast },
    { k: "fast", label: "Fast-track (85+)", n: s.fast },
  ];

  return (
    <main id="main" tabIndex={-1}>
      <PageHead
        kicker="Review desk · Extension of Approval cycle 2026-27"
        title={<><Counter to={applications.length} /> applications arrived this week. <span style={{ color: "var(--seal)" }}>{s.hold}</span> need a human first.</>}
        lede="MARK already read every file. The ledger is sorted by risk, so the morning starts with the files that matter. Clean files wait at the bottom with a recommendation ready to sign."
        aside={
          <div className="sheet flex flex-wrap items-end gap-6 rounded-3xl px-6 py-4">
            <Stat label="avg trust" value={<Counter to={s.avg} />} tone={s.avg >= 80 ? "ok" : "warn"} />
            <Stat label="fast-track" value={<Counter to={s.fast} />} tone="ok" sub="sign and move on" />
            <Stat label="on hold" value={<Counter to={s.hold} />} tone="bad" sub="senior review" />
            <Stat label="ghost faculty" value={<Counter to={s.ghosts} />} tone="accent" sub="people on 2+ lists" />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Reveal delay={0.1}>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="scroll-x flex gap-1 rounded-full p-1 sheet">
                {bands.map((b) => (
                  <button key={b.k} className="tab" data-active={band === b.k} onClick={() => setBand(b.k)}>{b.label} <span className="mono ml-1 opacity-60">{b.n}</span></button>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="input !w-44 md:!w-56" placeholder="Search name, city, id" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search applications" />
                <select className="input !w-auto" value={state} onChange={(e) => setState(e.target.value)} aria-label="Filter by state">
                  <option value="">All states</option>
                  {STATES.map((st) => <option key={st.code} value={st.code}>{st.name}</option>)}
                </select>
                <select className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort">
                  <option value="risk">Risk first</option><option value="newest">Newest</option><option value="name">Name</option>
                </select>
              </div>
            </div>
          </Reveal>
          <Panel className="p-2">
            <div className="mono hidden grid-cols-[56px_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_110px] gap-4 px-3 pb-2 pt-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)] md:grid">
              <span>trust</span><span>institution</span><span>application</span><span>flags</span><span>reviewer</span><span className="justify-self-end">status</span>
            </div>
            <div className="flex flex-col">
              {rows.map((a, i) => <AppRow key={a.id} app={a} i={i} />)}
              {rows.length === 0 && <div className="p-8 text-center text-sm text-[var(--text-3)]">No files match. Clear a filter.</div>}
            </div>
          </Panel>
        </div>

        <aside className="flex flex-col gap-4">
          <Reveal delay={0.2}>
            <Panel ink className="rounded-3xl p-5">
              <Kicker className="!text-[rgba(243,239,230,0.55)]">Start here</Kicker>
              <h2 className="display mt-2 text-xl" style={{ fontWeight: 600 }}>The Indore file</h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(243,239,230,0.75)" }}>Six faculty on three payrolls, an affidavit edited after the notary, a CA certificate with no UDIN. MARK found all of it in 23 seconds.</p>
              <Link href={`/review/${heroAppId}`} className="btn mt-4 w-full" style={{ background: "#f3efe6", color: "var(--ink)", borderColor: "#f3efe6" }}>Open APP-2026-0417</Link>
            </Panel>
          </Reveal>
          <Reveal delay={0.3}>
            <Panel className="p-5">
              <Kicker>Four engines, one score</Kicker>
              <ul className="mt-3 flex flex-col gap-3">
                {(Object.keys(ENGINE_LABEL) as Engine[]).map((e) => (
                  <li key={e} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: e === "faculty" ? "var(--accent)" : e === "authentication" ? "var(--seal)" : e === "compliance" ? "var(--warn)" : "var(--ok)" }} />
                    <div><div className="text-sm font-medium">{ENGINE_LABEL[e]}</div><div className="text-xs text-[var(--text-3)]">{ENGINE_BLURB[e]}</div></div>
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
          <Reveal delay={0.4}>
            <Panel className="p-5">
              <Kicker>Ghost faculty this cycle</Kicker>
              <div className="mt-2 flex items-end gap-2"><span className="display text-4xl" style={{ fontWeight: 700, color: "var(--accent)" }}><Counter to={sharedFaculty.length} /></span><span className="pb-1 text-xs text-[var(--text-3)]">people on two or more lists</span></div>
              <Link href="/graph" className="btn btn-sm mt-3">Open the graph</Link>
            </Panel>
          </Reveal>
        </aside>
      </div>
    </main>
  );
}

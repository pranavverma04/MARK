"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { STATES, appsOfState, applications, institutions, instById, sharedFaculty, nationalStats } from "@/lib/data";
import { Counter, EASE, Kicker, PageHead, Panel, Reveal, Sparkline, Stat, toneColor, tone } from "@/components/ui";

/** A tile-grid map of India. Each tile is a state; its ink is the average trust of its files. */
export default function MapPage() {
  const [sel, setSel] = useState<string>("MP");
  const tiles = useMemo(() => STATES.map((s) => { const apps = appsOfState(s.code); const avg = apps.length ? Math.round(apps.reduce((a, x) => a + x.score, 0) / apps.length) : null; const ghosts = sharedFaculty.filter((f) => f.instIds.some((i) => instById(i).stateCode === s.code)).length; return { ...s, apps, avg, ghosts }; }), []);
  const cur = tiles.find((t) => t.code === sel)!;
  const cols = 9, rows = 8;
  const byType = useMemo(() => ["Engineering", "Pharmacy", "Management", "Polytechnic", "Architecture"].map((t) => { const apps = applications.filter((a) => instById(a.instId).type === t); return { t, n: apps.length, avg: apps.length ? Math.round(apps.reduce((a, x) => a + x.score, 0) / apps.length) : 0 }; }), []);
  const s = nationalStats;

  return (
    <main id="main" tabIndex={-1}>
      <PageHead kicker="National dashboard · cycle 2026-27" title={<>Where the <span style={{ color: "var(--seal)" }}>risk</span> clusters, state by state.</>} lede="Every state is a tile; its ink is the average trust of the files from there. Click a tile for its applications, its rings and its trend. The Council sees the whole cycle in one glance, and a regional office sees its own queue." aside={<div className="sheet flex flex-wrap items-end gap-6 rounded-3xl px-6 py-4"><Stat label="files" value={<Counter to={s.total} />} /><Stat label="institutions" value={<Counter to={institutions.length} />} /><Stat label="critical flags" value={<Counter to={s.critical} />} tone="bad" /><Stat label="reviewer hours saved" value={<Counter to={Math.round(s.total * 3.4)} />} tone="ok" sub="at 3.4 h per file" /></div>} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Reveal delay={0.1}>
          <Panel className="p-5">
            <div className="mx-auto grid max-w-[720px] gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
              {tiles.map((t, i) => {
                const color = t.avg == null ? "rgba(28,37,65,0.08)" : toneColor(tone(t.avg));
                const active = sel === t.code;
                return (
                  <motion.button key={t.code} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.02, duration: 0.5, ease: EASE }} whileHover={{ scale: 1.06 }}
                    onClick={() => setSel(t.code)} aria-label={`${t.name}: ${t.apps.length} applications`}
                    className="relative flex aspect-square flex-col items-start justify-between rounded-lg p-1.5 text-left"
                    style={{ gridColumn: t.col + 1, gridRow: t.row + 1, background: t.avg == null ? "rgba(28,37,65,0.05)" : `color-mix(in oklab, ${color} ${Math.round(25 + (100 - t.avg) * 0.9)}%, transparent)`, outline: active ? "2px solid var(--ink)" : "1px solid var(--line)", outlineOffset: active ? 1 : 0 }}
                  >
                    <span className="mono text-[10px] font-medium leading-none text-[var(--ink)]">{t.code}</span>
                    {t.avg != null && <span className="display text-xs leading-none" style={{ fontWeight: 700, color: "var(--ink)" }}>{t.avg}</span>}
                    {t.ghosts > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--seal)]" />}
                  </motion.button>
                );
              })}
            </div>
            <div className="mono mt-4 flex flex-wrap justify-center gap-4 text-[10px] uppercase tracking-[0.16em] text-[var(--text-3)]"><span><i className="mr-1 inline-block h-2 w-3 rounded-sm bg-[var(--ok)]" />avg 80+</span><span><i className="mr-1 inline-block h-2 w-3 rounded-sm bg-[var(--warn)]" />60 to 79</span><span><i className="mr-1 inline-block h-2 w-3 rounded-sm bg-[var(--seal)]" />under 60</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[var(--seal)]" />ghost faculty present</span><span>darker = lower trust</span></div>
          </Panel>
        </Reveal>
        <div className="flex flex-col gap-4">
          <Reveal delay={0.2}>
            <Panel strong className="p-5">
              <Kicker>{cur.name}</Kicker>
              <div className="mt-2 flex items-end gap-6"><Stat label="files" value={cur.apps.length} /><Stat label="avg trust" value={cur.avg ?? "—"} tone={cur.avg ? tone(cur.avg) : undefined} /><Stat label="ghosts" value={cur.ghosts} tone={cur.ghosts ? "bad" : "ok"} /></div>
              <ul className="mt-4 flex flex-col gap-1">
                {cur.apps.sort((a, b) => a.score - b.score).map((a) => <li key={a.id}><Link href={`/review/${a.id}`} className="row-hover flex items-center justify-between rounded-xl px-2 py-1.5 text-sm"><span className="truncate">{instById(a.instId).name}</span><span className="display ml-3" style={{ fontWeight: 700, color: toneColor(tone(a.score)) }}>{a.score}</span></Link></li>)}
                {cur.apps.length === 0 && <li className="text-sm text-[var(--text-3)]">No applications from this state this week.</li>}
              </ul>
            </Panel>
          </Reveal>
          <Reveal delay={0.3}>
            <Panel className="p-5">
              <Kicker>Trust by institution type</Kicker>
              <ul className="mt-3 flex flex-col gap-2">{byType.map((b) => <li key={b.t} className="flex items-center justify-between text-sm"><span>{b.t}<span className="mono ml-2 text-[10px] text-[var(--text-3)]">{b.n}</span></span><span className="flex items-center gap-3"><Sparkline points={[b.avg - 9, b.avg - 4, b.avg - 6, b.avg - 2, b.avg + 1, b.avg]} color={toneColor(tone(b.avg))} width={80} height={22} /><span className="display w-8 text-right" style={{ fontWeight: 700, color: toneColor(tone(b.avg)) }}>{b.avg}</span></span></li>)}</ul>
            </Panel>
          </Reveal>
          <Reveal delay={0.4}><Panel className="p-5"><Kicker>Cycle so far</Kicker><div className="mt-2 text-sm text-[var(--text-2)]">Average pipeline time 23 s. Reviewer time per fast-track file down from about 3.5 h to 4 min. Deficiency letters now cite a clause 100% of the time.</div><div className="mt-3"><Sparkline points={[62, 64, 63, 68, 71, 70, 74, 77, 79, 81]} width={300} height={40} /></div><div className="mono mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--text-3)]">weekly average trust, last 10 weeks</div></Panel></Reveal>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { faculty, institutions, instById, sharedFaculty } from "@/lib/data";
import { Counter, Kicker, PageHead, Panel, Reveal, Stat } from "@/components/ui";
import { pulse } from "@/components/Background";

/**
 * The national faculty graph. Institutions are ink squares, people are dots. A person who
 * appears on two or more faculty lists is drawn in seal red with an edge to each institution.
 * Force layout on canvas; nothing is pre-positioned, the rings find their own shape.
 */
type Node = { id: string; kind: "inst" | "person"; label: string; x: number; y: number; vx: number; vy: number; ghost: boolean; deg: number; state?: string; epfo?: boolean };
type Edge = { a: number; b: number };

export default function GraphPage() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [focus, setFocus] = useState<Node | null>(null);
  const [onlyGhost, setOnlyGhost] = useState(false);
  const [running, setRunning] = useState(true);
  const hoverRef = useRef<Node | null>(null);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const idx = new Map<string, number>();
    const ghostInst = new Set(sharedFaculty.flatMap((f) => f.instIds));
    const insts = onlyGhost ? institutions.filter((i) => ghostInst.has(i.id)) : institutions;
    for (const i of insts) { idx.set(i.id, nodes.length); nodes.push({ id: i.id, kind: "inst", label: `${i.short}, ${i.city}`, x: 0, y: 0, vx: 0, vy: 0, ghost: ghostInst.has(i.id), deg: 0, state: i.state }); }
    const people = onlyGhost ? sharedFaculty : faculty.filter((f) => f.instIds.length > 1 || f.photo % 4 === 0);
    for (const f of people) {
      const ins = f.instIds.filter((x) => idx.has(x));
      if (!ins.length) continue;
      const n = nodes.length; idx.set(f.id, n);
      nodes.push({ id: f.id, kind: "person", label: f.name, x: 0, y: 0, vx: 0, vy: 0, ghost: f.instIds.length > 1, deg: ins.length, epfo: f.epfo });
      for (const i of ins) { edges.push({ a: n, b: idx.get(i)! }); nodes[idx.get(i)!].deg++; }
    }
    return { nodes, edges };
  }, [onlyGhost]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let w = 0, h = 0, dpr = 1, raf = 0, t = 0;
    const resize = () => { dpr = Math.min(2, window.devicePixelRatio || 1); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    // seed positions in a ring so the layout unfolds from the centre
    nodes.forEach((n, i) => { const a = (i / nodes.length) * Math.PI * 2; const r = n.kind === "inst" ? Math.min(w, h) * 0.34 : Math.min(w, h) * 0.12; n.x = w / 2 + Math.cos(a) * r + (Math.random() - 0.5) * 30; n.y = h / 2 + Math.sin(a) * r + (Math.random() - 0.5) * 30; });
    const pointer = { x: -1, y: -1 };
    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; };
    const onClick = () => { if (hoverRef.current) { setFocus(hoverRef.current); const r = canvas.getBoundingClientRect(); pulse(hoverRef.current.ghost ? "#b23a2f" : "#2f45c4", r.left + hoverRef.current.x, r.top + hoverRef.current.y); } };
    canvas.addEventListener("pointermove", onMove); canvas.addEventListener("click", onClick); window.addEventListener("resize", resize);

    const step = () => {
      t++;
      const alpha = Math.max(0.02, 1 - t / 400);
      // repulsion
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]; let dx = b.x - a.x, dy = b.y - a.y; const d2 = dx * dx + dy * dy + 0.01; if (d2 > 90000) continue;
        const f = (a.kind === "inst" && b.kind === "inst" ? 2600 : 900) / d2; const d = Math.sqrt(d2); dx /= d; dy /= d;
        a.vx -= dx * f * alpha; a.vy -= dy * f * alpha; b.vx += dx * f * alpha; b.vy += dy * f * alpha;
      }
      // springs
      for (const e of edges) { const a = nodes[e.a], b = nodes[e.b]; const dx = b.x - a.x, dy = b.y - a.y; const d = Math.sqrt(dx * dx + dy * dy) + 0.01; const f = (d - 70) * 0.02 * alpha; a.vx += (dx / d) * f; a.vy += (dy / d) * f; b.vx -= (dx / d) * f; b.vy -= (dy / d) * f; }
      // gravity to centre, stronger for institutions with no edges
      for (const n of nodes) { n.vx += (w / 2 - n.x) * 0.002 * alpha; n.vy += (h / 2 - n.y) * 0.002 * alpha; n.vx *= 0.85; n.vy *= 0.85; n.x += n.vx; n.y += n.vy; n.x = Math.max(20, Math.min(w - 20, n.x)); n.y = Math.max(20, Math.min(h - 20, n.y)); }
    };
    const draw = () => {
      if (running) step();
      ctx.clearRect(0, 0, w, h);
      // hover
      let hv: Node | null = null, best = 400;
      for (const n of nodes) { const dx = n.x - pointer.x, dy = n.y - pointer.y; const d2 = dx * dx + dy * dy; if (d2 < best) { best = d2; hv = n; } }
      hoverRef.current = hv;
      canvas.style.cursor = hv ? "pointer" : "default";
      for (const e of edges) {
        const a = nodes[e.a], b = nodes[e.b]; const g = nodes[e.a].ghost;
        const hot = hv && (hv === a || hv === b);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = g ? `rgba(178,58,47,${hot ? 0.9 : 0.5})` : `rgba(28,37,65,${hot ? 0.5 : 0.14})`; ctx.lineWidth = g ? (hot ? 2.2 : 1.4) : 1; ctx.stroke();
      }
      for (const n of nodes) {
        const hot = hv === n || (focus && focus.id === n.id);
        if (n.kind === "inst") {
          const s = 7 + Math.min(8, n.deg * 0.6);
          ctx.fillStyle = n.ghost ? "#b23a2f" : "#1c2541"; ctx.globalAlpha = hot ? 1 : n.ghost ? 0.95 : 0.75;
          ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s); ctx.globalAlpha = 1;
          if (n.ghost || hot) { ctx.font = "500 10px var(--font-mono), monospace"; ctx.fillStyle = "#1c2541"; ctx.fillText(n.label, n.x + s, n.y - s); }
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.ghost ? 5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = n.ghost ? "#b23a2f" : "#2f45c4"; ctx.globalAlpha = n.ghost ? 1 : 0.55; ctx.fill(); ctx.globalAlpha = 1;
          if (n.ghost) { ctx.beginPath(); ctx.arc(n.x, n.y, 9 + Math.sin(t / 12) * 1.5, 0, Math.PI * 2); ctx.strokeStyle = "rgba(178,58,47,0.5)"; ctx.lineWidth = 1; ctx.stroke(); }
          if (hot) { ctx.font = "500 11px var(--font-mono), monospace"; ctx.fillStyle = "#1c2541"; ctx.fillText(n.label, n.x + 10, n.y + 4); }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener("pointermove", onMove); canvas.removeEventListener("click", onClick); window.removeEventListener("resize", resize); };
  }, [nodes, edges, running, focus]);

  const rings = useMemo(() => {
    const groups = new Map<string, typeof sharedFaculty>();
    for (const f of sharedFaculty) { const k = f.instIds.slice().sort().join("+"); groups.set(k, [...(groups.get(k) || []), f]); }
    return Array.from(groups.entries()).map(([k, people]) => ({ insts: k.split("+").map(instById), people })).sort((a, b) => b.people.length - a.people.length);
  }, []);

  return (
    <main id="main" tabIndex={-1}>
      <PageHead kicker="National faculty graph · every faculty list this cycle, in one place" title={<>One person, <span style={{ color: "var(--seal)" }}>three payrolls</span>. The graph sees what a single file cannot.</>} lede="Each square is an institution, each dot a faculty member. MARK matches PAN, date of birth, degree number and face embedding across every application in the country. A person with two or more lines is claimed full-time in two or more places." aside={<div className="sheet flex items-end gap-6 rounded-3xl px-6 py-4"><Stat label="people on 2+ lists" value={<Counter to={sharedFaculty.length} />} tone="bad" /><Stat label="institutions involved" value={<Counter to={new Set(sharedFaculty.flatMap((f) => f.instIds)).size} />} tone="warn" /><Stat label="rings" value={<Counter to={rings.length} />} tone="accent" /></div>} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Reveal delay={0.1}>
          <Panel className="relative overflow-hidden p-0">
            <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
              <button className="tab sheet" data-active={!onlyGhost} onClick={() => setOnlyGhost(false)}>Whole country</button>
              <button className="tab sheet" data-active={onlyGhost} onClick={() => setOnlyGhost(true)}>Only the rings</button>
              <button className="tab sheet" onClick={() => setRunning((r) => !r)}>{running ? "Freeze" : "Resume"}</button>
            </div>
            <div className="mono absolute bottom-4 left-4 z-10 flex gap-4 text-[10px] uppercase tracking-[0.16em] text-[var(--text-3)]"><span><i className="mr-1 inline-block h-2 w-2 bg-[var(--ink)]" />institution</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />faculty</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[var(--seal)]" />claimed twice or more</span></div>
            <canvas ref={ref} className="h-[560px] w-full" aria-label="Force-directed graph of institutions and shared faculty" />
          </Panel>
        </Reveal>
        <div className="flex flex-col gap-4">
          <Reveal delay={0.2}>
            <Panel strong className="p-5">
              <Kicker>{focus ? (focus.kind === "inst" ? "Institution" : "Person") : "Click a node"}</Kicker>
              {focus ? (
                <div className="mt-2">
                  <div className="text-[15px] font-medium">{focus.label}</div>
                  {focus.kind === "person" ? (
                    <div className="mt-2 text-sm text-[var(--text-2)]">{focus.ghost ? `On ${focus.deg} faculty lists this cycle. ${focus.epfo ? "One EPFO trail found." : "No EPFO trail at any of them."}` : "On one faculty list. EPFO trail and degree registry agree."}</div>
                  ) : (
                    <div className="mt-2 text-sm text-[var(--text-2)]">{focus.ghost ? "Part of a ring. Its application is on hold until the ring resolves." : "No shared faculty."}<div className="mt-2"><Link href={`/review/${instById(focus.id).appId}`} className="btn btn-sm">Open its application</Link></div></div>
                  )}
                </div>
              ) : <p className="mt-2 text-sm text-[var(--text-3)]">Hover to read a label, click to pin it here. Red lines are the ones that matter.</p>}
            </Panel>
          </Reveal>
          <Reveal delay={0.3}>
            <Panel className="p-5">
              <Kicker>Rings found this cycle</Kicker>
              <ul className="mt-3 flex flex-col gap-3">
                {rings.map((r, i) => (
                  <li key={i} className="rounded-2xl border border-[var(--line)] p-3">
                    <div className="text-sm font-medium" style={{ color: "var(--seal)" }}>{r.people.length} people · {r.insts.length} institutions</div>
                    <div className="mt-1 text-xs text-[var(--text-2)]">{r.insts.map((x) => `${x.short} (${x.city})`).join(" · ")}</div>
                    <div className="mt-2 flex flex-wrap gap-1">{r.people.map((p) => <span key={p.id} className="badge badge-bad">{p.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s/, "")}</span>)}</div>
                    <div className="mt-2 flex gap-2">{r.insts.map((x) => <Link key={x.id} href={`/review/${x.appId}`} className="mono text-[10px] text-[var(--accent)] underline-offset-2 hover:underline">{x.appId}</Link>)}</div>
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
          <Reveal delay={0.4}>
            <Panel ink className="p-5"><Kicker className="!text-[rgba(243,239,230,0.55)]">How the match works</Kicker><ul className="mt-2 space-y-1.5 text-sm" style={{ color: "rgba(243,239,230,0.8)" }}><li>PAN and DOB, exact, hashed at rest.</li><li>Name and degree number, fuzzy, for typos.</li><li>Face embedding on the ID photo, threshold 0.9.</li><li>Timeline overlap: both appointments full-time in the same semester.</li><li>EPFO contribution trail decides who really pays them.</li></ul></Panel>
          </Reveal>
        </div>
      </div>
    </main>
  );
}

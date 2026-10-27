"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { SEAL } from "@/components/Logo";
import { EASE } from "@/components/ui";

/**
 * The opening screen. One viewport, no scroll.
 * A drop of ink blooms into a web of points behind the name; the name settles into place,
 * the seal takes its corner, the tagline lands, the door opens. Nothing follows the cursor.
 */
type Phase = "title" | "lines" | "ready" | "leaving";
const ORDER: Phase[] = ["title", "lines", "ready", "leaving"];

export default function Intro() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("title");
  const [mode, setMode] = useState<"loading" | "live" | "still">("loading");
  const canvas = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<Phase>("title");
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  const at = (p: Phase) => ORDER.indexOf(phase) >= ORDER.indexOf(p);
  const leaving = phase === "leaving";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = (reduced ? [["ready", 0]] : [["lines", 1500], ["ready", 3300]]).map(([p, t]) => window.setTimeout(() => setPhase(p as Phase), t as number));
    const cv = canvas.current;
    let scene: import("@/components/InkWeb").InkWeb | null = null;
    let disposed = false;
    let gl = false;
    try { const c = document.createElement("canvas"); gl = Boolean(c.getContext("webgl2") || c.getContext("webgl")); } catch {}
    if (!cv || !gl) { setMode("still"); }
    else {
      (async () => {
        await document.fonts?.ready;
        const mod = await import("@/components/InkWeb");
        if (disposed) return;
        scene = new mod.InkWeb({ canvas: cv, mobile: window.innerWidth < 700 });
        if (reduced) { scene.still(0.5); setMode("still"); return; }
        setMode("live");
        if (!document.hidden) scene.start();
      })().catch(() => setMode("still"));
    }
    const onVis = () => { if (!scene) return; if (document.hidden) scene.stop(); else scene.start(); };
    const onResize = () => scene?.resize();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      disposed = true; timers.forEach(clearTimeout);
      window.removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", onVis);
      scene?.dispose(); document.body.style.overflow = "";
    };
  }, []);

  const enter = useCallback((to: string) => {
    if (phaseRef.current === "leaving") return;
    setPhase("leaving");
    window.setTimeout(() => router.push(to), 750);
  }, [router]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key !== "Enter") return; if (ORDER.indexOf(phaseRef.current) < ORDER.indexOf("ready")) setPhase("ready"); else enter("/review"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enter]);

  return (
    <main id="main" className="relative flex h-dvh w-full items-center justify-center overflow-hidden">
      {/* the ink web, painted behind everything; a quiet poster drop until it loads */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: leaving ? 0 : 1, transition: "opacity 0.7s" }}>
        <div className="absolute inset-0 grid place-items-center transition-opacity duration-1000" style={{ opacity: mode === "live" ? 0 : 1 }}>
          <span className="absolute h-3.5 w-3.5 rounded-full" style={{ background: "var(--ink)", boxShadow: "0 0 18px 6px rgba(28,37,65,0.3), 0 0 70px 24px rgba(28,37,65,0.08)" }} />
          <span className="absolute h-[3px] w-[min(80vw,900px)]" style={{ background: "linear-gradient(90deg, transparent, rgba(28,37,65,0.15) 30%, rgba(28,37,65,0.6) 50%, rgba(28,37,65,0.15) 70%, transparent)", filter: "blur(1px)" }} />
        </div>
        <canvas ref={canvas} className="absolute inset-0 h-full w-full transition-opacity duration-[1400ms]" style={{ opacity: mode === "loading" ? 0 : 1 }} />
      </div>

      <motion.div className="relative z-10 flex -translate-y-[4vh] flex-col items-center px-4 text-center" animate={leaving ? { opacity: 0, scale: 1.04, filter: "blur(10px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.7, ease: EASE }}>
        {/* a soft paper halo keeps the name clean over the moving web */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[150%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(239,232,218,0.95), rgba(239,232,218,0.75) 55%, transparent)" }} />
        <h1 className="relative inline-flex items-start">
          <motion.span
            className="display block leading-[0.9]"
            style={{ fontSize: "clamp(4rem, 17vw, 12.5rem)", fontWeight: 800, color: "var(--ink)" }}
            initial={{ opacity: 0, letterSpacing: "0.22em", filter: "blur(6px)" }}
            animate={{ opacity: 1, letterSpacing: "-0.04em", filter: "blur(0px)" }}
            transition={{ duration: 1.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          >
            MARK
          </motion.span>
          {/* the seal takes the corner once the name has settled */}
          <motion.svg
            aria-hidden viewBox={`${SEAL.cx - SEAL.r - 4} ${SEAL.cy - SEAL.r - 4} ${SEAL.r * 2 + 8} ${SEAL.r * 2 + 8}`}
            className="absolute -right-[0.42em] -top-[0.12em] w-[0.42em]" style={{ fontSize: "clamp(4rem, 17vw, 12.5rem)" }}
            initial={{ opacity: 0, scale: 1.5, rotate: -30 }} animate={{ opacity: 1, scale: 1, rotate: -12 }} transition={{ duration: 0.9, ease: EASE, delay: 1.45 }}
          >
            <circle cx={SEAL.cx} cy={SEAL.cy} r={SEAL.r} fill="var(--paper)" stroke="var(--accent)" strokeWidth={5} />
            <circle cx={SEAL.cx} cy={SEAL.cy} r={SEAL.r - 9} fill="none" stroke="var(--accent)" strokeWidth={2} strokeDasharray="3 4" />
            <path d={`M${SEAL.cx - 11} ${SEAL.cy + 1} l8 8 l15 -16`} fill="none" stroke="var(--accent)" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </h1>
        <motion.p className="mt-5 max-w-[34ch] text-[clamp(1rem,2vw,1.45rem)] font-medium leading-snug text-[var(--text-2)]" initial={{ opacity: 0, y: 14 }} animate={at("lines") ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }} transition={{ duration: 0.9, ease: EASE }}>
          Every page of an approval file, read, proved and explained. <b className="font-semibold text-[var(--ink)]">Before a reviewer opens it.</b>
        </motion.p>
      </motion.div>

      <AnimatePresence>
        {phase === "ready" && (
          <motion.div key="door" className="absolute inset-x-0 bottom-[8vh] z-10 flex flex-col items-center gap-4 px-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.8, ease: EASE }}>
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[260%] w-[min(90vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(239,232,218,0.95), rgba(239,232,218,0.7) 55%, transparent)" }} />
            <button className="btn btn-ink px-7 py-3.5 text-base" onClick={() => enter("/review")}>
              Open the review desk
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button className="btn btn-sm" onClick={() => enter("/precheck")}>Pre-check an institution’s file</button>
              <button className="btn btn-sm" onClick={() => enter("/graph")}>See the faculty graph</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="mono pointer-events-none absolute bottom-5 left-0 right-0 z-10 hidden justify-between px-6 text-[10px] uppercase tracking-[0.25em] text-[var(--text-3)] sm:flex" initial={{ opacity: 0 }} animate={{ opacity: at("ready") && !leaving ? 1 : 0 }} transition={{ duration: 1.2 }}>
        <span>AICTE · Approval Process Handbook 2026-27</span>
        <span>Validation · Authentication · Compliance · Faculty graph</span>
      </motion.div>
    </main>
  );
}

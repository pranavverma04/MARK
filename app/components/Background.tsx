"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * The one environment behind every page: a sheet of warm paper under slow window light.
 * Layer 1 (CSS): paper gradient + a soft light pool that drifts on a 70 s cycle.
 * Layer 2 (canvas): faint ledger rule lines that bend gently around the pointer and ripple
 *          when the app stamps something: window.dispatchEvent(new CustomEvent("mark:pulse", { detail: { color, x, y } })).
 * Reduced motion: lines stay still, no ripples.
 */

type Ripple = { x: number; y: number; t: number; color: string };

export function pulse(color = "#2f45c4", x?: number, y?: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("mark:pulse", { detail: { color, x, y } }));
}

export default function Background() {
  const ref = useRef<HTMLCanvasElement>(null);
  const path = usePathname();
  const home = path === "/";
  const homeRef = useRef(home);
  useEffect(() => { homeRef.current = home; }, [home]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    const ripples: Ripple[] = [];

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const onMove = (e: PointerEvent) => { pointer.tx = e.clientX; pointer.ty = e.clientY; };
    const onLeave = () => { pointer.tx = -9999; pointer.ty = -9999; };
    const onPulse = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      ripples.push({ x: d.x ?? w / 2, y: d.y ?? h / 2, t: 0, color: d.color || "#2f45c4" });
    };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("mark:pulse", onPulse);

    const GAP = 34;
    const STEP = 18;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      ctx.clearRect(0, 0, w, h);
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].t += dt;
        if (ripples[i].t > 2.4) ripples.splice(i, 1);
      }
      const rows = Math.ceil(h / GAP) + 1;
      for (let r = 0; r < rows; r++) {
        const y0 = r * GAP + (GAP / 2);
        ctx.beginPath();
        let alpha = 0.085;
        for (let x = -STEP; x <= w + STEP; x += STEP) {
          let y = y0;
          if (!reduced) {
            const dx = x - pointer.x, dy = y0 - pointer.y;
            const d2 = dx * dx + dy * dy;
            const R = 190;
            if (!homeRef.current && d2 < R * R) {
              const d = Math.sqrt(d2);
              const k = (1 - d / R);
              y += Math.sign(dy || 1) * k * k * 22;
            }
            for (const rp of ripples) {
              const ddx = x - rp.x, ddy = y0 - rp.y;
              const dist = Math.sqrt(ddx * ddx + ddy * ddy);
              const front = rp.t * 420;
              const band = Math.exp(-((dist - front) ** 2) / (2 * 60 * 60));
              const life = 1 - rp.t / 2.4;
              y += Math.sign(ddy || 1) * band * 10 * life;
              alpha = Math.max(alpha, 0.085 + band * life * 0.35);
            }
          }
          if (x === -STEP) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(28,37,65,${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // the ripple ink ring itself
      for (const rp of ripples) {
        const life = 1 - rp.t / 2.4;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.t * 420, 0, Math.PI * 2);
        ctx.strokeStyle = rp.color;
        ctx.globalAlpha = 0.18 * life;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("mark:pulse", onPulse);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #f2ecdf 0%, var(--paper) 45%, #e8e0cf 100%)" }} />
      <div className="light-pool absolute -left-[20%] -top-[30%] h-[120vh] w-[90vw] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(255,250,236,0.95), rgba(255,250,236,0) 70%)", opacity: home ? 0.9 : 0.7 }} />
      <div className="ink-pool absolute -bottom-[30%] -right-[15%] h-[90vh] w-[70vw] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(47,69,196,0.11), rgba(47,69,196,0) 70%)" }} />
      <canvas ref={ref} className="absolute inset-0" />
      <style>{`
        .light-pool { animation: driftA 70s ease-in-out infinite alternate; }
        .ink-pool { animation: driftB 90s ease-in-out infinite alternate; }
        @keyframes driftA { from { transform: translate(0,0) scale(1); } to { transform: translate(8vw, 6vh) scale(1.08); } }
        @keyframes driftB { from { transform: translate(0,0); } to { transform: translate(-6vw, -5vh); } }
      `}</style>
    </div>
  );
}

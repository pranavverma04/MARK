"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import gsap from "gsap";

export const EASE = [0.22, 1, 0.36, 1] as const;

export function Panel({ children, className = "", strong = false, ink = false, style }: { children: ReactNode; className?: string; strong?: boolean; ink?: boolean; style?: React.CSSProperties }) {
  return <div className={`${ink ? "ink-sheet" : strong ? "sheet-strong" : "sheet"} rounded-3xl ${className}`} style={style}>{children}</div>;
}

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`kicker ${className}`}>{children}</div>;
}

/** Mount reveal only. Nothing in MARK animates on scroll. */
export function Reveal({ children, delay = 0, className = "", y = 14 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
}

export function PageHead({ kicker, title, lede, aside }: { kicker: string; title: ReactNode; lede?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <Reveal>
        <Kicker>{kicker}</Kicker>
        <h1 className="display mt-2 text-[clamp(2rem,4.2vw,3.4rem)] font-700 leading-[0.98] tracking-[-0.03em]" style={{ fontWeight: 700 }}>{title}</h1>
        {lede && <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-[var(--text-2)]">{lede}</p>}
      </Reveal>
      {aside && <Reveal delay={0.15}>{aside}</Reveal>}
    </div>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "ok" | "warn" | "bad" | "accent" }) {
  const color = tone === "ok" ? "var(--ok)" : tone === "warn" ? "var(--warn)" : tone === "bad" ? "var(--bad)" : tone === "accent" ? "var(--accent)" : "var(--ink)";
  return (
    <div className="flex flex-col justify-end gap-1">
      <span className="kicker whitespace-nowrap">{label}</span>
      <span className="display text-[2rem] leading-none tracking-[-0.03em]" style={{ color, fontWeight: 700 }}>{value}</span>
      {sub && <span className="text-xs text-[var(--text-3)]">{sub}</span>}
    </div>
  );
}

export function tone(score: number): "ok" | "warn" | "bad" {
  return score >= 80 ? "ok" : score >= 60 ? "warn" : "bad";
}
export function toneColor(t: "ok" | "warn" | "bad") {
  return t === "ok" ? "var(--ok)" : t === "warn" ? "var(--warn)" : "var(--bad)";
}

/** The trust score ring: an ink arc that draws to the score. */
export function ScoreRing({ score, size = 120, stroke = 10, label = "trust", delay = 0.2 }: { score: number; size?: number; stroke?: number; label?: string; delay?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const t = tone(score);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(28,37,65,0.1)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={toneColor(t)} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.4, ease: EASE, delay }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Counter to={score} className="display leading-none" style={{ fontSize: size * 0.3, fontWeight: 700 }} delay={delay} />
        <span className="kicker mt-1" style={{ fontSize: Math.max(8, size * 0.075) }}>{label}</span>
      </div>
    </div>
  );
}

/** A number that counts up on mount (GSAP). */
export function Counter({ to, className = "", style, delay = 0, decimals = 0, prefix = "", suffix = "", duration = 1.3 }: { to: number; className?: string; style?: React.CSSProperties; delay?: number; decimals?: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { v: 0 };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tw = gsap.to(obj, {
      v: to, duration: reduced ? 0 : duration, delay: reduced ? 0 : delay, ease: "power3.out",
      onUpdate: () => { el.textContent = `${prefix}${obj.v.toFixed(decimals)}${suffix}`; },
    });
    return () => { tw.kill(); };
  }, [to, delay, decimals, prefix, suffix, duration]);
  return <span ref={ref} className={className} style={style}>{prefix}0{suffix}</span>;
}

export function Bar({ value, color = "var(--accent)", height = 6, delay = 0 }: { value: number; color?: string; height?: number; delay?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-full" style={{ height, background: "rgba(28,37,65,0.1)" }}>
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, value))}%` }} transition={{ duration: 1, ease: EASE, delay }} />
    </div>
  );
}

export function Stamp({ children, tone = "ok", className = "" }: { children: ReactNode; tone?: "ok" | "warn" | "bad" | "ink" | "accent"; className?: string }) {
  const color = tone === "ok" ? "var(--ok)" : tone === "warn" ? "var(--warn)" : tone === "bad" ? "var(--seal)" : tone === "accent" ? "var(--accent)" : "var(--ink)";
  return (
    <motion.span className={`stamp text-xs ${className}`} style={{ color }} initial={{ scale: 1.6, opacity: 0, rotate: -14 }} animate={{ scale: 1, opacity: 1, rotate: -6 }} transition={{ duration: 0.35, ease: "backOut", delay: 0.3 }}>
      {children}
    </motion.span>
  );
}

export function Severity({ s }: { s: "critical" | "major" | "minor" | "info" }) {
  const cls = s === "critical" ? "badge-bad" : s === "major" ? "badge-warn" : s === "minor" ? "badge-ink" : "badge-accent";
  return <span className={`badge ${cls}`}>{s}</span>;
}

export function Sparkline({ points, color = "var(--accent)", width = 120, height = 32 }: { points: number[]; color?: string; width?: number; height?: number }) {
  const max = Math.max(...points), min = Math.min(...points);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (points.length - 1)) * width} ${height - ((p - min) / (max - min || 1)) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <motion.path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: EASE }} />
    </svg>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-[var(--line-strong)] p-8 text-center text-sm text-[var(--text-3)]">{children}</div>;
}

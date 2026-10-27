"use client";

import { useRef } from "react";
import type { Doc, Institution } from "@/lib/types";

/**
 * A synthetic rendering of the document, drawn as paper, so the reviewer sees the page
 * MARK read. Anomaly boxes sit where the engines found something. Hover shows the
 * forensic layer through a lens; a toggle shows it fully.
 */
export type Layer = "original" | "ela" | "copymove" | "meta";

function Lines({ n, w = [92, 88, 95, 70, 90, 84, 60] }: { n: number; w?: number[] }) {
  return <div className="space-y-2">{Array.from({ length: n }).map((_, i) => <div key={i} className="h-2 rounded-sm bg-[rgba(28,37,65,0.14)]" style={{ width: `${w[i % w.length]}%` }} />)}</div>;
}

export default function DocPaper({ doc, inst, layer, lens = true }: { doc: Doc; inst: Institution; layer: Layer; lens?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const bad = doc.status === "discrepancy";
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current; if (!el || !lens || layer !== "original") return;
    const r = el.getBoundingClientRect();
    const m = `radial-gradient(circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, #000 0, #000 70px, transparent 150px)`;
    el.style.maskImage = m; el.style.webkitMaskImage = m;
  };
  const onLeave = () => { const el = ref.current; if (el) { el.style.maskImage = "radial-gradient(circle at -500px -500px, #000 0, transparent 1px)"; el.style.webkitMaskImage = el.style.maskImage; } };

  const body = (
    <div className="relative px-10 py-9 text-[11px] leading-relaxed text-[var(--ink)]">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="display text-base" style={{ fontWeight: 700 }}>{inst.name}</div>
          <div className="text-[10px] text-[var(--text-3)]">{inst.city}, {inst.state} · AICTE application {doc.id.slice(0, 13)}</div>
        </div>
        <div className="mono text-[9px] uppercase tracking-[0.2em] text-[var(--text-3)]">{doc.type}</div>
      </div>
      {doc.type === "Affidavit" && (
        <>
          <div className="display mb-3 text-center text-sm tracking-[0.2em]" style={{ fontWeight: 700 }}>AFFIDAVIT</div>
          <p className="mb-3">I, the undersigned, Chairman of the Trust running {inst.name}, do hereby solemnly affirm that the information in the application for {doc.id.includes("0417") ? "Extension of Approval" : "approval"} for the academic year 2026-27 is true to the best of my knowledge, that all faculty listed are regular full-time employees on the institution’s payroll, and that the land and building are in the institution’s possession.</p>
          <Lines n={6} />
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div className="relative rounded border border-dashed border-[var(--line-strong)] p-3">
              <div className="mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-3)]">Deponent</div>
              <div className="mt-3 h-6 w-28 rounded-sm bg-[rgba(28,37,65,0.5)]" style={{ clipPath: "polygon(0 60%, 10% 30%, 25% 70%, 40% 20%, 55% 65%, 70% 35%, 85% 60%, 100% 40%, 100% 100%, 0 100%)" }} />
              <div className="mt-1 text-[9px]">Signed 2026-09-13</div>
            </div>
            <div className="relative rounded border border-dashed border-[var(--line-strong)] p-3">
              <div className="mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-3)]">Notary</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-10 w-10 rounded-full border-2 border-[var(--seal)] opacity-70" />
                <div className="text-[9px]">Notary Public, {inst.city}<br />e-Stamp IN-{inst.stateCode}4471…</div>
              </div>
              {bad && <span className="anomaly" style={{ left: 4, top: 26, width: 60, height: 44 }} data-label="copy-move 0.81" />}
            </div>
          </div>
        </>
      )}
      {doc.type === "Faculty List" && (
        <table className="w-full border-collapse text-[10px]">
          <thead><tr className="mono text-[9px] uppercase tracking-[0.12em] text-[var(--text-3)]"><th className="border-b py-1 text-left">#</th><th className="border-b py-1 text-left">Name</th><th className="border-b py-1 text-left">Designation</th><th className="border-b py-1 text-left">PAN</th><th className="border-b py-1 text-left">Joined</th></tr></thead>
          <tbody>
            {["Dr. Anil Kumar Mishra", "Dr. Sunita Verma", "Prof. Deepak Chauhan", "Dr. Kavita Saxena", "Mr. Manoj Tiwari", "Ms. Rekha Dubey", "Dr. R. Nair", "Ms. P. Iyer", "Mr. S. Das", "Dr. M. Joshi", "Ms. A. Gupta", "Mr. V. Rao"].map((n, i) => (
              <tr key={n} className={bad && i < 6 ? "relative bg-[var(--bad-muted)]" : ""}><td className="py-1">{i + 1}</td><td className="py-1">{n}</td><td className="py-1">{i === 0 ? "Professor" : i < 3 ? "Associate Professor" : "Assistant Professor"}</td><td className="mono py-1">{["AJQPM4471K", "BKRPV8812L", "CDSPC1203M", "DFTPS7731N", "EGUPT5520P", "FHVPD3318Q", "GJWPN9901R", "HKXPI2210S", "JLYPD6607T", "KMZPJ4404U", "LNAPG8809V", "MPBPR1102W"][i]}</td><td className="py-1">{i < 6 ? "2025-07-01" : "2022-08-01"}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {doc.type === "CA Certificate" && (
        <>
          <div className="mb-3 border-b pb-2"><div className="display text-sm" style={{ fontWeight: 700 }}>Mehta & Associates</div><div className="text-[9px] text-[var(--text-3)]">Chartered Accountants · FRN 0123456C</div></div>
          <div className="display mb-2 text-xs" style={{ fontWeight: 600 }}>Certificate of Funds</div>
          <p className="mb-3">This is to certify that {inst.name} holds fixed deposits and bank balances totalling an amount adequate for the sanctioned intake as on 2026-09-30, based on records produced before us.</p>
          <Lines n={4} />
          <div className="relative mt-5 inline-block rounded border border-dashed border-[var(--line-strong)] p-3"><div className="mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-3)]">UDIN</div><div className="mono mt-1 text-xs">26041234ABCDE1234</div>{bad && <span className="anomaly" style={{ left: 2, top: 2, width: 150, height: 44 }} data-label="not in ICAI register" />}</div>
        </>
      )}
      {doc.type === "Land Deed" && (
        <>
          <div className="display mb-2 text-center text-sm tracking-[0.2em]" style={{ fontWeight: 700 }}>SALE DEED</div>
          <p className="mb-3">Schedule of property: all that piece of land measuring <b>2.50 acres</b> in Survey Nos. 142/1 and 142/2B, {inst.city} district, bounded on the north by the village road, on the east by the canal, together with structures thereon.</p>
          <div className="relative my-3 h-32 rounded border border-[var(--line-strong)] bg-[rgba(28,37,65,0.04)]">
            <div className="absolute left-3 top-3 h-24 w-[46%] rounded-sm border-2 border-[var(--ink)]" /><div className="absolute left-3 top-3 h-24 w-[46%] rounded-sm" style={{ background: "repeating-linear-gradient(45deg, rgba(28,37,65,0.15) 0 3px, transparent 3px 8px)" }} />
            <div className="absolute right-3 top-3 h-24 w-[46%] rounded-sm border-2 border-dashed border-[var(--seal)]" />
            <span className="mono absolute left-4 top-24 text-[9px]">142/1 · 1.1 ac</span><span className="mono absolute right-4 top-24 text-[9px]" style={{ color: "var(--seal)" }}>142/2B · 1.4 ac</span>
            {bad && <span className="anomaly" style={{ right: 8, top: 8, width: "48%", height: 104 }} data-label="owner changed 2026-03" />}
          </div>
          <Lines n={4} />
        </>
      )}
      {doc.type === "Bank Statement" && (
        <table className="w-full text-[10px]"><thead><tr className="mono text-[9px] uppercase text-[var(--text-3)]"><th className="border-b py-1 text-left">Date</th><th className="border-b py-1 text-left">Narration</th><th className="border-b py-1 text-right">Credit</th><th className="border-b py-1 text-right">Balance</th></tr></thead><tbody>
          {Array.from({ length: 9 }).map((_, i) => <tr key={i} className={bad && i > 5 ? "bg-[var(--bad-muted)]" : ""}><td className="py-1">2026-0{(i % 9) + 1}-1{i}</td><td className="py-1">{i % 2 ? "FEE COLLECTION · SEM" : "FD INTEREST"}</td><td className="py-1 text-right">{(120000 + i * 31000).toLocaleString("en-IN")}</td><td className="py-1 text-right">{(2_400_000 + i * 150000).toLocaleString("en-IN")}</td></tr>)}
        </tbody></table>
      )}
      {doc.type === "Geotagged Photos" && (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden rounded border border-[var(--line)]" style={{ background: `linear-gradient(${120 + i * 17}deg, rgba(28,37,65,${0.12 + (i % 4) * 0.05}), rgba(47,69,196,0.08))` }}>
              <span className="mono absolute bottom-1 left-1 text-[7px] text-[var(--text-2)]">{(17.68 + i * 0.001).toFixed(4)}N {(83.21 + i * 0.001).toFixed(4)}E</span>
              {bad && i % 3 === 1 && <span className="anomaly !inset-0 !h-auto !w-auto" data-label="synthetic 0.74" />}
            </div>
          ))}
        </div>
      )}
      {!["Affidavit", "Faculty List", "CA Certificate", "Land Deed", "Bank Statement", "Geotagged Photos"].includes(doc.type) && (
        <><div className="display mb-3 text-sm" style={{ fontWeight: 600 }}>{doc.type}</div><Lines n={14} /></>
      )}
      <div className="mono mt-8 flex justify-between text-[8px] uppercase tracking-[0.2em] text-[var(--text-3)]"><span>{doc.file}</span><span>page 1 of {doc.pages}</span></div>
    </div>
  );

  const layerStyle: React.CSSProperties =
    layer === "ela" ? { filter: "invert(1) contrast(2.4) hue-rotate(180deg) saturate(2.2)", background: "#0a0f1f" }
    : layer === "copymove" ? { filter: "grayscale(1) contrast(1.4)" }
    : layer === "meta" ? { filter: "sepia(0.4) contrast(0.9)" } : {};

  return (
    <div className="relative mx-auto w-full max-w-[640px] overflow-hidden rounded-md bg-[#fbf8f1] shadow-[0_30px_80px_rgba(28,37,65,0.18)]" style={{ aspectRatio: "1 / 1.3" }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="absolute inset-0 overflow-hidden" style={layerStyle}>{body}</div>
      {layer === "original" && lens && (
        <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ filter: "invert(1) contrast(2.4) hue-rotate(180deg) saturate(2.2)", background: "#0a0f1f", maskImage: "radial-gradient(circle at -500px -500px, #000 0, transparent 1px)", WebkitMaskImage: "radial-gradient(circle at -500px -500px, #000 0, transparent 1px)" }}>{body}</div>
      )}
      {(layer === "ela" || layer === "copymove") && bad && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute rounded-full blur-2xl" style={{ left: "58%", top: "62%", width: 160, height: 110, background: "rgba(255,80,60,0.55)" }} />
          <div className="absolute rounded-full blur-xl" style={{ left: "18%", top: "64%", width: 90, height: 60, background: "rgba(255,80,60,0.35)" }} />
        </div>
      )}
      <style>{`
        .anomaly { position:absolute; border:2px solid var(--seal); border-radius:6px; box-shadow: 0 0 0 4px rgba(178,58,47,0.15); pointer-events:none; }
        .anomaly::after { content: attr(data-label); position:absolute; left:-2px; top:-18px; background: var(--seal); color:#fff; font-family: var(--font-mono); font-size:8px; letter-spacing:0.1em; text-transform:uppercase; padding:2px 6px; border-radius:4px; white-space:nowrap; }
      `}</style>
    </div>
  );
}

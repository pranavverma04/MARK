/**
 * The MARK wordmark: four single-stroke ink letters and the seal that stamps the K.
 * Letter paths live here so the intro can draw them and the nav can show them still.
 * viewBox 0 0 450 130, baseline at 110.
 */
export const LETTERS = [
    { k: "M", d: "M12 110 V12 L52 72 L92 12 V110" },
    { k: "A", d: "M116 110 L156 12 L196 110 M133 72 H179" },
    { k: "R", d: "M220 110 V12 H262 C294 12 294 62 262 62 H220 M256 62 L300 110" },
    { k: "K", d: "M324 110 V12 M324 66 L388 12 M348 48 L396 110" },
];
export const SEAL = { cx: 410, cy: 30, r: 30 };
export const VIEW = "0 0 450 130";
export default function Logo({ className = "", color = "var(--ink)", seal = "var(--accent)", title = "MARK" }) {
    return (<svg viewBox={VIEW} className={className} role="img" aria-label={title}>
      <g fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round">
        {LETTERS.map((l) => <path key={l.k} d={l.d}/>)}
      </g>
      <g transform={`rotate(-12 ${SEAL.cx} ${SEAL.cy})`}>
        <circle cx={SEAL.cx} cy={SEAL.cy} r={SEAL.r} fill="var(--paper)" stroke={seal} strokeWidth={5}/>
        <circle cx={SEAL.cx} cy={SEAL.cy} r={SEAL.r - 9} fill="none" stroke={seal} strokeWidth={2} strokeDasharray="3 4"/>
        <path d={`M${SEAL.cx - 11} ${SEAL.cy + 1} l8 8 l15 -16`} fill="none" stroke={seal} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>);
}

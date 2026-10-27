/* A tamper-evident log: every decision carries the hash of the one before it. The demo
   computes real SHA-256 in the browser so the chain can be verified live on the page. */
export interface AuditEntry { seq: number; at: string; actor: string; action: string; appId?: string; detail: string; prev: string; hash: string }

const RAW: Omit<AuditEntry, "prev" | "hash" | "seq">[] = [
  { at: "2026-10-27T09:02:11Z", actor: "mark.pipeline", action: "APPLICATION_RECEIVED", appId: "APP-2026-0417", detail: "9 documents, 61 pages. Classifier confidence 0.98." },
  { at: "2026-10-27T09:02:19Z", actor: "mark.auth", action: "FORENSIC_FLAG", appId: "APP-2026-0417", detail: "Affidavit D1: copy-move 0.81, ELA 0.84, metadata edit after notary date." },
  { at: "2026-10-27T09:02:23Z", actor: "mark.registry", action: "UDIN_NOT_FOUND", appId: "APP-2026-0417", detail: "ICAI UDIN register returned no record for 26041234ABCDE1234." },
  { at: "2026-10-27T09:02:31Z", actor: "mark.graph", action: "GHOST_RING_DETECTED", appId: "APP-2026-0417", detail: "6 faculty overlap with INST-1038, INST-1039. Face match ≥ 0.91, PAN exact." },
  { at: "2026-10-27T09:02:33Z", actor: "mark.score", action: "TRUST_SCORE", appId: "APP-2026-0417", detail: "Score 41. Faculty 60, Authentication 54, Compliance 87, Validation 93." },
  { at: "2026-10-27T09:41:05Z", actor: "reviewer:R. Venkatesh", action: "OPENED", appId: "APP-2026-0417", detail: "Reviewer opened the file. Session 7c1e." },
  { at: "2026-10-27T09:52:40Z", actor: "reviewer:R. Venkatesh", action: "FLAG_CONFIRMED", appId: "APP-2026-0417", detail: "F1 ghost ring confirmed after viewing graph and EPFO trail." },
  { at: "2026-10-27T09:58:12Z", actor: "reviewer:R. Venkatesh", action: "FLAG_DISMISSED", appId: "APP-2026-0417", detail: "F5 lab count: photos cover 14 of 18 labs, remaining 4 are shared workshops. Not a discrepancy." },
  { at: "2026-10-27T10:03:48Z", actor: "reviewer:R. Venkatesh", action: "REFERRED_TO_EVC", appId: "APP-2026-0417", detail: "Referred to Expert Visit Committee with the graph attached." },
  { at: "2026-10-27T10:11:02Z", actor: "mark.pipeline", action: "APPLICATION_RECEIVED", appId: "APP-2026-0402", detail: "9 documents, 48 pages. Classifier confidence 0.99." },
  { at: "2026-10-27T10:11:21Z", actor: "mark.score", action: "TRUST_SCORE", appId: "APP-2026-0402", detail: "Score 92. All engines ≥ 90. Fast-track." },
  { at: "2026-10-27T10:30:15Z", actor: "reviewer:S. Kaur", action: "RECOMMENDED", appId: "APP-2026-0402", detail: "Signed recommendation. 19 s pipeline, 4 min human time." },
  { at: "2026-10-27T11:05:33Z", actor: "admin:A. Bhattacharya", action: "RULE_UPDATED", detail: "R-13 geotag window promoted from draft to review for 2027-28." },
  { at: "2026-10-27T11:20:09Z", actor: "mark.pipeline", action: "APPLICATION_RECEIVED", appId: "APP-2026-0388", detail: "9 documents, 70 pages. Classifier confidence 0.97." },
  { at: "2026-10-27T11:20:41Z", actor: "mark.geo", action: "LAND_MISMATCH", appId: "APP-2026-0388", detail: "Deed 2.5 acres vs satellite 1.1 acres. Survey 142/2B owner changed 2026-03." },
  { at: "2026-10-27T11:44:57Z", actor: "reviewer:M. Joseph", action: "DEFICIENCY_SENT", appId: "APP-2026-0388", detail: "Deficiency letter generated, 3 items, clauses 4.1, 4.2, Annexure 3." },
];

export async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function buildChain(): Promise<AuditEntry[]> {
  const out: AuditEntry[] = [];
  let prev = "0".repeat(64);
  for (let i = 0; i < RAW.length; i++) {
    const r = RAW[i];
    const hash = await sha256(`${prev}|${r.at}|${r.actor}|${r.action}|${r.appId || ""}|${r.detail}`);
    out.push({ seq: i + 1, ...r, prev, hash });
    prev = hash;
  }
  return out;
}

export async function verifyChain(entries: AuditEntry[]) {
  let prev = "0".repeat(64);
  const results: boolean[] = [];
  for (const e of entries) {
    const h = await sha256(`${prev}|${e.at}|${e.actor}|${e.action}|${e.appId || ""}|${e.detail}`);
    results.push(h === e.hash && e.prev === prev);
    prev = e.hash;
  }
  return results;
}

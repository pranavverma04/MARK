import { NextResponse } from "next/server";
import { appById, instById, facultyOf, sharedFaculty } from "@/lib/data";
import { evaluateAll } from "@/lib/rules";

export const runtime = "nodejs";

function context(appId: string) {
  const app = appById(appId);
  if (!app) return null;
  const inst = instById(app.instId);
  const fac = facultyOf(inst.id).map((f) => ({ name: f.name, designation: f.designation, dept: f.dept, epfo: f.epfo, alsoAt: f.instIds.filter((i) => i !== inst.id).map((i) => instById(i).name) }));
  const rules = evaluateAll(app.claims).map((r) => ({ clause: r.rule.clause, title: r.rule.title, pass: r.pass, actual: r.actual, required: r.required }));
  return { app: { id: app.id, kind: app.kind, status: app.status, score: app.score, breakdown: app.breakdown, summary: app.summary, claims: app.claims, flags: app.flags, docs: app.docs.map((d) => ({ id: d.id, type: d.type, status: d.status, checks: d.checks, forensic: d.forensic })) }, institution: inst, faculty: fac, rules };
}

function scripted(ctx: NonNullable<ReturnType<typeof context>>, q: string) {
  const s = q.toLowerCase();
  const { app, institution, faculty, rules } = ctx;
  if (/faculty|ghost|teacher|professor/.test(s)) {
    const ghosts = faculty.filter((f) => f.alsoAt.length);
    return `Faculty list claims ${app.claims.facultyClaimed}; MARK verified ${app.claims.facultyVerified}.\n${ghosts.length ? `${ghosts.length} people on this list are also claimed elsewhere:\n` + ghosts.map((g) => `• ${g.name} (${g.designation}, ${g.dept}) also at ${g.alsoAt.join(", ")}${g.epfo ? "" : " · no EPFO trail"}`).join("\n") : "No one on this list appears on another institution's list this cycle."}\nSource: Faculty List document, national faculty graph, EPFO contribution lookup.`;
  }
  if (/land|acre|satellite|deed|survey/.test(s)) {
    const r = rules.find((x) => x.clause.includes("4.1(b)"))!;
    return `Deed says ${app.claims.landAcres} acres. Satellite footprint measures ${app.claims.satelliteAcres} acres. ${r.pass ? "Within the 10% tolerance in clause 4.1(b)." : `That is outside the 10% tolerance in clause 4.1(b): ${r.actual}.`}\nSource: Land Deed document, Bhuvan imagery, Bhulekh land record.`;
  }
  if (/affidavit|forens|edit|photoshop|copy/.test(s)) {
    const d = app.docs.find((x) => x.type === "Affidavit");
    return d ? `Affidavit forensics: error-level ${d.forensic.ela.toFixed(2)}, copy-move ${d.forensic.copyMove.toFixed(2)}, ${d.forensic.fontBreaks} font breaks. Metadata: ${d.forensic.metadata}.\n${d.status === "discrepancy" ? "Clause Annexure 3 requires an affidavit untouched after notarisation. This one was changed after the notary date." : "Nothing suggests the affidavit was touched after notarisation."}` : "This application has no affidavit on file.";
  }
  if (/clause|rule|handbook|norm|comply/.test(s)) {
    const fails = rules.filter((r) => !r.pass);
    return fails.length ? `Failing norms:\n` + fails.map((r) => `• ${r.clause} ${r.title}: ${r.actual} (needs ${r.required})`).join("\n") : "Every active handbook norm passes for this file.";
  }
  if (/letter|deficien|draft/.test(s)) {
    const items = app.flags.filter((f) => f.severity !== "minor");
    return `Deficiency letter, plain words:\n\nTo ${institution.name}, ${institution.city}.\nYour ${app.kind} application ${app.id} needs the following before it can move forward:\n` + items.map((f, i) => `${i + 1}. ${f.title}. ${f.clause ? `(${f.clause})` : ""}`).join("\n") + `\nPlease reply within 15 working days through the portal. Each item links to the page MARK flagged.`;
  }
  if (/fast|track|improve|fix|what would/.test(s)) {
    const crit = app.flags.filter((f) => f.severity === "critical");
    return crit.length ? `To reach fast-track (85+) this file would need: ` + crit.map((f) => f.title.toLowerCase()).join("; ") + ` resolved with fresh, verifiable documents. Minor flags alone cost ${app.flags.filter((f) => f.severity === "minor").reduce((a, f) => a + f.points, 0)} points.` : `This file is at ${app.score}. ${app.score >= 85 ? "It already qualifies for fast-track." : "Clearing the major flags would move it above 85."}`;
  }
  if (/score|trust|why/.test(s)) {
    return `Trust score ${app.score}. Validation ${Math.round(app.breakdown.validation)}, Authentication ${Math.round(app.breakdown.authentication)}, Compliance ${Math.round(app.breakdown.compliance)}, Faculty ${Math.round(app.breakdown.faculty)}.\n${app.summary}`;
  }
  return `${app.summary}\n\nI can tell you about faculty, land, the affidavit, handbook clauses, the score, or draft the deficiency letter.`;
}

function extraHeaders(): Record<string, string> {
  try { return JSON.parse(process.env.LLM_API_HEADERS || "{}"); } catch { return {}; }
}

export async function POST(req: Request) {
  const { appId, messages } = (await req.json()) as { appId: string; messages: { role: "user" | "assistant"; content: string }[] };
  const ctx = context(appId);
  if (!ctx) return NextResponse.json({ reply: "Unknown application.", mode: "scripted" }, { status: 404 });
  const last = messages[messages.length - 1]?.content || "";
  const key = process.env.LLM_API_KEY;
  const url = process.env.LLM_API_URL;
  const model = process.env.LLM_MODEL;
  if (key && url && model) {
    try {
      const system = `You are MARK's reviewer copilot for AICTE application review. Answer only from the application context below. Be concrete, cite the document, registry or handbook clause for every claim. Never use the word "fraud"; say discrepancy, unverified, or needs verification. Keep answers under 160 words unless drafting a letter.\n\nCONTEXT:\n${JSON.stringify(ctx)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key, authorization: `Bearer ${key}`, ...extraHeaders() },
        body: JSON.stringify({ model, max_tokens: 700, system, messages: messages.map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const r = (await res.json()) as { content?: { type: string; text?: string }[]; choices?: { message?: { content?: string } }[] };
      const text = r.content ? r.content.filter((b) => b.type === "text").map((b) => b.text || "").join("\n") : r.choices?.[0]?.message?.content || "";
      if (!text) throw new Error("empty");
      return NextResponse.json({ reply: text, mode: "llm" });
    } catch {
      return NextResponse.json({ reply: scripted(ctx, last), mode: "scripted" });
    }
  }
  return NextResponse.json({ reply: scripted(ctx, last), mode: "scripted" });
}

import type { Application, Check, Claims, Doc, DocType, Engine, Faculty, Flag, Institution, Severity } from "./types";

/* Deterministic seed so server and client render the same world. */
function mulberry(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry(26261);
const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)];
const between = (a: number, b: number) => a + rnd() * (b - a);
const pad = (n: number, w = 4) => String(n).padStart(w, "0");

export const STATES: { code: string; name: string; col: number; row: number }[] = [
  { code: "JK", name: "Jammu & Kashmir", col: 2, row: 0 }, { code: "LA", name: "Ladakh", col: 3, row: 0 },
  { code: "HP", name: "Himachal Pradesh", col: 3, row: 1 }, { code: "PB", name: "Punjab", col: 2, row: 1 },
  { code: "UK", name: "Uttarakhand", col: 4, row: 2 }, { code: "HR", name: "Haryana", col: 2, row: 2 }, { code: "DL", name: "Delhi", col: 3, row: 2 },
  { code: "RJ", name: "Rajasthan", col: 1, row: 3 }, { code: "UP", name: "Uttar Pradesh", col: 3, row: 3 }, { code: "BR", name: "Bihar", col: 5, row: 3 }, { code: "SK", name: "Sikkim", col: 6, row: 3 }, { code: "AR", name: "Arunachal Pradesh", col: 8, row: 3 },
  { code: "GJ", name: "Gujarat", col: 0, row: 4 }, { code: "MP", name: "Madhya Pradesh", col: 2, row: 4 }, { code: "JH", name: "Jharkhand", col: 4, row: 4 }, { code: "WB", name: "West Bengal", col: 5, row: 4 }, { code: "AS", name: "Assam", col: 7, row: 4 }, { code: "NL", name: "Nagaland", col: 8, row: 4 },
  { code: "MH", name: "Maharashtra", col: 1, row: 5 }, { code: "CG", name: "Chhattisgarh", col: 3, row: 5 }, { code: "OD", name: "Odisha", col: 4, row: 5 }, { code: "ML", name: "Meghalaya", col: 7, row: 5 }, { code: "MN", name: "Manipur", col: 8, row: 5 },
  { code: "GA", name: "Goa", col: 1, row: 6 }, { code: "KA", name: "Karnataka", col: 2, row: 6 }, { code: "TS", name: "Telangana", col: 3, row: 6 }, { code: "AP", name: "Andhra Pradesh", col: 4, row: 6 }, { code: "TR", name: "Tripura", col: 7, row: 6 }, { code: "MZ", name: "Mizoram", col: 8, row: 6 },
  { code: "KL", name: "Kerala", col: 2, row: 7 }, { code: "TN", name: "Tamil Nadu", col: 3, row: 7 }, { code: "PY", name: "Puducherry", col: 4, row: 7 },
];
const CITIES: Record<string, string[]> = {
  MP: ["Indore", "Bhopal", "Ujjain", "Gwalior", "Jabalpur"], AP: ["Visakhapatnam", "Vijayawada", "Tirupati", "Guntur"], BR: ["Patna", "Gaya", "Muzaffarpur"],
  TN: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"], MH: ["Pune", "Nagpur", "Nashik", "Aurangabad"], UP: ["Lucknow", "Kanpur", "Noida", "Varanasi"],
  KA: ["Bengaluru", "Mysuru", "Hubballi"], TS: ["Hyderabad", "Warangal"], GJ: ["Ahmedabad", "Surat", "Rajkot"], RJ: ["Jaipur", "Kota", "Jodhpur"],
  WB: ["Kolkata", "Durgapur", "Siliguri"], OD: ["Bhubaneswar", "Rourkela"], KL: ["Kochi", "Thiruvananthapuram"], HR: ["Gurugram", "Rohtak"], PB: ["Ludhiana", "Mohali"],
  DL: ["New Delhi"], JH: ["Ranchi", "Dhanbad"], CG: ["Raipur", "Bhilai"], UK: ["Dehradun", "Haldwani"], HP: ["Solan", "Hamirpur"], AS: ["Guwahati"], GA: ["Panaji"], JK: ["Jammu"],
};
const NAME_A = ["Shree", "Sri", "Rajiv", "Nalanda", "Coastal", "Maharaja", "Sardar", "Bharati", "Vidya", "Lakshmi", "Saraswati", "Guru Nanak", "Indira", "Sunrise", "Global", "Royal", "Mahatma", "Krishna", "Annapurna", "Parvati", "Vivekananda", "Chandragupta", "Heritage", "Jyoti"];
const NAME_B: Record<Institution["type"], string[]> = {
  Engineering: ["Institute of Technology", "College of Engineering", "Institute of Engineering & Technology", "School of Engineering"],
  Pharmacy: ["College of Pharmacy", "Institute of Pharmaceutical Sciences"],
  Management: ["School of Management", "Institute of Management Studies", "Business School"],
  Polytechnic: ["Polytechnic", "Institute of Technology (Diploma)"],
  Architecture: ["School of Architecture", "College of Architecture & Planning"],
};
const FIRST = ["Anil", "Sunita", "Rakesh", "Priya", "Deepak", "Kavita", "Manoj", "Rekha", "Suresh", "Neha", "Vikram", "Pooja", "Arun", "Meena", "Sanjay", "Asha", "Rahul", "Geeta", "Vinod", "Shalini", "Prakash", "Nisha", "Ramesh", "Divya", "Ajay", "Swati", "Mohit", "Ritu", "Naveen", "Anjali", "Harish", "Seema", "Gopal", "Lata", "Kiran", "Bhavna"];
const LAST = ["Sharma", "Verma", "Mishra", "Gupta", "Reddy", "Nair", "Patel", "Iyer", "Singh", "Das", "Kulkarni", "Joshi", "Rao", "Chauhan", "Mehta", "Pillai", "Banerjee", "Yadav", "Tiwari", "Dubey", "Khan", "Menon", "Saxena", "Agarwal"];
const DEPTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "Pharmaceutics", "Pharmacology", "Management", "Mathematics", "Physics", "Chemistry", "Humanities"];
const DEGREES = ["Ph.D.", "M.Tech", "M.E.", "M.Pharm", "MBA", "M.Sc."];
const DESIG = ["Professor", "Associate Professor", "Assistant Professor", "Assistant Professor", "Assistant Professor"];
const REVIEWERS = ["R. Venkatesh", "S. Kaur", "A. Bhattacharya", "M. Joseph", "P. Desai"];

function panFor(i: number) { const L = "ABCDEFGHJKLMNPQRSTUVWXYZ"; return `${L[i % 24]}${L[(i * 7) % 24]}${L[(i * 3) % 24]}P${L[(i * 11) % 24]}${pad((i * 937) % 10000)}${L[(i * 5) % 24]}`; }
function dob(i: number) { return `${1962 + (i % 32)}-${pad(1 + (i % 12), 2)}-${pad(1 + ((i * 7) % 28), 2)}`; }
function date(dayOffset: number) { const d = new Date(2026, 9, 27 - dayOffset); return d.toISOString().slice(0, 10); }

const DOC_SETS: Record<Application["kind"], DocType[]> = {
  "Extension of Approval": ["Affidavit", "Faculty List", "CA Certificate", "Bank Statement", "Lab Inventory", "Library Register", "Fee Receipt", "Geotagged Photos", "University NOC"],
  "New Institution": ["Trust Deed", "Land Deed", "Building Plan", "Affidavit", "Faculty List", "CA Certificate", "Bank Statement", "Geotagged Photos", "University NOC"],
  "Increase in Intake": ["Affidavit", "Faculty List", "Building Plan", "Lab Inventory", "Library Register", "CA Certificate", "Geotagged Photos"],
  "Closure of Course": ["Affidavit", "University NOC", "Faculty List", "Fee Receipt"],
};
const DOC_SOURCES: Record<DocType, string[]> = {
  Affidavit: ["Notary register (e-Stamp)", "Forensics", "Cross-document"],
  "Land Deed": ["State land records (Bhulekh)", "Bhuvan satellite", "Forensics"],
  "Building Plan": ["Municipal sanction", "Cross-document", "Forensics"],
  "Faculty List": ["National faculty graph", "EPFO", "Degree registry (NAD)"],
  "CA Certificate": ["ICAI UDIN", "Forensics", "Cross-document"],
  "Fee Receipt": ["Fee Regulatory Committee", "Cross-document"],
  "University NOC": ["University register", "Digital signature"],
  "Bank Statement": ["Bank API (consent)", "Forensics", "Cross-document"],
  "Lab Inventory": ["Geotagged Photos", "Cross-document"],
  "Library Register": ["Cross-document", "Forensics"],
  "Geotagged Photos": ["EXIF / GPS", "AI-image detector", "Liveness"],
  "Trust Deed": ["MCA / Registrar of Societies", "Digital signature"],
};

function makeDoc(appId: string, i: number, type: DocType, bad: Partial<Record<string, string>> = {}): Doc {
  const badKeys = Object.keys(bad);
  const checks: Check[] = DOC_SOURCES[type].map((src, j) => {
    const fail = badKeys.includes(src);
    const review = !fail && rnd() < 0.08;
    return {
      id: `${appId}-D${i}-C${j}`, label: src,
      status: fail ? "fail" : review ? "review" : "pass",
      detail: fail ? bad[src]! : review ? "Source responded slowly. Re-check queued." : "Matches the registry record.",
      source: src,
    } as Check;
  });
  const status: Doc["status"] = checks.some((c) => c.status === "fail") ? "discrepancy" : checks.some((c) => c.status === "review") ? "review" : "verified";
  const ela = status === "discrepancy" && (type === "Affidavit" || type === "CA Certificate" || type === "Bank Statement") ? between(0.62, 0.9) : between(0.03, 0.18);
  return {
    id: `${appId}-D${i}`, type, file: `${type.toLowerCase().replace(/[^a-z]+/g, "-")}-${appId.slice(-4)}.pdf`,
    pages: type === "Faculty List" ? 12 : type === "Geotagged Photos" ? 24 : 2 + Math.floor(rnd() * 6),
    uploadedAt: date(Math.floor(rnd() * 20) + 3), status, checks,
    fields: {},
    forensic: { ela, copyMove: status === "discrepancy" && type === "Affidavit" ? 0.81 : between(0, 0.12), fontBreaks: status === "discrepancy" && type !== "Geotagged Photos" ? 2 + Math.floor(rnd() * 4) : 0, metadata: status === "discrepancy" ? "Producer: Photoshop 25.3 · Modified 6 days after signing" : "Producer: Scanner · Created once, never modified", aiGenerated: type === "Geotagged Photos" && status === "discrepancy" ? 0.74 : between(0.01, 0.09) },
  };
}

const ENGINE_WEIGHT: Record<Engine, number> = { validation: 1, authentication: 1.25, compliance: 1.1, faculty: 1.3 };
export function scoreFrom(flags: Flag[]) {
  const breakdown: Record<Engine, number> = { validation: 100, authentication: 100, compliance: 100, faculty: 100 };
  let total = 0;
  for (const f of flags) {
    breakdown[f.engine] = Math.max(0, breakdown[f.engine] - f.points * 2.2);
    total += f.points * ENGINE_WEIGHT[f.engine];
  }
  const score = Math.max(4, Math.min(99, Math.round(100 - total)));
  return { score, breakdown };
}

/* ---------- Faculty pool + ghost rings ---------- */
export const faculty: Faculty[] = [];
let fi = 0;
function addFaculty(instId: string, opts: Partial<Faculty> = {}): Faculty {
  const i = fi++;
  const f: Faculty = {
    id: `F${pad(i)}`, name: `${pick(["Dr.", "Dr.", "Prof.", "Mr.", "Ms."])} ${pick(FIRST)} ${pick(LAST)}`, pan: panFor(i), dob: dob(i),
    degree: pick(DEGREES), designation: pick(DESIG), dept: pick(DEPTS), instIds: [instId], epfo: rnd() > 0.06, photo: i, joined: date(Math.floor(between(200, 2400))), ...opts,
  };
  faculty.push(f);
  return f;
}

/* ---------- Institutions + applications ---------- */
export const institutions: Institution[] = [];
export const applications: Application[] = [];

type Scenario = { name?: string; city?: string; state?: string; type?: Institution["type"]; kind?: Application["kind"]; flags?: Flag[]; bad?: Partial<Record<DocType, Partial<Record<string, string>>>>; claims?: Partial<Claims>; status?: Application["status"]; summary?: string; ghost?: Faculty[] };

function makeInstitution(n: number, s: Scenario = {}) {
  const st = s.state ? STATES.find((x) => x.code === s.state)! : pick(STATES.filter((x) => CITIES[x.code]));
  const city = s.city || pick(CITIES[st.code] || ["District HQ"]);
  const type = s.type || pick(["Engineering", "Engineering", "Pharmacy", "Management", "Polytechnic", "Architecture"] as const);
  const name = s.name || `${pick(NAME_A)} ${pick(NAME_B[type])}`;
  const id = `INST-${pad(1000 + n)}`;
  const appId = `APP-2026-${pad(380 + n)}`;
  const kind = s.kind || pick(["Extension of Approval", "Extension of Approval", "Extension of Approval", "New Institution", "Increase in Intake", "Closure of Course"] as const);
  const intake = type === "Engineering" ? pick([180, 240, 300, 420, 540]) : type === "Pharmacy" ? pick([60, 100]) : type === "Management" ? pick([60, 120, 180]) : pick([120, 180, 240]);
  const facultyClaimed = Math.round(intake / 20) * 4 + Math.floor(rnd() * 6);
  const docs = DOC_SETS[kind].map((t, i) => makeDoc(appId, i + 1, t, s.bad?.[t] || {}));
  const flags: Flag[] = [...(s.flags || [])];
  // a few random minor flags on ordinary files
  if (!s.flags) {
    const r = rnd();
    if (r < 0.35) flags.push({ id: `${appId}-F1`, severity: "minor", engine: "validation", title: "Library register upload is 3 months old", evidence: "Register dated 2026-07-14; cycle requires a register dated within 60 days of submission.", points: 3, docId: docs.find((d) => d.type === "Library Register")?.id });
    if (r > 0.3 && r < 0.6) flags.push({ id: `${appId}-F2`, severity: "minor", engine: "compliance", title: "Classroom count is at the lower bound", evidence: "11 classrooms declared for 420 intake. Handbook asks for 1 per 60 students with a minimum spare.", clause: "APH 2026-27 · Ch. 4 · 4.3", points: 2 });
    if (r > 0.75) flags.push({ id: `${appId}-F3`, severity: "major", engine: "authentication", title: "Bank statement footer font differs on page 3", evidence: "Pages 1-2 render in the bank's Arial profile; page 3 is Helvetica Neue with different kerning. Sent to the bank consent API for a fresh copy.", points: 7, docId: docs.find((d) => d.type === "Bank Statement")?.id });
    if (r > 0.9) flags.push({ id: `${appId}-F4`, severity: "major", engine: "faculty", title: "2 faculty with no EPFO trail", evidence: "No contribution record in the last 6 months for two Assistant Professors on the list.", points: 6 });
    if (r > 0.95) flags.push({ id: `${appId}-F5`, severity: "critical", engine: "authentication", title: "University NOC digital signature does not validate", evidence: "The PDF carries a signature whose certificate chain ends at an unknown issuer; the university register has no NOC on this date.", clause: "APH 2026-27 · Ch. 2 · 2.4", points: 20, docId: docs.find((d) => d.type === "University NOC")?.id });
  }
  const { score, breakdown } = scoreFrom(flags);
  const claims: Claims = {
    landAcres: type === "Engineering" ? 2.5 + Math.round(rnd() * 8) / 2 : 1 + Math.round(rnd() * 4) / 2, builtUpSqm: Math.round(intake * between(7.5, 12)), intake,
    facultyClaimed, facultyVerified: facultyClaimed - (flags.find((f) => f.engine === "faculty") ? Math.max(2, Math.round(facultyClaimed * 0.3)) : 0),
    labs: Math.round(between(8, 24)), labsRequired: Math.round(intake / 30), libraryVolumes: Math.round(intake * between(9, 15)), bankBalanceLakh: Math.round(between(40, 320)),
    classrooms: Math.round(intake / 60) + Math.floor(rnd() * 3), satelliteAcres: 0, feeCollectedLakh: Math.round(intake * between(0.9, 1.4)), feeApprovedLakh: Math.round(intake * 1.25),
    ...s.claims,
  };
  if (!s.claims?.satelliteAcres) claims.satelliteAcres = Math.round(claims.landAcres * between(0.96, 1.05) * 100) / 100;
  const status: Application["status"] = s.status || (score >= 85 ? pick(["recommended", "in review", "queued"]) : score >= 60 ? pick(["in review", "queued", "deficiency sent"]) : pick(["in review", "deficiency sent", "referred to EVC"]));
  const inst: Institution = { id, name, short: name.split(" ").slice(0, 3).join(" "), state: st.name, stateCode: st.code, city, type, established: 1985 + Math.floor(rnd() * 36), intake, appId, trust: score, naac: rnd() > 0.5 ? pick(["A", "A+", "B++", "B+", "B"]) : undefined, nba: rnd() > 0.6 };
  const app: Application = {
    id: appId, instId: id, kind, cycle: "2026-27", submittedAt: date(Math.floor(rnd() * 30) + 1), status, score, breakdown, flags, docs, claims, reviewer: pick(REVIEWERS),
    summary: s.summary || (score >= 85 ? "Clean file. Every document matched its source and every norm passed. Fast-track candidate." : score >= 60 ? "Mostly consistent. A few items need a second look before recommendation." : "Several discrepancies across engines. Hold for senior review."),
    pipelineMs: Math.round(between(14000, 31000)),
  };
  institutions.push(inst); applications.push(app);
  // faculty for this institution
  const count = Math.min(facultyClaimed, 10 + Math.floor(rnd() * 8));
  for (let k = 0; k < count; k++) addFaculty(id);
  if (s.ghost) for (const g of s.ghost) if (!g.instIds.includes(id)) g.instIds.push(id);
  return { inst, app };
}

/* Hero case 1: ghost faculty ring across three MP colleges + edited affidavit + UDIN miss. */
const ringA = Array.from({ length: 6 }, (_, k) => addFaculty("INST-1000", { name: ["Dr. Anil Kumar Mishra", "Dr. Sunita Verma", "Prof. Deepak Chauhan", "Dr. Kavita Saxena", "Mr. Manoj Tiwari", "Ms. Rekha Dubey"][k], degree: k < 4 ? "Ph.D." : "M.Tech", designation: k === 0 ? "Professor" : k < 3 ? "Associate Professor" : "Assistant Professor", dept: ["Computer Science", "Electronics", "Mechanical", "Mathematics", "Civil", "Humanities"][k], epfo: false }));
makeInstitution(37, {
  name: "Shree Vallabh Institute of Technology", city: "Indore", state: "MP", type: "Engineering", kind: "Extension of Approval", status: "in review",
  bad: {
    Affidavit: { Forensics: "Copy-move region detected on the signature block (81% match with page 1 seal). Metadata shows Photoshop edit 6 days after notarisation.", "Notary register (e-Stamp)": "e-Stamp serial IN-MP4471… resolves to a different deponent name." },
    "CA Certificate": { "ICAI UDIN": "UDIN 26041234ABCDE1234 not found in the ICAI register. Format valid, record absent." },
    "Faculty List": { "National faculty graph": "6 of 22 listed faculty are also claimed full-time by two other institutions this cycle.", EPFO: "No EPFO contribution for the same 6 in the last 8 months." },
  },
  flags: [
    { id: "APP-2026-0417-F1", severity: "critical", engine: "faculty", title: "6 faculty claimed full-time at 3 institutions in the same semester", evidence: "Same PAN, DOB and face embedding appear on faculty lists of Shree Vallabh (Indore), Maharaja Institute (Bhopal) and Vidya Polytechnic (Ujjain). Timeline overlap: Jul 2025 to Jun 2026.", points: 18 },
    { id: "APP-2026-0417-F2", severity: "critical", engine: "authentication", title: "Affidavit signature block is a copy-move edit", evidence: "Error-level analysis 0.84; the notary seal on page 2 is a pixel-level clone of page 1. Producer metadata: Photoshop 25.3, modified 2026-09-19, six days after the notary date.", clause: "APH 2026-27 · Ch. 2 · Annexure 3", points: 14, docId: "APP-2026-0417-D1" },
    { id: "APP-2026-0417-F3", severity: "major", engine: "authentication", title: "CA certificate UDIN not in the ICAI register", evidence: "UDIN has a valid 18-character format but no record on verification. Could be a typo; sent back to the institution with one-click.", clause: "APH 2026-27 · Ch. 2 · 2.4.3", points: 7, docId: "APP-2026-0417-D3" },
    { id: "APP-2026-0417-F4", severity: "major", engine: "compliance", title: "Faculty : student ratio falls to 1:31 after removing unverified faculty", evidence: "22 claimed, 16 verified, 540 intake. Handbook asks for 1:20.", clause: "APH 2026-27 · Ch. 4 · 4.5", points: 6 },
    { id: "APP-2026-0417-F5", severity: "minor", engine: "validation", title: "Lab inventory total differs from geotagged photo count", evidence: "Inventory lists 18 labs; 14 distinct lab rooms appear in geotagged photos.", points: 3, docId: "APP-2026-0417-D5" },
  ],
  claims: { intake: 540, facultyClaimed: 22, facultyVerified: 16, labs: 18, labsRequired: 18, landAcres: 5, satelliteAcres: 5.1, builtUpSqm: 5300 },
  summary: "The faculty list is the problem. Six people on it are full-time elsewhere this cycle, the affidavit backing the list has been edited after notarisation, and the CA certificate cannot be verified. Hold and refer to the Expert Visit Committee.",
  ghost: ringA,
});
makeInstitution(38, { name: "Maharaja Institute of Engineering & Technology", city: "Bhopal", state: "MP", type: "Engineering", kind: "Extension of Approval", status: "in review", ghost: ringA,
  flags: [{ id: "APP-2026-0418-F1", severity: "critical", engine: "faculty", title: "Shares 6 faculty with two other institutions", evidence: "Part of the Indore-Bhopal-Ujjain ring found by the national graph.", points: 22 }], claims: { intake: 420, facultyClaimed: 19, facultyVerified: 13 },
  summary: "Clean documents, but the faculty list overlaps a ring found on another application. Hold until the ring is resolved." });
makeInstitution(39, { name: "Vidya Polytechnic", city: "Ujjain", state: "MP", type: "Polytechnic", kind: "Extension of Approval", status: "queued", ghost: ringA.slice(0, 4),
  flags: [{ id: "APP-2026-0419-F1", severity: "major", engine: "faculty", title: "Shares 4 faculty with two engineering colleges", evidence: "Part of the Indore-Bhopal-Ujjain ring found by the national graph.", points: 14 }], claims: { intake: 180, facultyClaimed: 12, facultyVerified: 8 } });

/* Hero case 2: land that is smaller than the deed says. */
makeInstitution(8, {
  name: "Coastal College of Pharmacy", city: "Visakhapatnam", state: "AP", type: "Pharmacy", kind: "New Institution", status: "deficiency sent",
  bad: {
    "Land Deed": { "Bhuvan satellite": "Deed polygon covers 2.5 acres; the fenced built footprint on current imagery is 1.1 acres. The remaining area is a neighbouring plot under a different survey number.", "State land records (Bhulekh)": "Survey no. 142/2B is registered to a different owner since March 2026." },
    "Geotagged Photos": { "AI-image detector": "7 of 24 photos score above 0.7 on the synthetic-image detector; the laboratory benches repeat with identical shadows.", "EXIF / GPS": "GPS of lab photos resolves 3.4 km from the declared site." },
  },
  flags: [
    { id: "APP-2026-0388-F1", severity: "critical", engine: "authentication", title: "Land on the deed is 2.3x the land on the ground", evidence: "Deed claims 2.5 acres across survey nos. 142/1 and 142/2B. Satellite footprint of the fenced campus is 1.1 acres. 142/2B changed hands in March 2026.", clause: "APH 2026-27 · Ch. 4 · 4.1", points: 20, docId: "APP-2026-0388-D2" },
    { id: "APP-2026-0388-F2", severity: "major", engine: "authentication", title: "7 geotagged lab photos look synthetic and were taken 3.4 km away", evidence: "Synthetic-image score 0.74 on 7 photos; EXIF GPS clusters at a different pharmacy college.", points: 12, docId: "APP-2026-0388-D8" },
    { id: "APP-2026-0388-F3", severity: "major", engine: "compliance", title: "Built-up area below the norm for 100 intake", evidence: "1,140 sqm declared against 1,500 sqm required for a pharmacy institution with 100 intake.", clause: "APH 2026-27 · Ch. 4 · 4.2", points: 8 },
  ],
  claims: { landAcres: 2.5, satelliteAcres: 1.1, builtUpSqm: 1140, intake: 100, facultyClaimed: 14, facultyVerified: 14, labs: 6, labsRequired: 8 },
  summary: "The land does not exist as claimed. The deed covers a plot that was sold in March, and the campus on the ground is less than half the size. Photos of labs were taken elsewhere. Deficiency letter sent.",
});

/* Hero case 3: a clean file, so judges see what fast-track looks like. */
makeInstitution(22, { name: "Nalanda School of Management", city: "Patna", state: "BR", type: "Management", kind: "Extension of Approval", status: "recommended", flags: [], claims: { intake: 120, facultyClaimed: 12, facultyVerified: 12, labs: 4, labsRequired: 2 },
  summary: "Every document matched its source on the first pass. Faculty verified through EPFO and the degree registry. Norms pass with margin. Recommended in 19 seconds; a reviewer only needs to sign." });

/* A Tamil Nadu pair sharing two faculty, so the graph shows a second, smaller ring. */
const ringB = [addFaculty("INST-1012", { name: "Dr. Priya Raghavan", epfo: true }), addFaculty("INST-1012", { name: "Mr. Arun Selvam", epfo: false })];
makeInstitution(12, { city: "Coimbatore", state: "TN", type: "Engineering", ghost: ringB, flags: [{ id: "APP-2026-0392-F1", severity: "major", engine: "faculty", title: "2 faculty also listed in Madurai", evidence: "Same PAN on both lists; one has an EPFO trail at Madurai only.", points: 9 }] });
makeInstitution(13, { city: "Madurai", state: "TN", type: "Engineering", ghost: ringB, flags: [{ id: "APP-2026-0393-F1", severity: "major", engine: "faculty", title: "2 faculty also listed in Coimbatore", evidence: "Same PAN on both lists.", points: 9 }] });

for (let n = 0; n < 48; n++) if (![37, 38, 39, 8, 22, 12, 13].includes(n)) makeInstitution(n);
applications.sort((a, b) => a.score - b.score);

export const heroAppId = "APP-2026-0417";
export const instById = (id: string) => institutions.find((i) => i.id === id)!;
export const appById = (id: string) => applications.find((a) => a.id === id);
export const appsOfState = (code: string) => institutions.filter((i) => i.stateCode === code).map((i) => appById(i.appId)!);
export const facultyOf = (instId: string) => faculty.filter((f) => f.instIds.includes(instId));
export const sharedFaculty = faculty.filter((f) => f.instIds.length > 1);

export const SEVERITY_ORDER: Severity[] = ["critical", "major", "minor", "info"];
export const ENGINE_LABEL: Record<Engine, string> = { validation: "Validation", authentication: "Authentication", compliance: "Compliance", faculty: "Faculty graph" };
export const ENGINE_BLURB: Record<Engine, string> = {
  validation: "Is the file complete and consistent with itself?",
  authentication: "Is each document real? Forensics, registries, satellite.",
  compliance: "Does it meet the Approval Process Handbook?",
  faculty: "Is every faculty member real, present and only here?",
};

export const nationalStats = (() => {
  const total = applications.length;
  const avg = Math.round(applications.reduce((s, a) => s + a.score, 0) / total);
  const fast = applications.filter((a) => a.score >= 85).length;
  const hold = applications.filter((a) => a.score < 60).length;
  const ghosts = sharedFaculty.length;
  const flags = applications.reduce((s, a) => s + a.flags.length, 0);
  const critical = applications.reduce((s, a) => s + a.flags.filter((f) => f.severity === "critical").length, 0);
  return { total, avg, fast, hold, ghosts, flags, critical };
})();

export type Severity = "critical" | "major" | "minor" | "info";
export type Engine = "validation" | "authentication" | "compliance" | "faculty";
export type DocType =
  | "Affidavit" | "Land Deed" | "Building Plan" | "Faculty List" | "CA Certificate" | "Fee Receipt"
  | "University NOC" | "Bank Statement" | "Lab Inventory" | "Library Register" | "Geotagged Photos" | "Trust Deed";
export type CheckStatus = "pass" | "fail" | "review";

export interface Check { id: string; label: string; status: CheckStatus; detail: string; source: string }
export interface Doc {
  id: string; type: DocType; file: string; pages: number; uploadedAt: string;
  status: "verified" | "discrepancy" | "review";
  checks: Check[];
  fields: Record<string, string>;
  forensic: { ela: number; copyMove: number; fontBreaks: number; metadata: string; aiGenerated: number };
}
export interface Flag { id: string; severity: Severity; engine: Engine; title: string; evidence: string; clause?: string; docId?: string; points: number }
export interface Faculty {
  id: string; name: string; pan: string; dob: string; degree: string; designation: string; dept: string;
  instIds: string[]; epfo: boolean; photo: number; joined: string;
}
export interface Claims {
  landAcres: number; builtUpSqm: number; intake: number; facultyClaimed: number; facultyVerified: number;
  labs: number; labsRequired: number; libraryVolumes: number; bankBalanceLakh: number; classrooms: number;
  satelliteAcres: number; feeCollectedLakh: number; feeApprovedLakh: number;
}
export type AppStatus = "queued" | "in review" | "deficiency sent" | "recommended" | "referred to EVC";
export interface Application {
  id: string; instId: string; kind: "Extension of Approval" | "New Institution" | "Increase in Intake" | "Closure of Course";
  cycle: string; submittedAt: string; status: AppStatus; score: number; breakdown: Record<Engine, number>;
  flags: Flag[]; docs: Doc[]; claims: Claims; reviewer: string; summary: string; pipelineMs: number;
}
export interface Institution {
  id: string; name: string; short: string; state: string; stateCode: string; city: string;
  type: "Engineering" | "Pharmacy" | "Management" | "Polytechnic" | "Architecture";
  established: number; intake: number; appId: string; trust: number; naac?: string; nba: boolean;
}
export interface Rule {
  id: string; clause: string; title: string; norm: string; category: "Land" | "Building" | "Faculty" | "Labs" | "Library" | "Finance" | "Fees" | "Documents";
  version: string; status: "active" | "draft" | "retired"; expression: string;
  evaluate: (c: Claims) => { pass: boolean; actual: string; required: string };
}

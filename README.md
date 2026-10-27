# MARK

AI-powered application validation, document authentication and regulatory compliance verification for AICTE.

MARK reads every document in an institution's application, proves each one is real, checks the file against the Approval Process Handbook, finds faculty who are claimed by more than one institution, and shows the reviewer exactly why. It never says "fraud": it says discrepancy, unverified, needs a fresh copy.

## Run it

```sh
cd app
npm install
npm run dev          # http://localhost:3900
# or
./run.sh             # production build + serve on :3900
```

Optional: copy `app/.env.example` to `app/.env.local` and add an LLM API key so the copilot and deficiency letters are written by the language model, grounded in the file. Without a key the copilot uses a scripted engine over the same data.

## What is inside

| Route | What it shows |
| --- | --- |
| `/` | The opening: the MARK wordmark draws itself in ink, the seal stamps the K, the pointer is a lens that shows what MARK sees under the paper. |
| `/review` | The reviewer's desk. 48 synthetic applications sorted by risk, filters by band and state. |
| `/review/[id]` | One application: trust score ring, four engine scores, flags with evidence and clauses (confirm or dismiss and the score re-computes), documents, faculty, handbook table, pipeline replay, copilot chat, deficiency letter. |
| `/review/[id]/doc/[docId]` | The document itself, rendered as paper, with a hover lens for the forensic layer and toggles for error-level, copy-move and metadata. |
| `/graph` | The national faculty graph. Force layout on canvas; people on two or more faculty lists are drawn in red. |
| `/rules` | The handbook as versioned code. A clause-to-rule draft with a human approval step. |
| `/precheck` | The institution's rehearsal: drop files, see what is missing, run the same pipeline. |
| `/map` | A tile-grid map of India with average trust per state. |
| `/inspect` | Virtual inspection: a phone walkthrough that MARK counts. |
| `/audit` | A SHA-256 hash chain of every decision, verifiable in the browser. Tamper with one entry and watch it break. |
| `/settings` | Role, thresholds, integrations, privacy. |
| `/about` | Why MARK, the architecture, the five-minute demo script. |

## Stack

Next.js 16, React 19, Tailwind 4. Motion (Framer Motion) for reveals and page transitions, GSAP for the intro timeline, counters and the pipeline strip. No scroll-driven animation anywhere; everything plays on mount or on action. Design world: warm manila paper, ink-blue pen, a stamp seal. Fonts: Bricolage Grotesque, Instrument Sans, IBM Plex Mono.

Everything in the data is synthetic and deterministic (`lib/data.ts`). Registries, satellite and the AICTE portal are mocked; the shapes of their responses are the real ones.

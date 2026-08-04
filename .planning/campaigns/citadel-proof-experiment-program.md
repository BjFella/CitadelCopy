---
version: 1
id: "95e45977-b0de-46b0-8ad5-267b09c55698"
status: active
started: "2026-08-04T17:08:14.4310319Z"
completed_at: null
direction: "Run every proposed Citadel proof experiment, act on valid findings, and reduce evidence-backed bloat without losing compatibility or reproducibility."
phase_count: 8
current_phase: 5
branch: "codex/proof-program-20260804"
worktree_status: active
---

# Campaign: Citadel Proof Experiment Program

Status: active
Started: 2026-08-04T17:08:14.4310319Z
Direction: Run every proposed Citadel proof experiment, act on valid findings, and reduce evidence-backed bloat without losing compatibility or reproducibility.

## Claimed Scope

- `core/operations/`, `hooks_src/`, `core/policy/`, `core/governance/`
- `core/fleet/`, `core/product-proof/`, `core/deploy-steward/`
- `agents/`, `scripts/`, `benchmarks/`, `package.json`
- `README.md`, `docs/`, `.planning/research/`

## Phases

| # | Status | Type | Phase | Done When | Validator Retries Remaining |
|---|---|---|---|---|---:|
| 1 | complete | research | Freeze experiment contracts and bloat baseline | Manifest and baseline reports exist; all proposed experiments have controls, metrics, gates, and external-dependency classifications | 3 |
| 2 | complete | build | Run crash-recovery and safety-gate A/B experiments | Local A/B runners publish raw evidence and pass deterministic verification | 3 |
| 3 | complete | build | Build and run Citadel JudgeEval | Blinded fixture suite reports false-pass and false-block matrices for validator and arbiter paths | 3 |
| 4 | complete | build | Run Fleet isolation ablation | Serial and isolated-parallel arms run on matched fixtures with accepted-outcome, intervention, conflict, time, and cost evidence | 3 |
| 5 | in-progress | build | Run Real User Proof v2 | Local instrument and proxy run complete; external-owner and D7 gates are either evidenced or explicitly blocked without simulated humans | 3 |
| 6 | pending | build | Run deploy-steward paired experiment | Local paired simulator completes; public GitHub arm runs only after policy approval and publishes verifiable evidence | 3 |
| 7 | pending | prune | Act on bloat findings | Package experiment improves packed metric without breaking runtime/evidence gates; safe deprecations and temp-state decisions are recorded | 3 |
| 8 | pending | verify | Integrate, verify, and publish proof boundaries | Full strict suite and offline proof replay pass; README and evidence reports match actual results | 3 |

## Phase End Conditions

| Phase | Type | Check |
|---:|---|---|
| 1 | file_exists | `.planning/research/citadel-proof-experiments/experiment-manifest.json` |
| 1 | file_exists | `.planning/research/citadel-proof-experiments/bloat-baseline.json` |
| 1 | command_passes | `node scripts/experiment-contracts.js verify` |
| 2 | command_passes | `node scripts/experiment-operation-recovery.js verify` |
| 2 | command_passes | `node scripts/experiment-safety-gates.js verify` |
| 3 | command_passes | `node scripts/experiment-judge-eval.js verify` |
| 4 | command_passes | `node scripts/experiment-fleet-ablation.js verify` |
| 5 | command_passes | `node scripts/product-proof-trial.js report --experiment-manifest .planning/research/citadel-proof-experiments/experiment-manifest.json` |
| 5 | manual | Independent repository owners supply blinded task judgments and D7 records |
| 6 | command_passes | `node scripts/experiment-deploy-steward.js verify` |
| 6 | manual | Policy-approved disposable GitHub repositories complete the public arm |
| 7 | metric_threshold | `node scripts/experiment-package-bloat.js metric` reports packed bytes below the frozen baseline with both runtime and evidence profiles valid |
| 7 | command_passes | `node scripts/experiment-package-bloat.js verify` |
| 8 | command_passes | `node scripts/test-all.js --strict` |
| 8 | command_passes | `npm run grant:verify` |

## Exit Evidence

| Target | ID | Type | Required | Evidence | Status | Retries Remaining | Next Action |
|---|---|---|---|---|---|---:|---|
| phase:1 | experiment-contracts | test_result | yes | `node scripts/experiment-contracts.js verify`; 4/4 tamper tests | passed | 3 | Phase Validator passed; freeze retained |
| phase:2 | recovery-safety-ab | test_result | yes | Recovery `c81d93...`; safety `e7d94c...`; independent validator pass | passed | 3 | Preserve narrow deterministic claim boundary |
| phase:3 | judge-eval | test_result | yes | 8-case sealed same-family proxy; independent validator pass | passed | 3 | Keep instrument-only; obtain external calibration before promotion |
| phase:4 | fleet-ablation | test_result | yes | Real 2-agent serial/parallel run; independent validator pass | passed | 3 | Keep single-suite result instrument-only |
| phase:5 | real-user-proof | test_result | yes | V2 report and receipts | pending | 3 | Run instrument, then external owner gate |
| phase:6 | deploy-steward | test_result | yes | Local and policy-approved public reports | pending | 3 | Run simulator before remote mutation |
| phase:7 | package-bloat | command_result | yes | Before/after pack metrics and smoke gates | pending | 3 | Classify runtime versus evidence artifacts |
| phase:8 | strict-suite | test_result | yes | `node scripts/test-all.js --strict` | pending | 3 | Integrate and verify |

## Feature Ledger

| Feature | Status | Phase | Notes |
|---|---|---:|---|
| Public proof framing and dead-anchor validation | complete | pre-campaign | Four-file isolated branch change; strict suite and 17 offline proof checks passed |
| Frozen seven-track experiment contract | complete | 1 | Phase Validator passed; pack baseline is 9,678,793 packed bytes across 1,954 files |
| Journaled recovery A/B | complete | 2 | Control duplicates 3; treatment 0; safe recovery 6/6; deterministic in-process faults only |
| Safety-gate precision A/B | complete | 2 | 12 matched decisions; TPR 1; FPR 0; canary 0; no exploit or cross-OS claim |
| Citadel JudgeEval instrument | complete | 3 | Control accuracy 0.625 vs acting-arbiter proxy 1.0; both false-accept 0; promotion blocked |
| Fleet worktree ablation | complete | 4 | Both arms accepted; 196.834s serial vs 154.023s isolated parallel; one internal suite only |

## Decision Log

- 2026-08-04: Preserve the dirty primary checkout and execute on `codex/proof-program-20260804` at live `main` `d3aae97`.
- 2026-08-04: Do not simulate humans, provider identity, subscription cash, GitHub branch protection, or external-owner judgments. These remain external gates.
- 2026-08-04: Treat package size as a multi-output optimization: lower packed bytes only counts if runtime smoke and offline evidence verification both pass.
- 2026-08-04: Do not delete `.planning/tmp/` until ownership and inactivity are proven; investigation is authorized, destructive cleanup is not inferred.
- 2026-08-04: Foreground campaign only. No unattended daemon or public infrastructure mutation before the applicable policy gate.
- 2026-08-04: Campaign telemetry helper is unavailable in this source checkout; campaign file and experiment reports remain authoritative.
- 2026-08-04: Phase 1 passed independent validation. The contract hash is `d1995b49cd4e02198889d418f3a78f1eadb64be17ab94f4866e9ac6e99e0dd27`; contract evidence is not outcome evidence.
- 2026-08-04: Phase 2 passed independent validation. Recovery proves deterministic in-process fault behavior, not process-kill or power-loss behavior. Safety proves decision-boundary precision, not execution containment or cross-OS portability.
- 2026-08-04: Phase 3 passed as an instrument, not a product claim. A one-trial same-family proxy reduced unknown verdicts from 0.50 to 0.125 and raised exact accuracy from 0.625 to 1.0, but false accepts were already zero in both arms; the preregistered false-accept improvement gate failed.
- 2026-08-04: Phase 4 passed as an instrument. One matched two-task run showed 21.75% lower wall time for isolated parallel worktrees with both arms accepted and no conflicts; external task selection, repeated suites, accepted-outcome review, and cost telemetry remain missing.

## Review Queue

- [ ] Architecture: Decide whether reproducible evidence remains in the primary npm package or becomes a separate release artifact/package.
- [ ] External: Identify independent repository owners for Real User Proof v2.
- [ ] External: Approve disposable public GitHub repositories if the local deploy-steward comparison justifies the public arm.

## Circuit Breakers

- Three consecutive failures on the same experimental mechanism.
- Any new false pass, unknown-to-pass conversion, duplicate non-repeatable effect, or path-containment regression.
- Five or more new strict-suite failures from a build phase.
- Package reduction breaks install, runtime, or offline evidence replay.
- Experiment design drifts into simulated human or external evidence presented as real.

## Active Context

Phase 5 is in progress. Exercise the Real User Proof v2 instrument with explicit proxy records, fix manifest binding, and leave independent-owner and D7 evidence blocked rather than simulated.

## Continuation State

Phase: 5
Sub-step: bind the product-proof instrument to the frozen experiment contract and produce a fail-honest proxy report
Files modified: prior files plus Fleet fixture, runner, tests, observations, and bounded report
Blocking: none for local phases; external-owner, vendor, and GitHub gates remain later
checkpoint-phase-1: stash@{0}
checkpoint-phase-2: 805627d
checkpoint-phase-3: 9492f8f
checkpoint-phase-4: 16a2d5e


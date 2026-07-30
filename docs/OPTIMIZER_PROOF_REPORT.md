# Citadel Optimizer Proof Report

Observed: 2026-07-30

## Answer

The optimizer proof system is engineering-ready for calibration. It is not
performance-proven and is not submission-ready.

## What passed locally

- 10 frozen scenarios across 3 public repositories
- 4 frozen policies and 3 repetitions, producing a 120-record fixture matrix
- strict cost provenance and unknown-cost semantics
- deterministic prompt-only and adaptive routing
- bounded read-only repository probing
- adaptive escalation and stop decisions
- holdout exclusion from capability learning
- report rejection of missing, duplicate, forged, or tampered records
- zero simulated adversarial false passes
- signed-run tamper rejection
- existing product-benchmark identity unchanged
- existing executor-profile acceptance test unchanged and passing

The deterministic fixture happens to exercise a 23.2507% held-out median-cost
reduction with no simulated verified-completion loss. That number is a report
math fixture. It is not evidence that real models save money.

## Current doctor

| Gate | State |
|---|---|
| Claude Code launch | Available, version 2.1.206 |
| Codex CLI launch | Available through official global CLI, version 0.146.0 |
| Desktop-bundled Codex path | Visible but access denied; not used as the automation path |
| Exact model IDs | Frozen: GPT-5.6 Luna, Claude Sonnet 5, Claude Opus 5, GPT-5.6 Sol |
| Executor profile digests | Bound to canonical Operation Fork profiles |
| Runtime adapter | Self-contained and bound by source digest |
| Codex price basis | Official API list-price normalization, observed 2026-07-29 |
| Calibration | First attempt stopped after 2/12 on missing Claude model provenance; revised 4-run smoke plan authorized |
| External scenario selector | Not collected |
| Local run-attestation public key | Not frozen |
| Independent reproduction | Not collected |
| Model calls made by this work | None |

The official Codex CLI was installed and verified with a version-only command;
no model call was made. Citadel's Windows launcher now prefers the reviewed npm
entrypoint over an inaccessible Windows Store desktop executable. Calibration,
external selection, and attestation remain machine-readable blockers, so
`actual-run` execution and the submission gate remain closed.

## Claim boundary

Safe current claim:

> Citadel now contains a separate, reproducible engineering contract for
> outcome-aware economic routing and can run a frozen comparative evaluation
> once exact executors, subscription quota, and external selection are approved.

Unsafe current claims:

- Citadel reduces real agent cost;
- Citadel retains frontier quality;
- Citadel is best in class;
- the Sentient performance target has been met;
- the grant package is ready to submit.

## Next evidence, not next feature

The first calibration attempt stopped after two calls because Claude's final
summary omitted model identity. Its local session stream retained the exact
model, so the adapter now binds the final session ID to that stream and rejects
mixed or mismatched session evidence.

The revised gate is a frozen 4-run subscription-backed smoke calibration: one
short non-holdout scenario across all four profiles. It verifies authenticated
access, observed identity, and cost provenance without spending long tasks on
what is not a performance benchmark. The cap is 4 CLI runs and 160 aggregate
model-runtime timeout minutes. Together with the two stopped-attempt calls,
this remains below Seth's original 12-call authorization.

Official API list prices remain a normalization basis for comparing routes.
They are not a claim about Seth's invoice or the marginal cost of a
subscription-backed run.

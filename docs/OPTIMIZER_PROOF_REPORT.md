# Citadel Optimizer Proof Report

Observed: 2026-07-30

## Answer

The optimizer calibration is complete and digest-bound. The optimizer is not
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
| Calibration | Passed 4/4 identity, receipt, and cost-source gates; 0/4 task verifiers passed |
| External scenario selector | Not collected |
| Local run-attestation public key | Frozen; private key stored outside the repository |
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

A second start stopped before any model call because Windows could not launch
the frozen `npm.cmd` setup through `spawnSync` with `shell: false`. The benchmark
runner now resolves reviewed `npm`, `npx`, and `corepack` shims to their
JavaScript entrypoints and still avoids a command interpreter.

The revised 4-run subscription-backed calibration completed across all four
profiles. Every requested model matched the observed model, every receipt
verified, and every cost source was known. The normalized comparison total was
`$3.534060`, not a subscription invoice. Aggregate elapsed runtime was
1,439,995 ms.

All four task verifiers failed. That does not invalidate the access and
telemetry calibration, but it means these runs provide no task-quality or
savings evidence. The next gate is therefore the attested preliminary matrix,
not a stronger public claim.

Official API list prices remain a normalization basis for comparing routes.
They are not a claim about Seth's invoice or the marginal cost of a
subscription-backed run.

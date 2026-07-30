# Citadel Optimizer Proof Report

Observed: 2026-07-30

## Answer

The optimizer calibration and diagnostic pilot are complete and digest-bound.
The optimizer is not performance-proven and is not submission-ready.

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
- bounded, path- and secret-redacted verifier-output and patch receipts before temporary
  workspace cleanup
- proof-bundle verification of the completed calibration record, its archived
  scenario set, and the no-model forensic record
- proof-bundle verification of the completed diagnostic plan, immutable failed
  record, archived pilot scenario set, and zero-call forensic replay
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
| Diagnostic pilot | Completed 2/2 identity and receipt gates; raw record failed; Claude's 22-test pass was an artifact-gate false negative |
| Holdout selector | `citadel-short-executor-proof`, selected by precommitted drand round 6333716; three relays agreed and the BLS signature verified |
| Local run-attestation public key | Rotated before any matrix run because the original private key was unavailable; replacement private key stored outside the repository and public rotation record checked in |
| Clean hosted verification | Beacon selection passed on GitHub-hosted runner; matrix bundle verification awaits the unrun matrix |
| Model calls made across calibration attempts | 6 total; 4 in the completed record |
| Model calls made in diagnostic pilot | 2 total; no rerun |

Citadel's Windows launcher prefers the reviewed npm entrypoint over an
inaccessible Windows Store desktop executable. Calibration, the local
attestation key, public-random holdout selection, and the exact subscription
quota authorization are complete. No matrix run has started.

The method and public-random selection request were published before drand round
`6333716`. All three committed relays agreed; the exact rule selected
`citadel-short-executor-proof`, and `drand-client@1.4.2` verified the BLS
signature. No human selector was involved and no matrix run has started.

## Claim boundary

Safe current claim:

> Citadel now contains a separate, reproducible engineering contract for
> outcome-aware economic routing. Its precommitted public beacon selected
> `citadel-short-executor-proof`; the frozen comparative matrix is approved but
> remains unrun. Clean hosted verification remains required before a grant
> claim.

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

All four task verifiers failed. A no-model reproduction established that the
original `npm test` verifier failed on unrelated lint and TypeScript tooling
before reaching the queue tests. A task-focused AVA invocation then failed on
the actual queue bug, and a bounded reference repair touching `index.js` and
`test.js` passed all 22 tests with no unhandled rejection. The archived
calibration scenario set preserves what actually ran; the corrected actual
matrix has a new frozen scenario-set identity. The 0/4 calibration result is
therefore not interpretable as model quality and supplies no savings evidence.

The authorized diagnostic pilot completed both frontier runs in 741,708 ms.
Its normalized comparison total was `$2.191393`, not a subscription invoice.
Both requested models matched their observed identities and both execution
receipts verified. Claude changed `index.js` and all 22 AVA tests passed, while
Codex made no patch and the verifier failed.

The immutable pilot record remains failed with `NO_TASK_VERIFIER_PASS` because
the manifest required both `index.js` and `test.js` to change. The pinned
repository already contained the regression test, so this rejected a valid
implementation and rewarded unnecessary test churn. The exact pilot scenario
set and raw record are archived unchanged. A digest-bound, zero-call forensic
replay narrows only the future matrix manifest to `index.js`; it classifies the
Claude run as task-verified and leaves the Codex run failed. This proves the
evidence path can carry a real verifier pass but supplies no savings claim.

The next gate is collection and verification of the already committed public
beacon round. The full matrix remains separately quota-gated.

Official API list prices remain a normalization basis for comparing routes.
They are not a claim about Seth's invoice or the marginal cost of a
subscription-backed run.

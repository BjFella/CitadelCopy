# Optimizer Benchmark Method

## Decision

The benchmark exists to falsify or support one economic claim. It is not a
general Citadel showcase.

The funded target is at least 30% lower total operation cost while retaining at
least 95% of always-frontier verified completions. The smaller pre-application
gate is:

- at least 20% lower held-out median cost than always-frontier;
- no loss of held-out verified completions in the frozen preliminary set;
- adaptive beats prompt-only on verified completion, or ties it at lower
  effective cost per verified completion;
- unknown cost cannot contribute to savings;
- zero false passes across tamper, incomplete, model-substitution, and crash
  cases.

## Benchmark shape

The frozen engineering matrix contains:

| Dimension | Frozen value |
|---|---:|
| Repositories | 3 |
| Scenarios | 10 |
| Categories | 6 |
| Policies | 4 |
| Repetitions | 3 |
| Total actual runs | 120 |
| Runtime families | 2 |
| Capability tiers | 3 |
| Holdouts | 4 |

Repositories and pinned revisions:

- [SethGammon/Citadel at `4a02265`](https://github.com/SethGammon/Citadel/commit/4a02265c206d992b556fc1b38c3c9487ced880d8)
- [sindresorhus/p-limit at `df47604`](https://github.com/sindresorhus/p-limit/commit/df476048d023ff868cd45b35ee47f5fb0ca2b25a)
- [ai/nanoid at `1a1fee4`](https://github.com/ai/nanoid/commit/1a1fee4610061c63e2429eb5c22a35e3634c1d03)

The commits were confirmed from the public repositories on 2026-07-29.

## Symmetry and anti-gaming

Every policy receives the same repository commit, task, setup, verifier,
allowed tools, timeout, attempts, agent limit, and candidate executor set.
Policy, scenario, and repetition form a unique matrix key. Missing, duplicate,
or caller-injected runs fail report construction.

The policy cannot read fixture truth. `learnCapabilityProfiles()` rejects any
holdout record. An outside maintainer later selects one already frozen holdout.
The local matrix signer and outside reproducer are separate trust roles.

The runner verifies repository tests and requires every expected artifact to
appear in the Git diff. Each verification attempt preserves a bounded,
path- and secret-redacted verifier-output excerpt, patch excerpt, digests, changed paths,
exit status, and truncation flags before deleting its temporary workspace.
A successful task counts only when:

- repository verification passes;
- the outcome is marked verified;
- observed-model proof passes;
- the execution receipt is verified.

Independent reproduction uses a separate record and reproducer public key.
Citadel checks that the signed actual run matches the outside-selected scenario
and that its digest matches the freeze.

## Probe boundary

Adaptive routing may perform bounded read-only reconnaissance:

- real directories only;
- no symlink traversal;
- fixed file, byte, and duration ceilings;
- package manifests, test commands, language mix, CI/test presence, and
  task-relevant file names;
- no model call during the probe.

The prompt-only baseline receives task text but no repository probe.

## Cost accounting

Each attempt reports a strict cost object. Multi-attempt adaptive work sums
every known component. If any attempt cost is unknown, the total is unknown.
Failed attempts are still included.

The report exposes both total known cost and whether all cost is known, but
economic comparisons use authoritative total and median cost only when the
relevant runs are fully known.

Fixture pricing multipliers are deterministic report-test inputs. They are
plainly labeled non-claim assumptions and are not vendor prices.

The actual-run Codex snapshot is separately frozen from those fixtures. It
uses the official API list price observed on 2026-07-29, including cached-input
rates and the documented multiplier above 272K input tokens. Its
`billing_basis` is `official_api_list_price`: a normalized resource-cost basis,
not a representation of subscription billing. Claude uses the runtime's
vendor-reported `total_cost_usd`.

## Evidence ladder

1. **Contract proof**: local unit tests, deterministic policies, frozen
   identities, anti-tamper tests.
2. **Calibration**: 4 completed, non-holdout CLI runs (one scenario × 4 frozen
   profiles) prove account access, observed model identity, and known cost
   sources. The digest-bound record reports 0/4 task-verifier passes, so it is
   not performance evidence. A no-model forensic reproduction found that the
   original full-repository verifier failed on unrelated lint and TypeScript
   tooling before reaching the task tests. The old scenario set is archived
   unchanged with that record. The actual matrix is re-frozen with a
   task-focused verifier that fails on the queue bug and passes a bounded
   repair touching both expected artifacts. The subscription-quota budget
   capped calibration at 4 runs and 160 aggregate model-runtime timeout
   minutes.
3. **Diagnostic pilot**: a separately authorized, non-claim two-run check uses
   the corrected scenario with one frontier profile from each runtime. It is
   capped at 2 CLI runs and 80 aggregate model-runtime timeout minutes. It
   exists only to demonstrate that the task-verifier evidence path can produce
   a pass before the 120-cell matrix consumes quota.
4. **Outside selection**: an independent maintainer selects one already frozen
   holdout before the local matrix starts.
5. **Preliminary evidence**: complete frozen actual-run matrix and held-out
   gate.
6. **Independent reproduction**: outside run, public key, raw privacy-safe
   records, and one-command verification.
7. **Grant claim**: only the claims supported by steps 5 and 6.

There is no calendar promise. Progress advances when an evidence gate closes.

## Commands

```bash
node scripts/optimizer-benchmark.js validate
node scripts/optimizer-benchmark.js doctor
node scripts/optimizer-benchmark.js calibration-plan
node scripts/optimizer-benchmark.js calibrate --output benchmarks/optimizer-proof/calibration-record.json
node scripts/optimizer-benchmark.js pilot-plan
node scripts/optimizer-benchmark.js pilot
node scripts/optimizer-benchmark.js selection-request
node scripts/optimizer-benchmark.js reproduction-plan
node scripts/optimizer-benchmark.js matrix-plan
node scripts/test-optimizer.js
node scripts/optimizer-proof-bundle.js verify <bundle-directory>
```

Actual matrix execution remains fail-closed until an outside scenario is
selected and the user explicitly approves consuming the frozen run/runtime
allowance from their subscription quota. Independent reproduction remains a
submission blocker, but it does not have to finish before the local matrix
starts.

The no-model outside-selection tooling emits a digest-bound request, verifies
that the response selects one frozen holdout, and writes a reviewable candidate
freeze. The independent-reproduction tooling reports its exact call/runtime
envelope before execution, requires an outside signing key and explicit quota
acknowledgement, and validates the signed record before writing a second
candidate freeze. These workflows are prepared locally but have not been
published, sent, selected, or run.

The proof bundle carries both scenario sets: `inputs/calibration-scenarios/`
reproduces the exact set used by the completed calibration, while
`inputs/scenarios/` is the corrected set frozen for the actual matrix. It also
includes and verifies `calibration-record.json` and
`calibration-forensics.json`. It carries the pending or completed
diagnostic-pilot plan and verifies the pilot record when one is bound.

Model and pricing references:

- [OpenAI GPT-5.6 model catalog and prices](https://developers.openai.com/api/docs/models)
- [Anthropic model IDs and pinned-version semantics](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions)
- [Anthropic model pricing](https://platform.claude.com/docs/en/about-claude/pricing)

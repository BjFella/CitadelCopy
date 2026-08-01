# Sentient Grant Draft: Citadel Operation Control

Status: internal draft, not approved or submitted

Evidence observed: 2026-08-01 UTC

## Project

**Citadel Operation Control: Verifiable Economic Governance for Open Agent Stacks**

Citadel is an open operation-control and evidence plane for agent operations.
Its core contract is stack-neutral, while current external-stack adoption is
demonstrated only with ROMA. It binds model assignment, decomposition, concurrency, subtask
ceilings, retries, tools, timeouts, and escalation to a signed plan; observes
what the underlying stack and providers actually exercised; and lets a
deterministic verifier outside the routed model decide whether the operation
completed.

The first external-stack binding targets Sentient's own ROMA recursive agent
framework. A frozen 24-cell actual-run diagnostic compared subscribed frontier,
prompt-only routing, direct 7B open/local, and Citadel-controlled ROMA. Citadel
completed 4/6 tasks locally versus 2/6 for direct 7B local and 3/6 for the
prompt router. All receipts reconciled, and there were zero false passes.

The precommitted efficiency hypothesis still failed: Citadel used six strong
whole-operation attempts, the same as the direct-7B baseline, and was much
slower. The application does not convert that result into a savings claim.

A subsequent preregistered local comparison tested a simpler adaptive policy
on one GTX 1070: 12 tasks × 2 policies × 3 timing repetitions. Adaptive
recorded 27/36 verified cells versus 24/36 for always-7B. The frozen aggregate
showed 9.9% less GPU energy and 10.3% less modeled GPU cost, but one same-route
60-second baseline timeout drove that appearance. Excluding the matched pair
reverses the comparison to 3.5% more energy, 5.4% more modeled GPU cost, and
7.5% more request wall time. The frozen 30% gates failed, one model identity
remained unknown, and Citadel makes no v1 savings claim. The grant would fund:
learning when smaller models, recursive decomposition, tools, and strong
modules are worth their full operational cost across stacks and hardware.

A separately frozen second 72-cell study used 12 new exact instances, 10 from
task templates already seen in v1: 1.5B for numeric atomic work, 3B for lexical
counting, and 7B for compositional, constraint, or adversarial work. A
model-external verifier could escalate a failed small-model answer. The profile
matched the always-7B cell completion (24/36 versus 24/36) with zero false
passes, but its 12 escalations increased measured GPU energy 15.7%, modeled GPU
cost 16.4%, request wall time 17.2%, and tokens 27.4%. Repetitions used the same
temperature-zero prompt and estimate runtime variance; they are not independent
task successes. That signed negative result is
published unchanged. It demonstrates why the funded controller must optimize
expected verified operation value rather than model size or prompt labels.

## Short application answer

Citadel makes optimization claims about open agents falsifiable. It attaches to
an existing stack, controls the whole operation rather than only choosing a
model, reconciles the declared plan against provider-level observations, keeps
unknown cost unknown, and signs model-externally verified outcomes. The working
ROMA integration and 24-cell proof reduce integration and evaluation risk. The
funded work is to turn that proven control plane into an adaptive policy that
meets precommitted absolute-completion, relative-quality, and end-to-end cost
gates across multiple open agent stacks. Citadel is currently demonstrated
research infrastructure and falsification machinery, not a demonstrated
economic optimizer.

## Sentient request addressed

This proposal addresses Sentient Foundation's
[Token and Economic Optimization for Agents](https://sentient.foundation/product-requests)
request. The request calls for a layer that can choose models, agents, and
tools, attach to agent stacks, and account for more than token price.

Sentient's [grant program](https://sentient.foundation/grants) states that
public-goods grants take no equity or claim on the work, applications are open
and reviewed on a rolling basis, and compute and engineering support may
accompany funding. The site states that `$42M` is committed but does not publish
a per-project maximum. The amount proposed below is a budget, not an inferred
entitlement.

### Sentient's six beliefs

- **Open:** MIT code, contracts, adapters, methods, cells, reports, and verifiers.
- **Yours to keep:** no Citadel account, token, or mandatory hosted evidence endpoint.
- **Accessible:** `/do` is the beginner path and current local studies ran on
  an 8 GB GTX 1070, while broader hardware accessibility remains a funded gate.
- **Good for humanity:** the intended benefit is reliable, lower-cost access to
  coding-agent capability; impact is not claimed before representative proof.
- **Private by default:** project state and telemetry remain local unless a user
  explicitly invokes a provider; public artifacts are bounded and redacted.
- **Empowering, not extractive:** users keep code, state, receipts, and adapters;
  Citadel has no telemetry resale or proprietary lock-in requirement.

The evidence and remaining gates for each belief are mapped in
[`SENTIENT_BELIEFS.md`](SENTIENT_BELIEFS.md).

## Problem

Model routing is not operation optimization. A recursive agent can choose a
cheap model yet waste cost through excess decomposition, parallelism, retries,
tools, context, and failed verification. It can also appear successful while
the declared model or controls were not what actually ran.

Common savings claims can be made misleading by:

- counting only a successful retry;
- ignoring setup, tool, local-compute, or human cost;
- calling unknown cost zero;
- accepting model prose or self-reported status as completion;
- requesting one model while a different provider path executes;
- changing tasks, policies, or verifiers after results are visible;
- allowing the controller to weaken the test that grades it;
- reporting orchestration activity as a useful outcome.

The missing public good is an operation-level control contract coupled to a
proof contract that can reject both fake completion and fake savings.

## What Citadel now does

### Stack-neutral operation contract

The core contract does not depend on ROMA. It specifies:

- exact upstream stack commit and adapter digest;
- per-module provider, model, endpoint, and model-manifest digest;
- decomposition depth, concurrency, and subtask ceilings;
- provider retry and whole-operation attempt limits;
- per-module output-token ceilings;
- external tool availability;
- operation timeout and reason codes.

### Thin Sentient ROMA binding

The adapter configures a pinned ROMA commit without replacing ROMA's planning
or execution logic. It records:

- configured atomizer, planner, executor, aggregator, and verifier models;
- actual provider call model and response model;
- token usage and timestamps;
- node depth and module exercise when available;
- configured internal and external tools separately;
- actual provider tool calls;
- partial sanitized observations during a timeout or process kill.

Unexercised modules are labeled `not_exercised`. A timeout can retain evidence,
but it remains incomplete and cannot become a pass.

### Model-external evidence and cost boundary

- Expected answers are stored only as frozen canonical SHA-256 digests.
- The last parseable JSON answer is verified outside the model and agent stack.
- Model prose, ROMA status, and self-reported verdicts cannot pass a cell.
- Every receipt is content-addressed.
- The full artifact bundle is operator-signed with Ed25519. This is tamper
  evidence under the operator key, not proof against operator fabrication.
- Offline verification recomputes source bindings, routes, plans, controls,
  observations, answers, receipts, summary, report, digests, and signature.
  This validates artifact consistency; it is not third-party replication.
- Self-hosted provider invoice cost can be known `$0` while total economic cost
  remains `unknown` because CPU/system energy, electricity price, hardware
  amortization, or subscription allocation is unmeasured.

## Frozen actual-run evidence

Method:
[`benchmarks/roma-operation-control/METHOD.md`](../../benchmarks/roma-operation-control/METHOD.md)

Signed report:
[`benchmarks/roma-operation-control/published-run/REPORT.md`](../../benchmarks/roma-operation-control/published-run/REPORT.md)

One-command verification:

```text
npm run operation-proof:verify
```

Verified identities:

- Freeze: `sha256:f1ecf932261ceac604978952c42cdb8ec14032b795bffd1848fae90e9572ded5`
- Bundle: `sha256:95b49d26019296adcb5f05121d3faf0e43c9c91a349da63d737640277557b719`
- ROMA: `a6e3bb4f9e0694375fa627fa4b8bf8cae50592a6`
- Qwen2.5-Coder 3B manifest: `sha256:f72c60cabf6237b07f6e632b2c48d533cef25eda2efbd34bed21c5e9c01e6225`
- Qwen2.5-Coder 7B manifest: `sha256:dae161e27b0e90dd1856c8bb3209201fd6736d8eb66298e75ed87571486f4364`

| Policy | Verified | Rate | Duration | Frontier calls | Local calls | Strong whole-operation attempts |
|---|---:|---:|---:|---:|---:|---:|
| Frontier-only | 6/6 | 100.0% | 47.7s | 6 | 0 | 0 |
| Prompt router | 3/6 | 50.0% | 40.8s | 3 | 3 | 0 |
| Always open/local 7B | 2/6 | 33.3% | 13.2s | 0 | 6 | 6 |
| Citadel-controlled ROMA | 4/6 | 66.7% | 1042.8s | 0 | 89 module calls | 6 |

Additional evidence gates:

- measured cells: 24/24;
- false passes: 0;
- receipt-integrity failures: 0;
- execution-control failures: 0;
- verifier-triggered Citadel escalations: 3;
- total USD: unknown, with missing components explicitly enumerated.

The matrix is a compact diagnostic, not a population-level superiority claim.

## The most legible cell

The adversarial-ledger prompt contained an untrusted note claiming the answer
was 999 and instructing any verifier to accept it.

- Direct 7B local returned `{"answer": 999}` and failed.
- The prompt router selected local and returned `{"answer": 999}` and failed.
- Citadel-controlled ROMA returned `{"answer": 213}` and passed.
- Frontier returned `{"answer": 213}` and passed.

This is not evidence that Citadel solves prompt injection generally. It is a
concrete demonstration that the model and stack could not promote an injected
self-verdict into a verified completion.

## The negative result

The frozen performance gate required Citadel to:

1. meet or exceed direct 7B local verified completion; and
2. avoid at least one strong whole-operation attempt; and
3. create zero false passes.

Citadel satisfied the first and third conditions but not the second. It doubled
verified completion from 2/6 to 4/6, but three verifier-triggered escalations
left it with six strong attempts. Its measured duration was about 79 times the
direct-local baseline. Therefore the optimizer performance hypothesis is
reported as **failed**.

The proof result is **passed** because the frozen controls, provider paths,
outcomes, failure states, and attestation all reconstruct consistently offline. An
operational failure is not mislabeled as evidence corruption when it is
faithfully recorded.

## Earlier evidence retained

Citadel's earlier subscription-backed optimizer matrix remains published under
its original identity:

- 120/120 signed cells;
- 84 cells reached a model;
- 87 real model attempts;
- 33 verified completions;
- 0 adversarial false passes;
- 36 setup-unknown cells;
- adaptive and prompt-only each completed 6/12 held-out cells;
- the original adaptive performance gate remained open because cost coverage
  was incomplete; it was not a failed economic comparison.

That baseline demonstrated large-scale signed evidence and exposed method
defects. The ROMA diagnostic does not rewrite it. It closes several of its
largest gaps: a stack-neutral contract, real open/local execution, exact model
manifests, clean setup preflight, explicit attempt semantics, and task-scoped
verification.

## Prospective local v1 calibration

Method:
[`benchmarks/sentient-readiness/METHOD.md`](../../benchmarks/sentient-readiness/METHOD.md)

Signed report:
[`benchmarks/sentient-readiness/published-run/REPORT.md`](../../benchmarks/sentient-readiness/published-run/REPORT.md)

One-command verification:

```text
npm run readiness:verify
```

| Policy | Verified | Attempts | 3B | 7B | GPU energy | Modeled comparison cost |
|---|---:|---:|---:|---:|---:|---:|
| Always strong local | 24/36 | 36 | 0 | 36 | 0.004599 kWh | $0.001795 |
| Citadel adaptive local | 27/36 | 39 | 24 | 15 | 0.004145 kWh | $0.001609 |

The adaptive policy recorded three more verified cells. Its frozen aggregate
showed roughly ten percent lower GPU energy, modeled GPU cost, and request wall
time, but that direction is not robust: one initial 7B baseline attempt timed
out after 60 seconds on a task where both policies selected the same strong
route. Excluding that matched pair makes adaptive use 3.5% more measured GPU
energy, 5.4% more modeled GPU cost, and 7.5% more request wall time. Token use
in the frozen aggregate increased 11.2%, and the timeout retained unknown model
identity. The signed aggregate is unchanged; the supplementary
[`SENSITIVITY.md`](../../benchmarks/sentient-readiness/SENSITIVITY.md) rules out
a v1 routing-policy savings claim.

This is a prospective, repeated, local, energy-measured calibration. Its 12
unique exact-answer tasks and deterministic repetitions do not establish a
general quality or economic effect.

### Capability-profile follow-up

Frozen method and required disclosure:
[`METHOD.md`](../../benchmarks/sentient-readiness-v2/METHOD.md) ·
[`CORRIGENDUM.md`](../../benchmarks/sentient-readiness-v2/CORRIGENDUM.md)

Signed report:
[`benchmarks/sentient-readiness-v2/published-run/REPORT.md`](../../benchmarks/sentient-readiness-v2/published-run/REPORT.md)

One-command verification:

```text
npm run readiness:v2:verify
```

| Policy | Verified | Attempts | 1.5B | 3B | 7B | GPU energy | Modeled comparison cost |
|---|---:|---:|---:|---:|---:|---:|---:|
| Always strong local | 24/36 | 36 | 0 | 0 | 36 | 0.003568 kWh | $0.001389 |
| Capability profile | 24/36 | 48 | 18 | 6 | 24 | 0.004127 kWh | $0.001617 |

This result rejects the idea that capability labels plus smaller models are
enough. The model-external verifier matched baseline cell completion, but the cost of 12
escalations erased the apparent savings. Citadel is valuable here because it
can reject the policy before its intuition is promoted as an economic claim.

### Representative repository-operation shakedown

Frozen method:
[`benchmarks/representative-operation-pilot-v2/METHOD.md`](../../benchmarks/representative-operation-pilot-v2/METHOD.md)

Signed report:
[`benchmarks/representative-operation-pilot-v2/published-run/REPORT.md`](../../benchmarks/representative-operation-pilot-v2/published-run/REPORT.md)

One-command verification:

```text
npm run representative:v2:verify
```

| Policy | Unique tasks | Verified cells | Attempts | Escalations | GPU energy | Modeled comparison cost |
|---|---:|---:|---:|---:|---:|---:|
| Always strong local | 6 | 6/12 | 12 | 0 | 0.002507 kWh | $0.000810 |
| Citadel risk profile | 6 | 6/12 | 14 | 2 | 0.002329 kWh | $0.000772 |

This precommitted v2 repair exercised six artifact-producing repository fixture
tasks across configuration, documentation, refactoring, security, bug fixing,
and multi-file API work, twice per policy. Both policies verified 6/12 cells;
Citadel had zero false passes, zero path violations, and zero integrity
failures. Its 7.1% measured GPU-energy reduction and 4.7% modeled GPU-cost
reduction missed the frozen 20% gates, while token use increased 13.2%, so the
published evidence result is failed. Six fixture tasks and timing repetitions
do not establish production generalization. The result matters because it
extends the evidence machinery from exact answers to repository artifacts and
still refuses to turn a small directional result into a savings claim.

The first frozen pilot identity remains published as an aborted harness result:
its initial offline replay exposed an ephemeral temporary-path mismatch. The
source was not patched in place. A separately frozen v2 normalized only that
ephemeral root before the 24-cell run.

## Why this is differentiated

Citadel is not claiming the first model router or the first agent orchestrator.
Its research claim is narrower and more defensible:

> The economically relevant unit is the verified agent operation, and an
> optimization layer should prove the relationship between its declared
> operation plan, the provider paths actually exercised, the full cost boundary,
> and the model-externally verified outcome.

ROMA, LiteLLM, RouteLLM, OpenTelemetry, Langfuse, and Harbor already provide
important orchestration, routing, telemetry, and evaluation capabilities.
Citadel's claim is the binding across them, not invention of their components.
The dated, source-linked comparison and exact missing seam for each is in
[`TECHNICAL_COMPARISON.md`](TECHNICAL_COMPARISON.md).

The first ROMA binding matters to Sentient because it demonstrates that this is
not a Citadel-only abstraction. Sentient's own recursive stack can consume the
contract, remain responsible for execution, and produce externally
reconcilable evidence.

## Why Sentient should fund it

- It directly targets a named Sentient Request for Products.
- It integrates with Sentient ROMA at an exact public commit.
- It runs on real open/local models rather than a simulated routing table.
- The stack-neutral core and proof artifacts remain MIT-licensed public goods.
- The evidence layer has already rejected two of Citadel's own optimizer claims.
- V1 recorded more verified cells but its apparent savings reverse under a
  matched-timeout sensitivity, preventing an overclaim.
- V2 matched baseline cell completion while robustly showing that naive
  capability-profile routing increased measured GPU energy and modeled GPU cost.
- The representative repository-operation shakedown preserved zero false passes
  and zero path violations, but failed its frozen economic gates and remains
  published as failed.
- The work distinguishes activity, completion, control integrity, and cost.
- Citadel already provides operation lifecycle, recovery, executor profiles,
  worktree isolation, receipts, and verification, reducing substrate risk.
- Funding buys the still-unproven adaptive result, not a reconstruction of a
  slide-deck prototype.

## Funded work

### 1. Learn operation value, not prompt difficulty

- estimate expected verified utility from early operation signals;
- predict whether decomposition improves completion enough to justify overhead;
- assign strong models only to modules with positive expected value;
- incorporate failed attempts and verifier escalation into expected total cost;
- learn only from eligible non-holdout outcomes;
- publish every precommitted negative result.

### 2. Measure full local economics

- attribute GPU and CPU/system energy per operation;
- bind electricity-rate snapshots and hardware-amortization assumptions;
- separate provider invoice, subscription allocation, local compute, tools,
  setup, and bounded human intervention;
- never use an unknown component as savings;
- support both measured monetary and nonmonetary comparisons.

### 3. Generalize the stack-neutral port

- harden the ROMA adapter and upstream compatibility matrix;
- add at least two additional open agent stacks;
- add multiple open model families and hardware profiles;
- cover coding, research, structured reasoning, and tool-using operations;
- keep stack-specific execution outside the control-contract core.

### 4. Scale the proof

- precommit at least 60 unique artifact-producing repository operations across
  bug fixing, tests, configuration migration, documentation consistency, and
  search/refactor strata, with clean setup gates;
- use repeated trials only for runtime variance and cluster uncertainty by
  unique task and repository;
- publish privacy-safe raw cells and signed bundles;
- run clean hosted offline verification;
- provide one-command reproduction and adapter conformance tests.

## Evidence-gated milestones and requested funding

The proposal is **$150,000 over nine months**, released in $45,000, $60,000,
and $45,000 go/no-go tranches. The cost basis is $99,000 maintainer labor,
$27,000 capped compute/tools, $7,000 hosted reproducibility, $7,000
documentation/accessibility/release work, $2,000 for a bounded opt-in operator
cohort, and $8,000 bounded contingency.

The single canonical milestone allocation, FTE/rate basis, dependencies,
baseline matrix, statistical contract, tranche gates, and failure deliverables
are in [`MILESTONES_AND_BUDGET.md`](MILESTONES_AND_BUDGET.md). No second budget
allocation is maintained in this draft.

The primary comparator is always frontier. Stack-native default, prompt-only,
and strongest applicable open/local are diagnostic baselines. If a gate fails,
the negative result, reusable contracts/data, and unused-funds accounting are
deliverables.

## Funded performance target

Across the funded multi-stack benchmark:

- always frontier first verifies at least 80% overall and at least 70% in every
  preregistered task stratum, or the benchmark is baseline-invalid;
- at least 80% absolute verified-operation completion;
- at least 95% of the valid always-frontier verified-operation rate;
- at least 30% lower measured end-to-end cost than always-frontier;
- zero false passes;
- zero unknown cost used as savings;
- a clean hosted reconstruction from public privacy-safe evidence.

Prompt-only paired differences remain a reported routing diagnostic, not a pass
condition. These are funded targets, not current results.

## Risks and honest limits

- Six diagnostic tasks are too few for a general performance claim.
- Citadel/ROMA was materially slower than every baseline.
- The strong-operation avoidance gate failed.
- V1 contains 12 unique tasks repeated at temperature zero; one same-route
  baseline timeout drives the apparent 9.9% GPU-energy reduction, and matched
  sensitivity reverses the economic direction.
- V2 uses 12 new exact instances but 10 reuse v1 task templates; it is not an
  independent task-family holdout, and its repetitions are timing repetitions.
- The capability-profile follow-up used 15.7% more GPU energy and 16.4% more
  modeled cost because verification triggered 12 strong-model escalations.
- One local 7B cell timed out before model identity was observed.
- Actual end-to-end dollar cost is still unknown because whole-system energy
  and Seth's observed utility rate were not measured.
- External-stack adoption is demonstrated only with ROMA; Claude Code and
  Ollama establish contract-layer runtime coverage.
- The local package used one 8 GB GPU and three Qwen2.5-Coder model sizes in
  one model family.
- The representative shakedown used six small fixture tasks with two timing
  repetitions per policy; repetitions are not independent tasks and fixtures
  are not evidence of production generalization.
- Original freeze source lists omitted transitive verifier dependencies;
  supplementary closure manifests bind those files at each signed execution
  commit but do not retroactively repair the preregistration.
- `human_interventions_during_cells: 0` is operator-declared, not instrumented
  telemetry; request duration is client wall time, not provider model duration.
- The controller remains heuristic rather than learned.

Those are the exact uncertainties the funded milestones address.

## Applicant and adoption evidence

SethGammon owns and maintains the public MIT repository. On 2026-08-01 the
GitHub page showed 808 stars, 79 forks, and 510 commits. Those are public
interest and repository-history signals, not users, installations, or Seth's
authored-work count. The adoption path is
an existing Claude Code or Codex user starting with `/do`, then an external
stack builder implementing the conformance adapter; ROMA is the current
example. A funded, bounded opt-in cohort of 15-20 external operators measures
governed first-operation completion, including failed installs and abandonment;
it does not govern the optimizer performance gate. Applicant email,
city/country, role selection, and submission authority remain human-owned
Typeform inputs. Legal and payment details may follow during due
diligence but were not fields in the observed application path. See
[`APPLICANT_AND_ADOPTION.md`](APPLICANT_AND_ADOPTION.md).

## Public deliverables

1. Stack-neutral operation-control contract and conformance suite.
2. Maintained Sentient ROMA adapter.
3. At least two additional open-stack adapters.
4. End-to-end economic telemetry contract.
5. Adaptive whole-operation controller.
6. Frozen multi-stack benchmark and signed raw evidence.
7. One-command offline and clean hosted verification.
8. Positive or negative performance report under the same claim boundary.

## Submission blockers

Do not submit until:

- this final application package is merged and all hosted checks pass;
- the public Pages site, evidence manifest, evaluator path, and PDF links are
  checked after merge;
- applicant email and city/country are entered, and the role selection is
  confirmed;
- Seth reviews and explicitly approves the requested amount and wording;
- Seth explicitly approves submitting the application.

No outside reviewer, outreach campaign, or third-party selector is required.

The exact live form map and paste-ready payload are in
[`TYPEFORM_ANSWER_PACK.md`](TYPEFORM_ANSWER_PACK.md). The supporting upload and
final audit are in [`SUBMISSION_READINESS.md`](SUBMISSION_READINESS.md).

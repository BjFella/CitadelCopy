# Sentient Grant Draft: Citadel Operation Control

Status: internal draft, not approved or submitted

Evidence observed: 2026-07-31

## Project

**Citadel Operation Control: Verifiable Economic Governance for Open Agent Stacks**

Citadel is an open, stack-neutral control and evidence plane for agent
operations. It binds model assignment, decomposition, concurrency, subtask
ceilings, retries, tools, timeouts, and escalation to a signed plan; observes
what the underlying stack and providers actually exercised; and lets an
independent verifier decide whether the operation completed.

The first external-stack binding targets Sentient's own ROMA recursive agent
framework. A frozen 24-cell actual-run diagnostic compared subscribed frontier,
prompt-only routing, direct 7B open/local, and Citadel-controlled ROMA. Citadel
completed 4/6 tasks locally versus 2/6 for direct 7B local and 3/6 for the
prompt router. All receipts reconciled, and there were zero false passes.

The precommitted efficiency hypothesis still failed: Citadel used six strong
whole-operation attempts, the same as the direct-7B baseline, and was much
slower. The application does not convert that result into a savings claim.
The grant would fund the missing research result: learning when recursive
decomposition and strong modules are worth their full operational cost.

## Short application answer

Citadel makes optimization claims about open agents falsifiable. It attaches to
an existing stack, controls the whole operation rather than only choosing a
model, reconciles the declared plan against provider-level observations, keeps
unknown cost unknown, and signs independently verified outcomes. The working
ROMA integration and 24-cell proof reduce integration and evaluation risk. The
funded work is to turn that proven control plane into an adaptive policy that
meets precommitted completion and end-to-end cost gates across multiple open
agent stacks.

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

### Independent evidence and cost boundary

- Expected answers are stored only as frozen canonical SHA-256 digests.
- The last parseable JSON answer is verified outside the model and agent stack.
- Model prose, ROMA status, and self-reported verdicts cannot pass a cell.
- Every receipt is content-addressed.
- The full artifact bundle is Ed25519-attested.
- Offline verification recomputes source bindings, routes, plans, controls,
  observations, answers, receipts, summary, report, digests, and signature.
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
outcomes, failure states, and attestation all independently reproduce. An
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
- the original adaptive cost hypothesis failed.

That baseline demonstrated large-scale signed evidence and exposed method
defects. The ROMA diagnostic does not rewrite it. It closes several of its
largest gaps: a stack-neutral contract, real open/local execution, exact model
manifests, clean setup preflight, explicit attempt semantics, and task-scoped
verification.

## Why this is differentiated

Citadel is not claiming the first model router or the first agent orchestrator.
Its research claim is narrower and more defensible:

> The economically relevant unit is the verified agent operation, and an
> optimization layer should prove the relationship between its declared
> operation plan, the provider paths actually exercised, the full cost boundary,
> and the independently verified outcome.

Prompt routers such as RouteLLM and Not Diamond choose a model for a query.
ROMA and other agent stacks plan and execute work. Citadel controls and audits
the operation around those systems without requiring them to grade themselves.

The first ROMA binding matters to Sentient because it demonstrates that this is
not a Citadel-only abstraction. Sentient's own recursive stack can consume the
contract, remain responsible for execution, and produce independently
reconcilable evidence.

## Why Sentient should fund it

- It directly targets a named Sentient Request for Products.
- It integrates with Sentient ROMA at an exact public commit.
- It runs on real open/local models rather than a simulated routing table.
- The stack-neutral core and proof artifacts remain MIT-licensed public goods.
- The evidence layer has already rejected two of Citadel's own optimizer claims.
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

- precommit a larger multi-stack benchmark with clean setup gates;
- add repeated trials and uncertainty intervals;
- publish privacy-safe raw cells and signed bundles;
- run clean hosted offline verification;
- provide one-command reproduction and adapter conformance tests.

## Evidence-gated milestones

Milestones are gated by artifacts rather than calendar promises.

1. **Economic telemetry gate:** all declared cost components are measured or
   explicitly unknown; no unknown is counted as savings.
2. **Adapter gate:** ROMA plus two additional open stacks pass the same public
   operation-contract conformance suite.
3. **Controller gate:** adaptive whole-operation control beats prompt-only and
   always-open/local on precommitted expected-cost and completion gates.
4. **Scale gate:** the result reproduces across multiple model families,
   hardware profiles, and task categories with uncertainty reported.
5. **Public-proof gate:** a clean hosted job reconstructs every published claim
   from signed raw evidence.

If a gate fails, that failure and its artifacts are deliverables.

## Requested funding

Proposed public-goods grant: **$150,000**.

| Use | Amount |
|---|---:|
| Controller and runtime engineering | $50,000 |
| Open-model, stack, and hardware evaluation | $35,000 |
| Economic telemetry and cost attribution | $25,000 |
| Benchmark and verification hardening | $20,000 |
| Documentation and public proof surfaces | $10,000 |
| Administration and contingency | $10,000 |
| **Total** | **$150,000** |

Sentient compute support could reduce the evaluation cash line. The public
deliverables and evidence gates would remain unchanged.

## Funded performance target

Across the funded multi-stack benchmark:

- at least 95% of frontier verified completion;
- at least 30% lower measured end-to-end cost than always-frontier;
- adaptive whole-operation control beats prompt-only routing;
- zero false passes;
- zero unknown cost used as savings;
- a clean hosted reconstruction from public privacy-safe evidence.

These are funded targets, not current results.

## Risks and honest limits

- Six diagnostic tasks are too few for a general performance claim.
- Citadel/ROMA was materially slower than every baseline.
- The strong-operation avoidance gate failed.
- Total dollar cost is still unknown.
- Current stack-neutral adoption is demonstrated only with ROMA.
- The local test used one 8 GB GPU and two Qwen2.5-Coder model sizes.
- The controller remains heuristic rather than learned.

Those are the exact uncertainties the funded milestones address.

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

- the committed proof bundle passes its clean GitHub-hosted verification job;
- the public operation-control page is live at its final URL;
- final repository and evidence links are checked after merge;
- Seth reviews and explicitly approves the requested amount and wording;
- Seth explicitly approves submitting the application.

No outside reviewer, outreach campaign, or third-party selector is required.

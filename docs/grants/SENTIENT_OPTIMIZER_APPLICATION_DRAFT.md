# Sentient Grant Draft: Citadel Optimizer

Status: internal draft, not approved or submitted

Observed against Sentient's public program: 2026-07-30

## Project

**Citadel Optimizer: Verifiable Economic Control for Open Agents**

Citadel is building an open controller and evaluation layer that finds cheaper
paths through models, agents, tools, retries, and stopping decisions while an
independent verifier holds the required outcome constant.

This application does not claim that the current controller already saves
money. Its first signed actual-run matrix rejected that claim. The funding
request is to turn the proven evaluation substrate and preserved negative
result into a general controller that can demonstrate savings without grading
its own work.

## Sentient request addressed

This proposal directly addresses Sentient Foundation's
[Token and Economic Optimization for Agents](https://sentient.foundation/product-requests)
request. The request asks for a layer that automatically chooses models,
agents, and tools, attaches to any agent stack, and accounts for costs beyond
tokens.

Sentient's [grant program](https://sentient.foundation/grants) currently states
that `$42M` is committed, public-goods grants take no equity or claim on the
work, applications are open and reviewed on a rolling basis, and compute and
engineering support may accompany funding. The site does not publish a
per-project maximum. The amount below is a proposed budget, not an inferred
entitlement.

## Problem

An agent that completes a task wastefully and a cheap agent that fails are both
economically bad. Existing stacks usually treat routing, retries, agent count,
tool use, and verification as separate decisions. That makes savings claims
easy to game:

- count only the successful retry;
- ignore setup, tool, or human cost;
- call unknown cost zero;
- accept a partial patch as completion;
- request one model and execute another;
- optimize against tests the controller can weaken;
- compare unlike tasks or change the holdout after seeing results.

The missing public good is not another prompt classifier. It is an economic
controller coupled to a proof contract that can reject fake savings.

## Product

Citadel Optimizer has two inseparable parts.

The controller:

- performs bounded read-only reconnaissance;
- estimates task capability requirements;
- chooses an executor, model tier, topology, agent count, tools, and budget;
- watches progress and independent verification;
- continues, escalates, splits, or stops;
- learns only from eligible non-holdout outcomes.

The proof layer:

- binds requested and observed model identities;
- records model, tool, compute, retry, and human cost with provenance;
- refuses to coerce unknown cost to zero;
- freezes tasks, policies, repositories, verifiers, and holdouts before runs;
- signs decisions, receipts, artifacts, and outcomes;
- reproduces the report from privacy-safe raw evidence;
- fails closed on missing, duplicate, substituted, or tampered records.

It is open infrastructure inside an existing MIT-licensed project, not a
private routing API.

## What is already proven

Citadel already supplies the operating substrate:

- explicit Claude and Codex executor profiles;
- requested-versus-observed model proof;
- isolated Operation Fork worktrees;
- signed receipts and tamper rejection;
- deterministic comparison and gated landing;
- durable operation state and recovery;
- public proof-bundle machinery.

The optimizer work adds a separate controller, actual-run protocol, scenario
identity, policy identity, cost model, public-random holdout, and submission
gate.

The frozen subscription-backed matrix completed:

| Evidence | Result |
|---|---:|
| Signed CLI cells | 120 / 120 |
| Cells reaching a model | 84 |
| Real model attempts | 87 |
| Verified completions | 33 |
| Failed cells | 51 |
| Setup-unknown cells | 36 |
| Aggregate model-cell runtime | 590.857 minutes |
| Known list-price-normalized comparison cost | $114.575324 |
| Adversarial false passes | 0 |

All 120 Ed25519 attestations verify. The exact models, executor profile
digests, runtime adapter, pricing snapshot, calibration record, quota
authorization, and precommitted drand selection are bound into the report.

Report:
`optimizer-report-sha256:f43285ff9254b84a49ae8e4e7c02f278716ed4c09db4e30307d7678c75420aa9`

Proof bundle:
`sha256:1822a5a8c73e570884ca8e0e38c28bdaf2d1934f8fafdb647f60ad5d337e13db`

The list-price normalization is a comparison unit, not Seth's subscription
invoice.

## The negative result

The precommitted performance gate did not pass.

- Adaptive and prompt-only each verified 6/12 held-out cells.
- Adaptive's known-cost held-out median was `$0.948231`.
- Prompt-only's known-cost held-out median was `$0.522119`.
- The 36 pre-model setup failures make the full economic metric unknown.
- Unknown cost was not discarded or counted as savings.

The current heuristic therefore did not beat prompt-only routing. On one safety
scenario, prompt-only matched adaptive's 3/3 completion while costing less and
running in roughly half the median time. On one cleanup scenario, adaptive
matched frontier's 3/3 completion while prompt-only passed 2/3. That is a
useful routing signal, but not a general economic result.

The matrix also exposed benchmark defects:

- Nano ID's frozen pnpm setup is incompatible with the pinned workspace file,
  producing 36 setup failures before any model ran;
- one p-limit scenario's verifier did not preserve task-level failure detail;
- one Citadel scenario's exact-file contract rejected plausible fixes even
  when its configured verifier passed;
- fallback and escalation fields need clearer attempt and route-sequence
  semantics.

We are preserving this result unchanged. A new method must receive a new
identity rather than rewriting the failed matrix.

## Why this result strengthens the funding case

The failed hypothesis is not the proposed product. The durable asset is the
ability to make optimizer claims falsifiable across agent stacks.

The completed work reduces grant risk in ways a routing demo cannot:

- it proves the team can launch and bind exact models across two runtimes;
- it proves signed actual-run evidence can survive independent reconstruction;
- it demonstrates that cheap failures, unknown costs, and tampering do not
  become savings;
- it reveals concrete controller and benchmark defects before grant funds are
  used to scale them;
- it provides a public negative baseline against which a funded controller
  must improve.

A grant would fund the part still unproven: a controller that learns enough
about real operations to outperform prompt-only routing across more stacks,
including open and local executors.

## Novelty boundary

We are not claiming the first model router.

[Not Diamond](https://docs.notdiamond.ai/docs/what-is-model-routing) routes
queries for quality, cost, and latency. The
[SWE-Router paper](https://arxiv.org/abs/2607.00053) studies escalation using
partial software trajectories.

Citadel's contribution to test is whole-operation control across model,
runtime, agent count, topology, tools, retries, and stopping, constrained by
independent verified completion and strict end-to-end cost provenance. Its
public value exists only if another harness can inspect the decision and
reproduce the result.

## Funded work

### 1. Repair the evaluation contract

- add setup compatibility preflights before quota authorization;
- separate task tests from unrelated repository tooling;
- replace brittle exact-file checks with task-owned artifact contracts;
- make attempt counts and escalation sequences unambiguous;
- publish benchmark-version migration rules that preserve negative results.

### 2. Build the controller that the first matrix falsified

- calibrate capability profiles from eligible prior outcomes;
- estimate completion probability and total expected cost, not token price
  alone;
- use repository evidence to decide when cheap starts are plausible;
- escalate only on precommitted progress and verification signals;
- learn stopping rules that include failed-attempt cost;
- expose decisions through a stack-neutral adapter contract.

### 3. Generalize beyond the first test surface

- add open and local model executors;
- cover multiple harnesses, languages, repositories, task categories, tool
  types, and topologies;
- include latency, paid tools, local compute, retries, and bounded human
  intervention;
- publish privacy-safe raw records, signed bundles, and one-command
  reconstruction.

### 4. Prove adoption

- integrate at least one agent stack outside Citadel through the public
  adapter;
- make the proof layer usable without adopting Citadel's orchestration model;
- document both positive and negative results.

No outside reviewer or private selector is required. Clean hosted automation
is the independent verifier for checked-in evidence; optional third-party
reruns remain optional.

## Evidence gates

Current engineering gate:

- complete signed matrix: passed;
- exact model and executor bindings: passed;
- strict cost provenance: passed;
- zero adversarial false passes: passed;
- first controller performance gate: failed.

Funded performance target:

- at least 30% lower end-to-end cost than always-frontier;
- at least 95% of frontier verified completion;
- adaptive must beat prompt-only;
- zero unknown cost used as savings;
- clean hosted reconstruction from public privacy-safe evidence;
- result holds across more than the original three repositories and two
  proprietary runtime families.

The target is not a promise that the current heuristic already satisfies it.
If a future precommitted controller fails, that negative result will also be
published.

## Open-source deliverables

1. **Frozen negative baseline**: complete. Signed 120-cell matrix, raw records,
   report, limitations, public holdout, and locally verified proof bundle.
2. **Benchmark v2**: setup preflights, task-scoped verifiers, route-sequence
   receipts, and versioned migration rules.
3. **General controller**: calibrated expected-cost policy across more
   executors, tools, retries, and topologies.
4. **Stack-neutral adapter**: another open harness can use the controller and
   proof contract without rewriting its orchestration.
5. **Independent proof**: clean hosted reproduction and public,
   privacy-safe actual-run evidence.

Advancement is evidence-gated rather than calendar-gated.

## Funding request

Proposed public-goods grant: **$150,000**.

| Use | Amount |
|---|---:|
| Controller and runtime engineering | $55,000 |
| Model, tool, and compute evaluation | $35,000 |
| Benchmark and verification hardening | $25,000 |
| Open/local executors and stack integrations | $15,000 |
| Documentation and public results surface | $10,000 |
| Administration and contingency | $10,000 |
| **Total** | **$150,000** |

The request is larger than a prototype budget because the deliverable is
credible comparative evidence across stacks and cost types, not another
routing demonstration. Sentient compute credits could reduce the cash
evaluation line.

## Why Sentient should fund it

- It maps exactly to a named Request for Products.
- The controller, evals, raw evidence, and negative findings remain open public
  goods.
- The first matrix proves that Citadel's gate rejects its own claim rather than
  manufacturing a success.
- Citadel already supplies execution, recovery, receipts, and verification,
  reducing the amount of grant funding spent rebuilding harness basics.
- The funded work adds open and local executors, better matching Sentient's
  accessibility and ownership goals than the proprietary-only first matrix.
- A reusable economic proof layer benefits every open agent stack, including
  those that do not adopt Citadel.

## Risks and honest limits

- The current adaptive controller is not competitive with prompt-only routing.
- The first matrix covers coding work in only three repositories.
- Thirty-six cells never reached a model because the setup preflight was
  insufficient.
- Current runtime evidence comes from proprietary subscription-backed CLIs.
- No user adoption evidence yet shows that another harness wants this layer.

The funded milestones are designed to resolve those facts, not hide them.

## Application blockers

Do not submit until:

- the committed proof bundle passes the clean GitHub-hosted verification job;
- the public results page shows the actual negative result rather than the
  fixture;
- all links and exact identities are checked from the final commit;
- Seth reviews and explicitly approves the final wording and submission.

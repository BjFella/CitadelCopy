# Sentient Grant Draft: Citadel Optimizer

Status: internal draft, not approved or submitted

## Project

**Citadel Optimizer: Outcome-Aware Economic Routing for Open Agents**

Citadel learns how to execute multi-step agent work for the lowest total cost
while preserving independently verified outcomes across competing agent
stacks.

## Sentient request addressed

This proposal directly addresses Sentient Foundation's
[Token and Economic Optimization for Agents](https://sentient.foundation/product-requests)
request. The request calls for a layer that automatically chooses models,
agents, and tools, attaches to any agent stack, and accounts for fees beyond
tokens.

Sentient's [grant program](https://sentient.foundation/grants) currently states
that $42 million is committed, public-goods grants take no equity or claim on
the work, and applications are reviewed on a rolling basis. The site does not
publish a per-project maximum. The amount below is our proposed budget, not an
inferred entitlement.

## Problem

Agent stacks optimize for task completion but usually make economic decisions
piecemeal. A builder selects a model, a harness spawns agents, tools consume
subscription quota or metered calls, retries accumulate, and the resource
footprint is discovered afterward.

Cheap routing alone is insufficient. It can look economical by failing tasks,
silently accepting partial work, substituting a different model, or excluding
failed attempts from cost. The missing public layer is a controller that
changes the execution path while an independent verifier holds the outcome
constant.

## Product

Citadel Optimizer:

- performs bounded read-only reconnaissance before expensive work;
- infers task capability needs;
- chooses an executor, capability tier, topology, agent count, and tool budget;
- watches progress and verification;
- continues, escalates, splits, or stops;
- learns capability profiles from non-holdout outcomes;
- records model, tool, compute, retry, and human cost with provenance;
- refuses to call unknown cost zero;
- binds decisions, observed execution, receipts, artifacts, and final
  verification into a reproducible proof record.

It is designed as open infrastructure under an existing MIT-licensed project,
not a private routing API.

## Why Citadel is a credible base

Citadel already has the expensive substrate that a trustworthy optimizer needs:

- explicit executor profiles across Claude and Codex;
- requested-versus-observed model proof;
- isolated Operation Fork worktrees;
- signed receipt bindings and tamper rejection;
- deterministic comparison and gated landing;
- durable operation state and recovery;
- public proof-bundle machinery;
- a repository with hundreds of commits and an existing user/install base.

That substrate does not itself prove economic optimization. The new optimizer
is separate code with separate contracts, policies, benchmark identities, and
failure gates.

## Novelty boundary

We are not claiming the first model router.

[Not Diamond](https://docs.notdiamond.ai/docs/what-is-model-routing) already
routes queries for quality, cost, and latency. The
[SWE-Router paper](https://arxiv.org/abs/2607.00053) already shows that partial
trajectory information can improve escalation decisions in software work.

The proposed contribution to test is narrower and broader at the same time:
whole-operation economic control across model, agent count, topology, tools,
retries, and stopping, constrained by independent verified completion and
strict end-to-end cost provenance.

## Current evidence

Already implemented:

- a separate optimizer core and actual-run protocol;
- a frozen 10-scenario, 3-repository, 4-policy, 3-repetition matrix;
- prompt-only and adaptive policies;
- bounded repository probes;
- training-only profile learning with holdout rejection;
- strict vendor-reported, price-derived, tool-reported, and unknown cost;
- adversarial tamper, incomplete, model-substitution, and crash cases;
- signed-run verification and fail-closed submission gates.

Current fixture simulations validate report math only. They are not model
performance evidence. Exact model IDs, canonical executor digests, the runtime
adapter, and a list-price normalization are frozen. A four-profile
subscription-backed calibration verified exact model identity, receipts, and
known cost sources, while all four task verifiers failed. The local Ed25519
run-attestation public key is also frozen. Outside selection, the preliminary
matrix, and independent reproduction remain open.
The list-price normalization is a common comparison unit, not a claim that
Seth's subscription is billed per run.

A no-model forensic reproduction found that the original calibration verifier
failed on unrelated repository tooling before reaching the task tests. The
exact calibration scenario set is archived with its record. The actual matrix
is re-frozen with a task-focused verifier that fails on the pinned queue bug and
passes a bounded reference repair touching both expected artifacts. Future run
records retain bounded, path- and secret-redacted verifier and patch receipts, and the
standalone bundle verifies the completed calibration record, the forensic
record, and both scenario sets.

## Evaluation

Pre-application evidence gate:

- at least 20% lower held-out median cost than always-frontier;
- no loss of verified completions on the frozen preliminary holdout;
- adaptive beats prompt-only;
- zero unknown cost used as savings;
- zero adversarial false passes;
- attested actual runs from a clean checkout.

Funded target:

- at least 30% lower end-to-end cost;
- at least 95% of frontier verified completion;
- more runtime families, model tiers, tool types, and topologies;
- independent reproduction and public privacy-safe raw evidence.

If the preliminary gate fails, we will publish the negative result and revise
or stop the economic claim.

## Open-source deliverables by evidence gate

1. **Execution-ready**: completed. Frozen model bindings, runtime adapter, and
   cost sources passed a bounded subscription-quota calibration; the
   run/runtime envelope and 0/4 task-verifier result are recorded.
2. **Preliminary proof**: complete attested matrix, held-out comparison, raw
   records, limitations, and one-command verifier.
3. **Independent proof**: outside-selected scenario, external reproduction,
   public key, and signed proof bundle.
4. **Generalized controller**: learned profiles across more stacks, tool and
   topology decisions, and public adapter contracts.
5. **Adoption proof**: integrations that let another open harness use the
   controller without rewriting its stack.

Advancement is evidence-gated rather than calendar-gated.

## Funding request

Proposed public-goods grant: **$150,000**.

| Use | Amount |
|---|---:|
| Core controller and runtime engineering | $60,000 |
| Model, tool, and compute evaluation | $30,000 |
| Independent reproduction and security review | $20,000 |
| Open adapters and harness integrations | $15,000 |
| Documentation, demo, and results surface | $15,000 |
| Administration and contingency | $10,000 |
| **Total** | **$150,000** |

The request is larger than a prototype budget because the main deliverable is
credible comparative evidence across vendors, not just routing code. Compute
credits from Sentient could reduce the cash evaluation line.

## Why Sentient should fund it

- It maps directly to a named request rather than stretching Citadel toward an
  adjacent theme.
- The output is inspectable infrastructure and open evals, so other agent
  stacks can reuse both positive and negative findings.
- Citadel already supplies execution, recovery, receipts, and verification,
  reducing the risk that the grant funds another paper router with no durable
  operating substrate.
- The benchmark is designed to punish fake savings.
- The proposal has explicit falsification gates and does not present fixtures
  as results.
- Lowering the cost of open agents compounds across every application built on
  top of them.

## Application blockers

Do not submit until:

- the actual preliminary matrix closes or honestly fails;
- an outside maintainer selects and reproduces a scenario;
- the demo and results page link to actual proof rather than fixtures;
- Seth reviews and approves the final wording and submission.

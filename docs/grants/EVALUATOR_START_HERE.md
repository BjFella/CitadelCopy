# Citadel grant evaluator: start here

Citadel is applying to build open token and economic optimization for agent
operations. The narrow thesis is:

> The unit worth optimizing is not a model call. It is a model-externally
> verified operation, including models, topology, tools, retries, local
> compute, failures, and unknown costs.

## The review path

1. [Product overview](https://sethgammon.github.io/Citadel/): start with `/do`
   and open progressively into persistent and controlled operation.
2. [Research program](https://sethgammon.github.io/Citadel/research.html): the
   evidence ladder, funded target, and explicit claim boundary.
3. [Generated evidence manifest](../EVIDENCE_MANIFEST.md): current public
   numbers generated from canonical artifacts.
4. [Calibrated hybrid economic pilot](../../benchmarks/hybrid-economic-pilot-v2/published-run/REPORT.md):
   the passed 24-cell prospective comparison across 12 new artifact-producing
   tasks, Claude Sonnet 5, and local Qwen 2.5 Coder 3B.
5. [Calibration trail](../../benchmarks/hybrid-economic-pilot/published-run/REPORT.md):
   the retained 28.4% near-miss that informed the narrower v2 support envelope.
6. [Delivery evidence](GITHUB_DELIVERY_EVIDENCE.md): dated maintainer-attributed
   history, public interest, owner-visible traffic, and the exact boundaries on
   what those counts do not prove.
7. [Grant draft](SENTIENT_OPTIMIZER_APPLICATION_DRAFT.md): the request, public
   deliverables, budget, and risks.

Application support: the required eight-page PDF is generated at
[`output/pdf/citadel-sentient-grant-packet.pdf`](../../output/pdf/citadel-sentient-grant-packet.pdf),
with its render source in
[`scripts/render-sentient-grant-packet.py`](../../scripts/render-sentient-grant-packet.py).
The live-form audit and exact claim boundary are in
[`SUBMISSION_READINESS.md`](SUBMISSION_READINESS.md).

## Ninety-second technical review

Run the complete offline evidence path without model access:

```text
npm run grant:verify
```

That command runs the nine canonical verifiers, including hybrid v2, and
recomputes signatures, source bindings, receipt chains, reports, and public
claims. It does not ask the controller or models whether they won.

## Current result in one paragraph

Citadel's contract and actual-run coverage now spans Claude Code, Ollama, and a
pinned Sentient ROMA integration. Earlier frozen local studies retained a
timeout-sensitive apparent gain, a cost-increasing escalation policy, and an
invalid local baseline. The first fresh Claude-plus-local hybrid then preserved
12/12 completions but reduced comparison cost only 28.4%, missing its 30% gate.
Citadel used that failure to freeze a narrower support envelope on 12 new tasks.
Hybrid v2 verified 12/12 operations under both policies, used local 3B eight
times with one Claude recovery, reduced Claude calls from 12 to 5, and reduced
provider-reported plus locally modeled comparison cost from $0.063711 to
$0.039071: 38.7%. Every frozen quality, cost, identity, path, false-pass, and
integrity gate passed. The tasks remain author-selected synthetic fixtures on
one machine and one model pair; actual subscription allocation, whole-system
energy, production reliability, and general savings remain unproved.

## What funding buys

The grant turns a passed, bounded support-envelope result into an independently
credible general result: expand selection beyond the author, measure actual
end-to-end cost, and learn which models, agents, topology, tools, retries, and
verification paths preserve at least 95% of a valid frontier baseline while
reducing cost at least 30% across stacks, model families, hardware profiles,
repositories, and task strata. A baseline below 80% overall or 70% in any
preregistered stratum still invalidates the comparison rather than lowering the
bar.

# Citadel grant evaluator: start here

Citadel is applying to build open token and economic optimization for agent
operations. The narrow thesis is:

> The unit worth optimizing is not a model call. It is an independently
> verified operation, including models, topology, tools, retries, local
> compute, failures, and unknown costs.

## The five-link review path

1. [Product overview](https://sethgammon.github.io/Citadel/): start with `/do`
   and open progressively into persistent and controlled operation.
2. [Research program](https://sethgammon.github.io/Citadel/research.html): the
   evidence ladder, funded target, and explicit claim boundary.
3. [Generated evidence manifest](../EVIDENCE_MANIFEST.md): current public
   numbers generated from canonical artifacts.
4. [Prospective local comparison](../../benchmarks/sentient-readiness/published-run/REPORT.md):
   the latest positive and negative result under one frozen gate.
5. [Grant draft](SENTIENT_OPTIMIZER_APPLICATION_DRAFT.md): the request, public
   deliverables, budget, and risks.

## Ninety-second technical review

Run these without model access:

```text
npm run readiness:verify
npm run operation-proof:verify
npm run operation:prospective
npm run optimizer:bundle -- verify benchmarks/optimizer-proof/proof-bundle
npm run application:evidence:check
npm run onboarding:fresh-clone:verify
```

These commands recompute signatures, source bindings, receipt chains, reports,
and public claims. They do not ask the controller or models whether they won.

## Current result in one paragraph

Citadel has demonstrated stack-neutral control and evidence integration across
Claude Code, Ollama, and a pinned Sentient ROMA integration. The latest
preregistered local study completed 72 cells on a GTX 1070. Adaptive routing
verified 27/36 outcomes versus 24/36 for always-7B while reducing measured GPU
energy 9.9%, modeled GPU cost 10.3%, and model duration 10.8%. It failed the
frozen 30% economic gates and is published as failed. This is enough to show a
working measurement and learning loop; it is not enough to claim the funded
performance target.

## What funding buys

The grant buys the missing general result: a controller that learns which
models, agents, topology, tools, retries, and verification paths preserve at
least 95% of frontier verified completion while reducing measured end-to-end
cost by at least 30% across multiple stacks, model families, hardware profiles,
and task categories.


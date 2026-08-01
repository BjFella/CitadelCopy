# Citadel grant evaluator: start here

Citadel is applying to build open token and economic optimization for agent
operations. The narrow thesis is:

> The unit worth optimizing is not a model call. It is a model-externally
> verified operation, including models, topology, tools, retries, local
> compute, failures, and unknown costs.

## The five-link review path

1. [Product overview](https://sethgammon.github.io/Citadel/): start with `/do`
   and open progressively into persistent and controlled operation.
2. [Research program](https://sethgammon.github.io/Citadel/research.html): the
   evidence ladder, funded target, and explicit claim boundary.
3. [Generated evidence manifest](../EVIDENCE_MANIFEST.md): current public
   numbers generated from canonical artifacts.
4. [Representative repository-operation pilot](../../benchmarks/representative-operation-pilot-v2/published-run/REPORT.md):
   the latest 24-cell shakedown across six artifact-producing fixture tasks.
5. [Grant draft](SENTIENT_OPTIMIZER_APPLICATION_DRAFT.md): the request, public
   deliverables, budget, and risks.

## Ninety-second technical review

Run these without model access:

```text
npm run readiness:verify
npm run readiness:v2:verify
npm run representative:v2:verify
npm run operation-proof:verify
npm run operation:prospective
npm run optimizer:bundle -- verify benchmarks/optimizer-proof/proof-bundle
npm run application:evidence:check
npm run onboarding:fresh-clone:verify
```

These commands recompute signatures, source bindings, receipt chains, reports,
and public claims. They do not ask the controller or models whether they won.

## Current result in one paragraph

Citadel's contract-layer coverage spans Claude Code, Ollama, and a pinned
Sentient ROMA integration; external-stack adoption is demonstrated only with
ROMA. Two 72-cell local
exact-answer studies established the measurement and falsification loop, not a
savings result: v1's apparent savings reverse when one same-route timeout pair
is removed, and v2 matched baseline cell completion while using 15.7% more GPU
energy after verifier escalation. The latest 24-cell representative shakedown
then exercised six artifact-producing repository fixtures twice per policy.
Both policies verified 6/12 cells with zero false passes and zero path
violations. Citadel's profile used 7.1% less measured GPU energy, missing the
frozen 20% gate, while using 13.2% more tokens. The published result is failed.
Together these studies prove an auditable measurement and rejection loop; they
do not establish general quality, production reliability, or the funded
economic target.

## What funding buys

The grant buys the missing general result: a controller that learns which
models, agents, topology, tools, retries, and verification paths reach at least
80% absolute verified completion, preserve at least 95% of a valid frontier
baseline, and reduce measured end-to-end cost by at least 30% across multiple
stacks, model families, hardware profiles, and task categories. A frontier
baseline below 80% overall or 70% in any preregistered task stratum invalidates
the comparison rather than lowering the bar.

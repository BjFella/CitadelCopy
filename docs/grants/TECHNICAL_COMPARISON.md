# Technical comparison boundary

Citadel should not be described as a replacement for a coding agent, model
router, orchestrator, or evaluation framework. It composes with them.

| Layer | Primary decision | Typical proof | Citadel relationship |
|---|---|---|---|
| Coding agent | How to inspect and change a repository | Patch, tests, session transcript | Citadel supplies durable workflow, safeguards, recovery, and evidence around it |
| Model router | Which model handles a request | Quality/cost score for a call | Citadel can use the choice but measures the entire verified operation |
| Agent orchestrator | How tasks decompose and coordinate | Agent or workflow completion status | Citadel binds topology and limits, then independently checks the outcome |
| Observability platform | What calls, traces, and costs occurred | Telemetry and dashboards | Citadel binds observations to a declared plan and signed decision receipt |
| Evaluation harness | Did an output pass a benchmark? | Benchmark score | Citadel treats the verifier as a binding operational gate and retains failure cost |

## The differentiated contract

Citadel's research object is a tuple:

```text
declared operation plan
+ observed runtime, model, tool, topology, and cost facts
+ independently verified outcome
+ signed failure-preserving receipt
```

The controller may optimize only across outcomes that satisfy that contract.
A cheaper failure is not a saving, an absent cost is not zero, and a runtime's
self-reported completion does not settle the result.

## Defensible novelty

Citadel does not claim to have invented routing, orchestration, tracing,
verification, or signatures independently. The contribution is joining these
seams into an open operation-level optimization contract that can reject its
own economic claim. The published optimizer and ROMA failures demonstrate that
the rejection path is real.


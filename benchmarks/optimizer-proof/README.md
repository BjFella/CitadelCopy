# Citadel Optimizer Proof

This benchmark asks one narrow question:

> Can an open controller lower the total cost of multi-step agent work while
> preserving independently verified outcomes?

It is separate from `benchmarks/product-proof/`. The product-proof benchmark
compares bare and Citadel-assisted operation. Optimizer Proof compares economic
policies and must not rewrite, reinterpret, or reuse that frozen result.

## Frozen matrix

- 10 scenarios across Citadel, p-limit, and Nano ID
- 6 task categories
- 4 policies: always-frontier, always-cheap, prompt-only, and adaptive
- 3 repetitions per policy and scenario
- 120 actual runs when the matrix is authorized
- 4 holdout scenarios excluded from profile calibration
- 2 runtime families and 3 capability/cost tiers

The checked-in executor set binds exact public model IDs, the reviewed
self-contained runtime adapter, and the canonical Operation Fork executor
profile for each runtime/model pair. Calibration must still prove that the
authenticated accounts can launch those exact IDs and that runtime telemetry
reports the same identity.

## Evidence levels

`fixture-simulation` validates schemas, policy determinism, report math,
anti-tamper behavior, and the submission blockers. It is not evidence of model
quality or savings.

`actual-run` requires:

1. exact frozen models and bound executor profiles;
2. a checked-in outside scenario selection and Ed25519 public key;
3. runner-owned verification of changed artifacts and repository tests;
4. strict cost provenance;
5. a signed raw run record.

Unknown cost remains unknown. A failed or unknown outcome still contributes its
known spend and can never be counted as a saving.

## Commands

```bash
node scripts/optimizer-benchmark.js validate
node scripts/optimizer-benchmark.js doctor
node scripts/optimizer-benchmark.js plan \
  --scenario p-limit-short-clear-queue \
  --policy adaptive \
  --fixture-probe
node scripts/optimizer-benchmark.js fixture --output <raw.jsonl>
node scripts/optimizer-benchmark.js report \
  --input <raw.jsonl> \
  --output <report.json>
node scripts/optimizer-proof-bundle.js build \
  --raw <raw.jsonl> \
  --report <report.json> \
  --output <bundle-directory>
node scripts/optimizer-proof-bundle.js verify <bundle-directory>
node scripts/test-optimizer.js
```

`--fixture-probe` is visibly synthetic. A real adaptive plan requires
`--repository <checked-out-path>`.

## Frozen identities

- Scenario set:
  `optimizer-scenarios-sha256:d9e0a9eab6c005ae8fdabbc69696397cecab2a0f45009b88357c989818103a7a`
- Executor set:
  `optimizer-executors-sha256:00f184d107a29f367a1cbfabea7ec01e1893692398f30afcdad2bcb400ded750`
- Metric set:
  `optimizer-metrics-sha256:bedffbda2b18d725610b0f294a8273ef908237fd957bf9e51a5af4885b123e4f`
- Pricing snapshot:
  `sha256:25b513c37e29469432a02426ef9fee93c190489cfada0548ae6c3376ec4b5ae1`

The source commits were confirmed from the public GitHub repositories on
2026-07-29 and are pinned in each scenario manifest.

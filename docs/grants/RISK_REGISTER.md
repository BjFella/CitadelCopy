# Citadel grant risk register

| Risk | Why it could invalidate the result | Mitigation and evidence |
|---|---|---|
| Benchmark overfitting | A router can look efficient on tasks used to design it | Separate calibration and holdout sets; freeze before execution; preserve failed studies |
| Cherry-picked reruns | Retrying only failures manufactures a stronger aggregate | Intent-before-cell ledger; immutable cell paths; ambiguous runs are unknown and never retried automatically |
| Weak or correlated verifier | The same model can reward its own mistake | Deterministic repository or answer gates where possible; different-family arbiter only for irreducible judgment; publish verifier identity |
| Model substitution | Requested and actual runtime paths can differ | Requested/observed reconciliation, exact manifest IDs, provider receipts, fail-closed unknown state |
| Missing costs | Token-only accounting hides tools, retries, local compute, and people | Separate actual, marginal, market-equivalent, energy, amortization, setup, and human lenses |
| Local hardware generalization | One GTX 1070 result may not transfer | Funded benchmark spans hardware profiles; current result is labeled single-machine |
| Provider and model drift | Hosted defaults and model IDs change | Pin public commits and explicit models; record runtime version and observed identity |
| Setup and survivorship bias | Failed installations disappear from the sample | Preflight and setup failures remain terminal unknowns; fresh-clone proof is separately versioned |
| Verifier leakage | Expected answers or tests can enter model context | Digest-only expected answers; isolated workspaces; exact source bindings |
| Evidence tampering | Reports can be edited after a run | Content-addressed artifacts, receipt chains, Ed25519 signatures, offline reconstruction |
| Privacy leakage | Raw prompts, paths, logs, or secrets can become public | Bounded output, path and secret redaction, privacy-safe public bundles, local-first telemetry |
| Controller overhead | Coordination and verification can cost more than they save | Include controller, verifier, retry, and model-load overhead; publish failed economic gates |
| Single-maintainer continuity | Public infrastructure can stagnate | MIT licensing, versioned contracts, reproducible releases, contributor docs, adapter conformance suite |
| Misleading product complexity | Research surfaces can obscure first value | Keep `/do` and `/do next` primary; advanced control remains progressive and optional |

## Stop conditions

Citadel must refuse a savings claim when completion quality falls below the
frozen floor, any material cost component required by the comparison is
unknown, model identity is not observed, the verifier changes after execution,
or artifact/signature reconstruction fails.


# Independent reproduction

This procedure lets an outside maintainer produce the separately signed
`actual-run` required by the submission gate. It is not part of the local
120-cell matrix.

## Before consuming quota

The reproducer should use the exact public commit containing the frozen outside
selection. First run:

```bash
node scripts/optimizer-benchmark.js doctor
node scripts/optimizer-benchmark.js reproduction-plan
```

`reproduction-plan` makes no model calls. It reports the selected scenario,
the fixed `adaptive` policy, and the minimum and maximum call/runtime envelope.
It remains blocked until outside selection is frozen.

Create a fresh Ed25519 key outside the repository:

```bash
node scripts/optimizer-attestation-key.js \
  --private <private-key-path> \
  --public <public-key-path>
```

Keep the private key private. Arrange a public HTTPS provenance page for the
reproduction record before the run, and confirm that the selected runtime
accounts may consume the reported subscription quota. Citadel rejects the
local matrix signing key; the reproducer must generate a distinct key pair.

## Run once

```bash
node scripts/optimizer-benchmark.js reproduce \
  --signing-key <private-key-path> \
  --reproduced-by <public-identity> \
  --source <https-provenance-url> \
  --output external-reproduction.json \
  --acknowledge-external-quota
```

The acknowledgement is mandatory. The command runs only the outside-selected
scenario with the frozen adaptive policy and refuses to overwrite an existing
record. It validates identity, source URL, key type, freeze readiness, and
output writability before invoking a model.

Publish the privacy-safe record at the declared provenance URL. The output
contains the reproducer's public key, a signed run, bounded path- and
secret-redacted verifier output, and bounded patch evidence. It must not contain
the private key.

## Owner verification and binding

After receiving the record:

```bash
node scripts/optimizer-benchmark.js verify-reproduction \
  --input external-reproduction.json
node scripts/optimizer-benchmark.js freeze-reproduction \
  --input external-reproduction.json \
  --output freeze.reproduction-candidate.json
```

Both commands make no model calls. Review the candidate freeze; the only new
value should be `external_reproduction_digest`. Copy the verified record to
`benchmarks/optimizer-proof/external-reproduction.json`, adopt the candidate
freeze through a reviewed commit, then rebuild and verify the proof bundle.

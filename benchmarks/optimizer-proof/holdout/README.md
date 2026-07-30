# Holdout policy

Holdouts are declared in the frozen scenario manifests and repeated in
`freeze.json`. They may be evaluated by a calibrated policy, but their outcomes
must never be passed to `learnCapabilityProfiles()`.

Before actual runs, a future public-randomness beacon committed after the
runner and method are public selects one of the already frozen holdouts. The
selection source, round, method, and record digest are frozen before the local
matrix. The exact request and selection workflow is in
[`EXTERNAL_SELECTION.md`](EXTERNAL_SELECTION.md).

Independent reproduction is a second gate. The reproducer supplies a
privacy-safe actual run signed by their own Ed25519 key. Citadel verifies the
run, selected scenario, signature, signer separation, and content digest. A
selector URL alone cannot satisfy the reproduction gate. The quota-bounded
outside workflow is in
[`EXTERNAL_REPRODUCTION.md`](EXTERNAL_REPRODUCTION.md).

Current holdout selection: **`citadel-short-executor-proof`**, selected by
precommitted drand round `6333716` and bound by selection digest
`sha256:234e805981ef070475960905f65243fa01fbfffa7b7e7babf39ee3dc982f3de1`.

The exact machine-bound request is
[`external-selection-request.json`](external-selection-request.json). It
produced the checked-in
[`../external-selection.json`](../external-selection.json) record before any
local matrix run. No human selector was required.

Current outside reproduction: **not collected**.

# Holdout policy

Holdouts are declared in the frozen scenario manifests and repeated in
`freeze.json`. They may be evaluated by a calibrated policy, but their outcomes
must never be passed to `learnCapabilityProfiles()`.

Before actual runs, an outside maintainer must select one of the already frozen
holdouts after the runner and method are public. The selection source, date,
and selector are frozen independently from the local matrix signer. The exact
request and response workflow is in
[`EXTERNAL_SELECTION.md`](EXTERNAL_SELECTION.md).

Independent reproduction is a second gate. The reproducer supplies a
privacy-safe actual run signed by their own Ed25519 key. Citadel verifies the
run, selected scenario, signature, signer separation, and content digest. A
selector URL alone cannot satisfy the reproduction gate. The quota-bounded
outside workflow is in
[`EXTERNAL_REPRODUCTION.md`](EXTERNAL_REPRODUCTION.md).

Current outside selection: **request published; response not collected**.

The exact machine-bound request is
[`external-selection-request.json`](external-selection-request.json). It must
receive a public HTTPS response before the local matrix is run.

Current outside reproduction: **not collected**.

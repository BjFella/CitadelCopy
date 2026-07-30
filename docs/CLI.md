# Citadel package CLI

Citadel can be invoked from a local checkout today and is structured for a conventional package-registry install once the package is published:

```sh
npx citadel@latest adopt plan /path/to/Citadel --target .
```

Until registry publication is verified, run the same entrypoint from a checkout:

```sh
node bin/citadel.js adopt plan /path/to/Citadel --target .
```

## Governed adoption

The public project-lifecycle surface is `citadel adopt`. Plan commands are
read-only unless `--out` is explicitly requested. Apply commands consume the
exact saved plan and confirmation token.

```sh
citadel adopt plan /path/to/Citadel --target . \
  --project-runtime codex --out citadel-adoption.plan.json --json
citadel adopt apply citadel-adoption.plan.json --confirm TOKEN --json
citadel adopt doctor --target . --json
```

`citadel install` remains a one-major runtime-package compatibility adapter.
It is not the authority for footprint ownership, update, rollback, or exit.

`citadel install` selects a runtime in this order:

1. `--runtime claude|codex`
2. `CITADEL_RUNTIME`
3. A single `.claude/` or `.codex/` project marker
4. A single available `claude` or `codex` command

If both runtimes are available, Citadel stops and asks for `--runtime`. It does not choose silently.

```sh
citadel install --runtime codex --dry-run --json
citadel install --runtime claude --project-root /path/to/project
```

Arguments are passed to the existing runtime installer as an argv array. The
CLI does not interpolate a shell command. Project owners should still create a
governed adoption receipt before relying on exact update or leave.

## Maintenance

```sh
citadel doctor --json
citadel update plan /path/to/Citadel-v2 --migration migration.json \
  --target . --out citadel-update.plan.json --json
citadel update apply citadel-update.plan.json --confirm TOKEN --json
citadel rollback plan --target . --out citadel-rollback.plan.json --json
citadel rollback apply citadel-rollback.plan.json --confirm TOKEN --json
citadel uninstall /path/to/project --dry-run --json
citadel uninstall --apply --plan citadel-leave.plan.json --confirm TOKEN --json
```

`update` and `rollback` accept only `plan|apply` and route through the adoption
core. The lower-level release-archive script is not exposed as a public package
mutation route. `uninstall` is a compatibility alias for receipt-owned leave:
its default is a no-write plan, and apply requires a saved leave plan. Legacy
installs first use `citadel adopt import plan`; unknown ownership never becomes
a successful removal.

## Config, governance, control plane, and product proof

```sh
citadel config show --project-root . --json
citadel config enable parallel --project-root .          # plan only
citadel config enable parallel --project-root . --apply

citadel governance evaluate --input gate.json --project-root .
citadel governance authorize --project-root . \
  --subject-kind fleet-task --subject-id session-1-task-4 \
  --subject-digest sha256:<digest> --subject-generation 1 \
  --disposition merge

citadel control-plane conformance
citadel control-plane stdio --state state.json \
  --authority-keys authority-keys.json --proof-private-key proof.pem \
  --proof-key-id proof-key-1 --proof-issuer-id citadel-installation \
  --installation-id installation-1

citadel trial plan --spec trial.json
npm run test:governed-lifecycle
```

Every product surface consumes the same effective config receipt. Disabled,
unavailable, stale, or malformed authority blocks execution with a bounded
activation plan. Governance authorization is read-only; work-queue status,
transport success, or dashboard projection cannot authorize merge.

## Operation Fork

Run one objective through Claude Code and Codex from the same commit:

```sh
citadel fork start "Find and eliminate the authentication race"
citadel fork status fork-find-and-eliminate-the-authentication-race
citadel fork compare fork-find-and-eliminate-the-authentication-race
```

The default workflow verifies `git diff --check`. Supply `--workflow FILE` to declare
project-specific steps and a verifier as `{ "command": "npm", "args": ["test"] }`.
Commands are always executed as literal argument arrays with `shell: false`.

Compare explicit models and providers, including several profiles on one runtime,
with an executor file:

```sh
citadel fork start "Find and eliminate the authentication race" \
  --executors examples/executors.json
```

`--executors` and `--runtimes` are mutually exclusive. A profile may select only a
registered runtime, a model, an allowlisted local provider, and the adapter options
in `docs/EXECUTOR_PROFILES.md`. It can never supply an executable, arguments,
environment values, or paths.

```sh
citadel fork select ID --branch branch-claude --expected-revision 6 \
  --idempotency-key choose-claude-001
citadel fork land plan ID
citadel fork land apply ID --expected-revision 7 --target-revision SHA \
  --confirm TOKEN --idempotency-key land-claude-001
citadel fork replay ID --output replay.json
```

Selection never lands code. `land plan` returns the current target revision, clean-state
result, and one exact token. `land apply` rechecks all three before a local merge. It never
pushes, publishes, tags, deploys, or bypasses branch protection. An ambiguous merge effect
blocks recovery and is not repeated.

## Packs and receipts

`citadel pack` manages the local certified Pack index and lifecycle. `citadel journey` starts or completes a Pack as an Operations Protocol run, and `citadel receipt verify` checks its execution receipt offline. Missing evidence remains `unknown`.

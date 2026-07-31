# Privacy

Citadel runs entirely on your machine. It does not collect, transmit, or sell
any data.

- By default, state lives in your repository under `.planning/` and `.claude/`
  or `.codex/`. Nothing is sent anywhere by Citadel itself.
- Telemetry (cost, hook timing, audit records) is written to local JSONL files
  in `.planning/telemetry/`. It never leaves your machine unless you run the
  optional OTLP exporter, which sends metrics only to the endpoint you specify.
- Model API calls are made by your runtime (Claude Code or OpenAI Codex) under
  your own account and their respective privacy policies. Citadel adds no
  additional services, accounts, or network calls.
- The interactive demo site is static and sets no cookies.

## Optional cross-clone memory

On Node.js 22.13+, `citadel memory enable` creates a local user-level SQLite
database so durable lessons can survive deletion of a clone. It is disabled by
default and never makes a network request.

- Only completed campaigns, postmortems, research, discoveries, backlog
  Markdown, and `.citadel/project.md` are eligible.
- Active campaigns, worktree and fleet state, telemetry, consent, runtime
  configuration, credentials, and hook settings are excluded.
- The database stores a SHA-256 repository key, relative paths, content, content
  digests, timestamps, and preserved versions. It does not store the raw remote
  URL or clone path as identity metadata. Because eligible documents are stored
  verbatim, their text may itself contain paths, URLs, or other private context.
- `citadel memory disable` stops sync and restore without deleting history.
  `citadel memory purge --confirm PURGE` deletes the current repository's rows.

See [Cross-clone repository memory](docs/REPOSITORY_MEMORY.md).

## Real User Proof v2

The v2 trial store is local under `.planning/product-proof/v2/` and is ignored
by Git by default. Exact schemas reject prompts, paths, repository names,
commands/output, source, diffs, usernames, email, credentials, tokens, and
secrets. Detailed signed receipts remain local.

`share-preview` creates an aggregate-only file, suppresses cells smaller than
five, and makes no network request. Sharing remains a separate manual choice.
`purge` removes only the v2 trial store inside the selected project; it does not
remove application files or other `.planning` state.

Questions: open an issue at https://github.com/SethGammon/Citadel/issues.

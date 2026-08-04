# Deploy steward paired local experiment

Outcome: **local_pass_external_promotion_blocked**

Fake provider and deterministic local state-machine evidence only; not GitHub branch protection, GitHub Actions, GitHub API race, public artifact, or real deployment evidence.

| Metric | Independent loops | Leased steward |
|---|---:|---:|
| Landed PRs | 45/45 | 45/45 |
| Deploys | 45 | 45 |
| Race failures | 315 | 0 |
| Stale-head attempts | 315 | 0 |
| Stale-head merges | 0 | 0 |
| Branch updates | 315 | 42 |
| Repair tasks | 0 | 0 |

## Public arm readiness

Status: **blocked**

- [ ] authority: explicit_mutation_approval
- [ ] infrastructure: authenticated_github
- [ ] infrastructure: disposable_protected_repositories
- [ ] infrastructure: github_actions

Raw evidence SHA-256: `f43a30d07df500cd0206d3451cea20a261e02756bc872772256dc6cc61a9cf27`

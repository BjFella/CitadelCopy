# Canonical milestone plan and budget

Proposed public-goods grant: **$150,000 over nine months**. This is the only
budget table application materials may reproduce. The amount, applicant
availability, and legal recipient remain unconfirmed until Seth approves the
final application.

## Cost basis

| Cost basis | Quantity | Amount |
|---|---:|---:|
| Maintainer engineering and research labor | 9 months, one proposed full-time maintainer, blended $11,000/month | $99,000 |
| Local hardware, provider inference, tool execution, and benchmark compute | Capped direct-cost pool; invoices and allocation rules published | $27,000 |
| Hosted CI, artifact storage, site, and reproducibility infrastructure | Nine-month build plus 12-month post-grant maintenance reserve | $7,000 |
| Documentation, accessibility, compatibility fixtures, and release packaging | Fixed work package | $7,000 |
| Bounded opt-in operator cohort | Honoraria for 15-20 external operators; attempted installs and failures included | $2,000 |
| Bounded contingency | Maximum 5.33%; unused funds remain unspent or are reallocated only with funder approval | $8,000 |
| **Total** |  | **$150,000** |

No outside reviewer or contractor is assumed in this budget. The only external
participation is a bounded, opt-in 15-20 person operator cohort with disclosed
honoraria. If the funder requires an independent audit, its scope and funding
must be added explicitly rather than silently taken from benchmark compute.

## Milestones, dependencies, and acceptance gates

| Milestone | Months | Depends on | Public acceptance gate | Allocation |
|---|---:|---|---|---:|
| 1. Representative workload and economic closure | 1-2 | Current signed calibration artifacts | At least 60 unique, artifact-producing repository operations are defined across five task strata; repeat trials are not counted as independent tasks; cost components are measured or explicitly unknown | $30,000 |
| 2. Adapter and conformance SDK | 2-4 | M1 operation schema and task contract | ROMA plus two additional open stacks satisfy one versioned contract for requested/observed identity, tools, artifacts, attempts, model-external verdicts, failure preservation, and cost lenses | $28,000 |
| 3. Expected verified-operation controller | 4-6 | M1 data and M2 adapters | Held-out routing decisions are reproducible; the controller prices likely verification, escalation, and recovery; zero adversarial false passes | $35,000 |
| 4. Multi-stack prospective evaluation | 6-8 | M1-M3 frozen release candidate | Always frontier first clears the baseline-validity floor: at least 80% verified overall and 70% in every preregistered task stratum. Citadel then must reach at least 80% absolute verified completion, at least 95% of that valid frontier rate, and at least 30% lower measured end-to-end cost, with cluster-aware uncertainty; every negative and unknown cell is published | $32,000 |
| 5. Public proof, beginner path, and maintenance release | 8-9 | M4 terminal result | One command reconstructs reports from signed raw evidence; clean hosted verification passes; `/do` onboarding, adapter docs, governance, compatibility, and accessibility gates pass; a bounded opt-in cohort of 15-20 external operators reports governed first-operation completion with every attempted install and setup failure retained | $25,000 |
| **Total** |  |  |  | **$150,000** |

Allocation reconciles to the cost basis: $99,000 labor, $27,000 compute and
tools, $7,000 hosted infrastructure, $7,000 release/accessibility work, $2,000
operator-cohort honoraria, and $8,000 contingency. Milestone allocations are
scheduling envelopes, not a second budget.

## Tranches and go/no-go rules

1. **Tranche A — $45,000:** M1 plus the initial M2 schema. Continue only if the
   representative workload, baseline matrix, measurement boundary, and adapter
   contract are frozen and publicly reconstructable.
2. **Tranche B — $60,000:** remaining M2 and M3. Continue only if at least three
   stacks can emit conformant receipts and the controller can be evaluated
   without changing the stacks' native planning logic.
3. **Tranche C — $45,000:** M4 and M5. Release the final tranche after the
   evaluation candidate, task split, statistical plan, and gates are frozen.

If a go/no-go rule fails, the terminal deliverable is the public negative
result, failure analysis, reusable data/contracts, and unused-funds accounting.

## One baseline matrix

Every applicable unique task is evaluated against:

1. **Always frontier** — primary quality and economic comparator.
2. **Stack-native default** — adoption-cost diagnostic.
3. **Prompt-only strong/weak router** — routing diagnostic.
4. **Strongest applicable open/local profile** — accessibility diagnostic.
5. **Citadel adaptive** — treatment policy.

The primary pass condition is fixed. First, always frontier must verify at least
80% of unique operations overall and at least 70% in every preregistered task
stratum. If it does not, the benchmark is baseline-invalid and diagnostic; task
or verifier repair creates a new benchmark identity. Against a valid frontier
baseline, Citadel adaptive must verify at least 80% of operations overall,
retain at least 95% of frontier's verified-operation rate, and use at least 30%
less measured end-to-end cost. Diagnostic baselines are reported even when they
do not govern the primary gate. In particular, paired prompt-only differences
are reported but are not a pass condition.

## Statistical contract

- Minimum 60 unique tasks; repetitions estimate runtime variance and are never
  presented as independent task successes.
- Stratify by repository, task family, agent stack, model family, and hardware.
- Report task-level completion, paired cost deltas, medians, distributions, and
  cluster-bootstrap confidence intervals grouped by unique task/repository.
- Precommit missing-data, timeout, setup-failure, and outlier sensitivity rules.
- Treat an always-frontier result below 80% overall or below 70% in any frozen
  task stratum as a baseline-invalid diagnostic, never as an easier denominator.
- Zero false passes, signature failures, chain failures, or identity
  substitutions are required.
- Any post-result task, verifier, metric, or threshold change creates a new
  benchmark identity and preserves the prior result.
- The operator cohort measures adoption and onboarding separately. Its outcomes
  do not alter or govern the optimizer performance gate.

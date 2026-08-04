# Citadel JudgeEval report

- Observation status: `observed`
- Claim status: `instrument_only`
- External promotion: `blocked_external`
- Cases: 8
- Receipt: `sha256:3daed220757d1df12d05e9080bee7bec50e23d4eb0571cf5c6913a06025d3ffd`

This report verifies an evaluation instrument. It is not a passed Citadel product claim. Missing or malformed judge output remains `unknown`.

## control

| gold \ predicted | accept | block | unknown |
|---|---:|---:|---:|
| accept | 2 | 0 | 0 |
| block | 0 | 2 | 3 |
| unknown | 0 | 0 | 1 |

- False-accept: 0/5 (0.0%)
- False-block: 0/2 (0.0%)
- Unknown rate: 50.0%
- pass@1: 62.5%
- pass^3: unknown
- Latency ms mean/p50/p95: unknown / unknown / unknown
- Cost USD total/mean: unknown / unknown

## treatment

| gold \ predicted | accept | block | unknown |
|---|---:|---:|---:|
| accept | 2 | 0 | 0 |
| block | 0 | 5 | 0 |
| unknown | 0 | 0 | 1 |

- False-accept: 0/5 (0.0%)
- False-block: 0/2 (0.0%)
- Unknown rate: 12.5%
- pass@1: 100.0%
- pass^3: unknown
- Latency ms mean/p50/p95: unknown / unknown / unknown
- Cost USD total/mean: unknown / unknown

## External promotion gates

- [x] outputs_observed
- [ ] labels_human_calibrated
- [ ] judges_human_calibrated
- [ ] pinned_strong_models
- [ ] different_model_families
- [ ] three_trials_per_case
- [x] all_outputs_observed
- [x] treatment_false_accept_rate_lte_0_05
- [ ] false_accept_improvement_gte_0_20
- [x] true_accept_loss_lte_0_10

Remaining gates: labels_human_calibrated, judges_human_calibrated, pinned_strong_models, different_model_families, three_trials_per_case, false_accept_improvement_gte_0_20


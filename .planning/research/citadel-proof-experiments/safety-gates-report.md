# Citadel safety-gate decision-boundary experiment

> This is a local decision-boundary experiment. It did not execute dangerous commands,
> did not perform a real exploit, and does not establish cross-OS behavior.

Outcome: **passed**

| Metric | Control | Treatment | Required |
|---|---:|---:|---:|
| Malicious true-positive rate | 0 | 1 | 1 |
| Benign false-positive rate | 0 | 0 | 0 |
| Canary effects | 0 | 0 | 0 |
| Unknown to pass | 0 | 0 | 0 |

Raw evidence: 12 case records across 6 matched pairs.
Treatment latency p95: 130684000 ns (local observation only).

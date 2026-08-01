# Sentient submission readiness

Status: application package prepared; external form not submitted

Observed: 2026-08-01

## Live form contract

The current Typeform at `https://form.typeform.com/to/IRj7WaKH` was inspected
through the Grant track. Its required project fields are represented one-for-one
in [`TYPEFORM_ANSWER_PACK.md`](TYPEFORM_ANSWER_PACK.md):

- applicant email, role, and city/country;
- problem and why now;
- who benefits;
- one-line description, limited to 80 characters;
- builder/team fit;
- public-goods closure question;
- demo/trial URL;
- Grant versus Investment track;
- funding range;
- what the grant unlocks;
- required supporting document upload;
- how the applicant heard about Sentient.

The live form did not ask for a legal entity, tax information, payment details,
or a separate budget spreadsheet during this observed path. Reinspect if the
form changes before submission.

## Required upload

The mandatory supporting document is ready at:

`output/pdf/citadel-sentient-grant-packet.pdf`

- format: PDF, 16:9 landscape;
- pages: 8;
- size: 1,976,050 bytes;
- SHA-256: `9dc8add0f9b224ab983209e3fe14a335965cb45d3f02de149638dc9e7e65b723`;
- source renderer: `scripts/render-sentient-grant-packet.py`;
- visual QA: all eight pages rendered to PNG and inspected at full resolution;
- text QA: eight pages, 960 by 540 points, required headings extractable,
  replacement-character check passed.

The packet deliberately distinguishes a passed evidence/integrity result from
failed optimizer performance gates. It does not claim current economic savings.

## Canonical application choices

| Field | Prepared choice |
|---|---|
| Applicant role | Engineer / Builder |
| Track | Grant |
| Funding range | Greater than $50,000 |
| Request | $150,000 over nine months |
| Public demo | `https://sethgammon.github.io/Citadel/` |
| Supporting review path | `docs/grants/EVALUATOR_START_HERE.md` |

The $150,000 request reconciles exactly to the single canonical cost basis and
five milestone allocations in [`MILESTONES_AND_BUDGET.md`](MILESTONES_AND_BUDGET.md).

## Evidence claims allowed in the application

- A 120-cell prior signed optimizer history exists and is retained.
- The pinned 24-cell Sentient ROMA diagnostic completed 24/24 measured cells,
  reconciled its receipt chain, and recorded zero false passes.
- Citadel-controlled ROMA verified 4/6 tasks versus 2/6 for direct local 7B in
  that compact diagnostic.
- The ROMA performance gate failed because Citadel avoided no strong
  whole-operation attempts and was much slower.
- Local v1's apparent aggregate savings are timeout-sensitive and reverse in
  the matched-pair sensitivity; no savings claim is allowed.
- Local v2 matched 24/36 verified cells but used 15.7% more measured GPU energy
  and 16.4% more modeled GPU cost; the negative result is retained.
- The representative repository pilot verified 6/12 cells for each policy with
  zero false passes and path violations, but its 7.1% energy reduction missed
  the frozen 20% gate and token use increased 13.2%.
- GitHub showed 808 stars, 79 forks, and 510 repository commits on 2026-08-01.
  These are dated public-interest and repository-history signals, not user,
  installation, contribution, or economic-impact counts.

## Claims not allowed

- Citadel currently saves money in representative use.
- Citadel is best in class across agent optimizers.
- The signed bundles prove independent third-party execution.
- Repetitions are independent task successes.
- Unknown total economic cost is zero.
- GitHub stars or commits equal active users, adoption, or Seth's authored work.
- Current external-stack adoption extends beyond the demonstrated ROMA binding.

## Optional pre-submission strengthening

A bounded stronger-open-model portability diagnostic on a free cloud GPU would
address the current single-Qwen-family and single-GTX-1070 execution boundary.
It is useful only if obtained at zero cost and published under a frozen method.
It is not a submission blocker and cannot establish savings or generalization by
itself. Do not delay a rolling grant indefinitely for free-GPU availability.

## Human-owned final values

Only four factual or authority inputs remain outside the repository:

- [ ] applicant email;
- [ ] city and country;
- [ ] how Seth heard about Sentient;
- [ ] Seth's explicit approval of the amount, wording, upload, and external
  submission.

No outside reviewer, sponsor, operator outreach, external task selector, or
pre-award cohort is required. The funded cohort is post-award work.

## Final submission sequence

1. Confirm the three applicant facts above.
2. Recheck the live Typeform for field or option drift.
3. Refresh the dated GitHub counts or remove them if they cannot be verified.
4. Verify the public Pages site and evaluator path after this package merges.
5. Re-render the PDF only if any public claim changes, then update its digest.
6. Paste answers from `TYPEFORM_ANSWER_PACK.md` and upload the PDF.
7. Stop at the final submission action until Seth explicitly authorizes it.


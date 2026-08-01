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
- required supporting document upload.

The combined form definition contains a later `How did you hear about this
program` field, but the current Grant-branch logic jumps from the supporting
document field to the grant thank-you screen. That field belongs outside the
observed Grant path and is not an applicant blocker. Recheck the branch logic,
not only the combined field inventory, if the form changes.

Run `npm run application:form:check` immediately before the final form pass.
The read-only check fetches the public definition, verifies all 13 required
Grant inputs and their types, confirms the 80-character limit and funding
choices, proves the upload-to-thank-you branch, and requires a matching answer
surface without entering or submitting response data.

Observed live Grant contract fingerprint on 2026-08-01:
`sha256:611739716b3eb5ad7b16a2e93778f91b9b8cc06ff5ffcbe2eb843c4683544dcd`.
Any mismatch is a review stop, not an instruction to update the digest blindly.

The live form did not ask for a legal entity, tax information, payment details,
or a separate budget spreadsheet during this observed path. Reinspect if the
form changes before submission.

## Required upload

The mandatory supporting document is ready at:

`output/pdf/citadel-sentient-grant-packet.pdf`

- format: PDF, 16:9 landscape;
- pages: 8;
- size: 971,050 bytes;
- SHA-256: `019dbef9189d6727f9417676ce6a6a766b8535854b997eef15cceab8776ebdf9`;
- source renderer: `scripts/render-sentient-grant-packet.py`;
- visual QA: all eight pages rendered to PNG and inspected at both 72 and 96
  DPI, including the normal-viewer scale that exposed the original legibility
  problem;
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
- [ ] confirmation that `Engineer / Builder` is the correct role selection;
- [ ] Seth's explicit approval of the amount, wording, upload, and external
  submission.

No outside reviewer, sponsor, operator outreach, external task selector, or
pre-award cohort is required. The funded cohort is post-award work.

## Final submission sequence

1. Confirm the two applicant facts and role selection above.
2. Run `npm run application:form:check` to reject live field, option, or branch
   drift.
3. Refresh the dated GitHub counts or remove them if they cannot be verified.
4. Verify the public Pages site and evaluator path after this package merges.
5. Re-render the PDF only if any public claim changes, then update its digest.
6. Paste answers from `TYPEFORM_ANSWER_PACK.md` and upload the PDF.
7. Stop at the final submission action until Seth explicitly authorizes it.

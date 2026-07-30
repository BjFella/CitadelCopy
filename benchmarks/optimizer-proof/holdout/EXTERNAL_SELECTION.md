# Outside holdout selection

This procedure creates a public, machine-bound holdout choice without exposing
performance results or consuming model quota.

## Owner procedure

Do this only after the frozen runner and method are publicly accessible.

1. Generate the exact request:

   ```bash
   node scripts/optimizer-benchmark.js selection-request \
     --output external-selection-request.json
   ```

2. Publish `external-selection-request.json`. Do not run or disclose any
   holdout or matrix outcomes before the choice.
3. Ask one person who is not the local matrix signer to select exactly one ID
   from `holdout_scenario_ids`.
4. Require a public HTTPS response that states the request ID, scenario-set ID,
   selected scenario, selector identity, and selection date.
5. Save those six fields as `external-selection-response.json`.
6. Generate, but do not silently adopt, a candidate freeze:

   ```bash
   node scripts/optimizer-benchmark.js freeze-selection \
     --input external-selection-response.json \
     --output freeze.selection-candidate.json
   ```

7. Review the candidate against `benchmarks/optimizer-proof/freeze.json`.
   The only changed field should be `external_scenario`. Replace the checked-in
   freeze through the normal reviewed commit workflow.

`selection-request` and `freeze-selection` make no model calls and refuse to
overwrite output files.

## Response contract

The response JSON must contain exactly these fields:

- `request_id`: the ID in the published request;
- `scenario_set_id`: the frozen scenario-set ID in that request;
- `scenario_id`: one of the request's four holdout IDs;
- `selected_by`: the outside selector's stable public identity;
- `selected_at`: the selection date in `YYYY-MM-DD`;
- `selection_source`: the public HTTPS page containing the selection.

Citadel rejects a response for another request, a non-holdout scenario, a
selection predating the freeze, incomplete provenance, or extra fields.

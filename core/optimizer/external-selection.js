'use strict';

const {
  canonical,
  digest,
  exactFields,
  scenarioSetIdentity,
} = require('./contracts');

const REQUEST_FIELDS = Object.freeze([
  'schema',
  'kind',
  'request_id',
  'scenario_set_id',
  'frozen_at',
  'holdout_scenario_ids',
  'constraints',
  'response_fields',
]);
const CONSTRAINT_FIELDS = Object.freeze([
  'outside_selector_required',
  'select_exactly',
  'selection_before_local_matrix',
  'holdout_results_disclosed',
  'selection_source_must_be_https',
]);
const RESPONSE_FIELDS = Object.freeze([
  'request_id',
  'scenario_set_id',
  'scenario_id',
  'selected_by',
  'selected_at',
  'selection_source',
]);
const FROZEN_SELECTION_FIELDS = Object.freeze([
  'scenario_id',
  'selected_by',
  'selected_at',
  'selection_source',
]);

function requestPayload(freeze) {
  return {
    schema: 1,
    kind: 'citadel_optimizer_external_selection_request',
    request_id: null,
    scenario_set_id: freeze.scenario_set_id,
    frozen_at: freeze.frozen_at,
    holdout_scenario_ids: [...freeze.holdout_scenario_ids],
    constraints: {
      outside_selector_required: true,
      select_exactly: 1,
      selection_before_local_matrix: true,
      holdout_results_disclosed: false,
      selection_source_must_be_https: true,
    },
    response_fields: [...RESPONSE_FIELDS],
  };
}

function buildExternalSelectionRequest(freeze, scenarios) {
  if (freeze.scenario_set_id !== scenarioSetIdentity(scenarios)) {
    throw new Error('External selection request requires the frozen scenario set');
  }
  const payload = requestPayload(freeze);
  return validateExternalSelectionRequest({
    ...payload,
    request_id: digest(payload),
  }, freeze, scenarios);
}

function validateExternalSelectionRequest(value, freeze, scenarios) {
  if (!exactFields(value, REQUEST_FIELDS)
    || value.schema !== 1
    || value.kind !== 'citadel_optimizer_external_selection_request') {
    throw new Error('External selection request identity or fields are invalid');
  }
  if (value.scenario_set_id !== scenarioSetIdentity(scenarios)
    || value.scenario_set_id !== freeze.scenario_set_id
    || value.frozen_at !== freeze.frozen_at
    || canonical(value.holdout_scenario_ids) !== canonical(freeze.holdout_scenario_ids)) {
    throw new Error('External selection request does not bind the freeze');
  }
  if (!exactFields(value.constraints, CONSTRAINT_FIELDS)
    || value.constraints.outside_selector_required !== true
    || value.constraints.select_exactly !== 1
    || value.constraints.selection_before_local_matrix !== true
    || value.constraints.holdout_results_disclosed !== false
    || value.constraints.selection_source_must_be_https !== true
    || canonical(value.response_fields) !== canonical(RESPONSE_FIELDS)) {
    throw new Error('External selection request constraints are invalid');
  }
  const unsigned = { ...value, request_id: null };
  if (value.request_id !== digest(unsigned)) {
    throw new Error('External selection request ID does not bind the request');
  }
  return value;
}

function validateExternalSelectionResponse(value, request, freeze, scenarios) {
  validateExternalSelectionRequest(request, freeze, scenarios);
  if (!exactFields(value, RESPONSE_FIELDS)
    || value.request_id !== request.request_id
    || value.scenario_set_id !== request.scenario_set_id) {
    throw new Error('External selection response does not bind the request');
  }
  if (!request.holdout_scenario_ids.includes(value.scenario_id)) {
    throw new Error('External selection response must select a frozen holdout');
  }
  if (typeof value.selected_by !== 'string' || !value.selected_by.trim()
    || !/^\d{4}-\d{2}-\d{2}$/.test(value.selected_at)
    || value.selected_at < freeze.frozen_at
    || typeof value.selection_source !== 'string'
    || !/^https:\/\//.test(value.selection_source)) {
    throw new Error('External selection response provenance is invalid');
  }
  return value;
}

function frozenSelectionFromResponse(value, request, freeze, scenarios) {
  const response = validateExternalSelectionResponse(value, request, freeze, scenarios);
  const selection = Object.fromEntries(FROZEN_SELECTION_FIELDS.map((field) => [
    field,
    response[field],
  ]));
  if (!exactFields(selection, FROZEN_SELECTION_FIELDS)) {
    throw new Error('Frozen external selection fields are invalid');
  }
  return selection;
}

module.exports = Object.freeze({
  RESPONSE_FIELDS,
  buildExternalSelectionRequest,
  frozenSelectionFromResponse,
  validateExternalSelectionRequest,
  validateExternalSelectionResponse,
});

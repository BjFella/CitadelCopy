'use strict';

const { canonical, exactFields } = require('./contracts');

const PLAN_FIELDS = Object.freeze([
  'schema',
  'kind',
  'scenario_ids',
  'profile_ids',
  'runs_per_pair',
  'total_runs',
  'no_holdouts',
  'access_basis',
  'quota_budget',
  'approval_status',
  'quota_acknowledged',
  'approved_by',
  'approved_at',
  'record_digest',
]);
const QUOTA_BUDGET_FIELDS = Object.freeze([
  'max_cli_runs',
  'max_runtime_minutes',
]);

function validateCalibrationPlan(value, scenarios, executors, source = 'calibration plan') {
  if (!exactFields(value, PLAN_FIELDS)
    || value.schema !== 1
    || value.kind !== 'citadel_optimizer_calibration_plan') {
    throw new Error(`${source} identity or fields are invalid`);
  }
  if (!Array.isArray(value.scenario_ids)
    || value.scenario_ids.length < 3
    || new Set(value.scenario_ids).size !== value.scenario_ids.length) {
    throw new Error(`${source}.scenario_ids is invalid`);
  }
  const scenarioMap = new Map(scenarios.map((scenario) => [scenario.id, scenario]));
  if (value.scenario_ids.some((id) => !scenarioMap.has(id))) throw new Error(`${source} references an unknown scenario`);
  if (value.no_holdouts !== true
    || value.scenario_ids.some((id) => scenarioMap.get(id).holdout)) {
    throw new Error(`${source} may not use holdouts`);
  }
  const expectedProfiles = executors.map((executor) => executor.profile_id).sort();
  if (!Array.isArray(value.profile_ids)
    || canonical([...value.profile_ids].sort()) !== canonical(expectedProfiles)) {
    throw new Error(`${source}.profile_ids must include every frozen executor`);
  }
  if (!Number.isInteger(value.runs_per_pair) || value.runs_per_pair !== 1) {
    throw new Error(`${source}.runs_per_pair must be 1`);
  }
  if (value.total_runs !== value.scenario_ids.length * value.profile_ids.length) {
    throw new Error(`${source}.total_runs mismatch`);
  }
  if (value.access_basis !== 'subscription') {
    throw new Error(`${source}.access_basis must be subscription`);
  }
  const maxRuntimeMinutes = value.scenario_ids.reduce(
    (total, id) => total + scenarioMap.get(id).timeout_minutes,
    0,
  ) * value.profile_ids.length * value.runs_per_pair;
  if (!exactFields(value.quota_budget, QUOTA_BUDGET_FIELDS)
    || value.quota_budget.max_cli_runs !== value.total_runs
    || value.quota_budget.max_runtime_minutes !== maxRuntimeMinutes) {
    throw new Error(`${source}.quota_budget must match the frozen run and runtime limits`);
  }
  if (!['pending', 'approved', 'completed'].includes(value.approval_status)) {
    throw new Error(`${source}.approval_status is invalid`);
  }
  if (value.approval_status === 'pending') {
    if (value.quota_acknowledged !== false
      || value.approved_by !== null
      || value.approved_at !== null
      || value.record_digest !== null) {
      throw new Error(`${source} pending approval cannot carry approval or evidence`);
    }
  } else {
    if (value.quota_acknowledged !== true
      || typeof value.approved_by !== 'string' || !value.approved_by.trim()
      || typeof value.approved_at !== 'string' || !Number.isFinite(Date.parse(value.approved_at))) {
      throw new Error(`${source} approved calibration requires subscription quota acknowledgement and approver`);
    }
    if (value.approval_status === 'approved' && value.record_digest !== null) {
      throw new Error(`${source} approved calibration cannot claim a completed record`);
    }
    if (value.approval_status === 'completed'
      && (typeof value.record_digest !== 'string' || !/^sha256:[0-9a-f]{64}$/.test(value.record_digest))) {
      throw new Error(`${source} completed calibration requires a record digest`);
    }
  }
  return value;
}

module.exports = Object.freeze({
  PLAN_FIELDS,
  QUOTA_BUDGET_FIELDS,
  validateCalibrationPlan,
});

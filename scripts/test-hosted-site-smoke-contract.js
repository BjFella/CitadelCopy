#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'scripts', 'hosted-site-smoke.js'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'hosted-pages-smoke.yml'), 'utf8');
for (const page of ['/', '/evidence.html', '/operation-control.html', '/optimizer.html', '/research.html', '/walkthrough.html']) assert(script.includes(`path: '${page}'`), `hosted smoke is missing ${page}`);
for (const gate of ['scrollY', 'active', 'scrollWidth', 'canonical', 'ogImage', 'consoleErrors', 'aria-expanded', 'LOCAL_RELEASE.source_digest', 'site-release-manifest.json']) assert(script.includes(gate), `hosted smoke is missing ${gate}`);
assert(workflow.includes('workflow_run:'));
assert(workflow.includes('schedule:'));
assert(workflow.includes('playwright@1.55.0'));
assert(workflow.includes('node scripts/hosted-site-smoke.js'));
process.stdout.write('hosted site smoke contract passed\n');

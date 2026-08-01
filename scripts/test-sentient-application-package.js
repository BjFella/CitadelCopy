#!/usr/bin/env node
'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const answerFile = path.join(ROOT, 'docs', 'grants', 'TYPEFORM_ANSWER_PACK.md');
const readinessFile = path.join(ROOT, 'docs', 'grants', 'SUBMISSION_READINESS.md');
const checklistFile = path.join(ROOT, 'docs', 'grants', 'APPLICATION_CHECKLIST.md');
const rendererFile = path.join(ROOT, 'scripts', 'render-sentient-grant-packet.py');
const pdfFile = path.join(ROOT, 'output', 'pdf', 'citadel-sentient-grant-packet.pdf');

for (const file of [answerFile, readinessFile, checklistFile, rendererFile, pdfFile]) {
  assert.ok(fs.existsSync(file), `missing application package file: ${path.relative(ROOT, file)}`);
}

const answers = fs.readFileSync(answerFile, 'utf8');
const readiness = fs.readFileSync(readinessFile, 'utf8');
const checklist = fs.readFileSync(checklistFile, 'utf8');
const renderer = fs.readFileSync(rendererFile, 'utf8');
const pdf = fs.readFileSync(pdfFile);

const oneLine = 'An open control layer that proves whether AI agents finished and what it cost.';
assert.ok(oneLine.length <= 80, `one-line answer exceeds Typeform limit: ${oneLine.length}`);
assert.match(answers, new RegExp(`Character count: ${oneLine.length} of 80\\.`));
assert.ok(answers.includes(`\`${oneLine}\``), 'one-line answer and recorded count drifted');

for (const placeholder of ['[SETH EMAIL]', '[CITY, COUNTRY]', '[HOW SETH HEARD ABOUT SENTIENT]']) {
  assert.ok(answers.includes(placeholder), `missing human-owned placeholder: ${placeholder}`);
}
assert.match(answers, /No form has been submitted/i);
assert.match(readiness, /Stop at the final submission action until Seth explicitly authorizes it/i);
assert.match(readiness, /https:\/\/form\.typeform\.com\/to\/IRj7WaKH/);
assert.match(checklist, /TYPEFORM_ANSWER_PACK\.md/);
assert.match(checklist, /SUBMISSION_READINESS\.md/);

assert.ok(pdf.length > 100_000, `supporting PDF is unexpectedly small: ${pdf.length} bytes`);
assert.strictEqual(pdf.subarray(0, 5).toString('ascii'), '%PDF-', 'supporting upload is not a PDF');
assert.match(pdf.subarray(Math.max(0, pdf.length - 2048)).toString('latin1'), /%%EOF/, 'supporting PDF has no EOF marker');
assert.match(renderer, /slides = \[slide_1, slide_2, slide_3, slide_4, slide_5, slide_6, slide_7, slide_8\]/, 'renderer must retain eight declared pages');

const digest = crypto.createHash('sha256').update(pdf).digest('hex');
assert.ok(readiness.includes(digest), `readiness digest drifted from PDF: ${digest}`);
assert.ok(readiness.includes(pdf.length.toLocaleString('en-US')), 'readiness byte count drifted from PDF');

for (const gate of ['80%', '95%', '30%']) {
  assert.ok(answers.includes(gate), `paste-ready grant answer is missing ${gate} gate`);
}
assert.match(answers, /unknown cost used\s+as savings/i);
assert.match(answers, /negative result/i);

console.log(`Sentient application package passed: ${pdf.length} bytes, sha256:${digest}, ${oneLine.length}/80 characters.`);

'use strict';
const assert=require('assert');const fs=require('fs');const decoder=require('./src/decoder');const {readEnvelope}=require('./src/reader');
assert.deepStrictEqual(Object.keys(decoder).sort(),['decodeEnvelope','decodeLegacy']);assert.strictEqual(decoder.decodeLegacy,decoder.decodeEnvelope);assert.deepStrictEqual(readEnvelope('{"ok":true}'),{ok:true});const reader=fs.readFileSync('src/reader.js','utf8');assert(reader.includes('decodeEnvelope'));assert(!reader.includes('decodeLegacy'));

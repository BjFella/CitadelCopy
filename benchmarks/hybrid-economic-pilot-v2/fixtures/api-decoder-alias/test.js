'use strict';
const assert=require('assert');const decoder=require('./src/decoder');const {readEnvelope}=require('./src/reader');
assert.strictEqual(decoder.decodeLegacy,decoder.decodeEnvelope);assert.deepStrictEqual(readEnvelope('{"ok":true}'),{ok:true});

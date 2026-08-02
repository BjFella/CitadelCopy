'use strict';
const assert=require('assert');const {isAllowedContentType}=require('./src/content-type');
assert.strictEqual(isAllowedContentType('application/json'),true);assert.strictEqual(isAllowedContentType('Application/JSON; charset=utf-8'),true);assert.strictEqual(isAllowedContentType('application/jsonp'),false);

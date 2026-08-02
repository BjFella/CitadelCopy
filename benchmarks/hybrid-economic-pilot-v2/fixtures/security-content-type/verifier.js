'use strict';
const assert=require('assert');const {isAllowedContentType}=require('./src/content-type');
for(const value of ['application/json',' Application/JSON ','application/json; charset=utf-8','application/json;charset=UTF-8'])assert.strictEqual(isAllowedContentType(value),true);
for(const value of ['application/jsonp','text/json','application/json; charset=ascii','application/json; boundary=x','',null,4])assert.strictEqual(isAllowedContentType(value),false);

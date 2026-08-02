'use strict';
function isRelativeResource(value){return typeof value==='string'&&value.length>0&&!value.startsWith('/');}
module.exports={isRelativeResource};

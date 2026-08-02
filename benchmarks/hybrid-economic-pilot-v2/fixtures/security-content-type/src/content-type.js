'use strict';
function isAllowedContentType(value){return typeof value==='string'&&value.trim().toLowerCase().startsWith('application/json');}
module.exports={isAllowedContentType};

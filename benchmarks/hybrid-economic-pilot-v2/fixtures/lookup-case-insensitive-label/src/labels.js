'use strict';
function findLabel(labels,key){if(!Array.isArray(labels)||typeof key!=='string')return null;const found=labels.find(label=>label.key===key);return found?found.value:null;}
module.exports={findLabel};

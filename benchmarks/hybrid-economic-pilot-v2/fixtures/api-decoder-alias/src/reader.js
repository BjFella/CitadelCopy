'use strict';
const {decodeLegacy}=require('./decoder');
function readEnvelope(text){return decodeLegacy(text);}
module.exports={readEnvelope};

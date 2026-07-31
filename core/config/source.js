'use strict';

const fs = require('fs');
const path = require('path');
const { sha256Digest } = require('../operations/canonical');

function digestSource(exists, raw, bytes, parseError) {
  if (!exists) return sha256Digest(null);
  if (parseError) {
    return sha256Digest({
      kind: 'invalid-json',
      bytes,
    });
  }
  return sha256Digest(raw);
}

function readConfigFile(projectRoot, options = {}) {
  const root = path.resolve(projectRoot || process.cwd());
  const configPath = options.configPath
    ? path.resolve(root, options.configPath)
    : path.join(root, '.claude', 'harness.json');
  if (!fs.existsSync(configPath)) {
    return Object.freeze({
      projectRoot: root,
      configPath,
      exists: false,
      bytes: null,
      raw: undefined,
      parseError: null,
      sourceDigest: digestSource(false),
    });
  }
  const bytes = fs.readFileSync(configPath, 'utf8');
  try {
    const raw = JSON.parse(bytes);
    return Object.freeze({
      projectRoot: root,
      configPath,
      exists: true,
      bytes,
      raw,
      parseError: null,
      sourceDigest: digestSource(true, raw, bytes, null),
    });
  } catch (error) {
    return Object.freeze({
      projectRoot: root,
      configPath,
      exists: true,
      bytes,
      raw: undefined,
      parseError: error.message,
      sourceDigest: digestSource(true, undefined, bytes, error.message),
    });
  }
}

module.exports = Object.freeze({
  digestSource,
  readConfigFile,
});

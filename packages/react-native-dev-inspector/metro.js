/**
 * Subpath shim so `require('react-native-dev-inspector/metro')` resolves
 * without relying on package "exports" support (Metro often has
 * `unstable_enablePackageExports` disabled).
 */
module.exports = require('./dist/metro.js');

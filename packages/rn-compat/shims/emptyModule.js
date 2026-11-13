/**
 * Empty module placeholder. The rn-compat resolver maps optional peer
 * dependencies (expo-dev-menu / expo-dev-client) here when they are not
 * installed, so core's `try { require('expo-dev-menu') } catch {}`
 * degrades to a no-op instead of Metro's runtime-throwing stub.
 */
module.exports = {};

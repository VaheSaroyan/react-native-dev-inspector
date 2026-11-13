/**
 * Query-string construction for the open-in-editor endpoints.
 *
 * Kept free of any `react-native` import so it can be unit tested in plain
 * Node — the bug this module guards against only shows up on specific RN
 * versions and went unnoticed precisely because it was untestable.
 */

import type { CodeInfo } from './fiber';

/**
 * Build the query string for the editor endpoint.
 *
 * `URLSearchParams` cannot be feature-detected with `typeof`. React Native
 * 0.72 and earlier ship a polyfill (Libraries/Blob/URL.js) that defines
 * `set()` on the prototype and then throws "URLSearchParams.set is not
 * implemented" when you call it, so a `typeof params.set === 'function'`
 * check is a false positive and open-in-editor dies with an unhandled error.
 *
 * The probe therefore has to be behavioural: actually build the string, and
 * fall back to manual encoding if anything throws.
 *
 * Credit: diagnosed by @junjie-z666 in PR #2.
 */
export function buildEditorQueryString(codeInfo: CodeInfo, editor?: string): string {
  // Use absolutePath if available, otherwise relativePath
  const file = codeInfo.absolutePath || codeInfo.relativePath;

  const entries: Array<[string, string | number | undefined]> = [
    ['file', file],
    ['line', codeInfo.lineNumber],
    ['column', codeInfo.columnNumber],
    ['editor', editor],
  ];

  const present = entries.filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  );

  const Params = (globalThis as any).URLSearchParams;
  if (typeof Params === 'function') {
    try {
      const params = new Params();
      for (const [key, value] of present) {
        params.set(key, String(value));
      }
      const queryString = params.toString();
      if (typeof queryString === 'string') {
        return queryString;
      }
    } catch {
      // Polyfill is present but not functional - fall through.
    }
  }

  return present
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

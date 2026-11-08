/**
 * @rn-dev-inspector/rn-compat — runtime patch entry
 *
 * Decoupled from withInspectorCompat (the build-time resolver adaptation in
 * metro.config.js). This file collects side-effect polyfills for "runtime API
 * gaps on older RN".
 * Usage (already imported by default by the umbrella package
 * react-native-dev-inspector, no manual import needed):
 *
 *   import '@rn-dev-inspector/rn-compat/dist/runtime';
 *
 * Constraint: the build output of this file gets bundled into any RN project,
 * so it must stay ES5-compatible (plain for loops, no destructuring/spread/
 * async) to avoid tsc downleveling to @babel/runtime helpers — rn-compat is a
 * zero-runtime-dependency config package that may not resolve in every
 * project. Each patch must feature-detect and only fill in what is missing;
 * it is a no-op on Node/newer RN.
 */

/**
 * URLSearchParams polyfill for RN <= 0.72 (react-native/Libraries/Blob/URL.js):
 * only get/getAll/has/append exist; set() throws outright with
 * "URLSearchParams.set is not implemented". The inspector's Open-in-editor
 * needs set() to build the query string, so the missing write methods are
 * filled in here with WHATWG semantics.
 */
function patchURLSearchParams(): void {
  const ParamsAny = (globalThis as any).URLSearchParams;
  if (typeof ParamsAny !== 'function') return;
  const proto = ParamsAny.prototype;

  // Behavioral probe: RN 0.72's polyfill "has" set() on its prototype, but
  // calling it throws "URLSearchParams.set is not implemented" — a typeof
  // check alone would be a false positive.
  let setWorks = false;
  try {
    const probe = new ParamsAny('a=1');
    probe.set('a', '2');
    setWorks = probe.toString() === 'a=2';
  } catch {
    setWorks = false;
  }

  // set: replace the first same-name entry (keeping order), or append at the end
  if (!setWorks) {
    proto.set = function set(name: string, value: string): void {
      name = String(name);
      value = String(value);
      const hasGet = typeof this.get === 'function';
      if (hasGet && this.get(name) === null) {
        this.append(name, value);
        return;
      }
      const internal = this._searchParams;
      if (Array.isArray(internal)) {
        let replaced = false;
        const kept: any[] = [];
        for (let i = 0; i < internal.length; i++) {
          const pair = internal[i];
          if (pair && pair.name === name) {
            if (!replaced) {
              pair.value = value;
              replaced = true;
              kept.push(pair);
            }
          } else {
            kept.push(pair);
          }
        }
        this._searchParams = kept;
      } else {
        // Unknown internal structure: cannot replace precisely when get()
        // returns a value, degrade to append (get() returns the first
        // same-name entry, so the result is still correct)
        this.append(name, value);
      }
    };
  }

  if (typeof proto.delete !== 'function') {
    proto.delete = function deleteParam(name: string): void {
      const internal = this._searchParams;
      if (Array.isArray(internal)) {
        const kept: any[] = [];
        for (let i = 0; i < internal.length; i++) {
          const pair = internal[i];
          if (!(pair && pair.name === String(name))) kept.push(pair);
        }
        this._searchParams = kept;
      }
    };
  }
}

patchURLSearchParams();

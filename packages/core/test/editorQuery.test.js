/**
 * Tests for open-in-editor query-string construction.
 *
 * Run with: pnpm --filter @rn-dev-inspector/core test
 *
 * These exercise the hostile `URLSearchParams` implementations that ship with
 * older React Native versions. The module under test deliberately imports no
 * `react-native` code so it can run in plain Node.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { buildEditorQueryString } = require('../dist/editorQuery.js');

const CODE_INFO = {
  relativePath: 'src/App.tsx',
  absolutePath: '/proj/src/App.tsx',
  lineNumber: 42,
  columnNumber: 7,
  componentName: 'App',
};

/** Swap in a fake global URLSearchParams for the duration of `fn`. */
function withURLSearchParams(impl, fn) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'URLSearchParams');
  if (impl === undefined) {
    delete globalThis.URLSearchParams;
  } else {
    Object.defineProperty(globalThis, 'URLSearchParams', {
      value: impl,
      configurable: true,
      writable: true,
    });
  }
  try {
    return fn();
  } finally {
    if (original) Object.defineProperty(globalThis, 'URLSearchParams', original);
    else delete globalThis.URLSearchParams;
  }
}

function parse(queryString) {
  const out = {};
  for (const pair of queryString.split('&')) {
    if (!pair) continue;
    const [k, v] = pair.split('=');
    out[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }
  return out;
}

test('builds the expected parameters with a working URLSearchParams', () => {
  const out = parse(buildEditorQueryString(CODE_INFO, 'code'));
  assert.equal(out.file, '/proj/src/App.tsx');
  assert.equal(out.line, '42');
  assert.equal(out.column, '7');
  assert.equal(out.editor, 'code');
});

test('prefers absolutePath, falls back to relativePath', () => {
  const relOnly = { ...CODE_INFO, absolutePath: undefined };
  assert.equal(parse(buildEditorQueryString(relOnly)).file, 'src/App.tsx');
});

test('omits absent line, column and editor', () => {
  const out = parse(
    buildEditorQueryString({ relativePath: 'a.tsx', componentName: 'A' })
  );
  assert.deepEqual(Object.keys(out), ['file']);
});

// --- the RN <= 0.72 regression -------------------------------------------
// Its polyfill defines set() on the prototype and throws when called, so a
// `typeof set === 'function'` guard passes and open-in-editor dies.

class ThrowingURLSearchParams {
  set() {
    throw new Error('URLSearchParams.set is not implemented');
  }
  toString() {
    return '';
  }
}

test('survives a URLSearchParams whose set() throws (RN <= 0.72)', () => {
  withURLSearchParams(ThrowingURLSearchParams, () => {
    assert.equal(
      typeof ThrowingURLSearchParams.prototype.set,
      'function',
      'precondition: a typeof check would wrongly pass'
    );
    const out = parse(buildEditorQueryString(CODE_INFO, 'code'));
    assert.equal(out.file, '/proj/src/App.tsx');
    assert.equal(out.line, '42');
    assert.equal(out.column, '7');
    assert.equal(out.editor, 'code');
  });
});

test('survives URLSearchParams being absent entirely', () => {
  withURLSearchParams(undefined, () => {
    const out = parse(buildEditorQueryString(CODE_INFO, 'code'));
    assert.equal(out.file, '/proj/src/App.tsx');
    assert.equal(out.line, '42');
  });
});

test('survives a constructor that throws', () => {
  const Exploding = function () {
    throw new Error('nope');
  };
  withURLSearchParams(Exploding, () => {
    assert.equal(parse(buildEditorQueryString(CODE_INFO)).file, '/proj/src/App.tsx');
  });
});

test('survives toString() returning a non-string', () => {
  class WeirdParams {
    set() {}
    toString() {
      return undefined;
    }
  }
  withURLSearchParams(WeirdParams, () => {
    assert.equal(parse(buildEditorQueryString(CODE_INFO)).file, '/proj/src/App.tsx');
  });
});

test('the fallback percent-encodes values', () => {
  withURLSearchParams(undefined, () => {
    const info = {
      relativePath: 'src/my components/A B.tsx',
      lineNumber: 1,
      componentName: 'A',
    };
    const qs = buildEditorQueryString(info);
    assert.ok(!qs.includes(' '), `query string must not contain raw spaces: ${qs}`);
    assert.equal(parse(qs).file, 'src/my components/A B.tsx');
  });
});

test('the fallback encodes & and = inside a path', () => {
  withURLSearchParams(undefined, () => {
    const info = { relativePath: 'src/a&b=c.tsx', lineNumber: 2, componentName: 'A' };
    const qs = buildEditorQueryString(info);
    assert.equal(parse(qs).file, 'src/a&b=c.tsx');
    assert.equal(parse(qs).line, '2');
  });
});

test('both paths produce equivalent results', () => {
  const native = parse(buildEditorQueryString(CODE_INFO, 'cursor'));
  const fallback = withURLSearchParams(undefined, () =>
    parse(buildEditorQueryString(CODE_INFO, 'cursor'))
  );
  assert.deepEqual(fallback, native);
});

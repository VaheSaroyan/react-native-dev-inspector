/**
 * Tests for source-location resolution in getCodeInfoFromFiber.
 *
 * Run with: pnpm --filter @rn-dev-inspector/core test
 *
 * The babel plugin writes three markers on an element's props:
 *   dataInspectorSource — where the element is written
 *   __callerSource      — where the owning component was used
 *   testID              — may be hijacked by the plugin's "component root
 *                         forwarding", which replaces it with the enclosing
 *                         component's call site
 *
 * dataInspectorSource must win: the forwarded testID points at an ancestor and
 * used to make a Text render at line 83 report its parent's call site (line 45).
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { getCodeInfoFromFiber } = require('../dist/fiber.js');

/** Minimal Fabric-ish composite fiber: only what getCodeInfoFromFiber reads. */
function fiberWithProps(props, type = 'Text') {
  return { tag: 5, type, memoizedProps: props };
}

test('prefers dataInspectorSource over a forwarded testID', () => {
  const fiber = fiberWithProps({
    testID: 'TopHeader@src/app/onboarding.tsx:45:32',
    dataInspectorSource: 'Text@src/app/onboarding.tsx:83:7',
  });

  const info = getCodeInfoFromFiber(fiber);
  assert.equal(info.relativePath, 'src/app/onboarding.tsx');
  assert.equal(info.lineNumber, 83);
  assert.equal(info.columnNumber, 7);
});

test('uses a parseable testID when no dataInspectorSource exists', () => {
  const fiber = fiberWithProps({ testID: 'CustomButton@src/screens/Home.tsx:12:5' });

  const info = getCodeInfoFromFiber(fiber);
  assert.equal(info.lineNumber, 12);
  assert.equal(info.componentName, 'CustomButton');
});

test('uses __callerSource when only the legacy markers are present', () => {
  const fiber = fiberWithProps({
    __callerSource: 'Card@src/screens/Home.tsx:20:3',
    testID: 'Card@src/components/Card.tsx:8:1',
  });

  const info = getCodeInfoFromFiber(fiber);
  assert.equal(info.lineNumber, 20);
});

test('parses object-form __callerSource (metro-plugin built-in plugin)', () => {
  const fiber = fiberWithProps({
    __callerSource: { fileName: 'src/screens/Home.tsx', lineNumber: 31, columnNumber: 2 },
  });

  const info = getCodeInfoFromFiber(fiber);
  assert.equal(info.relativePath, 'src/screens/Home.tsx');
  assert.equal(info.lineNumber, 31);
});

test('falls back to _debugSource when no injected marker exists', () => {
  const fiber = fiberWithProps({}, 'View');
  fiber._debugSource = { fileName: 'src/legacy/App.js', lineNumber: 9, columnNumber: 4 };

  const info = getCodeInfoFromFiber(fiber);
  assert.equal(info.relativePath, 'src/legacy/App.js');
  assert.equal(info.lineNumber, 9);
});

test('returns null when nothing is available', () => {
  assert.equal(getCodeInfoFromFiber(fiberWithProps({})), null);
});

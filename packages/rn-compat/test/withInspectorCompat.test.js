/**
 * Tests for withInspectorCompat (pure Node config-time logic).
 *
 * Run with: pnpm --filter @rn-dev-inspector/rn-compat test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { withInspectorCompat } = require('../dist/index.js');

// The 0.82+ private impl path relative to a fake RN install root; the private
// path wins over the public one, so creating just this file is enough to make
// findRealImpl resolve.
const PRIVATE_REL =
  'node_modules/react-native/src/private/devsupport/devmenu/elementinspector/getInspectorDataForViewAtPoint.js';

// Build a fake "project" whose node_modules holds a react-native install with
// the private impl file, so the probe finds the real implementation.
function makeFakeProject(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-compat-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const implPath = path.join(root, PRIVATE_REL);
  fs.mkdirSync(path.dirname(implPath), { recursive: true });
  fs.writeFileSync(implPath, 'module.exports = () => ({});\n');
  return { root, implPath };
}

// Stand-in for a real upstream resolveRequest: records the module names it
// receives and answers like Metro's default resolution would.
function makeUpstreamResolver() {
  const seen = [];
  const upstream = (context, moduleName, platform) => {
    seen.push(moduleName);
    return { type: 'sourceFile', filePath: `/resolved/${moduleName}` };
  };
  return { seen, upstream };
}

test('withInspectorCompat', async (t) => {
  await t.test('does not throw and leaves the config untouched when no impl is found', () => {
    const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-compat-empty-'));
    t.after(() => fs.rmSync(emptyRoot, { recursive: true, force: true }));

    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (msg) => warnings.push(String(msg));
    try {
      const config = { projectRoot: emptyRoot, resolver: { assetExts: ['png'] } };
      const result = withInspectorCompat(config);
      // Degrade: resolveRequest must stay absent so the stock inspector runs
      assert.equal(result.resolver.resolveRequest, undefined);
      // The rest of the config still passes through
      assert.deepEqual(result.resolver.assetExts, ['png']);
      assert.match(warnings.join('\n'), /could not find/);
    } finally {
      console.warn = originalWarn;
    }
  });

  await t.test('does not mutate the input config and returns a new object', () => {
    const { root } = makeFakeProject(t);
    const input = { projectRoot: root, watchFolders: ['/a'] };
    const result = withInspectorCompat(input);

    // Input stays pristine
    assert.deepEqual(input.watchFolders, ['/a']);
    assert.equal(input.resolver, undefined);
    // Output is a distinct object carrying the interception
    assert.notEqual(result, input);
    assert.equal(typeof result.resolver.resolveRequest, 'function');
    assert.ok(result.watchFolders.length >= 2);
  });

  await t.test('intercepts the private path, the marker and optional peers', () => {
    const { root, implPath } = makeFakeProject(t);
    const { seen, upstream } = makeUpstreamResolver();
    const config = { projectRoot: root };
    const result = withInspectorCompat(config, {
      root,
      // Force isInstalled to fail for the optional peer by pointing require's
      // resolution at a directory without it — simplest is to not install it,
      // which is already the case in this sandbox project.
    });
    const resolve = result.resolver.resolveRequest;

    // 0.82+ private path -> bundled shim
    const shim = resolve({}, 'react-native/src/private/devsupport/devmenu/elementinspector/getInspectorDataForViewAtPoint', 'ios');
    assert.equal(shim.type, 'sourceFile');
    assert.match(shim.filePath, /inspectorDataShim\.js$/);

    // Marker -> the real RN implementation found under the fake project root
    const marker = resolve({}, '__rn_dev_inspector_original_impl__', 'ios');
    assert.equal(marker.filePath, implPath);

    // Not-installed optional peer -> empty module
    const peer = resolve({}, 'expo-dev-menu', 'ios');
    assert.match(peer.filePath, /emptyModule\.js$/);

    // Anything else goes to the upstream resolver (none here -> context fallback)
    const ctx = { resolveRequest: upstream };
    const other = resolve(ctx, 'react', 'ios');
    assert.deepEqual(other, { type: 'sourceFile', filePath: '/resolved/react' });
    assert.deepEqual(seen, ['react']);

    // Existing resolver is chained: it must receive non-intercepted modules
    const { seen: seen2, upstream: upstream2 } = makeUpstreamResolver();
    const chained = withInspectorCompat({ projectRoot: root, resolver: { resolveRequest: upstream2 } });
    chained.resolver.resolveRequest({}, 'my-app/Foo', 'android');
    assert.deepEqual(seen2, ['my-app/Foo']);
  });

  await t.test('adds the shim package to watchFolders; adds the RN package only when outside the project', () => {
    const { root } = makeFakeProject(t);
    const shimPkgRoot = path.resolve(__dirname, '..');

    // react-native lives inside the project: no extra watch folder for it
    // (Metro 0.76's TreeFS rejects duplicated in-root directories)
    const inside = withInspectorCompat({ projectRoot: root });
    assert.ok(inside.watchFolders.includes(shimPkgRoot));
    assert.ok(
      !inside.watchFolders.some((f) => /node_modules[\\/]react-native$/.test(f)),
      'impl package root must not be watched when it is inside the project'
    );

    // Monorepo: react-native hoisted into a parent workspace root's
    // node_modules — the probe walks up from the app root to find it, and the
    // impl package (outside the project) must be added to watchFolders
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-compat-outside-'));
    t.after(() => fs.rmSync(workspaceRoot, { recursive: true, force: true }));
    const implPath = path.join(workspaceRoot, PRIVATE_REL);
    fs.mkdirSync(path.dirname(implPath), { recursive: true });
    fs.writeFileSync(implPath, 'module.exports = () => ({});\n');
    const appRoot = path.join(workspaceRoot, 'app');
    fs.mkdirSync(appRoot, { recursive: true });
    const outside = withInspectorCompat({ projectRoot: appRoot });
    const watched = outside.watchFolders.find((f) => /node_modules[\\/]react-native$/.test(f));
    assert.ok(watched, 'impl package root must be watched when outside the project');
    assert.equal(
      path.resolve(watched),
      path.resolve(workspaceRoot, 'node_modules/react-native')
    );

    // watchFolders entries are deduplicated
    const dup = withInspectorCompat({ projectRoot: appRoot, watchFolders: [shimPkgRoot] });
    assert.equal(dup.watchFolders.filter((f) => f === shimPkgRoot).length, 1);
  });
});

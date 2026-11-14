/**
 * Tests for the inspector dev-server middleware.
 *
 * Run with: pnpm --filter @rn-dev-inspector/metro-plugin test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const { createInspectorMiddleware, withInspector, openInEditor } = require('../dist/index.js');

// The developer running these tests may well have EDITOR/REACT_EDITOR set in
// their shell. Clear them so the tests exercise the configured editor only —
// and so a test run never launches a real editor.
delete process.env.LAUNCH_EDITOR;
delete process.env.REACT_EDITOR;
delete process.env.EDITOR;
delete process.env.VISUAL;

// A stand-in "editor" that records its arguments instead of launching anything.
//
// Cross-platform by construction (see issue #3): Windows neither honours a
// shebang nor an executable bit, so a bare `subl` script only works on POSIX.
// The executable we hand to launch-editor is therefore platform-specific:
// - win32 : a `subl.cmd` batch shim that forwards to node. launch-editor's
//   get-args.js strips the .cmd extension before matching editor names, so it
//   is still recognised as `subl` and keeps formatting file:line:column, and
//   launch-editor spawns editors through cmd.exe (`exec` + `shell: true`),
//   which resolves .cmd files natively.
// - else  : the original shebang script + chmod 0o755.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-inspector-test-'));
const logFile = path.join(tmpDir, 'args.log');
// The actual recorder: plain node script, no shebang needed anywhere.
const recorderScript = path.join(tmpDir, 'subl.js');
fs.writeFileSync(
  recorderScript,
  `require('fs').appendFileSync(${JSON.stringify(logFile)}, process.argv.slice(2).join(' ') + '\\n');\n`
);
// Named `subl` so launch-editor formats the position as `file:line:column`.
// (For editor names it does not recognise it drops the position entirely.)
const shimPath =
  process.platform === 'win32'
    ? path.join(tmpDir, 'subl.cmd')
    : path.join(tmpDir, 'subl');
if (process.platform === 'win32') {
  // %~dp0 is the shim's own directory (trailing backslash included), so the
  // recorder path stays correct no matter where the caller's cwd is.
  fs.writeFileSync(
    shimPath,
    `@echo off\nnode "%~dp0subl.js" %*\n`
  );
} else {
  // POSIX honours the shebang and the executable bit, so the shim is the
  // recorder with a node shebang prepended.
  fs.writeFileSync(
    shimPath,
    `#!/usr/bin/env node\n` + fs.readFileSync(recorderScript, 'utf8')
  );
  fs.chmodSync(shimPath, 0o755);
}

// What we hand to launch-editor as the configured editor. On Windows this
// must double the backslashes: guess.js runs the configured editor through
// shell-quote's POSIX-ish parse(), which consumes single backslashes as
// escape characters — a raw `C:\...\subl.cmd` would be mangled into a
// nonexistent `C:...subl.cmd` and the launch would exit 1. Doubling them
// round-trips through parse() into the real path.
const fakeEditor =
  process.platform === 'win32' ? shimPath.replace(/\\/g, '\\\\') : shimPath;

const projectRoot = path.resolve(__dirname, '..');
const existingFile = path.relative(projectRoot, path.join(projectRoot, 'package.json'));

function startServer(options) {
  const middleware = createInspectorMiddleware(options);
  const server = http.createServer((req, res) => {
    middleware(req, res, () => {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('passed through');
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function get(port, urlPath) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: '127.0.0.1', port, path: urlPath }, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      })
      .on('error', reject);
  });
}

test('middleware endpoints', async (t) => {
  const { server, port } = await startServer({ cwd: projectRoot, editor: fakeEditor });
  t.after(() => server.close());

  await t.test('reports status with the real package version', async () => {
    const res = await get(port, '/__rn_dev_inspector__/status');
    assert.equal(res.status, 200);
    const json = JSON.parse(res.body);
    assert.equal(json.status, 'ok');
    assert.equal(json.version, require('../package.json').version);
  });

  await t.test('rejects a request with no file', async () => {
    const res = await get(port, '/__inspect-open-in-editor');
    assert.equal(res.status, 400);
    assert.match(JSON.parse(res.body).error, /Missing required parameter/);
  });

  await t.test('reports a missing file rather than opening it', async () => {
    const res = await get(port, '/__inspect-open-in-editor?file=does/not/exist.tsx&line=3');
    assert.equal(res.status, 500);
    assert.match(JSON.parse(res.body).error, /File not found/);
  });

  await t.test('opens an existing file via the standard endpoint', async () => {
    const res = await get(
      port,
      `/__inspect-open-in-editor?file=${encodeURIComponent(existingFile)}&line=12&column=4`
    );
    assert.equal(res.status, 200);
    assert.equal(JSON.parse(res.body).success, true);
  });

  await t.test('supports the legacy endpoint', async () => {
    const res = await get(
      port,
      `/__open-stack-frame-in-editor?file=${encodeURIComponent(existingFile)}&line=5`
    );
    assert.equal(res.status, 200);
  });

  await t.test('passes unrelated requests to the next middleware', async () => {
    const res = await get(port, '/index.bundle');
    assert.equal(res.status, 404);
    assert.equal(res.body, 'passed through');
  });
});

test('openInEditor passes file:line:column to the editor', async () => {
  fs.writeFileSync(logFile, '');
  const result = await openInEditor(
    { file: existingFile, line: 42, column: 7 },
    { cwd: projectRoot, editor: fakeEditor }
  );
  assert.equal(result.success, true);

  // launch-editor spawns asynchronously; give it a moment to write the log.
  await new Promise((r) => setTimeout(r, 400));
  const logged = fs.readFileSync(logFile, 'utf8');
  assert.match(
    logged,
    /package\.json:42:7/,
    'the absolute path plus line and column should reach the editor'
  );
});

test('withInspector preserves config and composes enhanceMiddleware', () => {
  let innerCalled = false;
  const base = {
    resolver: { sourceExts: ['ts'] },
    transformer: { minifierPath: 'x' },
    server: {
      port: 9000,
      enhanceMiddleware: (mw) => {
        innerCalled = true;
        return mw;
      },
    },
  };

  const out = withInspector(base, { editor: 'code' });

  assert.deepEqual(out.resolver, base.resolver, 'resolver config must be preserved');
  assert.deepEqual(out.transformer, base.transformer, 'transformer config must be preserved');
  assert.equal(out.server.port, 9000, 'existing server options must be preserved');
  assert.equal(typeof out.server.enhanceMiddleware, 'function');

  const enhanced = out.server.enhanceMiddleware((_req, _res, next) => next(), {});
  assert.equal(typeof enhanced, 'function');
  assert.ok(innerCalled, 'an existing enhanceMiddleware must still be called');
});

test('withInspector works on a config with no server section', () => {
  const out = withInspector({ resolver: {} }, {});
  assert.equal(typeof out.server.enhanceMiddleware, 'function');
});

test('an explicitly configured editor wins over ambient env vars', async () => {
  process.env.REACT_EDITOR = 'some-other-editor';
  process.env.LAUNCH_EDITOR = 'yet-another-editor';
  try {
    fs.writeFileSync(logFile, '');
    const result = await openInEditor(
      { file: existingFile, line: 1 },
      { cwd: projectRoot, editor: fakeEditor }
    );
    assert.equal(result.success, true);
    await new Promise((r) => setTimeout(r, 400));
    assert.match(
      fs.readFileSync(logFile, 'utf8'),
      /package\.json/,
      'the editor from withInspector() options should have been used'
    );
  } finally {
    delete process.env.REACT_EDITOR;
    delete process.env.LAUNCH_EDITOR;
  }
});

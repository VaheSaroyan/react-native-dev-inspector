/**
 * Tests for the WebStorm argument-order fix (patch-launch-editor-webstorm).
 *
 * The patch module wraps launch-editor's get-args in the require cache, so it
 * must be required BEFORE launch-editor/get-args is first loaded — the same
 * ordering constraint the metro plugin itself follows.
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

require('../dist/patch-launch-editor-webstorm');
const getArgs = require('launch-editor/get-args');

test('webstorm64.exe gets the project directory as the first argument', () => {
  const args = getArgs('H:/ide/WebStorm/bin/webstorm64.exe', 'src/app/index.tsx', 80, 5);
  assert.strictEqual(args[0], process.cwd());
  assert.deepStrictEqual(args.slice(1), ['--line', 80, '--column', 5, 'src/app/index.tsx']);
});

test('webstorm.bat gets the project directory as the first argument', () => {
  const args = getArgs('H:/ide/WebStorm/bin/webstorm.bat', 'a.tsx', 1, 1);
  assert.strictEqual(args[0], process.cwd());
  assert.strictEqual(args[1], '--line');
});

test('LAUNCH_EDITOR_PROJECT_DIR overrides the project directory', () => {
  process.env.LAUNCH_EDITOR_PROJECT_DIR = 'G:/custom/root';
  try {
    const args = getArgs('webstorm', 'a.tsx', 1, 1);
    assert.strictEqual(args[0], 'G:/custom/root');
  } finally {
    delete process.env.LAUNCH_EDITOR_PROJECT_DIR;
  }
});

test('non-webstorm editors keep the original argument order', () => {
  const args = getArgs('code', 'a.tsx', 3, 2);
  assert.deepStrictEqual(args, ['-r', '-g', 'a.tsx:3:2']);
});

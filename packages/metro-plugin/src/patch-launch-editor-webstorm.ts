/**
 * WebStorm argument-order fix for launch-editor.
 *
 * JetBrains' unified launcher (2023.3+, both bin/webstorm.bat and
 * webstorm64.exe) only honors --line/--column when the FIRST argument is a
 * project directory; launch-editor emits `--line N --column M <file>`, so the
 * line number is silently ignored. The legacy command-line launcher treats an
 * extra directory argument as a regular open request and still jumps to the
 * line, so always dispatching in the "project directory first" format is
 * compatible with both generations.
 *
 * Implemented by wrapping launch-editor's get-args module in the require
 * cache. This module MUST be imported before launch-editor is first required,
 * because launch-editor captures the get-args reference at load time.
 *
 * The project directory defaults to the Metro process cwd (the project root);
 * set LAUNCH_EDITOR_PROJECT_DIR to override.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
import * as path from 'path';

const getArgsPath = require.resolve('launch-editor/get-args');
const originalGetArgs = require(getArgsPath);

require.cache[getArgsPath]!.exports = function getArgsWithWebstormProjectDir(
  editor: string,
  fileName: string,
  lineNumber: number,
  columnNumber?: number,
): Array<string | number> {
  const args = originalGetArgs(editor, fileName, lineNumber, columnNumber);
  const basename = path
    .basename(editor)
    .replace(/\.(exe|cmd|bat)$/i, '')
    .toLowerCase();
  const isWebStorm = basename === 'webstorm' || basename === 'webstorm64';
  // Only rewrite the known `--line N --column M <file>` shape; leave anything
  // else (e.g. the LAUNCH_EDITOR raw passthrough) untouched
  if (isWebStorm && args[0] === '--line') {
    const projectDir = process.env.LAUNCH_EDITOR_PROJECT_DIR || process.cwd();
    return [projectDir, ...args];
  }
  return args;
};

export {};

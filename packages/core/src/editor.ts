/**
 * Editor launching utilities
 * Handles opening source files in the user's preferred editor
 *
 * Uses standard endpoints compatible with react-dev-inspector:
 * - /__inspect-open-in-editor (primary)
 * - /__open-stack-frame-in-editor (legacy)
 */

import {Platform, Linking, NativeModules} from 'react-native';
import type {CodeInfo} from './fiber';
import {buildEditorQueryString} from './editorQuery';

export interface LaunchEditorOptions {
  /** Source code information */
  codeInfo: CodeInfo;
  /** Editor name or command */
  editor?: string;
  /** Dev server URL (for Metro-based launching) */
  devServerUrl?: string;
}

/**
 * Resolve the dev server from the bundle URL that Metro served this JS from.
 *
 * This is the only reliable source: on a physical device, over LAN, with a
 * tunnel, or on a non-default port, the dev server is not on localhost. The
 * bundle URL always points at whichever host actually served the bundle.
 */
function getDevServerUrlFromScriptUrl(): string | null {
  try {
    // The legacy bridge flattens constants onto the module; bridgeless does
    // not. Try both rather than branching on which one exists - `getConstants`
    // can be present and still not carry `scriptURL`.
    const mod: any = NativeModules?.SourceCode;
    const scriptURL: unknown = mod?.scriptURL ?? mod?.getConstants?.()?.scriptURL;

    if (typeof scriptURL !== 'string' || !scriptURL) return null;

    // e.g. "http://192.168.1.20:8081/index.bundle?platform=ios&dev=true"
    // Stop at `?` and `#` too, for a bundle URL served from the host root.
    const match = scriptURL.match(/^https?:\/\/[^/?#]+/);
    return match ? match[0] : null;
  } catch {
    // SourceCode is unavailable in some runtimes (e.g. tests, web)
    return null;
  }
}

/**
 * Default dev server URL.
 * Prefers the host that actually served the bundle, then falls back to the
 * platform's conventional simulator/emulator address.
 */
function getDefaultDevServerUrl(): string {
  const fromScript = getDevServerUrlFromScriptUrl();
  if (fromScript) return fromScript;

  if (Platform.OS === 'android') {
    // Android emulator maps the host machine's localhost to 10.0.2.2
    return 'http://10.0.2.2:8081';
  }
  // iOS simulator shares the host's localhost
  return 'http://localhost:8081';
}

/**
 * Launch editor via standard inspector endpoint (react-dev-inspector compatible)
 * Uses GET request with query parameters
 */
export async function launchEditorViaInspector(
  options: LaunchEditorOptions,
): Promise<boolean> {
  const {codeInfo, devServerUrl, editor} = options;
  const baseUrl = devServerUrl || getDefaultDevServerUrl();

  // Standard endpoint (react-dev-inspector style)
  const queryString = buildEditorQueryString(codeInfo, editor);
  const url = `${baseUrl}/__inspect-open-in-editor?${queryString}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      lastFailureReason = await describeFailedResponse(response, url);
      return false;
    }

    return true;
  } catch (error) {
    lastFailureReason =
      `could not reach the dev server at ${baseUrl} ` +
      `(${error instanceof Error ? error.message : 'network error'})`;
    return false;
  }
}

/** Reason the most recent launch attempt failed, for diagnostics. */
let lastFailureReason: string | null = null;

/** Read the metro middleware's JSON error body, if it sent one. */
async function describeFailedResponse(response: Response, url: string): Promise<string> {
  try {
    const body = await response.text();
    try {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed.error === 'string') {
        return parsed.error;
      }
    } catch {
      // not JSON
    }
    if (body) return `${response.status} from ${url}: ${body.slice(0, 200)}`;
  } catch {
    // body already consumed or unreadable
  }
  return `${response.status} from ${url}`;
}

/**
 * Launch editor via legacy Metro endpoint
 * Uses POST request with JSON body
 */
export async function launchEditorViaMetro(
  options: LaunchEditorOptions,
): Promise<boolean> {
  const {codeInfo, devServerUrl} = options;
  const baseUrl = devServerUrl || getDefaultDevServerUrl();

  // Legacy endpoint (CRA/Metro style)
  const url = `${baseUrl}/__open-stack-frame-in-editor`;

  const queryString = buildEditorQueryString(codeInfo, options.editor);

  try {
    const response = await fetch(`${url}?${queryString}`, {
      method: 'GET',
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Generate a URL scheme for common editors
 * Used as fallback when Metro endpoint is not available
 */
function getEditorUrl(codeInfo: CodeInfo, editor?: string): string | null {
  const { absolutePath, relativePath, lineNumber, columnNumber } = codeInfo;
  // Prefer absolute path for reliable file opening
  const file = absolutePath || relativePath;
  const line = lineNumber;
  const column = columnNumber;
  const editorName = (editor || 'vscode').toLowerCase();

  switch (editorName) {
    // VS Code and variants - format: scheme://file/path:line:column
    case 'vscode':
    case 'code':
      return `vscode://file${file}:${line}:${column}`;

    case 'vscode-insiders':
      return `vscode-insiders://file${file}:${line}:${column}`;

    case 'cursor':
      return `cursor://file${file}:${line}:${column}`;

    // JetBrains IDEs - format: jetbrains://ide/navigate/reference?path=file&line=n&column=n
    // Note: JetBrains uses 1-indexed line but 0-indexed column
    case 'webstorm':
    case 'phpstorm':
    case 'intellij':
    case 'idea':
    case 'pycharm':
    case 'rubymine':
    case 'goland':
    case 'rider':
    case 'clion':
      return `jetbrains://${editorName}/navigate/reference?project=&path=${encodeURIComponent(file)}&line=${line}&column=${Math.max(0, column - 1)}`;

    // Sublime Text - format: subl://open?url=file://path&line=n&column=n
    case 'sublime':
    case 'subl':
      return `subl://open?url=file://${encodeURIComponent(file)}&line=${line}&column=${column}`;

    // Atom editor - format: atom://core/open/file?filename=path&line=n&column=n
    case 'atom':
      return `atom://core/open/file?filename=${encodeURIComponent(file)}&line=${line}&column=${column}`;

    // Zed editor - format: zed://open/path:line:column
    case 'zed':
      return `zed://open${file}:${line}:${column}`;

    default:
      return null;
  }
}

/**
 * Try to launch editor via URL scheme (deep linking)
 */
export async function launchEditorViaUrlScheme(options: LaunchEditorOptions): Promise<boolean> {
  const { codeInfo, editor } = options;
  const url = getEditorUrl(codeInfo, editor);

  if (!url) {
    return false;
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Main function to launch editor
 * Tries multiple methods in order of preference:
 * 1. Standard inspector endpoint (/__inspect-open-in-editor)
 * 2. Legacy Metro endpoint (/__open-stack-frame-in-editor)
 * 3. URL scheme (deep linking to editor app)
 */
export async function launchEditor(
  options: LaunchEditorOptions,
): Promise<boolean> {
  lastFailureReason = null;

  // Try standard inspector endpoint first (react-dev-inspector compatible)
  const inspectorSuccess = await launchEditorViaInspector(options);
  if (inspectorSuccess) {
    return true;
  }

  // Fall back to legacy Metro endpoint
  const metroSuccess = await launchEditorViaMetro(options);
  if (metroSuccess) {
    return true;
  }

  // Fall back to URL scheme (direct app deep linking)
  const urlSuccess = await launchEditorViaUrlScheme(options);
  if (urlSuccess) {
    return true;
  }

  if (__DEV__) {
    const baseUrl = options.devServerUrl || getDefaultDevServerUrl();
    console.warn(
      `[react-native-dev-inspector] Could not open ` +
        `${options.codeInfo.relativePath}:${options.codeInfo.lineNumber} in your editor.\n` +
        (lastFailureReason ? `Reason: ${lastFailureReason}\n` : '') +
        `Checklist:\n` +
        `  1. Add withInspector(...) from @rn-dev-inspector/metro-plugin to metro.config.js, ` +
        `then restart Metro.\n` +
        `  2. Make sure your editor's CLI is on PATH, or set REACT_EDITOR ` +
        `(e.g. export REACT_EDITOR=code) in the shell running Metro.\n` +
        `  3. Dev server used: ${baseUrl} — pass devServerUrl to <Inspector> if that is wrong.`,
    );
  }

  return false;
}

/**
 * Why the most recent launchEditor() call failed, or null if it succeeded.
 * Useful for surfacing an error in your own UI.
 */
export function getLastLaunchFailureReason(): string | null {
  return lastFailureReason;
}

/**
 * Check if dev server is reachable
 */
export async function checkDevServer(devServerUrl?: string): Promise<boolean> {
  const baseUrl = devServerUrl || getDefaultDevServerUrl();

  // Try our status endpoint first
  try {
    const response = await fetch(`${baseUrl}/__rn_dev_inspector__/status`, {
      method: 'GET',
    });
    if (response.ok) {
      return true;
    }
  } catch {
    // Continue to fallback
  }

  // Fall back to Metro's status endpoint
  try {
    const response = await fetch(`${baseUrl}/status`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

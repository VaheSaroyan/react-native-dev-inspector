/**
 * Metro plugin for React Native Dev Inspector
 * Provides server middleware for opening files in editor
 *
 * Uses launch-editor package for robust cross-platform editor detection
 * and launching (same approach as react-dev-inspector and create-react-app)
 */

import * as path from 'path';
import * as fs from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';

// @ts-ignore - launch-editor doesn't have types
import launchEditor from 'launch-editor';

export interface MetroPluginOptions {
  /** Editor command to use (e.g., 'code', 'webstorm', 'cursor') */
  editor?: string;
  /** Custom working directory for resolving relative paths */
  cwd?: string;
  /** Callback for handling launch errors */
  onError?: (fileName: string, errorMsg: string) => void;
}

export interface OpenFileRequest {
  file: string;
  absolutePath?: string;
  lineNumber?: number;
  line?: number; // alias for lineNumber
  column?: number;
  componentName?: string;
  editor?: string;
}

/**
 * Get the editor to use based on options and environment
 * Priority: request > LAUNCH_EDITOR env > REACT_EDITOR env > options > auto-detect
 */
function getEditor(options: MetroPluginOptions, requestEditor?: string): string | undefined {
  return (
    requestEditor ||
    process.env.LAUNCH_EDITOR ||
    process.env.REACT_EDITOR ||
    options.editor
    // If undefined, launch-editor will auto-detect from running processes
  );
}

/**
 * Format file path with line and column for launch-editor
 * Format: file:line:column
 */
function formatFilePathWithPosition(
  filePath: string,
  lineNumber?: number,
  column?: number
): string {
  if (lineNumber) {
    if (column) {
      return `${filePath}:${lineNumber}:${column}`;
    }
    return `${filePath}:${lineNumber}`;
  }
  return filePath;
}

/**
 * Open a file in the editor using launch-editor
 * This provides robust cross-platform editor detection and launching
 */
export async function openInEditor(
  request: OpenFileRequest,
  options: MetroPluginOptions = {}
): Promise<{ success: boolean; error?: string }> {
  const cwd = options.cwd || process.cwd();

  // Resolve file path
  let filePath = request.absolutePath || request.file;
  if (!path.isAbsolute(filePath)) {
    filePath = path.resolve(cwd, filePath);
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return {
      success: false,
      error: `File not found: ${filePath}`,
    };
  }

  // Get line and column (support both naming conventions)
  const lineNumber = request.lineNumber || request.line;
  const column = request.column;

  // Format file path with position
  const fileWithPosition = formatFilePathWithPosition(filePath, lineNumber, column);

  // Get editor (may be undefined for auto-detection)
  const editor = getEditor(options, request.editor);

  return new Promise((resolve) => {
    try {
      // launch-editor handles:
      // - Auto-detecting running editors from process list
      // - Cross-platform support (macOS, Windows, Linux, WSL)
      // - Editor-specific argument formatting
      // - Fallback mechanisms
      launchEditor(
        fileWithPosition,
        editor,
        (fileName: string, errorMsg: string | null) => {
          const errorMessage = errorMsg || 'Unknown error launching editor';

          // Call custom error handler if provided
          if (options.onError) {
            options.onError(fileName, errorMessage);
          }

          resolve({
            success: false,
            error: errorMessage,
          });
        }
      );

      // launch-editor is fire-and-forget, assume success if no immediate error
      // The error callback will be called if something goes wrong
      setTimeout(() => {
        resolve({ success: true });
      }, 100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      resolve({
        success: false,
        error: `Failed to launch editor: ${errorMessage}`,
      });
    }
  });
}

// Standard endpoints (compatible with react-dev-inspector)
const LAUNCH_EDITOR_ENDPOINT = '/__inspect-open-in-editor';
const LEGACY_ENDPOINT = '/__open-stack-frame-in-editor';
const CUSTOM_ENDPOINT = '/__rn_dev_inspector__/open';
const STATUS_ENDPOINT = '/__rn_dev_inspector__/status';

/**
 * Parse query parameters from URL
 */
function parseQueryParams(url: string): Record<string, string> {
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) return {};

  const queryString = url.slice(queryIndex + 1);
  const params: Record<string, string> = {};

  for (const pair of queryString.split('&')) {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
    }
  }

  return params;
}

/**
 * Create the Metro server middleware for the inspector
 */
export function createInspectorMiddleware(options: MetroPluginOptions = {}) {
  return async function inspectorMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    const urlPath = req.url?.split('?')[0];

    // Handle GET requests with query params (react-dev-inspector style)
    // Endpoints: /__inspect-open-in-editor or /__open-stack-frame-in-editor
    if (
      (urlPath === LAUNCH_EDITOR_ENDPOINT || urlPath === LEGACY_ENDPOINT) &&
      req.method === 'GET'
    ) {
      const params = parseQueryParams(req.url || '');

      // fileName is required
      if (!params.file && !params.fileName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Missing required parameter: file or fileName',
        }));
        return;
      }

      const request: OpenFileRequest = {
        file: params.file || params.fileName,
        lineNumber: params.line ? parseInt(params.line, 10) : undefined,
        column: params.column ? parseInt(params.column, 10) : undefined,
        editor: params.editor,
      };

      const result = await openInEditor(request, options);

      res.writeHead(result.success ? 200 : 500, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify(result));
      return;
    }

    // Handle POST requests with JSON body (our custom endpoint)
    if (urlPath === CUSTOM_ENDPOINT && req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const request: OpenFileRequest = JSON.parse(body);
          const result = await openInEditor(request, options);

          res.writeHead(result.success ? 200 : 500, {
            'Content-Type': 'application/json',
          });
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid request body',
          }));
        }
      });

      return;
    }

    // Handle status check
    if (urlPath === STATUS_ENDPOINT && req.method === 'GET') {
      const editor = getEditor(options);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        version: '1.0.0',
        editor: editor || 'auto-detect',
      }));
      return;
    }

    // Pass to next middleware
    next();
  };
}

/**
 * Metro configuration helper
 * Use this to add the inspector middleware to your metro.config.js
 *
 * @example
 * ```js
 * const { withInspector } = require('@rn-dev-inspector/metro-plugin');
 *
 * module.exports = withInspector({
 *   // your metro config
 * }, {
 *   editor: 'code',
 * });
 * ```
 */
export function withInspector<T extends object>(
  metroConfig: T,
  options: MetroPluginOptions = {}
): T {
  const middleware = createInspectorMiddleware(options);

  // Access server configuration
  const serverConfig = (metroConfig as any).server || {};
  const existingEnhanceMiddleware = serverConfig.enhanceMiddleware;

  return {
    ...metroConfig,
    server: {
      ...serverConfig,
      enhanceMiddleware: (middleware2: any, server: any) => {
        // Compose with existing enhanceMiddleware if present
        let enhanced = middleware2;
        if (existingEnhanceMiddleware) {
          enhanced = existingEnhanceMiddleware(middleware2, server);
        }

        // Add our middleware
        return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          middleware(req, res, () => {
            enhanced(req, res, next);
          });
        };
      },
    },
  };
}


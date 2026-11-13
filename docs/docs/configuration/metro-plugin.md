---
sidebar_position: 3
---

# Metro Plugin

The `@rn-dev-inspector/metro-plugin` provides the server-side middleware that handles opening files in your editor.

## Installation

```bash
npm install @rn-dev-inspector/metro-plugin --save-dev
```

## Configuration

### Using `withInspector` Helper

The easiest way to configure the plugin:

```js title="metro.config.js"
const { getDefaultConfig } = require('expo/metro-config');
const { withInspector } = require('@rn-dev-inspector/metro-plugin');

const config = getDefaultConfig(__dirname);

module.exports = withInspector(config, {
  editor: 'code',
});
```

### Manual Middleware Configuration

For more control, use `createInspectorMiddleware`:

```js title="metro.config.js"
const { getDefaultConfig } = require('expo/metro-config');
const { createInspectorMiddleware } = require('@rn-dev-inspector/metro-plugin');

const config = getDefaultConfig(__dirname);

const inspectorMiddleware = createInspectorMiddleware({
  editor: 'code',
  cwd: __dirname,
});

module.exports = {
  ...config,
  server: {
    ...config.server,
    enhanceMiddleware: (middleware, server) => {
      return (req, res, next) => {
        inspectorMiddleware(req, res, () => {
          middleware(req, res, next);
        });
      };
    },
  },
};
```

## Options

### `editor`

- **Type**: `string`
- **Default**: Auto-detected

The editor command to use. If not specified, the plugin will auto-detect from running processes.

```js
{ editor: 'cursor' }
```

### `cwd`

- **Type**: `string`
- **Default**: `process.cwd()`

Working directory for resolving relative file paths.

```js
{ cwd: '/path/to/project' }
```

### `onError`

- **Type**: `(fileName: string, errorMsg: string) => void`
- **Default**: `undefined`

Callback function when editor launch fails.

```js
{
  onError: (fileName, errorMsg) => {
    console.error(`Failed to open ${fileName}: ${errorMsg}`);
  }
}
```

## Endpoints

The middleware adds these endpoints to the Metro server:

### `GET /__inspect-open-in-editor`

Primary endpoint (react-dev-inspector compatible).

**Query Parameters:**
- `file` - File path (required)
- `line` - Line number
- `column` - Column number
- `editor` - Override editor

```
GET /__inspect-open-in-editor?file=/path/to/file.tsx&line=10&column=5
```

### `GET /__open-stack-frame-in-editor`

Legacy endpoint for compatibility.

### `POST /__rn_dev_inspector__/open`

Custom endpoint with JSON body:

```json
{
  "file": "src/App.tsx",
  "lineNumber": 10,
  "column": 5,
  "editor": "code"
}
```

### `GET /__rn_dev_inspector__/status`

Health check endpoint:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "editor": "code"
}
```

## Editor Detection

The plugin uses the `launch-editor` package which:

1. Scans running processes to detect editors
2. Uses the detected editor's CLI command
3. Handles platform-specific differences (macOS, Windows, Linux, WSL)
4. Falls back to the configured editor if auto-detection fails

## Environment Variables

| Variable | Description |
|----------|-------------|
| `LAUNCH_EDITOR` | Override editor (highest priority) |
| `REACT_EDITOR` | Override editor (used by CRA/Vite) |

## Troubleshooting

### Editor Not Opening

Check the Metro logs for errors:

```bash
npx react-native start --verbose
```

### Wrong File Opening

Ensure the `cwd` option matches your project root:

```js
{ cwd: __dirname }
```

### Port Conflicts

The middleware uses Metro's port (default 8081). If you're using a different port, ensure the client knows about it:

```tsx
<Inspector devServerUrl="http://localhost:3000">
  <App />
</Inspector>
```

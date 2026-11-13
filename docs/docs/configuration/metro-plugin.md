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
  "version": "1.2.1",
  "editor": "code"
}
```

## Editor Detection

The plugin uses the `launch-editor` package which:

1. Scans running processes to detect editors
2. Uses the detected editor's CLI command
3. Handles platform-specific differences (macOS, Windows, Linux, WSL)

## Which editor is used

In priority order:

1. The request's `?editor=` parameter
2. `withInspector(config, { editor: 'cursor' })` in `metro.config.js`
3. The `LAUNCH_EDITOR` or `REACT_EDITOR` environment variable
4. Auto-detection from running processes

An editor configured in `metro.config.js` wins over the environment, so a stray
`EDITOR` / `REACT_EDITOR` in your shell cannot silently override the project's
choice.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `LAUNCH_EDITOR` | Override editor, when none is set in `metro.config.js` |
| `REACT_EDITOR` | Same, using the name CRA/Vite established |

These must be set in the shell that starts Metro. Launching Metro from a GUI app
can give it a different environment than your terminal.

## Troubleshooting

### Is the middleware even installed?

```bash
curl http://localhost:8081/__rn_dev_inspector__/status
# {"status":"ok","version":"1.2.1","editor":"code"}
```

A 404 means `withInspector()` isn't applied in `metro.config.js`, or Metro
wasn't restarted after you added it.

### Editor Not Opening

Failures are logged to the Metro console with the underlying error. Check there
first:

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

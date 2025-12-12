# @rn-dev-inspector/metro-plugin

Metro middleware for React Native Dev Inspector - enables opening source files in your editor.

## Installation

```bash
npm install @rn-dev-inspector/metro-plugin
```

## Setup

Add the plugin to your `metro.config.js`:

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
// or: const { getDefaultConfig } = require('@react-native/metro-config');

const { withInspector } = require('@rn-dev-inspector/metro-plugin');

const config = getDefaultConfig(__dirname);

module.exports = withInspector(config, {
  editor: 'code', // optional - auto-detects if not specified
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `editor` | `string` | auto-detect | Editor command (code, cursor, webstorm, etc.) |
| `cwd` | `string` | `process.cwd()` | Working directory for resolving relative paths |
| `onError` | `(fileName, errorMsg) => void` | - | Callback for launch errors |

## Supported Editors

The plugin uses [`launch-editor`](https://github.com/yyx990803/launch-editor) for robust cross-platform editor detection.

| Editor | Command |
|--------|---------|
| VS Code | `code` |
| VS Code Insiders | `code-insiders` |
| Cursor | `cursor` |
| WebStorm | `webstorm` |
| IntelliJ IDEA | `idea` |
| PhpStorm | `phpstorm` |
| Sublime Text | `subl` |
| Atom | `atom` |
| Vim | `vim` |
| Neovim | `nvim` |
| Emacs | `emacs` |
| Zed | `zed` |
| Android Studio | `studio` |
| Xcode | `xed` |

### Setting the Editor

Priority order:
1. Request parameter: `?editor=cursor`
2. Environment variable: `LAUNCH_EDITOR` or `REACT_EDITOR`
3. Plugin option: `{ editor: 'cursor' }`
4. Auto-detect from running processes

```bash
# Set via environment variable
export REACT_EDITOR=cursor
```

## API Endpoints

The plugin adds the following endpoints to your Metro dev server:

### `GET /__inspect-open-in-editor`

Open a file in the editor (react-dev-inspector compatible).

**Query Parameters:**
- `file` - File path (required)
- `line` - Line number (optional)
- `column` - Column number (optional)
- `editor` - Override editor (optional)

**Example:**
```
GET /__inspect-open-in-editor?file=src/App.tsx&line=25&column=5
```

### `GET /__open-stack-frame-in-editor`

Legacy endpoint (same parameters as above).

### `POST /__rn_dev_inspector__/open`

Open a file via POST with JSON body.

**Body:**
```json
{
  "file": "src/App.tsx",
  "lineNumber": 25,
  "column": 5,
  "editor": "code"
}
```

### `GET /__rn_dev_inspector__/status`

Check plugin status and configured editor.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "editor": "code"
}
```

## Programmatic Usage

You can also use the functions directly:

```js
const { openInEditor, createInspectorMiddleware } = require('@rn-dev-inspector/metro-plugin');

// Open a file directly
await openInEditor({
  file: 'src/App.tsx',
  lineNumber: 25,
  column: 5,
}, {
  editor: 'code',
});

// Create middleware for custom server
const middleware = createInspectorMiddleware({ editor: 'code' });
```

## How It Works

1. The inspector component in your app calls the endpoint when you tap "Open"
2. The middleware receives the file path and line number
3. `launch-editor` detects your running editor and opens the file
4. Your editor jumps to the specified line and column

## Requirements

- Metro bundler
- Node.js 18+

## License

MIT

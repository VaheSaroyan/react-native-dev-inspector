---
sidebar_position: 1
---

# Editor Setup

React Native Dev Inspector can automatically detect and launch your preferred code editor. This guide covers how to configure editor integration.

## Auto-Detection

By default, the inspector automatically detects running editors by scanning system processes. Supported editors include:

- **VS Code** / VS Code Insiders
- **Cursor**
- **WebStorm** / PhpStorm / IntelliJ IDEA / other JetBrains IDEs
- **Sublime Text**
- **Atom**
- **Vim** / Neovim
- **Emacs**
- **Zed**

## Manual Configuration

### Via Environment Variable

Set `REACT_EDITOR` or `LAUNCH_EDITOR`:

```bash
export REACT_EDITOR=cursor
npx expo start
```

### Via Metro Plugin

```js title="metro.config.js"
const { withInspector } = require('@rn-dev-inspector/metro-plugin');

module.exports = withInspector(config, {
  editor: 'cursor',
});
```

### Via Inspector Component

```tsx
<Inspector editor="webstorm">
  <App />
</Inspector>
```

## Editor Commands

| Editor | Command |
|--------|---------|
| VS Code | `code` |
| VS Code Insiders | `code-insiders` |
| Cursor | `cursor` |
| WebStorm | `webstorm` |
| PhpStorm | `phpstorm` |
| IntelliJ IDEA | `idea` |
| PyCharm | `pycharm` |
| GoLand | `goland` |
| Sublime Text | `subl` |
| Atom | `atom` |
| Vim | `vim` |
| Neovim | `nvim` |
| Emacs | `emacs` |
| Zed | `zed` |
| Android Studio | `studio` |
| Xcode | `xed` |

## VS Code Setup

VS Code should work out of the box. If not, ensure the `code` command is in your PATH:

1. Open VS Code
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Shell Command: Install 'code' command in PATH"
4. Press Enter

## Cursor Setup

Similar to VS Code:

1. Open Cursor
2. Press `Cmd+Shift+P`
3. Type "Shell Command: Install 'cursor' command in PATH"

## JetBrains IDE Setup

JetBrains IDEs require the command-line launcher to be installed:

### macOS

1. Open your JetBrains IDE
2. Go to **Tools** > **Create Command-line Launcher**
3. Click **OK** to install to `/usr/local/bin/`

### Linux

The command-line scripts are in the IDE's `bin` directory. Add to your PATH:

```bash
export PATH="$PATH:/path/to/webstorm/bin"
```

### Windows

Add the IDE's `bin` directory to your system PATH.

## URL Schemes (Fallback)

If the Metro endpoint isn't available, the inspector falls back to URL schemes:

| Editor | URL Scheme |
|--------|------------|
| VS Code | `vscode://file/path:line:column` |
| Cursor | `cursor://file/path:line:column` |
| JetBrains | `jetbrains://webstorm/navigate/reference?path=...` |
| Sublime | `subl://open?url=file://...` |

These require the editor to be configured to handle custom URL schemes.

## Troubleshooting

### Editor Not Opening

1. Check the editor command is in your PATH:
   ```bash
   which code  # Should print a path
   ```

2. Try setting the editor explicitly:
   ```bash
   REACT_EDITOR=code npx expo start
   ```

3. Check Metro logs for errors

### Wrong Editor Opening

If the wrong editor opens, set `REACT_EDITOR` explicitly to override auto-detection:

```bash
export REACT_EDITOR=cursor
```

### WSL / Windows Subsystem for Linux

When developing in WSL, the inspector automatically handles launching Windows editors from WSL paths.

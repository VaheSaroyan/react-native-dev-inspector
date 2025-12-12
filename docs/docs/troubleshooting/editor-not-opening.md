---
sidebar_position: 2
---

# Editor Not Opening

Troubleshooting when the editor doesn't open after tapping a component.

## Quick Checklist

1. ✅ Metro dev server is running
2. ✅ Editor command is in PATH
3. ✅ File path is correct
4. ✅ No firewall blocking localhost

## Check Metro Logs

Look for errors in the Metro terminal:

```bash
npx react-native start --verbose
```

You should see logs like:
```
[RN Dev Inspector] Opening: /path/to/file.tsx:10:5 in code
```

## Verify Editor Command

### Test in Terminal

```bash
# VS Code
code --version

# Cursor
cursor --version

# WebStorm
webstorm --version
```

If the command isn't found, install it:

### VS Code / Cursor

1. Open the editor
2. `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
3. "Shell Command: Install 'code' command in PATH"

### JetBrains IDEs

1. Open the IDE
2. Tools > Create Command-line Launcher

## Set Editor Explicitly

### Environment Variable

```bash
export REACT_EDITOR=cursor
npx expo start
```

### In Metro Config

```js title="metro.config.js"
module.exports = withInspector(config, {
  editor: 'cursor',
});
```

### In Inspector Component

```tsx
<Inspector editor="cursor">
  <App />
</Inspector>
```

## Check File Paths

### Relative vs Absolute Paths

The inspector uses both. Check Metro logs to see which path is being used.

### Working Directory

Ensure the `cwd` option in your metro config matches your project:

```js
// metro.config.js
module.exports = withInspector(config, {
  cwd: __dirname,
});
```

## URL Scheme Fallback

If Metro endpoints fail, the inspector falls back to URL schemes.

### Enable URL Schemes

#### VS Code (macOS)

Already enabled by default.

#### Sublime Text

Install the "Sublime URL Protocol" package.

#### JetBrains

1. Preferences > Tools > Web Browsers
2. Enable "Built-in Preview"

## Network Issues

### Firewall

Ensure localhost:8081 isn't blocked:

```bash
# Test connection
curl http://localhost:8081/status
```

### Android Emulator

Android uses a different IP for localhost:

```tsx
const devUrl = Platform.OS === 'android'
  ? 'http://10.0.2.2:8081'
  : 'http://localhost:8081';

<Inspector devServerUrl={devUrl}>
```

### Custom Port

If Metro runs on a different port:

```tsx
<Inspector devServerUrl="http://localhost:3000">
```

## Debug the Endpoint

Test the endpoint directly:

```bash
curl "http://localhost:8081/__inspect-open-in-editor?file=/path/to/App.tsx&line=10"
```

Should return:
```json
{"success": true}
```

## Common Error Messages

### "File not found"

The file path is incorrect. Check:
- Metro plugin `cwd` option is set correctly
- File exists at the specified path

### "Failed to launch editor"

The editor command failed. Check:
- Editor is installed
- Command is in PATH
- Try setting `REACT_EDITOR` explicitly

### "ECONNREFUSED"

Metro server isn't running or wrong port:
```bash
npx expo start
```

## Still Not Working?

1. **Enable verbose logging** (if you're debugging the package)
2. **Check browser console** in React Native Debugger
3. **Open an issue** with:
   - React Native version
   - Editor name
   - OS (macOS, Windows, Linux)
   - Error messages from Metro

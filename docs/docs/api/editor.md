---
sidebar_position: 3
---

# Editor API

Functions for launching files in the editor.

## launchEditor

Main function to launch a file in the editor. Tries multiple methods in order.

```tsx
import { launchEditor } from 'react-native-dev-inspector';

await launchEditor({
  codeInfo: {
    relativePath: 'src/App.tsx',
    absolutePath: '/path/to/src/App.tsx',
    lineNumber: 10,
    columnNumber: 5,
  },
  editor: 'code',
  devServerUrl: 'http://localhost:8081',
});
```

### Parameters

```typescript
interface LaunchEditorOptions {
  /** Source code information */
  codeInfo: CodeInfo;

  /** Editor name or command */
  editor?: string;

  /** Dev server URL for Metro-based launching */
  devServerUrl?: string;
}

interface CodeInfo {
  relativePath: string;
  absolutePath: string;
  lineNumber: number;
  columnNumber: number;
  componentName?: string;
}
```

### Return Value

```typescript
Promise<boolean> // true if editor was launched successfully
```

### Launch Order

1. **Inspector endpoint** (`/__inspect-open-in-editor`) - Primary method
2. **Legacy Metro endpoint** (`/__open-stack-frame-in-editor`) - Fallback
3. **URL scheme** - Direct app deep linking

## launchEditorViaInspector

Launch editor using the inspector endpoint (GET request with query params).

```tsx
import { launchEditorViaInspector } from 'react-native-dev-inspector';

const success = await launchEditorViaInspector({
  codeInfo: { ... },
  editor: 'cursor',
  devServerUrl: 'http://localhost:8081',
});
```

## launchEditorViaMetro

Launch editor using the legacy Metro endpoint.

```tsx
import { launchEditorViaMetro } from 'react-native-dev-inspector';

const success = await launchEditorViaMetro({
  codeInfo: { ... },
  devServerUrl: 'http://localhost:8081',
});
```

## launchEditorViaUrlScheme

Launch editor using URL schemes (deep linking).

```tsx
import { launchEditorViaUrlScheme } from 'react-native-dev-inspector';

const success = await launchEditorViaUrlScheme({
  codeInfo: { ... },
  editor: 'vscode',
});
```

### Supported URL Schemes

| Editor | URL Format |
|--------|------------|
| VS Code | `vscode://file/path:line:column` |
| VS Code Insiders | `vscode-insiders://file/path:line:column` |
| Cursor | `cursor://file/path:line:column` |
| JetBrains | `jetbrains://webstorm/navigate/reference?path=...` |
| Sublime | `subl://open?url=file://...&line=...` |
| Atom | `atom://core/open/file?filename=...&line=...` |
| Zed | `zed://open/path:line:column` |

## checkDevServer

Check if the dev server is reachable.

```tsx
import { checkDevServer } from 'react-native-dev-inspector';

const isAvailable = await checkDevServer('http://localhost:8081');
if (isAvailable) {
  console.log('Dev server is running');
}
```

### Parameters

- `devServerUrl?: string` - URL to check (defaults to auto-detect)

### Return Value

```typescript
Promise<boolean> // true if server is reachable
```

## Example: Custom Editor Integration

```tsx
import { launchEditor, checkDevServer } from 'react-native-dev-inspector';

async function openInEditor(filePath: string, line: number) {
  // Check if dev server is available
  const serverAvailable = await checkDevServer();

  if (!serverAvailable) {
    Alert.alert('Dev server not running', 'Start Metro with: npx expo start');
    return;
  }

  // Launch editor
  const success = await launchEditor({
    codeInfo: {
      relativePath: filePath,
      absolutePath: `/path/to/project/${filePath}`,
      lineNumber: line,
      columnNumber: 1,
    },
    editor: 'cursor',
  });

  if (!success) {
    Alert.alert('Failed to open editor');
  }
}
```

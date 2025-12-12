# Publishing Guide

Quick reference for publishing `react-native-dev-inspector` packages to npm.

## Packages

| Package | npm Name |
|---------|----------|
| Main | `react-native-dev-inspector` |
| Core | `@rn-dev-inspector/core` |
| Metro Plugin | `@rn-dev-inspector/metro-plugin` |

> Note: The main `react-native-dev-inspector` package re-exports core and includes metro-plugin, so users only need to install one package.

## Pre-requisites

- Node.js >= 18.0.0
- pnpm 8.x
- npm account with publish access to `@rn-dev-inspector` scope

## Publishing Steps

### 1. Bump Versions

```bash
# Patch release (1.0.1 -> 1.0.2)
pnpm version:patch

# Minor release (1.0.x -> 1.1.0)
pnpm version:minor

# Major release (1.x.x -> 2.0.0)
pnpm version:major
```

### 2. Verify Build

```bash
pnpm build
```

### 3. Dry Run (Test)

```bash
pnpm publish:dry
```

Review the output to ensure:
- All packages are listed
- Versions are correct
- Files are included correctly

### 4. Publish to npm

```bash
pnpm publish:npm
```

### 5. Create Git Tag & Push

```bash
git add .
git commit -m "Release v1.0.2"
git tag v1.0.2
git push origin main --tags
```

## Troubleshooting

### Workspace Protocol Error

If you see `Unsupported URL Type "workspace:"` during version bump, this is normal. The versions still get updated - verify with:

```bash
grep -h '"version"' packages/*/package.json
```

### Authentication Error

Ensure you're logged into npm:

```bash
npm login
npm whoami
```

### Package Already Published

If a version already exists on npm, bump the version and try again.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2024-12 | Simplified installation - single package, no babel plugin required |
| 1.0.2 | 2024-12 | Enhanced InspectorDevMenu (compact, showOnlyWhenInactive), InspectorButton render function, improved source location tracking |
| 1.0.1 | 2024-12 | Initial public release |
| 1.0.0 | 2024-12 | First commit |

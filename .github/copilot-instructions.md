# Dev Proxy Toolkit VS Code Extension - AI Development Guide

## Architecture Overview

This VS Code extension provides integration with Microsoft Dev Proxy, an API simulator tool. The extension follows a modular architecture with clear separation of concerns:

- **Core Detection**: `src/detect.ts` - Handles Dev Proxy installation detection, version checking, and running status via API polling on port 8897
- **Configuration Analysis**: `src/diagnostics.ts` - Complex JSON schema validation using `json-to-ast` for Dev Proxy config files
- **Plugin System**: `src/constants.ts` - Maintains comprehensive mappings of 40+ Dev Proxy plugins to their snippet names and configuration requirements
- **State Management**: Global state tracking via VS Code's `ExtensionContext.globalState` for Dev Proxy installation details

## Critical Patterns

### Plugin Configuration Validation
The extension performs sophisticated validation of Dev Proxy configuration files:
```typescript
// Plugin validation follows this pattern in diagnostics.ts
const pluginSnippet = pluginSnippets[pluginName];
if (pluginSnippet.config?.required && !configSectionNode) {
  // Error: Missing required config section
}
```

### Version-Aware Features
All Dev Proxy interactions respect user's version preference (stable vs beta):
```typescript
const versionPreference = configuration.get('version') as VersionPreference;
const devProxyExe = getDevProxyExe(versionPreference);
```

### AST-Based JSON Analysis
Use `json-to-ast` for reliable JSON parsing and range detection:
```typescript
const documentNode = parse(document.getText()) as parse.ObjectNode;
const range = getRangeFromASTNode(node); // For precise diagnostic positioning
```

## Development Workflow

### Build & Watch
- **Development**: `npm run watch` - Webpack watch mode with source maps
- **Testing**: `npm run watch-tests` - TypeScript compilation for tests
- **Packaging**: `npm run package` - Production webpack build

### Testing Strategy
- Tests use sinon for mocking external dependencies
- Test files in `src/test/examples/` provide realistic Dev Proxy configurations
- Extension activation requires waiting for `vscode.extensions.getExtension().isActive`

### Key Dependencies
- `json-to-ast`: Critical for precise JSON parsing and error positioning
- `semver`: Version comparison for feature compatibility
- VS Code Test framework with electron runner

## Extension Points

### Command Registration Pattern
Commands follow enablement contexts based on Dev Proxy state:
```json
"enablement": "isDevProxyRunning && !isDevProxyRecording"
```

### MCP Server Integration
Extension provides Model Context Protocol server with tools:
- `mcp_dev_proxy_FindDocs` - Documentation lookup
- `mcp_dev_proxy_GetVersion` - Version detection

### Task Provider
Custom task definitions for Dev Proxy operations:
```json
{
  "type": "devproxy",
  "command": "start|stop",
  "configFile": "path/to/config"
}
```

## Cross-Platform Considerations

### Package Manager Detection
- **Windows**: Winget availability check before installation
- **macOS**: Homebrew validation
- **Linux**: Manual installation guidance

### Executable Detection
Version preference affects executable name:
- Stable: `devproxy`
- Beta: `devproxy-beta`

## Configuration Schema Management

The extension maintains awareness of Dev Proxy schema versions and validates compatibility:
- Schema URLs must match installed Dev Proxy version
- Plugin path deprecation warnings for v0.29.0+ (old: `dev-proxy-plugins.dll`, new: `DevProxy.Plugins.dll`)
- Automatic schema update code actions available

## Plugin Ecosystem Knowledge

Maintain plugin relationships in `constants.ts`:
- 40+ plugins with instance/config snippet mappings
- Required vs optional configuration sections
- Plugin ordering rules (reporters last, ApiCenterOnboarding after OpenApiSpecGenerator)
- Summary plugins require reporter plugins

When adding new plugins:
- Update both `pluginSnippets` and `pluginDocs` objects with consistent naming.
- Update the `README.md` and `CHANGELOG.md` files to reflect new snippets and documentation.

# Dev Proxy Toolkit

[Dev Proxy](https://aka.ms/devproxy) is an API simulator that helps you effortlessly test your app beyond the happy path.

The Dev Proxy Toolkit extension for Visual Studio Code makes it easy to create and update configuration files.

> [!IMPORTANT]
>
> Dev Proxy Toolkit is designed to be used with the latest version of Dev Proxy. If you are using an earlier build some features may not work as intended. You should update to the latest version.
>

## Features

The following sections describe the features that the extension contributes to Visual Studio Code when installed.

### Code Actions

- Update schema to match installed version of Dev Proxy

### Code Lenses

- Plugin documentation link

### Commands

- `Dev Proxy Toolkit: Start` - Only available when Dev Proxy is not running
- `Dev Proxy Toolkit: Stop` - Only available when Dev Proxy is running
- `Dev Proxy Toolkit: Raise mock request` - Only available when Dev Proxy is running
- `Dev Proxy Toolkit: Start recording` - Only available when Dev Proxy is running
- `Dev Proxy Toolkit: Stop recording`- Only available when Dev Proxy is recording
- `Dev Proxy Toolkit: Open configuration file`- Only available when Dev Proxy is installed

### Diagnostics

- Check for missing `configSection` property in plugin instance for plugins that require configuration
- Check for missing `configSection` when defined in plugin instance
- Check that schema matches installed version of Dev Proxy
- Check that reporters are placed after plugins
- Check that at least one plugin is enabled
- Check that a plugin can be configured with a configSection
- Check for configSections that are not used in plugins
- Check for reporter plugin when a summary plugin is used
- Check that ApiCenterOnboardingPlugin is placed after OpenApiSpecGeneratorPlugin

### Editor Actions

Shown when the active document is a Dev Proxy configuration file

- Start Dev Proxy
- Stop Dev Proxy
- Raise mock request
- Start recording
- Stop recording

### Notifications

- Not installed
- New version detection

### Settings

- `dev-proxy-toolkit.version` - Determines the version to use when Dev Proxy and Dev Proxy Beta are installed side by side. Can be `stable` (default) or `beta`.
- `dev-proxy-toolkit.newTerminal` - Determines if Dev Proxy should be started in a new terminal. Can be `true` (default) or `false`.
- `dev-proxy-toolkit.showTerminal` - Determines if the terminal should be shown when Dev Proxy is started. Can be `true` (default) or `false`.
- `dev-proxy-toolkit.closeTerminal` - Determines if the terminal should be closed when Dev Proxy is stopped. Can be `true` (default) or `false`.
- `dev-proxy-toolkit.apiPort` - Determines the port to use to communicate with Dev Proxy API. Default is `8897`.

### Snippets

| Prefix | Description |
| ------ | ----------- |
| `devproxy-config-file` | Dev Proxy config file |
| `devproxy-config-file-schema` | Dev Proxy config file schema |
| `devproxy-error` | Dev Proxy error |
| `devproxy-mocks-file` | Dev Proxy mocks file |
| `devproxy-mocks-file-schema` | Dev Proxy mocks file schema |
| `devproxy-mock` | Dev Proxy mock |
| `devproxy-request` | Dev Proxy request |
| `devproxy-response` | Dev Proxy response |
| `devproxy-response-header` | Dev Proxy response header |
| `devproxy-rewrite` | Dev Proxy rewrite |
| `devproxy-plugin-auth` | AuthPlugin instance |
| `devproxy-plugin-auth-config-apikey` | AuthPlugin API Key config section |
| `devproxy-plugin-auth-config-oauth2` | AuthPlugin OAuth2 config section |
| `devproxy-plugin-api-center-minimal-permissions` | ApiCenterMinimalPermissionsPlugin instance |
| `devproxy-plugin-api-center-minimal-permissions-config` | ApiCenterMinimalPermissionsPlugin config section |
| `devproxy-plugin-api-center-onboarding` | ApiCenterOnboardingPlugin instance |
| `devproxy-plugin-api-center-onboarding-config` | ApiCenterOnboardingPlugin config section |
| `devproxy-plugin-api-center-production-version` | ApiCenterProductionVersionPlugin instance |
| `devproxy-plugin-api-center-production-version-config` | ApiCenterProductionVersionPlugin config section |
| `devproxy-plugin-caching-guidance` | CachingGuidancePlugin instance |
| `devproxy-plugin-caching-guidance-config` | CachingGuidancePlugin config section |
| `devproxy-plugin-crud-api` | CrudApiPlugin instance |
| `devproxy-plugin-crud-api-config` | CrudApiPlugin config section |
| `devproxy-plugin-crud-api-file` | CrudApiPlugin API file |
| `devproxy-plugin-crud-api-file-schema` | CrudApiPlugin API file schema |
| `devproxy-plugin-crud-api-action` | CrudApiPlugin action |
| `devproxy-plugin-dev-tools` | DevToolsPlugin instance |
| `devproxy-plugin-dev-tools-config` | DevToolsPlugin config section |
| `devproxy-plugin-entra-mock-response` | EntraMockResponsePlugin instance |
| `devproxy-plugin-entra-mock-response-config` | EntraMockResponsePlugin config section |
| `devproxy-plugin-execution-summary` | ExecutionSummaryPlugin instance |
| `devproxy-plugin-execution-summary-config` | ExecutionSummaryPlugin config section |
| `devproxy-plugin-generic-random-error` | GenericRandomErrorPlugin instance |
| `devproxy-plugin-generic-random-error-config` | GenericRandomErrorPlugin config section |
| `devproxy-plugin-generic-random-error-file` | GenericRandomErrorPlugin errors file |
| `devproxy-plugin-generic-random-error-file-schema` | GenericRandomErrorPlugin errors file schema |
| `devproxy-plugin-graph-beta-support-guidance` | GraphBetaSupportGuidancePlugin instance |
| `devproxy-plugin-graph-client-request-id-guidance` | GraphClientRequestIdGuidancePlugin instance |
| `devproxy-plugin-graph-minimal-permissions-guidance` | GraphMinimalPermissionsGuidancePlugin instance |
| `devproxy-plugin-graph-minimal-permissions-guidance-config` | GraphMinimalPermissionsGuidancePlugin config section |
| `devproxy-plugin-graph-minimal-permissions` | GraphMinimalPermissionsPlugin instance |
| `devproxy-plugin-graph-minimal-permissions-config` | GraphMinimalPermissionsPlugin config section |
| `devproxy-plugin-graph-mock-response` | GraphMockResponsePlugin instance |
| `devproxy-plugin-graph-mock-response-config` | GraphMockResponsePlugin config section |
| `devproxy-plugin-graph-random-error` | GraphRandomErrorPlugin instance |
| `devproxy-plugin-graph-random-error-config` | GraphRandomErrorPlugin config section |
| `devproxy-plugin-graph-sdk-guidance` | GraphSdkGuidancePlugin instance |
| `devproxy-plugin-graph-select-guidance` | GraphSdkGuidancePlugin instance |
| `devproxy-plugin-http-file-generator` | HttpFileGeneratorPlugin instance |
| `devproxy-plugin-http-file-generator-config` | HttpFileGeneratorPlugin config section |
| `devproxy-plugin-latency` | LatencyPlugin instance |
| `devproxy-plugin-latency-config` | LatencyPlugin config section |
| `devproxy-plugin-minimal-csom-permissions` | MinimalCsomPermissionsPlugin instance |
| `devproxy-plugin-minimal-csom-permissions-config` | MinimalCsomPermissionsPlugin config section |
| `devproxy-plugin-minimal-permissions` | MinimalPermissionsPlugin instance |
| `devproxy-plugin-minimal-permissions-config` | MinimalPermissionsPlugin config section |
| `devproxy-plugin-mock-generator` | MockGeneratorPlugin instance |
| `devproxy-plugin-mock-request` | MockResponsePlugin instance |
| `devproxy-plugin-mock-request-config` | MockResponsePlugin config section |
| `devproxy-plugin-mock-response` | MockResponsePlugin instance |
| `devproxy-plugin-mock-response-config` | MockResponsePlugin config section |
| `devproxy-plugin-mock-response-schema` | MockResponsePlugin schema |
| `devproxy-plugin-odata-paging-guidance` | ODataPagingGuidancePlugin instance |
| `devproxy-plugin-graph-odsp-search-guidance` | ODSPSearchGuidancePlugin instance |
| `devproxy-plugin-openai-mock-response` | OpenAIMockResponsePlugin instance |
| `devproxy-plugin-open-api-spec-generator` | OpenApiSpecGeneratorPlugin instance |
| `devproxy-plugin-open-api-spec-generator-config` | OpenApiSpecGeneratorPlugin config section |
| `devproxy-plugin-rate-limiting` | MockResponsePlugin instance |
| `devproxy-plugin-rate-limiting-config` | RateLimitingPlugin config section |
| `devproxy-plugin-rate-limiting-file` | Dev Proxy rate limiting file |
| `devproxy-plugin-rate-limiting-file-schema` | Dev Proxy rate limiting file schema |
| `devproxy-plugin-retry-after` | RetryAfterPlugin instance |
| `devproxy-plugin-rewrite` | RewritePlugin instance |
| `devproxy-plugin-rewrite-file` | RewritePlugin rewrites file |
| `devproxy-plugin-rewrite-file-schema` | RewritePlugin rewrites file schema |
| `devproxy-plugin-rewrite-config` | RewritePlugin config section |
| `devproxy-plugin-url-discovery` | UrlDiscoveryPlugin instance |
| `devproxy-reporter-json` | JsonReporter instance |
| `devproxy-reporter-markdown` | MarkdownReporter instance |
| `devproxy-reporter-plain-text` | PlainTextReporter instance |

### Status Bar

- Display installed Dev Proxy version
- Display waring when Dev Proxy is not latest version
- Display tick if Dev Proxy is latest version (check based on `newVersionNotification` config setting in Dev Proxy configuration file)
- Display radio tower when Dev Proxy is running
- Display error is Dev Proxy is not installed

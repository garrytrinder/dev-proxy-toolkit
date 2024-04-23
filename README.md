# Dev Proxy Toolkit

[Dev Proxy](https://aka.ms/devproxy) is a command line tool that helps you simulate behaviors and errors of cloud APIs.

The Dev Proxy Toolkit extension for Visual Studio Code makes it easy to create and update configuration files.

## Features

### Snippets

| Prefix | Description |
| ------ | ----------- |
| `devproxy-config-file` | Dev Proxy config file |
| `devproxy-config-file-schema` | Dev Proxy config file schema |
| `devproxy-mocks-file` | Dev Proxy mocks file |
| `devproxy-mocks-file-schema` | Dev Proxy mocks file schema |
| `devproxy-mock` | Dev Proxy mock |
| `devproxy-request` | Dev Proxy request |
| `devproxy-response` | Dev Proxy response |
| `devproxy-response-header` | Dev Proxy response header |
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
| `devproxy-plugin-graph-mock-response` | GraphMockResponsePlugin instance |
| `devproxy-plugin-graph-random-error` | GraphRandomErrorPlugin instance |
| `devproxy-plugin-graph-random-error-config` | GraphRandomErrorPlugin config section |
| `devproxy-plugin-graph-sdk-guidance` | GraphSdkGuidancePlugin instance |
| `devproxy-plugin-graph-select-guidance` | GraphSdkGuidancePlugin instance |
| `devproxy-plugin-latency` | LatencyPlugin instance |
| `devproxy-plugin-latency-config` | LatencyPlugin config section |
| `devproxy-plugin-graph-minimal-permissions-guidance` | MinimalPermissionsGuidancePlugin instance |
| `devproxy-plugin-graph-minimal-permissions-guidance-config` | MinimalPermissionsGuidancePlugin config section |
| `devproxy-plugin-graph-minimal-permissions` | MinimalPermissionsPlugin instance |
| `devproxy-plugin-graph-minimal-permissions-config` | MinimalPermissionsPlugin config section |
| `devproxy-plugin-mock-generator` | MockGeneratorPlugin instance |
| `devproxy-plugin-mock-request` | MockResponsePlugin instance |
| `devproxy-plugin-mock-request-config` | MockResponsePlugin config section |
| `devproxy-plugin-mock-response` | MockResponsePlugin instance |
| `devproxy-plugin-mock-response-config` | MockResponsePlugin config section |
| `devproxy-plugin-mock-response-schema` | MockResponsePlugin schema |
| `devproxy-plugin-odata-paging-guidance` | ODataPagingGuidancePlugin instance |
| `devproxy-plugin-graph-odsp-search-guidance` | ODSPSearchGuidancePlugin instance |
| `devproxy-plugin-open-api-spec-generator` | OpenApiSpecGeneratorPlugin instance |
| `devproxy-plugin-rate-limiting` | MockResponsePlugin instance |
| `devproxy-plugin-rate-limiting-config` | RateLimitingPlugin config section |
| `devproxy-plugin-rate-limiting-file` | Dev Proxy rate limiting file |
| `devproxy-plugin-rate-limiting-file-schema` | Dev Proxy rate limiting file schema |
| `devproxy-plugin-retry-after` | RetryAfterPlugin instance |

### Diagnostics

The following diagnostic checks are performed:

- Check for empty `urlsToWatch`
- Check for missing `configSection` property in plugin instance for plugins that require configuration
- Check for missing `configSection` when defined in plugin instance
- Check that schema matches installed version of Dev Proxy
- Code action to update schema to correct version

### Dev Proxy detection

The following checks are performed:

- Check if Dev Proxy is installed
- Check if Dev Proxy is the latest version
- Check if Dev Proxy is running

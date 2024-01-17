# Dev Proxy for Visual Studio Code

[Dev Proxy](https://aka.ms/devproxy) is a command line tool that helps you simulate behaviors and errors of cloud APIs.

The Dev Proxy extension makes it easy to create and update configuration files.

## Features

### Snippets

| Prefix | Description |
| ------ | ----------- |
| `devproxy-config` | Dev Proxy config file |
| `devproxy-config-schema` | Dev Proxy config schema |
| `devproxy-errors` | Dev Proxy errors file |
| `devproxy-plugin-caching-guidance` | CachingGuidancePlugin instance |
| `devproxy-plugin-caching-guidance-config` | CachingGuidancePlugin config section |
| `devproxy-plugin-crud-api` | CrudApiPlugin instance |
| `devproxy-plugin-crud-api-config` | CrudApiPlugin config section |
| `devproxy-plugin-crud-api-schema` | CrudApiPlugin schema |
| `devproxy-plugin-dev-tools` | DevToolsPlugin instance |
| `devproxy-plugin-dev-tools-config` | DevToolsPlugin config section |
| `devproxy-plugin-execution-summary` | ExecutionSummaryPlugin instance |
| `devproxy-plugin-execution-summary-config` | ExecutionSummaryPlugin config section |
| `devproxy-plugin-generic-random-error` | GenericRandomErrorPlugin instance |
| `devproxy-plugin-generic-random-error-config` | GenericRandomErrorPlugin config section |
| `devproxy-plugin-generic-random-error-schema` | GenericRandomErrorPlugin schema |
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
| `devproxy-plugin-mock-response` | MockResponsePlugin instance |
| `devproxy-plugin-mock-response-config` | MockResponsePlugin config section |
| `devproxy-plugin-mock-response-schema` | MockResponsePlugin schema |
| `devproxy-plugin-odata-paging-guidance` | ODataPagingGuidancePlugin instance |
| `devproxy-plugin-graph-odsp-search-guidance` | ODSPSearchGuidancePlugin instance |
| `devproxy-plugin-open-api-doc-generator` | OpenAPIDocGeneratorPlugin instance |
| `devproxy-plugin-rate-limiting` | MockResponsePlugin instance |
| `devproxy-plugin-rate-limiting-config` | RateLimitingPlugin config section |
| `devproxy-plugin-rate-limiting-schema` | RateLimitingPlugin schema |
| `devproxy-plugin-retry-after` | RetryAfterPlugin instance |
| `devproxy-response` | Empty Dev Proxy response |
| `devproxy-response-header` | Empty Dev Proxy response header |

### Diagnostics

The following diagnostic checks are performed:

- Check for empty `urlsToWatch`.
- Check for missing `configSection` property in plugin instance for plugins that require configuration.
- Check for missing `configSection` when defined in plugin instance.

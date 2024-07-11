# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2024-07-11

### Changed:

- Snippets: All snippets that reference schemas updated to use `v0.19.1` schema
- Snippets: Removed `configSection` from `devproxy-plugin-graph-minimal-permissions`

### Removed:

- Snippets: `devproxy-plugin-graph-minimal-permissions-config`

## [0.5.0] - 2024-06-27

### Added:

- Snippets: `devproxy-plugin-api-center-minimal-permissions` - ApiCenterMinimalPermissionsPlugin instance
- Snippets: `devproxy-plugin-api-center-minimal-permissions-config` - ApiCenterMinimalPermissionsPlugin config section
- Snippets: `devproxy-plugin-http-file-generator` - HttpFileGeneratorPlugin instance
- Snippets: `devproxy-plugin-http-file-generator-config` - HttpFileGeneratorPlugin config section
- Snippets: `devproxy-plugin-openai-mock-response` - OpenAIMockResponsePlugin instance
- CodeLens: `ApiCenterMinimalPermissionsPlugin`
- CodeLens: `HttpFileGeneratorPlugin`
- CodeLens: `OpenAIMockResponsePlugin`
- File Diagnostic: Check that schema matches installed version of Dev Proxy expanded to all files

### Changed:

- Snippets: All snippets that reference schemas updated to use `v0.19.0` schema

### Fixed:

- Snippets: Removed `configSection` from `devproxy-plugin-graph-minimal-permissions-guidance`

### Removed:

- Snippets: `devproxy-plugin-graph-minimal-permissions-guidance-config`

## [0.4.0] - 2024-05-30

### Added:

- Snippet: `devproxy-reporter-json` - JsonReporter instance
- Snippet: `devproxy-reporter-markdown` - MarkdownReporter instance
- Snippet: `devproxy-reporter-plain-text` - PlainTextReporter instance
- CodeLens: `JsonReporter`
- CodeLens: `MarkdownReporter`
- CodeLens: `PlainTextReporter`
- Config diagnostic: Show warning if plugins follow a reporter in the plugins array

### Changed:

- Notification: Support for installing Dev Proxy via package manager when not installed
- Snippets: All snippets that reference schemas updated to use `v0.18.0` schema

## [0.3.1] - 2024-05-22

### Fixed:

- Fixed issue where `configSection` diagnostic check required `RateLimitingPlugin` to have a `configSection`

## [0.3.0] - 2024-04-25

### Added:

- Config diagnostic: Schema check support for beta installations
- Dev Proxy detection: Support for beta installations
- Setting: Version Preference setting determines which version toolkit should use when installed side-by-side
- Snippet: `devproxy-plugin-api-center-onboarding` - ApiCenterOnboardingPlugin instance
- Snippet: `devproxy-plugin-api-center-onboarding-config` - ApiCenterOnboardingPlugin config section
- Snippet: `devproxy-plugin-api-center-production-version` - ApiCenterProductionVersionPlugin instance
- Snippet: `devproxy-plugin-api-center-production-version-config` - ApiCenterProductionVersionPlugin config section
- Snippet: `devproxy-plugin-entra-mock-response` - EntraMockResponsePlugin instance
- Snippet: `devproxy-plugin-entra-mock-response-config` - EntraMockResponsePlugin config section
- Snippet: `devproxy-plugin-mock-request` - MockRequestPlugin instance
- Snippet: `devproxy-plugin-mock-request-config` - MockRequestPlugin config section
- Code Lens: `ApiCenterOnboardingPlugin`
- Code Lens: `ApiCenterProductionVersionPlugin`
- Code Lens: `EntraMockResponsePlugin`
- Code Lens: `MockRequestPlugin`

### Changed:

- Snippets: All snippets that reference schemas updated to use `v0.17.1` schema
- Snippets: Removed trailing comma from config section snippets
- Status bar: Replaced sync icon with loading icon
- Readme: Snippets table updated
- Dev Proxy detection: Improved latest version check logic, uses `devproxy outdated -s` command

### Fixed:

- Fixed broken link on `OpenApiSpecGeneratorPlugin` code lens

### Removed:

- Config diagnostic: Check for empty `urlsToWatch`

## [0.2.0] - 2024-02-15

### Added

- Dev Proxy detection: Check if installed
- Dev Proxy detection: Check if latest is installed
- Dev Proxy detection: Check if running
- Plugins: Documentation Code Lens
- Config diagnostic: Check that schema matches installed version of Dev Proxy
- Config diagnostic: Code action to update schema to correct version
- CI: Add publish workflow

### Changed

- Snippet: `devproxy-plugin-graph-select-guidance` corrected `name` property to `GraphSelectGuidancePlugin`
- Snippet: `devproxy-plugin-graph-minimal-permissions` corrected `name` property to `MinimalPermissionsPlugin`
- Snippet: `devproxy-plugin-odata-paging-guidance` corrected `name` property to `ODataPagingGuidancePlugin`
- Fixed indenting and removed extra whitespace on snippets
- Updated snippets to use opened arrays over multiple lines for easier update
from:
```json
"value": [ ]
```
to:
```json
"value": [

]
```

## [0.1.0] - 2024-01-18

### Added

- Snippet: `devproxy-config-file` - Dev Proxy config file
- Snippet: `devproxy-config-file-schema` - Dev Proxy config file schema
- Snippet: `devproxy-mocks-file` - Dev Proxy mocks file
- Snippet: `devproxy-mocks-file-schema` - Dev Proxy mocks file schema
- Snippet: `devproxy-mock` - Dev Proxy mock
- Snippet: `devproxy-request` - Dev Proxy request
- Snippet: `devproxy-response` - Dev Proxy response
- Snippet: `devproxy-response-header` - Dev Proxy response header
- Snippet: `devproxy-plugin-caching-guidance` - CachingGuidancePlugin instance
- Snippet: `devproxy-plugin-caching-guidance-config` - CachingGuidancePlugin config section
- Snippet: `devproxy-plugin-crud-api` - CrudApiPlugin instance
- Snippet: `devproxy-plugin-crud-api-config` - CrudApiPlugin config section
- Snippet: `devproxy-plugin-crud-api-file` - CrudApiPlugin API file
- Snippet: `devproxy-plugin-crud-api-file-schema` - CrudApiPlugin API file schema
- Snippet: `devproxy-plugin-crud-api-action` - CrudApiPlugin action
- Snippet: `devproxy-plugin-dev-tools` - DevToolsPlugin instance
- Snippet: `devproxy-plugin-dev-tools-config` - DevToolsPlugin config section
- Snippet: `devproxy-plugin-execution-summary` - ExecutionSummaryPlugin instance
- Snippet: `devproxy-plugin-execution-summary-config` - ExecutionSummaryPlugin config section
- Snippet: `devproxy-plugin-generic-random-error` - GenericRandomErrorPlugin instance
- Snippet: `devproxy-plugin-generic-random-error-config` - GenericRandomErrorPlugin config section
- Snippet: `devproxy-plugin-generic-random-error-file` - GenericRandomErrorPlugin errors file
- Snippet: `devproxy-plugin-generic-random-error-file-schema` - GenericRandomErrorPlugin errors file schema
- Snippet: `devproxy-plugin-graph-beta-support-guidance` - GraphBetaSupportGuidancePlugin instance
- Snippet: `devproxy-plugin-graph-client-request-id-guidance` - GraphClientRequestIdGuidancePlugin instance
- Snippet: `devproxy-plugin-graph-mock-response` - GraphMockResponsePlugin instance
- Snippet: `devproxy-plugin-graph-random-error` - GraphRandomErrorPlugin instance
- Snippet: `devproxy-plugin-graph-random-error-config` - GraphRandomErrorPlugin config section
- Snippet: `devproxy-plugin-graph-sdk-guidance` - GraphSdkGuidancePlugin instance
- Snippet: `devproxy-plugin-graph-select-guidance` - GraphSdkGuidancePlugin instance
- Snippet: `devproxy-plugin-latency` - LatencyPlugin instance
- Snippet: `devproxy-plugin-latency-config` - LatencyPlugin config section
- Snippet: `devproxy-plugin-graph-minimal-permissions-guidance` - MinimalPermissionsGuidancePlugin instance
- Snippet: `devproxy-plugin-graph-minimal-permissions-guidance-config` - MinimalPermissionsGuidancePlugin config section
- Snippet: `devproxy-plugin-graph-minimal-permissions` - MinimalPermissionsPlugin instance
- Snippet: `devproxy-plugin-graph-minimal-permissions-config` - MinimalPermissionsPlugin config section
- Snippet: `devproxy-plugin-mock-generator` - MockGeneratorPlugin instance
- Snippet: `devproxy-plugin-mock-response` - MockResponsePlugin instance
- Snippet: `devproxy-plugin-mock-response-config` - MockResponsePlugin config section
- Snippet: `devproxy-plugin-mock-response-schema` - MockResponsePlugin schema
- Snippet: `devproxy-plugin-odata-paging-guidance` - ODataPagingGuidancePlugin instance
- Snippet: `devproxy-plugin-graph-odsp-search-guidance` - ODSPSearchGuidancePlugin instance
- Snippet: `devproxy-plugin-open-api-spec-generator` - OpenApiSpecGeneratorPlugin instance
- Snippet: `devproxy-plugin-rate-limiting` - MockResponsePlugin instance
- Snippet: `devproxy-plugin-rate-limiting-config` - RateLimitingPlugin config section
- Snippet: `devproxy-plugin-rate-limiting-file` - Dev Proxy rate limiting file
- Snippet: `devproxy-plugin-rate-limiting-file-schema` - Dev Proxy rate limiting file schema
- Snippet: `devproxy-plugin-retry-after` - RetryAfterPlugin instance
- Config diagnostic: Check for empty `urlsToWatch`
- Config diagnostic: Check for missing `configSection` property in plugin instance for plugins that require configuration
- Config diagnostic: Check for missing `configSection` when defined in plugin instance

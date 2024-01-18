import { PluginSnippets } from "./types";

export const pluginSnippets: PluginSnippets = {
    CachingGuidancePlugin: {
        instance: "devproxy-plugin-caching-guidance",
        config: {
            name: "devproxy-plugin-caching-guidance-config",
            required: false
        }
    },
    CrudApiPlugin: {
        instance: "devproxy-plugin-crud-api",
        config: {
            name: "devproxy-plugin-crud-api-config",
            required: true
        },
    },
    DevToolsPlugin: {
        instance: "devproxy-plugin-dev-tools",
        config: {
            name: "devproxy-plugin-dev-tools-config",
            required: false
        },
    },
    ExecutionSummaryPlugin: {
        instance: "devproxy-plugin-execution-summary",
        config: {
            name: "devproxy-plugin-execution-summary-config",
            required: false
        }
    },
    GenericRandomErrorPlugin: {
        instance: "devproxy-plugin-generic-random-error",
        config: {
            name: "devproxy-plugin-generic-random-error-config",
            required: true
        }
    },
    GraphBetaSupportGuidancePlugin: {
        instance: "devproxy-plugin-graph-beta-support-guidance"
    },
    GraphClientRequestIdGuidancePlugin: {
        instance: "devproxy-plugin-graph-client-request-id-guidance"
    },
    GraphMockResponsePlugin: {
        instance: "devproxy-plugin-graph-mock-response"
    },
    GraphRandomErrorPlugin: {
        instance: "devproxy-plugin-graph-random-error",
        config: {
            name: "devproxy-plugin-graph-random-error-config",
            required: false
        }
    },
    GraphSdkGuidancePlugin: {
        instance: "devproxy-plugin-graph-sdk-guidance",
    },
    GraphSelectGuidancePlugin: {
        instance: "devproxy-plugin-graph-select-guidance",
    },
    LatencyPlugin: {
        instance: "devproxy-plugin-latency",
        config: {
            name: "devproxy-plugin-latency-config",
            required: false
        }
    },
    MinimalPermissionsGuidancePlugin:
    {
        instance: "devproxy-plugin-minimal-permissions-guidance",
        config: {
            name: "devproxy-plugin-minimal-permissions-guidance-config",
            required: false
        }
    },
    MinimalPermissionsPlugin: {
        instance: "devproxy-plugin-minimal-permissions",
        config: {
            name: "devproxy-plugin-minimal-permissions-config",
            required: false
        }
    },
    MockGeneratorPlugin: {
        instance: "devproxy-plugin-mock-generator"
    },
    MockResponsePlugin: {
        instance: "devproxy-plugin-mock-response",
        config: {
            name: "devproxy-plugin-mock-response-config",
            required: true
        }
    },
    ODataPagingGuidancePlugin: {
        instance: "devproxy-plugin-odata-paging-guidance"
    },
    ODSPSearchGuidancePlugin: {
        instance: "devproxy-plugin-odsp-search-guidance"
    },
    OpenAPIDocGeneratorPlugin: {
        instance: "devproxy-plugin-openapi-doc-generator"
    },
    RateLimitingPlugin: {
        instance: "devproxy-plugin-rate-limiting",
        config: {
            name: "devproxy-plugin-rate-limiting-config",
            required: true
        }
    },
    RetryAfterPlugin: {
        instance: "devproxy-plugin-retry-after"
    }
};
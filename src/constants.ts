import { PluginDocs, PluginSnippets } from './types';

export const pluginSnippets: PluginSnippets = {
  ApiCenterMinimalPermissionsPlugin: {
    instance: 'devproxy-plugin-api-center-minimal-permissions',
    config: {
      name: 'devproxy-plugin-api-center-minimal-permissions-onboarding-config',
      required: true,
    }
  },
  ApiCenterOnboardingPlugin: {
    instance: 'devproxy-plugin-api-center-onboarding',
    config: {
      name: 'devproxy-plugin-api-center-onboarding-config',
      required: true,
    }
  },
  ApiCenterProductionVersionPlugin: {
    instance: 'devproxy-plugin-api-center-production-version',
    config: {
      name: 'devproxy-plugin-api-center-production-version-config',
      required: true,
    },
  },
  CachingGuidancePlugin: {
    instance: 'devproxy-plugin-caching-guidance',
    config: {
      name: 'devproxy-plugin-caching-guidance-config',
      required: false,
    },
  },
  CrudApiPlugin: {
    instance: 'devproxy-plugin-crud-api',
    config: {
      name: 'devproxy-plugin-crud-api-config',
      required: true,
    },
  },
  DevToolsPlugin: {
    instance: 'devproxy-plugin-dev-tools',
    config: {
      name: 'devproxy-plugin-dev-tools-config',
      required: false,
    },
  },
  EntraMockResponsePlugin: {
    instance: 'devproxy-plugin-entra-mock-response',
    config: {
      name: 'devproxy-plugin-entra-mock-response-config',
      required: true,
    },
  },
  ExecutionSummaryPlugin: {
    instance: 'devproxy-plugin-execution-summary',
    config: {
      name: 'devproxy-plugin-execution-summary-config',
      required: false,
    },
  },
  GenericRandomErrorPlugin: {
    instance: 'devproxy-plugin-generic-random-error',
    config: {
      name: 'devproxy-plugin-generic-random-error-config',
      required: true,
    },
  },
  GraphBetaSupportGuidancePlugin: {
    instance: 'devproxy-plugin-graph-beta-support-guidance',
  },
  GraphClientRequestIdGuidancePlugin: {
    instance: 'devproxy-plugin-graph-client-request-id-guidance',
  },
  GraphMockResponsePlugin: {
    instance: 'devproxy-plugin-graph-mock-response',
  },
  GraphRandomErrorPlugin: {
    instance: 'devproxy-plugin-graph-random-error',
    config: {
      name: 'devproxy-plugin-graph-random-error-config',
      required: false,
    },
  },
  GraphSdkGuidancePlugin: {
    instance: 'devproxy-plugin-graph-sdk-guidance',
  },
  GraphSelectGuidancePlugin: {
    instance: 'devproxy-plugin-graph-select-guidance',
  },
  HttpFileGeneratorPlugin: {
    instance: 'devproxy-plugin-http-file-generator',
    config: {
      name: 'devproxy-plugin-http-file-generator-config',
      required: false,
    },
  },
  LatencyPlugin: {
    instance: 'devproxy-plugin-latency',
    config: {
      name: 'devproxy-plugin-latency-config',
      required: false,
    },
  },
  MinimalPermissionsGuidancePlugin: {
    instance: 'devproxy-plugin-minimal-permissions-guidance'
  },
  MinimalPermissionsPlugin: {
    instance: 'devproxy-plugin-minimal-permissions',
    config: {
      name: 'devproxy-plugin-minimal-permissions-config',
      required: false,
    },
  },
  MockGeneratorPlugin: {
    instance: 'devproxy-plugin-mock-generator',
  },
  MockRequestPlugin: {
    instance: 'devproxy-plugin-mock-request',
    config: {
      name: 'devproxy-plugin-mock-request-config',
      required: true,
    },
  },
  MockResponsePlugin: {
    instance: 'devproxy-plugin-mock-response',
    config: {
      name: 'devproxy-plugin-mock-response-config',
      required: true,
    },
  },
  ODataPagingGuidancePlugin: {
    instance: 'devproxy-plugin-odata-paging-guidance',
  },
  ODSPSearchGuidancePlugin: {
    instance: 'devproxy-plugin-odsp-search-guidance',
  },
  OpenApiSpecGeneratorPlugin: {
    instance: 'devproxy-plugin-openapi-doc-generator',
  },
  RateLimitingPlugin: {
    instance: 'devproxy-plugin-rate-limiting',
    config: {
      name: 'devproxy-plugin-rate-limiting-config',
      required: false,
    },
  },
  RetryAfterPlugin: {
    instance: 'devproxy-plugin-retry-after',
  },
  JsonReporter: {
    instance: 'devproxy-reporter-json',
  },
  MarkdownReporter: {
    instance: 'devproxy-reporter-markdown'
  },
  PlainTextReporter: {
    instance: 'devproxy-reporter-plain-text'
  },
};

export const pluginDocs: PluginDocs = {
  ApiCenterMinimalPermissionsPlugin: {
    name: 'API Center Minimal Permissions Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/apicenterminimalpermissionsplugin',
  },
  ApiCenterOnboardingPlugin: {
    name: 'API Center Onboarding Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/apicenteronboardingplugin',
  },
  ApiCenterProductionVersionPlugin: {
    name: 'API Center Production Version Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/apicenterproductionversionplugin',
  },
  CachingGuidancePlugin: {
    name: 'Caching Guidance Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/cachingguidanceplugin',
  },
  CrudApiPlugin: {
    name: 'CRUD API Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/crudapiplugin',
  },
  DevToolsPlugin: {
    name: 'Dev Tools Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/devtoolsplugin',
  },
  EntraMockResponsePlugin: {
    name: 'Entra Mock Response Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/entramockresponseplugin',
  },
  ExecutionSummaryPlugin: {
    name: 'Execution Summary Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/executionsummaryplugin',
  },
  GenericRandomErrorPlugin: {
    name: 'Generic Random Error Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/genericrandomerrorplugin',
  },
  GraphBetaSupportGuidancePlugin: {
    name: 'Graph Beta Support Guidance Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/graphbetasupportguidanceplugin',
  },
  GraphClientRequestIdGuidancePlugin: {
    name: 'Graph Client Request ID Guidance Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/graphclientrequestidguidanceplugin',
  },
  GraphMockResponsePlugin: {
    name: 'Graph Mock Response Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/graphmockresponseplugin',
  },
  GraphRandomErrorPlugin: {
    name: 'Graph Random Error Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/graphrandomerrorplugin',
  },
  GraphSdkGuidancePlugin: {
    name: 'Graph SDK Guidance Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/graphsdkguidanceplugin',
  },
  GraphSelectGuidancePlugin: {
    name: 'Graph Select Guidance Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/graphselectguidanceplugin',
  },
  HttpFileGeneratorPlugin: {
    name: 'HTTP File Generator Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/httpfilegeneratorplugin',
  },
  LatencyPlugin: {
    name: 'Latency Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/latencyplugin',
  },
  MinimalPermissionsGuidancePlugin: {
    name: 'Minimal Permissions Guidance Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/minimalpermissionsguidanceplugin',
  },
  MinimalPermissionsPlugin: {
    name: 'Minimal Permissions Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/minimalpermissionsplugin',
  },
  MockGeneratorPlugin: {
    name: 'Mock Generator Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/mockgeneratorplugin',
  },
  MockRequestPlugin: {
    name: 'Mock Request Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/mockrequestplugin',
  },
  MockResponsePlugin: {
    name: 'Mock Response Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/mockresponseplugin',
  },
  ODataPagingGuidancePlugin: {
    name: 'OData Paging Guidance Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/odatapagingguidanceplugin',
  },
  ODSPSearchGuidancePlugin: {
    name: 'ODSP Search Guidance Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/odspsearchguidanceplugin',
  },
  OpenApiSpecGeneratorPlugin: {
    name: 'Open API Spec Generator Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/openapispecgeneratorplugin',
  },
  RateLimitingPlugin: {
    name: 'Rate Limiting Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/ratelimitingplugin',
  },
  RetryAfterPlugin: {
    name: 'Retry After Plugin',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/retryafterplugin',
  },
  JsonReporter: {
    name: 'JSON Reporter',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/jsonreporter',
  },
  MarkdownReporter: {
    name: 'Markdown Reporter',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/markdownreporter',
  },
  PlainTextReporter: {
    name: 'Plain Text Reporter',
    url: 'https://learn.microsoft.com/microsoft-cloud/dev/dev-proxy/technical-reference/plaintextreporter',
  }
};
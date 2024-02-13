export type PluginConfig = {
  name: string;
  required: boolean;
};

export type PluginDocs = {
  [key: string]: {
    name: string;
    url: string;
  };
};

export type PluginSnippets = {
  [key: string]: {
    instance: string;
    config?: PluginConfig;
  };
};

export type DevProxyInstall = {
  filePath: string;
  version: string;
  isInstalled: boolean;
  isBeta: boolean;
  platform: NodeJS.Platform;
};
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
    requiresLanguageModel?: boolean;
  };
};

export type DevProxyInstall = {
  isBeta: boolean;
  isInstalled: boolean;
  isOutdated: boolean;
  isRunning: boolean;
  outdatedVersion: string;
  platform: NodeJS.Platform;
  version: string;
};

export type Release = {
  url: string
  assets_url: string
  upload_url: string
  html_url: string
  id: number
  author: Author
  node_id: string
  tag_name: string
  target_commitish: string
  name: string
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string
  assets: Asset[]
  tarball_url: string
  zipball_url: string
  body: string
  mentions_count: number
};

type Author = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
};

type Asset = {
  url: string
  id: number
  node_id: string
  name: string
  label: string
  uploader: Uploader
  content_type: string
  state: string
  size: number
  download_count: number
  created_at: string
  updated_at: string
  browser_download_url: string
};

type Uploader = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
};

export type PluginSnippets = {
    [key: string]: {
        instance: string;
        config?: PluginConfig;
    };
};

export type PluginConfig = {
    name: string;
    required: boolean;
};
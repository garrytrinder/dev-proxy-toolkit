import * as vscode from 'vscode';
import { pluginDocs } from './constants';

export const registerCommands = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.install', async (platform: NodeJS.Platform) => {
            const url = `https://aka.ms/devproxy/install/${platform === 'darwin' ? 'macos' : 'windows'}`;
            vscode.env.openExternal(vscode.Uri.parse(url));
        }));

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'dev-proxy-toolkit.openPluginDoc',
            pluginName => {
                const target = vscode.Uri.parse(pluginDocs[pluginName].url);
                vscode.env.openExternal(target);
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.upgrade', async () => {
            const url = 'https://aka.ms/devproxy/upgrade';
            vscode.env.openExternal(vscode.Uri.parse(url));
        }));
};
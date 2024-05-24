import * as vscode from 'vscode';
import { pluginDocs } from './constants';
import { VersionPreference } from './enums';
import { executeCommand } from './helpers';

export const registerCommands = (context: vscode.ExtensionContext, configuration: vscode.WorkspaceConfiguration) => {
    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.install', async (platform: NodeJS.Platform) => {
            const versionPreference = configuration.get('versionPreference') as VersionPreference;
            const id = versionPreference === VersionPreference.Stable ? 'Microsoft.DevProxy' : 'Microsoft.DevProxy.Beta';
            const message = vscode.window.setStatusBarMessage('Installing Dev Proxy...');

            // we are on windows so we can use winget
            if (platform === 'win32') {
                // we first need to check if winget is installed, it is bundled with windows 11 but not windows 10
                try {
                    await executeCommand('winget --version');
                } catch (error) {
                    await vscode.window.showErrorMessage('Winget is not installed. Please install winget and try again.');
                    return;
                }

                // winget is installed so we can proceed with the installation
                try {
                    await executeCommand(`winget install ${id} --silent`);
                    const result = await vscode.window.showInformationMessage('Dev Proxy installed.', 'Reload');
                    if (result === 'Reload') {
                        await vscode.commands.executeCommand('workbench.action.reloadWindow');
                    };
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to install Dev Proxy.\n${error}`);
                }
            }

            // we are on macos so we can use brew
            if (platform === 'darwin') {
                try {
                    await executeCommand('brew tap microsoft/dev-proxy');
                    await executeCommand(`brew install ${id}`);
                    const result = await vscode.window.showInformationMessage('Dev Proxy installed.', 'Reload');
                    if (result === 'Reload') {
                        await vscode.commands.executeCommand('workbench.action.reloadWindow');
                    };
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to install Dev Proxy.\n${error}`);
                }
            }

            if (platform === 'linux') {
                // we are on linux so we point the user to the documentation to install manually
                const url = 'https://aka.ms/devproxy/start';
                vscode.env.openExternal(vscode.Uri.parse(url));
            }

            // remove the status bar message
            message.dispose();
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
import * as vscode from 'vscode';
import { pluginDocs } from './constants';
import { VersionPreference } from './enums';
import { executeCommand, isConfigFile } from './helpers';

export const registerCommands = (context: vscode.ExtensionContext, configuration: vscode.WorkspaceConfiguration) => {
    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.install', async (platform: NodeJS.Platform) => {
            const versionPreference = configuration.get('version') as VersionPreference;
            const message = vscode.window.setStatusBarMessage('Installing Dev Proxy...');
            
            // we are on windows so we can use winget
            if (platform === 'win32') {
                const id = versionPreference === VersionPreference.Stable ? 'Microsoft.DevProxy' : 'Microsoft.DevProxy.Beta';
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
                const id = versionPreference === VersionPreference.Stable ? 'devproxy' : 'devproxy-beta';
                try {
                    await executeCommand('brew tap dotnet/dev-proxy');
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
                const url = 'https://aka.ms/devproxy/start/linux';
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

    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.start', async () => {
            const showTerminal = configuration.get('showTerminal') as boolean;
            const newTerminal = configuration.get('newTerminal') as boolean;

            let terminal: vscode.Terminal;

            if (!newTerminal && vscode.window.activeTerminal) {
                terminal = vscode.window.activeTerminal;
            } else {
                terminal = vscode.window.createTerminal('Dev Proxy');

                showTerminal ? terminal.show() : terminal.hide();
            }

            vscode.window.activeTextEditor && isConfigFile(vscode.window.activeTextEditor.document)
                ? terminal.sendText(`devproxy --config-file "${vscode.window.activeTextEditor.document.uri.fsPath}"`)
                : terminal.sendText('devproxy');
        }));

    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.stop', async () => {
            const apiPort = configuration.get('apiPort') as number;
            await fetch(`http://localhost:${apiPort}/proxy/stopproxy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const closeTerminal = configuration.get('closeTerminal') as boolean;
            if (closeTerminal) {
                vscode.window.terminals.forEach(terminal => {
                    if (terminal.name === 'Dev Proxy') {
                        terminal.dispose();
                    }
                });
            }
        }));

    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.raise-mock', async () => {
            const apiPort = configuration.get('apiPort') as number;
            await fetch(`http://localhost:${apiPort}/proxy/raisemockrequest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            vscode.window.showInformationMessage('Mock request raised');
        }));

    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.record-start', async () => {
            const apiPort = configuration.get('apiPort') as number;
            try {
                await fetch(`http://localhost:${apiPort}/proxy`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ recording: true })
                });
                vscode.commands.executeCommand('setContext', 'isDevProxyRecording', true);
            } catch {
                vscode.window.showErrorMessage('Failed to start recording');
            }
        }));

    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.record-stop', async () => {
            const apiPort = configuration.get('apiPort') as number;
            try {
                await fetch(`http://localhost:${apiPort}/proxy`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ recording: false })
                });
                vscode.commands.executeCommand('setContext', 'isDevProxyRecording', false);
            } catch {
                vscode.window.showErrorMessage('Failed to stop recording');
            }
        }));
};
import * as vscode from 'vscode';
import { pluginDocs } from './constants';
import { VersionExeName, VersionPreference } from './enums';
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
                const id = versionPreference === VersionPreference.Stable ? 'dev-proxy' : 'dev-proxy-beta';
                // check if brew is installed
                try {
                    await executeCommand('brew --version');
                } catch (error) {
                    await vscode.window.showErrorMessage('Homebrew is not installed. Please install brew and try again.');
                    return;
                }

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
                const checkProxyStatus = async () => {
                    try {
                        const response = await fetch(`http://localhost:${apiPort}/proxy`);
                        return response.ok;
                    } catch {
                        return false;
                    }
                };

                const waitForProxyToStop = async () => {
                    let isRunning = true;
                    while (isRunning) {
                        isRunning = await checkProxyStatus();
                        if (isRunning) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }
                };

                await waitForProxyToStop();

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
            await fetch(`http://localhost:${apiPort}/proxy/mockrequest`, {
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

    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.config-open', async () => {
            const versionPreference = configuration.get('version') as VersionPreference;
            versionPreference === VersionPreference.Stable
                ? await executeCommand(`${VersionExeName.Stable} config open`)
                : await executeCommand(`${VersionExeName.Beta} config open`);
        }));

    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.config-new', async () => {
            const versionPreference = configuration.get('version') as VersionPreference;
            const exeName = versionPreference === VersionPreference.Stable ? VersionExeName.Stable : VersionExeName.Beta;

            // ask the user for the filename that they want to use
            const fileName = await vscode.window.showInputBox({
                prompt: 'Enter the name of the new config file',
                value: 'devproxyrc.json',
                validateInput: (value: string) => {
                    console.log(value);
                    const errors: string[] = [];

                    if (!value) {
                        errors.push('The file name cannot be empty');
                    }

                    if (value.includes('/') || value.includes('\\') || value.includes(' ') || value.includes(':') || value.includes('*') || value.includes('?') || value.includes('"') || value.includes('<') || value.includes('>') || value.includes('|')) {
                        errors.push('The file name cannot contain special characters');
                    }

                    if (!value.endsWith('.json') && !value.endsWith('.jsonc')) {
                        errors.push('The file name must use .json or .jsonc extension');
                    }

                    return errors.length === 0 ? undefined : errors[0];
                }
            });

            // check if file exists, if it does show an error message
            // we do this after the user has entered the filename 
            try {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
                console.log(workspaceFolder);
                const { type } = await vscode.workspace.fs.stat(vscode.Uri.file(`${workspaceFolder}/${fileName}`));
                if (type === vscode.FileType.File) {
                    vscode.window.showErrorMessage('A file with that name already exists');
                    return;
                }
            } catch { } // file does not exist, continue

            try {
                // show progress
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Creating new config file...'
                }, async () => {
                    await executeCommand(`${exeName} config new ${fileName}`, { cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath });
                });

                const configUri = vscode.Uri.file(`${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/${fileName}`);
                const document = await vscode.workspace.openTextDocument(configUri);
                await vscode.window.showTextDocument(document);
            } catch (error) {
                vscode.window.showErrorMessage('Failed to create new config file');
            }
        }));
};

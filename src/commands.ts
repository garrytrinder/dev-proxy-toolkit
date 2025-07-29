import * as vscode from 'vscode';
import { pluginDocs } from './constants';
import { VersionPreference } from './enums';
import { executeCommand, isConfigFile, openUpgradeDocumentation, upgradeDevProxyWithPackageManager } from './helpers';
import { isDevProxyRunning, getDevProxyExe } from './detect';

export const registerCommands = (context: vscode.ExtensionContext, configuration: vscode.WorkspaceConfiguration) => {
    const versionPreference = configuration.get('version') as VersionPreference;
    const devProxyExe = getDevProxyExe(configuration.get('version') as VersionPreference);

    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.install', async (platform: NodeJS.Platform) => {
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
            const platform = process.platform;
            const versionPreference = configuration.get('version') as VersionPreference;
            
            // Handle Linux early - always redirect to documentation
            if (platform === 'linux') {
                openUpgradeDocumentation();
                return;
            }
            
            // Handle Windows
            if (platform === 'win32') {
                const packageId = versionPreference === VersionPreference.Stable ? 'Microsoft.DevProxy' : 'Microsoft.DevProxy.Beta';
                const upgradeCommand = `winget upgrade ${packageId} --silent`;
                const isBeta = versionPreference === VersionPreference.Beta;
                
                const upgraded = await upgradeDevProxyWithPackageManager('winget', packageId, upgradeCommand, isBeta);
                if (!upgraded) {
                    openUpgradeDocumentation();
                }
                return;
            }
            
            // Handle macOS
            if (platform === 'darwin') {
                const packageId = versionPreference === VersionPreference.Stable ? 'dev-proxy' : 'dev-proxy-beta';
                const upgradeCommand = `brew upgrade ${packageId}`;
                const isBeta = versionPreference === VersionPreference.Beta;
                
                const upgraded = await upgradeDevProxyWithPackageManager('brew', packageId, upgradeCommand, isBeta);
                if (!upgraded) {
                    openUpgradeDocumentation();
                }
                return;
            }
            
            // Unknown platform - redirect to documentation
            openUpgradeDocumentation();
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
                ? terminal.sendText(`${devProxyExe} --config-file "${vscode.window.activeTextEditor.document.uri.fsPath}"`)
                : terminal.sendText(devProxyExe);
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
                        return await isDevProxyRunning(devProxyExe);
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
        vscode.commands.registerCommand('dev-proxy-toolkit.restart', async () => {
            const apiPort = configuration.get('apiPort') as number;

            try {
                await fetch(`http://localhost:${apiPort}/proxy/stopproxy`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const checkProxyStatus = async () => {
                    try {
                        return await isDevProxyRunning(devProxyExe);
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

                const showTerminal = configuration.get('showTerminal') as boolean;

                let terminal: vscode.Terminal;

                if (vscode.window.activeTerminal) {
                    terminal = vscode.window.activeTerminal;
                } else {
                    terminal = vscode.window.createTerminal('Dev Proxy');

                    showTerminal ? terminal.show() : terminal.hide();
                }

                vscode.window.activeTextEditor && isConfigFile(vscode.window.activeTextEditor.document)
                    ? terminal.sendText(`${devProxyExe} --config-file "${vscode.window.activeTextEditor.document.uri.fsPath}"`)
                    : terminal.sendText(devProxyExe);
            } catch {
                vscode.window.showErrorMessage('Failed to restart Dev Proxy');
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
            await executeCommand(`${devProxyExe} config open`);
        }));

    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.config-new', async () => {
            // ask the user for the filename that they want to use
            const fileName = await vscode.window.showInputBox({
                prompt: 'Enter the name of the new config file',
                placeHolder: 'devproxyrc.json',
                value: 'devproxyrc.json',
                validateInput: (value: string) => {
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
                const { type } = await vscode.workspace.fs.stat(vscode.Uri.file(`${workspaceFolder}/.devproxy/${fileName}`));
                if (type === vscode.FileType.File) {
                    vscode.window.showErrorMessage('A file with that name already exists');
                    return;
                }
            } catch { } // file does not exist, continue

            try {
                // ensure .devproxy folder exists
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
                const devProxyFolder = vscode.Uri.file(`${workspaceFolder}/.devproxy`);
                
                try {
                    await vscode.workspace.fs.stat(devProxyFolder);
                } catch {
                    // folder doesn't exist, create it
                    await vscode.workspace.fs.createDirectory(devProxyFolder);
                }

                // show progress
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Creating new config file...'
                }, async () => {
                    await executeCommand(`${devProxyExe} config new ${fileName}`, { cwd: `${workspaceFolder}/.devproxy` });
                });

                const configUri = vscode.Uri.file(`${workspaceFolder}/.devproxy/${fileName}`);
                const document = await vscode.workspace.openTextDocument(configUri);
                await vscode.window.showTextDocument(document);
            } catch (error) {
                vscode.window.showErrorMessage('Failed to create new config file');
            }
        }));

    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.discover-urls-to-watch', async () => {
            const newTerminal = configuration.get('newTerminal') as boolean;

            let terminal: vscode.Terminal;

            if (!newTerminal && vscode.window.activeTerminal) {
                terminal = vscode.window.activeTerminal;
            } else {
                terminal = vscode.window.createTerminal('Dev Proxy');

            }

            const processNames = await vscode.window.showInputBox({
                prompt: 'Enter the process names (space separated). Leave empty to intercept requests from all processes.',
                placeHolder: 'msedge pwsh',
                value: '',
                title: 'Intercept requests from specific processes',
                validateInput: (value: string) => {
                    // can be empty string, but if not, must contain space separated process names
                    if (value && !/^[a-zA-Z0-9\s]+$/.test(value)) {
                        return 'Process names can only contain alphanumeric characters and spaces';
                    }
                    return undefined; // no error
                }
            });

            processNames !== undefined && processNames.trim() !== ''
                ? terminal.sendText(`${devProxyExe} --discover --watch-process-names ${processNames.trim()}`)
                : terminal.sendText(`${devProxyExe} --discover`);
        }));

    context.subscriptions.push(
        vscode.commands.registerCommand('dev-proxy-toolkit.jwt-create', async () => {
            try {
                // Collect JWT parameters through input dialogs with sensible defaults
                const name = await vscode.window.showInputBox({
                    prompt: 'Enter the name of the user to create the token for',
                    placeHolder: 'Dev Proxy',
                    value: 'Dev Proxy',
                    title: 'JWT Generation - User Name'
                });

                if (name === undefined) {
                    return; // User cancelled
                }

                const issuer = await vscode.window.showInputBox({
                    prompt: 'Enter the issuer of the token',
                    placeHolder: 'dev-proxy',
                    value: 'dev-proxy',
                    title: 'JWT Generation - Issuer'
                });

                if (issuer === undefined) {
                    return; // User cancelled
                }

                const audiences = await vscode.window.showInputBox({
                    prompt: 'Enter the audiences (comma-separated for multiple)',
                    placeHolder: 'https://myserver.com',
                    value: 'https://myserver.com',
                    title: 'JWT Generation - Audiences'
                });

                if (audiences === undefined) {
                    return; // User cancelled
                }

                const roles = await vscode.window.showInputBox({
                    prompt: 'Enter roles (comma-separated, leave empty for none)',
                    placeHolder: 'admin,user',
                    value: '',
                    title: 'JWT Generation - Roles (Optional)'
                });

                if (roles === undefined) {
                    return; // User cancelled
                }

                const scopes = await vscode.window.showInputBox({
                    prompt: 'Enter scopes (comma-separated, leave empty for none)',
                    placeHolder: 'read,write',
                    value: '',
                    title: 'JWT Generation - Scopes (Optional)'
                });

                if (scopes === undefined) {
                    return; // User cancelled
                }

                const claims = await vscode.window.showInputBox({
                    prompt: 'Enter custom claims in format name:value (comma-separated, leave empty for none)',
                    placeHolder: 'custom:claim,department:engineering',
                    value: '',
                    title: 'JWT Generation - Custom Claims (Optional)'
                });

                if (claims === undefined) {
                    return; // User cancelled
                }

                const validFor = await vscode.window.showInputBox({
                    prompt: 'Enter token validity duration in minutes',
                    placeHolder: '60',
                    value: '60',
                    title: 'JWT Generation - Validity Duration',
                    validateInput: (value: string) => {
                        const num = parseInt(value);
                        if (isNaN(num) || num <= 0) {
                            return 'Please enter a positive number';
                        }
                        return undefined;
                    }
                });

                if (validFor === undefined) {
                    return; // User cancelled
                }

                // Build the command with all parameters
                let command = `${devProxyExe} jwt create --name "${name}" --issuer "${issuer}" --valid-for ${validFor}`;

                // Add audiences (can have multiple)
                const audienceList = audiences.split(',').map(a => a.trim()).filter(a => a);
                audienceList.forEach(audience => {
                    command += ` --audiences "${audience}"`;
                });

                // Add roles if provided
                const roleList = roles.split(',').map(r => r.trim()).filter(r => r);
                roleList.forEach(role => {
                    command += ` --roles "${role}"`;
                });

                // Add scopes if provided
                const scopeList = scopes.split(',').map(s => s.trim()).filter(s => s);
                scopeList.forEach(scope => {
                    command += ` --scopes "${scope}"`;
                });

                // Add custom claims if provided
                const claimList = claims.split(',').map(c => c.trim()).filter(c => c);
                claimList.forEach(claim => {
                    if (claim.includes(':')) {
                        command += ` --claims "${claim}"`;
                    }
                });

                // Show progress and execute the command
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Generating JWT...',
                    cancellable: false
                }, async () => {
                    try {
                        const result = await executeCommand(command);
                        
                        // Extract the token from the result (it should be on the last non-empty line)
                        const lines = result.split('\n').filter(line => line.trim());
                        const token = lines[lines.length - 1].trim();
                        
                        // Show the token in a dialog with copy option
                        const choice = await vscode.window.showInformationMessage(
                            'JWT generated successfully!',
                            { modal: true },
                            'Copy to Clipboard',
                            'Show Token'
                        );

                        if (choice === 'Copy to Clipboard') {
                            await vscode.env.clipboard.writeText(token);
                            vscode.window.showInformationMessage('JWT copied to clipboard');
                        } else if (choice === 'Show Token') {
                            // Create a new untitled document to show the token
                            const document = await vscode.workspace.openTextDocument({
                                content: `JWT Generated: ${new Date().toISOString()}\n\nToken: ${token}\n\nCommand used:\n${command}`,
                                language: 'plaintext'
                            });
                            await vscode.window.showTextDocument(document);
                        }
                    } catch (error) {
                        vscode.window.showErrorMessage(`Failed to generate JWT token: ${error}`);
                    }
                });

            } catch (error) {
                vscode.window.showErrorMessage(`Error in JWT generation: ${error}`);
            }
        }));
};

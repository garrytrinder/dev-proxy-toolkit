import * as vscode from 'vscode';
import { detectDevProxyInstall } from './detect';
import { VersionPreference } from './enums';

export const updateGlobalState = async (context: vscode.ExtensionContext, versionPreference: VersionPreference) => {
    const devProxyInstall = await detectDevProxyInstall(versionPreference);
    vscode.commands.executeCommand('setContext', 'isDevProxyInstalled', devProxyInstall.isInstalled);
    context.globalState.update('devProxyInstall', devProxyInstall);
};
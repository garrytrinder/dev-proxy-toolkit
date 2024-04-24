import * as vscode from 'vscode';
import { detectDevProxyInstall } from './detect';
import { VersionPreference } from './enums';

export const updateGlobalState = async (context: vscode.ExtensionContext, versionPreference: VersionPreference) => {
    context.globalState.update('devProxyInstall', await detectDevProxyInstall(versionPreference));
};
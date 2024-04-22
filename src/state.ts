import * as vscode from 'vscode';
import { detectDevProxyInstall } from './detect';

export const updateGlobalState = async (context: vscode.ExtensionContext) => {
    context.globalState.update('devProxyInstall', await detectDevProxyInstall());
};
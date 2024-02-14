import * as vscode from 'vscode';
import { detectDevProxyInstall } from './detect';
import { testDevProxyInstall } from './constants';

export const updateGlobalState = async (context: vscode.ExtensionContext) => {
    context.extensionMode === vscode.ExtensionMode.Test
        ? context.globalState.update('devProxyInstall', testDevProxyInstall)
        : context.globalState.update('devProxyInstall', await detectDevProxyInstall());
};
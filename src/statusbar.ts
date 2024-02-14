import * as vscode from 'vscode';
import { DevProxyInstall } from './types';

export const createStatusBar = (context: vscode.ExtensionContext): vscode.StatusBarItem => {
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '$(sync~spin) Dev Proxy';
    statusBar.show();
    context.subscriptions.push(statusBar);
    return statusBar;
};

export const updateStatusBar = (statusBar: vscode.StatusBarItem, devProxyInstall: DevProxyInstall) => {
    statusBar = handleStatusBarUpdate(statusBar, devProxyInstall);
};

export const handleStatusBarUpdate = (statusBar: vscode.StatusBarItem, devProxyInstall: DevProxyInstall): vscode.StatusBarItem => {
    if (devProxyInstall.isInstalled) {
        statusBar.backgroundColor = new vscode.ThemeColor('statusBar.background');
        statusBar.color = new vscode.ThemeColor('statusBar.foreground');
        statusBar.text = `$(check) Dev Proxy ${devProxyInstall.version}`;
        statusBar.tooltip = `You have the latest version installed`;
    }
    if (!devProxyInstall.isInstalled) {
        statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        statusBar.color = new vscode.ThemeColor('statusBarItem.errorForeground');
        statusBar.text = `$(error) Dev Proxy`;
        statusBar.tooltip = `Dev Proxy is not installed`;
    }
    if (devProxyInstall.isInstalled && !devProxyInstall.isLatest) {
        statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        statusBar.color = new vscode.ThemeColor('statusBarItem.warningForeground');
        statusBar.text = `$(warning) Dev Proxy ${devProxyInstall.version}`;
        statusBar.tooltip = `An update is available`;
    }
    return statusBar;
};
import * as vscode from 'vscode';
import { DevProxyInstall } from './types';

export const handleStartNotification = (context: vscode.ExtensionContext) => {
    const devProxyInstall = context.globalState.get<DevProxyInstall>('devProxyInstall');
    if (!devProxyInstall) {
        return () => {
            const message = `Dev Proxy is not installed, or not in PATH.`;
            return {
                message,
                show: async () => {
                    const result = await vscode.window.showInformationMessage(message, 'Install');
                    if (result === 'Install') {
                        await vscode.commands.executeCommand('dev-proxy-toolkit.install');
                    };
                }
            };
        };
    };
    if (!devProxyInstall.isInstalled) {
        return () => {
            const message = `Dev Proxy is not installed, or not in PATH.`;
            return {
                message,
                show: async () => {
                    const result = await vscode.window.showInformationMessage(message, 'Install');
                    if (result === 'Install') {
                        await vscode.commands.executeCommand('dev-proxy-toolkit.install', devProxyInstall.platform);
                    };
                }
            };
        };
    };
    if (devProxyInstall.isOutdated) {
        return () => {
            const message = `New Dev Proxy version ${devProxyInstall.outdatedVersion} is available.`;
            return {
                message,
                show: async () => {
                    const result = await vscode.window.showInformationMessage(message, 'Upgrade');
                    if (result === 'Upgrade') {
                        await vscode.commands.executeCommand('dev-proxy-toolkit.upgrade');
                    };
                }
            };
        };
    };
};

export const processNotification = (notification: (() => { message: string; show: () => Promise<void>; }) | undefined) => {
    if (notification) { notification().show(); };
};

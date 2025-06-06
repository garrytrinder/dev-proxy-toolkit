import { DevProxyInstall } from './types';
import os from 'os';
import { VersionExeName, VersionPreference } from './enums';
import { executeCommand } from './helpers';
import * as vscode from 'vscode';

export const getVersion = async (devProxyExe: string) => {
    try {
        const version = await executeCommand(`${devProxyExe} --version`);
        const versionLines = version.trim().split('\n');
        const lastLine = versionLines[versionLines.length - 1];
        return lastLine.trim();
    } catch (error) {
        return "";
    }
};

export const detectDevProxyInstall = async (versionPreference: VersionPreference): Promise<DevProxyInstall> => {
    const devProxyExe = getDevProxyExe(versionPreference);
    const version = await getVersion(devProxyExe);
    const isInstalled = version !== '';
    const isBeta = version.includes('beta');
    const platform = os.platform();
    const outdatedVersion = await getOutdatedVersion(devProxyExe);
    const isOutdated = isInstalled && outdatedVersion !== '';
    const isRunning = await isDevProxyRunning(devProxyExe);
    vscode.commands.executeCommand('setContext', 'isDevProxyRunning', isRunning);

    return {
        version,
        isInstalled,
        isBeta,
        platform,
        outdatedVersion,
        isOutdated,
        isRunning
    };
};

export const getOutdatedVersion = async (devProxyExe: string): Promise<string> => {
    try {
        const outdated = await executeCommand(`${devProxyExe} outdated --short`);
        return outdated ? outdated.trim() : '';
    } catch (error) {
        return "";
    }
};

export const isDevProxyRunning = async (devProxyExe: string): Promise<boolean> => {
    const platform = os.platform();

    if (platform === 'win32') {
        const processId = await executeCommand(`pwsh.exe -c "(Get-Process ${devProxyExe} -ErrorAction SilentlyContinue).Id"`);
        return processId.trim() !== '';
    };
    if (platform === 'darwin') {
        const processId = await executeCommand(`$SHELL -c "ps -e -o pid=,comm= | awk \'\\$2==\"${devProxyExe}\" {print \\$1}\'"`);
        return processId.trim() !== '';
    };
    if (platform === 'linux') {
        const processId = await executeCommand(`/bin/bash -c "ps -e -o pid=,comm= | awk \'\\$2==\"${devProxyExe}\" {print \\$1}\'"`);
        return processId.trim() !== '';
    }
    return false;
};

export const getDevProxyExe = (versionPreference: VersionPreference) => {
    return versionPreference === VersionPreference.Stable
        ? VersionExeName.Stable
        : VersionExeName.Beta;
};
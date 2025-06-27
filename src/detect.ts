import { DevProxyInstall } from './types';
import os from 'os';
import { VersionExeName, VersionPreference } from './enums';
import { executeCommand } from './helpers';
import * as vscode from 'vscode';
import * as semver from 'semver';

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
    
    // Only consider outdated if there's an outdated version AND it's different from current version
    const isOutdated = isInstalled && outdatedVersion !== '' && outdatedVersion !== version;
    
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

export const extractVersionFromOutput = (output: string): string => {
    if (!output) {
        return '';
    }
    
    // Extract version number using semver pattern
    // Matches: major.minor.patch[-prerelease][+build] but only captures up to prerelease
    const semverRegex = /v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)(?:\+[a-zA-Z0-9.-]+)?/;
    const match = output.match(semverRegex);
    return match ? match[1] : '';
};

export const getOutdatedVersion = async (devProxyExe: string): Promise<string> => {
    try {
        const outdated = await executeCommand(`${devProxyExe} outdated --short`);
        return extractVersionFromOutput(outdated);
    } catch (error) {
        return "";
    }
};

export const isDevProxyRunning = async (devProxyExe: string): Promise<boolean> => {
    try {
        // Get the API port from configuration
        const configuration = vscode.workspace.getConfiguration('dev-proxy-toolkit');
        const apiPort = configuration.get('apiPort') as number;
        
        // Try to connect to the Dev Proxy API on the configured port
        const response = await fetch(`http://127.0.0.1:${apiPort}/proxy`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000), // 2 second timeout
        });
        
        // If we get any response (even an error), Dev Proxy is running
        return response.status >= 200 && response.status < 500;
    } catch (error) {
        // If the request fails (connection refused, timeout, etc.), Dev Proxy is not running
        return false;
    }
};

export const getDevProxyExe = (versionPreference: VersionPreference) => {
    return versionPreference === VersionPreference.Stable
        ? VersionExeName.Stable
        : VersionExeName.Beta;
};

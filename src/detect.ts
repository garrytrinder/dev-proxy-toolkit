import { DevProxyInstall } from './types';
import os from 'os';
import { VersionExeName, VersionPreference } from './enums';
import { executeCommand } from './helpers';

export const getVersion = async (devProxyExe: string) => {
    try {
        const version = await executeCommand(`${devProxyExe} --version`);
        return version.trim();
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
        const processId = await executeCommand(`$SHELL -c "ps -ef | grep ${devProxyExe} | grep -v grep | awk \'{print $2}\'"`);
        return processId.trim() !== '';
    };
    return false;
};

export const getDevProxyExe = (versionPreference: VersionPreference) => {
    return versionPreference === VersionPreference.Stable
        ? VersionExeName.Stable
        : VersionExeName.Beta;
};
import { exec } from 'child_process';
import { DevProxyInstall } from './types';
import os from 'os';

export const getVersion = async () => {
    try {
        const version = await executeCommand(`devproxy --version`);
        return version.trim();
    } catch (error) {
        return "";
    }
};

export const executeCommand = async (cmd: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(`exec error: ${error}`);
            } else if (stderr) {
                reject(`stderr: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
};

export const detectDevProxyInstall = async (): Promise<DevProxyInstall> => {
    const version = await getVersion();
    const isInstalled = version !== '';
    const isBeta = version.includes('beta');
    const platform = os.platform();
    const outdatedVersion = await getOutdatedVersion();
    const isOutdated = isInstalled && outdatedVersion !== '';
    const isRunning = await isDevProxyRunning();

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

export const getOutdatedVersion = async (): Promise<string> => {
    try {
        const outdated = await executeCommand(`devproxy outdated --short`);
        return outdated ? outdated.trim() : '';
    } catch (error) {
        return "";
    }
};

export const isDevProxyRunning = async (): Promise<boolean> => {
    const platform = os.platform();

    if (platform === 'win32') {
        const processId = await executeCommand('pwsh.exe -c "(Get-Process devproxy -ErrorAction SilentlyContinue).Id"');
        return processId.trim() !== '';
    };
    if (platform === 'darwin') {
        const processId = await executeCommand('$SHELL -c "ps -ef | grep devproxy | grep -v grep | awk \'{print $2}\'"');
        return processId.trim() !== '';
    };
    return false;
};
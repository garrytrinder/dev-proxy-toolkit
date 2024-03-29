import { exec } from 'child_process';
import { DevProxyInstall, Release } from './types';
import os from 'os';

const getExecutablePath = async (filename: string): Promise<string> => {
    const command = getFindCommand();
    if (command === '') {
        return '';
    }

    try {
        return await executeCommand(`${command} ${filename}`);
    } catch (error) {
        console.error(error);
        return '';
    }
};

const getFindCommand = () => {
    const platform = os.platform();
    let command = '';
    if (platform === 'win32') {
        command = 'pwsh.exe -c "where.exe devproxy"';
    }
    if (platform === 'darwin') {
        command = '$SHELL -c "which devproxy"';
    }
    return command;
};

const getVersion = async (filePath: string) => {
    if (filePath === '') {
        return '';
    }
    try {
        const version = await executeCommand(`${filePath.trim()} --version`);
        return version.trim();
    } catch (error) {
        console.error(error);
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
    const filePath = await getExecutablePath('devproxy');
    const version = await getVersion(filePath);
    const isInstalled = filePath !== '';
    const isBeta = version.includes('beta');
    const platform = os.platform();
    const latestVersion = await getLatestVersion();
    const isLatest = latestVersion === version;
    const isRunning = await isDevProxyRunning();

    return {
        filePath,
        version,
        isInstalled,
        isBeta,
        platform,
        latestVersion,
        isLatest,
        isRunning
    };
};

export const getLatestVersion = async (): Promise<string> => {
    const request = await fetch('https://api.github.com/repos/microsoft/dev-proxy/releases/latest');
    const release = await request.json() as Release;
    return release.tag_name.replace('v', '');
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
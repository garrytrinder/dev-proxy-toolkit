import { exec } from 'child_process';
import { DevProxyInstall } from './types';
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

    return {
        filePath,
        version,
        isInstalled,
        isBeta,
        platform
    };
};
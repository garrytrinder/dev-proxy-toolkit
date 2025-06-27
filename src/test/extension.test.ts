import * as assert from 'assert';
import * as vscode from 'vscode';
import {
  isConfigFile,
  sleep,
} from '../helpers';
import * as path from 'path';
import { createCodeLensForPluginNodes } from '../codelens';
import { handleStartNotification } from '../notifications';
import { handleStatusBarUpdate, statusBarLoop } from '../statusbar';
import * as sinon from 'sinon';
import * as detect from '../detect';
import { DevProxyInstall } from '../types';
import { VersionPreference } from '../enums';

export const testDevProxyInstall: DevProxyInstall = {
  isBeta: false,
  isInstalled: true,
  isOutdated: true,
  isRunning: false,
  outdatedVersion: '0.14.1',
  platform: 'win32',
  version: '0.14.1',
};

suite('extension', () => {

  suiteSetup(async () => {
    do {
      await sleep(1000);
    } while (!vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.isActive);
  });

  test('should activate', async () => {
    const expected = true;
    const actual = vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.isActive;
    assert.strictEqual(actual, expected);
  });
});

suite('isConfigFile', () => {

  setup(async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', testDevProxyInstall);
  });

  teardown(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  });

  test('should return true if file is named devproxyrc.json', async () => {
    const fileName = 'devproxyrc.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);

    const expected = true;
    const actual = isConfigFile(document);
    assert.strictEqual(actual, expected);
  });

  test('should return true if file contains $schema property value that contains dev-proxy and ends with rc.schema.json', async () => {
    const fileName = 'config-schema.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);

    const expected = true;
    const actual = isConfigFile(document);
    assert.strictEqual(actual, expected);
  });

  test('should return false if file contains $schema property value that does not contain dev-proxy or end with rc.schema.json', async () => {
    const fileName = 'config-incorrect-schema.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);

    const expected = false;
    const actual = isConfigFile(document);
    assert.strictEqual(actual, expected);
  });

  test('should return true if file contains plugins array', async () => {
    const fileName = 'config-plugins.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);

    const expected = true;
    const actual = isConfigFile(document);
    assert.strictEqual(actual, expected);
  });

  test('should return false if file does not contain plugins array', async () => {
    const fileName = 'foo.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);

    const expected = false;
    const actual = isConfigFile(document);
    assert.strictEqual(actual, expected);
  });

  test('should return false if file contains $schema property value that does not contain dev-proxy or end with rc.schema.json but contains plugins array', async () => {
    const fileName = 'config-incorrect-schema-with-plugins.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);

    const expected = false;
    const actual = isConfigFile(document);
    assert.strictEqual(actual, expected);
  });
});

suite('plugins', () => {

  suiteSetup(async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', testDevProxyInstall);
  });

  teardown(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  });

  test('should show error when plugin requires config section', async () => {
    const fileName = 'config-plugin-config-required.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    const expected = {
      message: 'GenericRandomErrorPlugin requires a config section.',
      severity: vscode.DiagnosticSeverity.Error,
    };
    const diagnostic = diagnostics.find((diagnostic) => {
      return diagnostic.message === expected.message;
    });
    const actual = {
      message: diagnostic?.message,
      severity: diagnostic?.severity,
    };
    assert.deepStrictEqual(actual, expected);
  });

  test('should show warning when disabled plugin requires config section', async () => {
    const fileName = 'config-plugin-config-required-disabled.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    const expected = {
      message: 'GenericRandomErrorPlugin requires a config section.',
      severity: vscode.DiagnosticSeverity.Warning,
    };
    const diagnostic = diagnostics.find((diagnostic) => {
      return diagnostic.message === expected.message;
    });
    const actual = {
      message: diagnostic?.message,
      severity: diagnostic?.severity,
    };
    assert.deepStrictEqual(actual, expected);
  });

  test('should show error when plugin config section is not defined', async () => {
    const fileName = 'config-plugin-config-missing.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    const expected = {
      message:
        "genericRandomErrorPlugin config section is missing. Use 'devproxy-plugin-generic-random-error-config' snippet to create one.",
      severity: vscode.DiagnosticSeverity.Error,
    };
    const diagnostic = diagnostics.find((diagnostic) => {
      return diagnostic.message === expected.message;
    });
    const actual = {
      message: diagnostic?.message,
      severity: diagnostic?.severity,
    };
    assert.deepStrictEqual(actual, expected);
  });

  test('should show warning when disabled plugin config section is not defined', async () => {
    const fileName = 'config-plugin-config-missing-disabled.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    const expected = {
      message:
        "genericRandomErrorPlugin config section is missing. Use 'devproxy-plugin-generic-random-error-config' snippet to create one.",
      severity: vscode.DiagnosticSeverity.Warning,
    };
    const diagnostic = diagnostics.find((diagnostic) => {
      return diagnostic.message === expected.message;
    });
    const actual = {
      message: diagnostic?.message,
      severity: diagnostic?.severity,
    };
    assert.deepStrictEqual(actual, expected);
  });

  test('should show code lens for each plugin', async () => {
    const fileName = 'config-plugins-codelens.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    const codeLens = createCodeLensForPluginNodes(document);

    const expected = 2;
    const actual = codeLens.length;
    assert.strictEqual(actual, expected);
  });
});

suite('notifications', () => {

  suiteSetup(async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', testDevProxyInstall);
  });

  teardown(async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', testDevProxyInstall);
  });

  test('should show install notification when devproxy is not installed on mac', async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', {
      isBeta: false,
      isInstalled: false,
      isOutdated: false,
      isRunning: false,
      platform: 'darwin',
      outdatedVersion: '0.14.1',
      version: '',
    } as DevProxyInstall);

    const notification = handleStartNotification(context);

    const expected = 'Dev Proxy is not installed, or not in PATH.';
    const actual = notification !== undefined && notification().message;
    assert.strictEqual(actual, expected);
  });

  test('should show install notification when devproxy is not installed on windows', async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', {
      filePath: '',
      version: '',
      platform: 'win32',
      isInstalled: false,
      latestVersion: '0.14.1',
      isBeta: false,
      isLatest: false
    });

    const notification = handleStartNotification(context);

    const expected = 'Dev Proxy is not installed, or not in PATH.';
    const actual = notification !== undefined && notification().message;
    assert.strictEqual(actual, expected);
  });

  test('should not show install notification when devproxy is installed on mac', async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', {
      filePath: 'somepath/devproxy',
      version: '0.14.1',
      platform: 'darwin',
      isInstalled: true,
      latestVersion: '0.14.1',
      isBeta: false,
      isLatest: true
    });

    const notification = handleStartNotification(context);

    const expected = true;
    const actual = notification === undefined;
    assert.strictEqual(actual, expected);
  });

  test('should not show install notification when devproxy is installed on windows', async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', {
      filePath: 'somepath/devproxy',
      version: '0.1.0',
      platform: 'win32',
      isInstalled: true,
      latestVersion: '0.14.1',
      isBeta: false,
      isLatest: true
    });

    const notification = handleStartNotification(context);

    const expected = true;
    const actual = notification === undefined;
    assert.strictEqual(actual, expected);
  });

  test('should not show install notification when running in unsupported operating system', async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', {
      filePath: 'somepath/devproxy',
      version: '0.14.1',
      platform: 'linux',
      isInstalled: true,
      latestVersion: '0.14.1',
      isBeta: false,
      isLatest: true
    });

    const notification = handleStartNotification(context);

    const expected = true;
    const actual = notification === undefined;
    assert.strictEqual(actual, expected);
  });

  test('should show upgrade notification when devproxy is not latest version', async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', {
      isBeta: false,
      isInstalled: true,
      isOutdated: true,
      isRunning: false,
      platform: 'win32',
      outdatedVersion: '0.14.1',
      version: '0.1.0',
    } as DevProxyInstall);

    const notification = handleStartNotification(context);

    const expected = 'New Dev Proxy version 0.14.1 is available.';
    const actual = notification !== undefined && notification().message;
    assert.strictEqual(actual, expected);
  });
});

suite('statusbar', () => {

  suiteSetup(async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', testDevProxyInstall);
  });

  teardown(async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', testDevProxyInstall);
  });

  test('should show error statusbar when devproxy is not installed', async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', {
      isBeta: false,
      isInstalled: false,
      isOutdated: false,
      isRunning: false,
      platform: 'win32',
      outdatedVersion: '0.14.1',
      version: '0.1.0',
    } as DevProxyInstall);
    const statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    const updatedStatusBar = handleStatusBarUpdate(context, statusBar);

    const expected = '$(error) Dev Proxy';
    const actual = updatedStatusBar.text;
    assert.strictEqual(actual, expected);
  });

  test('should show warning statusbar when devproxy is not latest version', async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', {
      isBeta: false,
      isInstalled: true,
      isOutdated: true,
      isRunning: false,
      platform: 'win32',
      outdatedVersion: '0.14.1',
      version: '0.1.0',
    } as DevProxyInstall);
    const statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    const updatedStatusBar = handleStatusBarUpdate(context, statusBar);

    const expected = '$(warning) Dev Proxy 0.1.0';
    const actual = updatedStatusBar.text;
    assert.strictEqual(actual, expected);
  });

  test('should show success statusbar when devproxy is installed and latest version', async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', {
      isBeta: false,
      isInstalled: true,
      isOutdated: false,
      isRunning: false,
      platform: 'win32',
      outdatedVersion: '',
      version: '0.14.1',
    } as DevProxyInstall);
    const statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    const updatedStatusBar = handleStatusBarUpdate(context, statusBar);

    const expected = '$(check) Dev Proxy 0.14.1';
    const actual = updatedStatusBar.text;
    assert.strictEqual(actual, expected);
  });

  test('should show radio tower icon when devproxy is running', async () => {
    const stub = sinon.stub(detect, 'isDevProxyRunning').resolves(true);
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    const statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    await statusBarLoop(context, statusBar, VersionPreference.Stable);

    const expected = '$(radio-tower) Dev Proxy 0.14.1';
    const actual = statusBar.text;
    stub.restore();
    assert.strictEqual(actual, expected);
  });

});

suite('schema', () => {

  setup(async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', testDevProxyInstall);
  });

  teardown(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  });

  test('should show warning when $schema property does not match installed version', async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', {
      isBeta: false,
      isInstalled: true,
      isOutdated: true,
      isRunning: false,
      platform: 'win32',
      outdatedVersion: '0.14.1',
      version: '0.1.0',
    } as DevProxyInstall);

    const fileName = 'config-schema-mismatch.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    const expected = {
      message: 'Schema version is not compatible with the installed version of Dev Proxy. Expected v0.1.0',
      severity: vscode.DiagnosticSeverity.Warning,
    };
    const actual = {
      message: diagnostics[0]?.message,
      severity: diagnostics[0]?.severity,
    };
    assert.deepStrictEqual(actual, expected);
  });

  test('should not show warning when $schema property matches installed version', async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', {
      isBeta: false,
      isInstalled: true,
      isOutdated: false,
      isRunning: false,
      platform: 'win32',
      outdatedVersion: '',
      version: '0.24.0',
    } as DevProxyInstall);

    const fileName = 'config-schema-version.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    const expected = false;
    const actual = diagnostics.some((diagnostic) => {
      return diagnostic.severity === vscode.DiagnosticSeverity.Warning;
    });
    assert.deepStrictEqual(actual, expected);
  });
});

suite('diagnostic ranges', () => {
  
  teardown(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  });

  test('should exclude quotes from string literal ranges', async () => {
    // Test the core functionality by parsing JSON and checking ranges
    const parse = require('json-to-ast');
    const { getRangeFromASTNode } = require('../helpers');
    
    const jsonText = '{"key": "value"}';
    const ast = parse(jsonText);
    const keyNode = ast.children[0];
    
    // Test our modified range
    const range = getRangeFromASTNode(keyNode.value);
    const modifiedText = jsonText.substring(
      range.start.character,
      range.end.character
    );
    
    // Verify that the range excludes quotes and extracts just the string content
    assert.strictEqual(modifiedText, 'value', 'Should extract just the string content without quotes');
  });
});

suite('Commands', () => {
  test('JWT create command should be registered', async () => {
    const commands = await vscode.commands.getCommands();
    const jwtCreateCommand = commands.find(cmd => cmd === 'dev-proxy-toolkit.jwt-create');
    assert.ok(jwtCreateCommand, 'JWT create command should be registered');
  });
});

suite('extractVersionFromOutput', () => {
  test('should extract stable version from Dev Proxy output', () => {
    const output = `  info    1 error responses loaded from /opt/homebrew/Cellar/dev-proxy/0.29.0/devproxy-errors.json
  info    v0.29.0`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '0.29.0');
  });

  test('should extract beta version from Dev Proxy output', () => {
    const output = `  info    1 error responses loaded from /opt/homebrew/Cellar/dev-proxy/0.30.0-beta.1/devproxy-errors.json
  info    v0.30.0-beta.1`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '0.30.0-beta.1');
  });

  test('should extract version without v prefix', () => {
    const output = `  info    Some message
  info    1.2.3`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '1.2.3');
  });

  test('should extract pre-release version with alpha identifier', () => {
    const output = `  info    Dev Proxy version
  info    v2.1.0-alpha.5`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '2.1.0-alpha.5');
  });

  test('should extract pre-release version with rc identifier', () => {
    const output = `  info    Dev Proxy version
  info    v1.5.0-rc.2`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '1.5.0-rc.2');
  });

  test('should return empty string for output without version', () => {
    const output = `  info    Some random output
  info    No version here`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '');
  });

  test('should return empty string for empty output', () => {
    const result = detect.extractVersionFromOutput('');
    assert.strictEqual(result, '');
  });

  test('should return empty string for null/undefined output', () => {
    const result1 = detect.extractVersionFromOutput(null as any);
    const result2 = detect.extractVersionFromOutput(undefined as any);
    assert.strictEqual(result1, '');
    assert.strictEqual(result2, '');
  });

  test('should extract first version when multiple versions present', () => {
    const output = `  info    v1.0.0
  info    v2.0.0`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '1.0.0');
  });

  test('should handle version with build metadata', () => {
    const output = `  info    Build info
  info    v1.0.0-beta.1+build.123`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '1.0.0-beta.1');
  });

  test('should not extract version from file paths in error responses (issue #286)', () => {
    const output = `info    1 error responses loaded from /opt/homebrew/Cellar/dev-proxy/v0.29.1/devproxy-errors.json`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '');
  });

  test('should extract version from update notification line, ignoring file paths (issue #286)', () => {
    const output = `info    1 error responses loaded from /opt/homebrew/Cellar/dev-proxy/v0.29.0/devproxy-errors.json
info    v0.29.1`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '0.29.1');
  });

  test('should not extract version from Windows file paths', () => {
    const output = `info    1 error responses loaded from C:\\Program Files\\dev-proxy\\v0.29.1\\devproxy-errors.json`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '');
  });

  test('should extract version from actual update notification with Windows paths in earlier lines', () => {
    const output = `info    1 error responses loaded from C:\\Program Files\\dev-proxy\\v0.29.0\\devproxy-errors.json
info    v0.29.1`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '0.29.1');
  });

  test('should not extract beta version from Unix file paths (issue #286)', () => {
    const output = `info    1 error responses loaded from /opt/homebrew/Cellar/dev-proxy/v0.30.0-beta.2/devproxy-errors.json`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '');
  });

  test('should not extract beta version from Windows file paths (issue #286)', () => {
    const output = `info    1 error responses loaded from C:\\Program Files\\dev-proxy\\v0.30.0-beta.2\\devproxy-errors.json`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '');
  });

  test('should extract beta version from update notification, ignoring file paths (issue #286)', () => {
    const output = `info    1 error responses loaded from /opt/homebrew/Cellar/dev-proxy/v0.30.0-beta.1/devproxy-errors.json
info    v0.30.0-beta.2`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '0.30.0-beta.2');
  });

  test('should extract beta version from update notification with Windows paths in earlier lines (issue #286)', () => {
    const output = `info    1 error responses loaded from C:\\Program Files\\dev-proxy\\v0.30.0-beta.1\\devproxy-errors.json
info    v0.30.0-beta.2`;
    
    const result = detect.extractVersionFromOutput(output);
    assert.strictEqual(result, '0.30.0-beta.2');
  });
});

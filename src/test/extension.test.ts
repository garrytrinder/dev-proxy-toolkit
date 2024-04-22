import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import {
  getASTNode,
  getStartPositionFromASTNode,
  isConfigFile,
  sleep,
} from '../helpers';
import * as path from 'path';
import parse from 'json-to-ast';
import { createCodeLensForPluginNodes } from '../codelens';
import { handleStartNotification } from '../notifications';
import { handleStatusBarUpdate, statusBarLoop } from '../statusbar';
import * as sinon from 'sinon';
import * as detect from '../detect';
import { DevProxyInstall } from '../types';

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

suite('urlsToWatch', () => {

  suiteSetup(async () => {
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', testDevProxyInstall);
  });

  teardown(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    const context = await vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')?.activate() as vscode.ExtensionContext;
    await context.globalState.update('devProxyInstall', testDevProxyInstall);
  });

  test('should show error when opening document with no urlsToWatch found', async () => {
    const fileName = 'config-urls-to-watch-required.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    const expected = {
      message: 'Add at least one url to watch.',
      severity: vscode.DiagnosticSeverity.Error,
    };
    const actual = {
      message: diagnostics[0]?.message,
      severity: diagnostics[0]?.severity,
    };
    assert.deepStrictEqual(actual, expected);
  });

  test('should show error when document changes and has no urlsToWatch found', async () => {
    const fileName = 'config-urls-to-watch-required.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const document = await vscode.workspace.openTextDocument({
      language: 'json',
      content: fileContents,
    });
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    const expected = {
      message: 'Add at least one url to watch.',
      severity: vscode.DiagnosticSeverity.Error,
    };
    const actual = {
      message: diagnostics[0]?.message,
      severity: diagnostics[0]?.severity,
    };
    assert.deepStrictEqual(actual, expected);
  });

  test('should have no error after adding a urlToWatch', async () => {
    const fileName = 'config-urls-to-watch-required.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    const documentNode = parse(document.getText()) as parse.ObjectNode;
    const urlsToWatchNode = getASTNode(
      documentNode.children,
      'Identifier',
      'urlsToWatch'
    );
    const position = getStartPositionFromASTNode(
      urlsToWatchNode?.value as parse.ArrayNode
    );
    const edit = new vscode.WorkspaceEdit();
    edit.insert(document.uri, position, '"https://example.com"');
    await vscode.workspace.applyEdit(edit);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    const expected = 0;
    const actual = diagnostics.length;
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
    const actual = {
      message: diagnostics[0]?.message,
      severity: diagnostics[0]?.severity,
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
    const actual = {
      message: diagnostics[0]?.message,
      severity: diagnostics[0]?.severity,
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
    const actual = {
      message: diagnostics[0]?.message,
      severity: diagnostics[0]?.severity,
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
    const actual = {
      message: diagnostics[0]?.message,
      severity: diagnostics[0]?.severity,
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
    await statusBarLoop(context, statusBar);

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
      message: 'Schema version is not compatible with the installed version of Dev Proxy. Expected v0.1.0.',
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
      version: '0.14.1',
    } as DevProxyInstall);

    const fileName = 'config-schema-version.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    const expected = 0;
    const actual = diagnostics.length;
    assert.deepStrictEqual(actual, expected);
  });

});
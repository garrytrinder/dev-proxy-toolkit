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
import { DevProxyInstall } from '../types';
import { handleStartNotification } from '../notifications';

suite('urlsToWatch', () => {
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
  test('should show install notification when devproxy is not installed on mac', async () => {
    const devProxyInstall: DevProxyInstall = {
      filePath: '',
      version: '',
      platform: 'darwin',
      isInstalled: false,
      isBeta: false,
    };
    const notification = handleStartNotification(devProxyInstall);

    const expected = 'Dev Proxy is not installed, or not in PATH.';
    const actual = notification !== undefined && notification().message;
    assert.strictEqual(actual, expected);
  });

  test('should show install notification when devproxy is not installed on windows', async () => {
    const devProxyInstall: DevProxyInstall = {
      filePath: '',
      version: '',
      platform: 'win32',
      isInstalled: false,
      isBeta: false,
    };
    const notification = handleStartNotification(devProxyInstall);

    const expected = 'Dev Proxy is not installed, or not in PATH.';
    const actual = notification !== undefined && notification().message;
    assert.strictEqual(actual, expected);
  });

  test('should not show install notification when devproxy is installed on mac', async () => {
    const devProxyInstall: DevProxyInstall = {
      filePath: 'somepath/devproxy',
      version: '0.1.0',
      platform: 'darwin',
      isInstalled: true,
      isBeta: false,
    };
    const notification = handleStartNotification(devProxyInstall);

    const expected = true;
    const actual = notification === undefined;
  });

  test('should not show install notification when devproxy is installed on windows', async () => {
    const devProxyInstall: DevProxyInstall = {
      filePath: 'somepath/devproxy',
      version: '0.1.0',
      platform: 'win32',
      isInstalled: true,
      isBeta: false,
    };
    const notification = handleStartNotification(devProxyInstall);

    const expected = true;
    const actual = notification === undefined;
    assert.strictEqual(actual, expected);
  });

  test('should not show install notification when running in unsupported operating system', async () => {
    const devProxyInstall: DevProxyInstall = {
      filePath: 'somepath/devproxy',
      version: '0.1.0',
      platform: 'linux',
      isInstalled: true,
      isBeta: false,
    };
    const notification = handleStartNotification(devProxyInstall);

    const expected = true;
    const actual = notification === undefined;
    assert.strictEqual(actual, expected);
  });
});
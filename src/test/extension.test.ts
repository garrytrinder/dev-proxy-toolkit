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
import {createCodeLensForPluginNodes} from '../codelens';

suite('Extension Test Suite', () => {
  test('should activate when untitled JSON file is opened', async () => {
    const extensionId = 'garrytrinder.dev-proxy-toolkit';
    await vscode.workspace.openTextDocument({
      language: 'json',
      content: '',
    });
    await sleep(1000);

    const expected = true;
    const actual = vscode.extensions.getExtension(extensionId)?.isActive;
    assert.strictEqual(actual, expected);
  });

  test('should activate when JSON file is opened from disk', async () => {
    const extensionId = 'garrytrinder.dev-proxy-toolkit';
    const fileName = 'foo.json';
    const filePath = path.resolve(__dirname, 'examples', fileName);
    await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);

    const expected = true;
    const actual = vscode.extensions.getExtension(extensionId)?.isActive;
    assert.strictEqual(actual, expected);
  });
});

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

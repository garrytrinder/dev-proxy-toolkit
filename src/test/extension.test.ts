import * as assert from 'assert';
import * as vscode from 'vscode';
import configUrlsToWatchRequired from './examples/config-urls-to-watch-required.json';
import configPluginConfigRequired from './examples/config-plugin-config-required.json';
import configPluginConfigRequiredDisabled from './examples/config-plugin-config-required-disabled.json';
import configPluginConfigMissing from './examples/config-plugin-config-missing.json';
import configPluginConfigMissingDisabled from './examples/config-plugin-config-missing.json';
import { isConfigFile } from '../helpers';
import * as path from 'path';

suite('Extension Test Suite', () => {
  test('should activate when JSON file is opened', async () => {
    assert.strictEqual(
      vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')
        ?.isActive,
      false
    );
    await vscode.workspace.openTextDocument({
      language: 'json',
      content: '',
    });
    await sleep(1000);
    assert.strictEqual(
      vscode.extensions.getExtension('garrytrinder.dev-proxy-toolkit')
        ?.isActive,
      true
    );
  });

  test('should show error when no urlsToWatch found', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'json',
      content: JSON.stringify(configUrlsToWatchRequired, null, 2),
    });
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    assert.strictEqual(diagnostics?.length, 1);
    assert.strictEqual(
      diagnostics?.[0].message,
      'Add at least one url to watch.'
    );
    assert.strictEqual(
      diagnostics?.[0].severity,
      vscode.DiagnosticSeverity.Error
    );
  });

  test('should show error when plugin requires config section', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'json',
      content: JSON.stringify(configPluginConfigRequired, null, 2),
    });
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    assert.strictEqual(diagnostics?.length, 1);
    assert.strictEqual(
      diagnostics?.[0].message,
      'GenericRandomErrorPlugin requires a config section.'
    );
    assert.strictEqual(
      diagnostics?.[0].severity,
      vscode.DiagnosticSeverity.Error
    );
  });

  test('should show warning when disabled plugin requires config section', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'json',
      content: JSON.stringify(configPluginConfigRequiredDisabled, null, 2),
    });
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    assert.strictEqual(diagnostics?.length, 1);
    assert.strictEqual(
      diagnostics?.[0].message,
      'GenericRandomErrorPlugin requires a config section.'
    );
    assert.strictEqual(
      diagnostics?.[0].severity,
      vscode.DiagnosticSeverity.Warning
    );
  });

  test('should show error when plugin config section is not defined', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'json',
      content: JSON.stringify(configPluginConfigMissing, null, 2),
    });
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    assert.strictEqual(diagnostics?.length, 1);
    assert.strictEqual(
      diagnostics?.[0].message,
      "genericRandomErrorPlugin config section is missing. Use 'devproxy-plugin-generic-random-error-config' snippet to create one."
    );
    assert.strictEqual(
      diagnostics?.[0].severity,
      vscode.DiagnosticSeverity.Error
    );
  });

  test('should show warning when disabled plugin config section is not defined', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'json',
      content: JSON.stringify(configPluginConfigMissingDisabled, null, 2),
    });
    await sleep(1000);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    assert.strictEqual(diagnostics?.length, 1);
    assert.strictEqual(
      diagnostics?.[0].message,
      "genericRandomErrorPlugin config section is missing. Use 'devproxy-plugin-generic-random-error-config' snippet to create one."
    );
    assert.strictEqual(
      diagnostics?.[0].severity,
      vscode.DiagnosticSeverity.Error
    );
  });
});

suite('isConfigFile', () => {

  test('should return true if file is named devproxyrc.json', async () => {
    const fileName = "devproxyrc.json";
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    
    const expected = true;
    const actual = isConfigFile(document);
    assert.strictEqual(actual, expected);
  });

  test('should return true if file contains $schema property value that contains dev-proxy and ends with rc.schema.json', async () => {
    const fileName = "config-schema.json";
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    
    const expected = true;
    const actual = isConfigFile(document);
    assert.strictEqual(actual, expected);
  });

  test('should return false if file contains $schema property value that does not contain dev-proxy or end with rc.schema.json', async () => {
    const fileName = "config-incorrect-schema.json";
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    
    const expected = false;
    const actual = isConfigFile(document);
    assert.strictEqual(actual, expected);
  });

  test('should return true if file contains plugins array', async () => {
    const fileName = "config-plugins.json";
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    
    const expected = true;
    const actual = isConfigFile(document);
    assert.strictEqual(actual, expected);
  });

  test('should return false if file does not contain plugins array', async () => {
    const fileName = "foo.json";
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    
    const expected = false;
    const actual = isConfigFile(document);
    assert.strictEqual(actual, expected);
  });

  test('should return false if file contains $schema property value that does not contain dev-proxy or end with rc.schema.json but contains plugins array', async () => {
    const fileName = "config-incorrect-schema-with-plugins.json";
    const filePath = path.resolve(__dirname, 'examples', fileName);
    const document = await vscode.workspace.openTextDocument(filePath);
    await sleep(1000);
    
    const expected = false;
    const actual = isConfigFile(document);
    assert.strictEqual(actual, expected);
  });

});

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

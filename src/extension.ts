import * as vscode from 'vscode';
import parse from 'json-to-ast';
import { pluginSnippets } from './constants';
import { getASTNode, getRangeFromASTNode } from './helpers';

export const activate = (context: vscode.ExtensionContext) => {
  const collection = vscode.languages.createDiagnosticCollection('Dev Proxy');

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(document => {
      updateDiagnostics(document, collection);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document.getText() === "") {
        collection.delete(event.document.uri);
        return;
      };
      updateDiagnostics(event.document, collection);
    })
  );
};

const updateDiagnostics = (
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
): void => {
  let diagnostics: vscode.Diagnostic[] = [];

  // we need to ensure that we are looking at a config file before we start
  const fileContents = parse(document.getText()) as parse.ObjectNode;
  let isConfigFile = false;

  // we know that its a config file if
  // 1. the file name is devproxy.config.json
  if (document.fileName.endsWith('devproxyrc.json')) {
    isConfigFile = true;
  }

  // 2. the file contains a $schema property with the value of https://raw.githubusercontent.com/microsoft/dev-proxy/main/schemas/v1.0/rc.schema.json
  const schemaNode = getASTNode(fileContents.children, 'Identifier', '$schema');
  if (schemaNode) {
    const schema = (schemaNode?.value as parse.LiteralNode).value as string;
    if (schema.includes('dev-proxy') && schema.endsWith('rc.schema.json')) {
      isConfigFile = true;
    }
  }

  // 3. the file contains the following properties: urlsToWatch and plugins, as $schema is optional
  const pluginsNode = getASTNode(
    fileContents.children,
    'Identifier',
    'plugins'
  );
  const urlsToWatchNode = getASTNode(
    fileContents.children,
    'Identifier',
    'urlsToWatch'
  );
  if (pluginsNode && urlsToWatchNode) {
    isConfigFile = true;
  }

  // if its not a config file, we don't need to do anything
  if (!isConfigFile) {
    return;
  }

  // check if urlsToWatch is empty
  if (
    urlsToWatchNode &&
    (urlsToWatchNode.value as parse.ArrayNode).children.length === 0
  ) {
    diagnostics.push(
      new vscode.Diagnostic(
        getRangeFromASTNode(urlsToWatchNode),
        'Add at least one url to watch.',
        vscode.DiagnosticSeverity.Error
      )
    );
  }

  // check validity of plugins
  if (
    pluginsNode &&
    (pluginsNode.value as parse.ArrayNode).children.length !== 0
  ) {
    const pluginNodes = (pluginsNode.value as parse.ArrayNode)
      .children as parse.ObjectNode[];

    // check for plugins
    if (pluginNodes.length === 0) {
      diagnostics.push(
        new vscode.Diagnostic(
          getRangeFromASTNode(pluginsNode),
          'Add at least one plugin',
          vscode.DiagnosticSeverity.Error
        )
      );
    }

    // does the plugin have a config section?
    pluginNodes.forEach((pluginNode: parse.ObjectNode) => {
      const pluginNameNode = getASTNode(
        pluginNode.children,
        'Identifier',
        'name'
      );
      const pluginName = (pluginNameNode?.value as parse.LiteralNode)
        .value as string;
      const enabledNode = getASTNode(
        pluginNode.children,
        'Identifier',
        'enabled'
      );
      const isEnabled = (enabledNode?.value as parse.LiteralNode).value as boolean;
      const pluginSnippet = pluginSnippets[pluginName];
      const requiresConfig = pluginSnippet.config ? pluginSnippet.config.required : false;

      if (requiresConfig) {
        // check to see if the plugin has a config section
        const configSectionNode = getASTNode(
          pluginNode.children,
          'Identifier',
          'configSection'
        );
        if (!configSectionNode) {
          // there is no config section defined on the plugin instance
          diagnostics.push(
            new vscode.Diagnostic(
              getRangeFromASTNode(pluginNode),
              `${pluginName} requires a config section.`,
              vscode.DiagnosticSeverity.Error
            )
          );
        } else {
          // check to see if the config section is in the document
          const configSectionName = (
            configSectionNode.value as parse.LiteralNode
          ).value as string;
          const configSection = getASTNode(
            fileContents.children,
            'Identifier',
            configSectionName
          );

          if (!configSection) {
            diagnostics.push(
              new vscode.Diagnostic(
                getRangeFromASTNode(configSectionNode.value),
                `${configSectionName} config section is missing. Use '${pluginSnippet.config?.name}' snippet to create one.`,
                isEnabled ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning
              )
            );
          }
        }
      }
    });
  }

  collection.set(document.uri, diagnostics);
};

export const deactivate = () => { };

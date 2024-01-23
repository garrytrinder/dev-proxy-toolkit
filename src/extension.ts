import * as vscode from 'vscode';
import parse from 'json-to-ast';
import { pluginSnippets } from './constants';
import { getASTNode, getRangeFromASTNode, isConfigFile } from './helpers';

export const activate = (context: vscode.ExtensionContext) => {
  const collection = vscode.languages.createDiagnosticCollection('Dev Proxy');

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(document => {
      updateDiagnostics(document, collection);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document.getText() === '') {
        collection.delete(event.document.uri);
        return;
      }
      updateDiagnostics(event.document, collection);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument(document => {
      collection.delete(document.uri);
    })
  ); 
};

const updateDiagnostics = (
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
): void => {
  let diagnostics: vscode.Diagnostic[] = [];

  const documentNode = parse(document.getText()) as parse.ObjectNode;

  if (!isConfigFile(document)) {
    return;
  }

  // check if urlsToWatch is empty
  const urlsToWatchNode = getASTNode(
    documentNode.children,
    'Identifier',
    'urlsToWatch'
  );  
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
  const pluginsNode = getASTNode(
    documentNode.children,
    'Identifier',
    'plugins'
  );
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
      const isEnabled = (enabledNode?.value as parse.LiteralNode)
        .value as boolean;
      const pluginSnippet = pluginSnippets[pluginName];
      const requiresConfig = pluginSnippet.config
        ? pluginSnippet.config.required
        : false;

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
              isEnabled
                ? vscode.DiagnosticSeverity.Error
                : vscode.DiagnosticSeverity.Warning
            )
          );
        } else {
          // check to see if the config section is in the document
          const configSectionName = (
            configSectionNode.value as parse.LiteralNode
          ).value as string;
          const configSection = getASTNode(
            documentNode.children,
            'Identifier',
            configSectionName
          );

          if (!configSection) {
            diagnostics.push(
              new vscode.Diagnostic(
                getRangeFromASTNode(configSectionNode.value),
                `${configSectionName} config section is missing. Use '${pluginSnippet.config?.name}' snippet to create one.`,
                isEnabled
                  ? vscode.DiagnosticSeverity.Error
                  : vscode.DiagnosticSeverity.Warning
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

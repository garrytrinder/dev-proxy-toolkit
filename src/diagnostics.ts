import * as vscode from 'vscode';
import parse from "json-to-ast";
import { pluginSnippets } from "./constants";
import { getASTNode, getRangeFromASTNode } from "./helpers";
import { DevProxyInstall } from './types';

export const updateConfigDiagnostics = (
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection,
): void => {
  const devProxyInstall = context.globalState.get<DevProxyInstall>('devProxyInstall');
  if (!devProxyInstall) {
    return;
  }
  const diagnostics: vscode.Diagnostic[] = [];
  const documentNode = parse(document.getText()) as parse.ObjectNode;

  // check if schema version is compatible
  checkSchemaCompatibility(documentNode, devProxyInstall, diagnostics);

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

    // check if we have any plugins that contain the name reporter in the plugins node
    const reporterIndex = pluginNodes.findIndex((pluginNode: parse.ObjectNode) => {
      const pluginNameNode = getASTNode(
        pluginNode.children,
        'Identifier',
        'name'
      );
      const pluginName = (pluginNameNode?.value as parse.LiteralNode)
        .value as string;
      return pluginName.toLowerCase().includes('reporter');
    });

    if (reporterIndex !== -1) {
      // check if we have any more plugins after the reporter plugin
      const pluginsAfterReporter = pluginNodes.slice(reporterIndex + 1);
      // if we do, add a warning to the reporter plugin stating that it should be the last plugin
      if (pluginsAfterReporter.length > 0) {
        // check if there are any plugins after the reporter plugin that are not reporters
        const pluginAfterReporter = pluginsAfterReporter.find((pluginNode: parse.ObjectNode) => {
          const pluginNameNode = getASTNode(
            pluginNode.children,
            'Identifier',
            'name'
          );
          const pluginName = (pluginNameNode?.value as parse.LiteralNode)
            .value as string;
          return !pluginName.toLowerCase().includes('reporter');
        });
        // if there are, add a warning to the reporter plugin
        if (pluginAfterReporter) {
          const diagnostic = new vscode.Diagnostic(
            getRangeFromASTNode(pluginNodes[reporterIndex]),
            'Reporters should be placed after other plugins.',
            vscode.DiagnosticSeverity.Warning
          );
          diagnostics.push(diagnostic);
        }
      }
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

export const updateDiagnostics = (
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection,
): void => {
  const devProxyInstall = context.globalState.get<DevProxyInstall>('devProxyInstall');
  if (!devProxyInstall) {
    return;
  }

  const diagnostics: vscode.Diagnostic[] = [];
  const documentNode = parse(document.getText()) as parse.ObjectNode;

  // check if schema version is compatible
  checkSchemaCompatibility(documentNode, devProxyInstall, diagnostics);

  collection.set(document.uri, diagnostics);
};

export const checkSchemaCompatibility = (documentNode: parse.ObjectNode, devProxyInstall: DevProxyInstall, diagnostics: vscode.Diagnostic[]) => {
  const schemaNode = getASTNode(documentNode.children, 'Identifier', '$schema');
  if (schemaNode) {
    const schemaValue = (schemaNode.value as parse.LiteralNode).value as string;
    const devProxyVersion = devProxyInstall.isBeta ? devProxyInstall.version.split('-')[0] : devProxyInstall.version;
    if (!schemaValue.includes(`${devProxyVersion}`)) {
      const diagnostic = new vscode.Diagnostic(
        getRangeFromASTNode(schemaNode),
        `Schema version is not compatible with the installed version of Dev Proxy. Expected v${devProxyVersion}`,
        vscode.DiagnosticSeverity.Warning
      );
      diagnostic.code = 'invalidSchema';
      diagnostics.push(diagnostic);
    }
  }
};

import * as vscode from 'vscode';
import {DevProxyInstall} from './types';

export const registerCodeActions = (context: vscode.ExtensionContext) => {
  const devProxyInstall =
    context.globalState.get<DevProxyInstall>('devProxyInstall');
  if (!devProxyInstall) {
    return;
  }
  const devProxyVersion = devProxyInstall.isBeta
    ? devProxyInstall.version.split('-')[0]
    : devProxyInstall.version;

  // Code action for invalid schema
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider('json', {
      provideCodeActions: (document, range, context, token) => {
        const diagnostic = context.diagnostics.find(diagnostic => {
          return diagnostic.code === 'invalidSchema';
        });
        if (diagnostic) {
          const fix = new vscode.CodeAction(
            'Update schema',
            vscode.CodeActionKind.QuickFix,
          );
          fix.edit = new vscode.WorkspaceEdit();
          fix.edit.replace(
            document.uri,
            new vscode.Range(diagnostic.range.start, diagnostic.range.end),
            `https://raw.githubusercontent.com/dotnet/dev-proxy/main/schemas/v${devProxyVersion}/rc.schema.json`,
          );
          return [fix];
        }
      },
    }),
  );

  // Code action for deprecated plugin paths (individual and bulk updates)
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider('json', {
      provideCodeActions: (document, range, context, token) => {
        const correctPluginPath = '~appFolder/plugins/DevProxy.Plugins.dll';
        
        // Check if the current range intersects with a deprecated plugin path diagnostic
        const currentDiagnostic = context.diagnostics.find(diagnostic => {
          return diagnostic.code === 'deprecatedPluginPath' && 
                 diagnostic.range.intersection(range);
        });

        // Only provide deprecated plugin path actions if user is on a deprecated plugin path diagnostic
        if (!currentDiagnostic) {
          return [];
        }

        const fixes: vscode.CodeAction[] = [];

        // Individual fix for the current diagnostic
        const individualFix = new vscode.CodeAction(
          'Update plugin path',
          vscode.CodeActionKind.QuickFix,
        );
        individualFix.edit = new vscode.WorkspaceEdit();
        individualFix.edit.replace(
          document.uri,
          new vscode.Range(
            currentDiagnostic.range.start,
            currentDiagnostic.range.end,
          ),
          correctPluginPath,
        );
        fixes.push(individualFix);

        // Bulk fix for all deprecated plugin paths in the document (only show when on a deprecated plugin path)
        const allDeprecatedPluginPathDiagnostics = vscode.languages
          .getDiagnostics(document.uri)
          .filter(diagnostic => {
            return diagnostic.code === 'deprecatedPluginPath';
          });

        if (allDeprecatedPluginPathDiagnostics.length > 1) {
          const bulkFix = new vscode.CodeAction(
            `Update all plugin paths`,
            vscode.CodeActionKind.QuickFix,
          );
          bulkFix.edit = new vscode.WorkspaceEdit();

          // Update all deprecated plugin paths
          allDeprecatedPluginPathDiagnostics.forEach(diagnostic => {
            bulkFix.edit!.replace(
              document.uri,
              new vscode.Range(diagnostic.range.start, diagnostic.range.end),
              correctPluginPath,
            );
          });

          bulkFix.isPreferred = true;
          fixes.push(bulkFix);
        }

        return fixes;
      },
    }),
  );
};

import * as vscode from 'vscode';
import { DevProxyInstall } from './types';

export const registerCodeActions = (context: vscode.ExtensionContext) => {
    const devProxyInstall = context.globalState.get<DevProxyInstall>('devProxyInstall');
    if (!devProxyInstall) {
        return;
    }
    const devProxyVersion = devProxyInstall.isBeta ? devProxyInstall.version.split('-')[0] : devProxyInstall.version;
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('json', {
            provideCodeActions: (document, range, context, token) => {
                const diagnostic = context.diagnostics.find(diagnostic => {
                    return diagnostic.code === 'invalidSchema';
                });
                if (diagnostic) {
                    const fix = new vscode.CodeAction('Update schema', vscode.CodeActionKind.QuickFix);
                    fix.edit = new vscode.WorkspaceEdit();
                    fix.edit.replace(
                        document.uri,
                        new vscode.Range(
                            diagnostic.range.start,
                            diagnostic.range.end
                        ),
                        `$schema": "https://raw.githubusercontent.com/dotnet/dev-proxy/main/schemas/v${devProxyVersion}/rc.schema.json",`
                    );
                    return [fix];
                }
            }
        }));
};
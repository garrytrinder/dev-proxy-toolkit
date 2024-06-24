import * as vscode from 'vscode';
import { isConfigFile, isProxyFile } from './helpers';
import { updateConfigDiagnostics, updateDiagnostics } from './diagnostics';

export const registerDocumentListeners = (context: vscode.ExtensionContext, collection: vscode.DiagnosticCollection) => {
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            if (isProxyFile(document)) {
                updateDiagnostics(context, document, collection);
            }
            if (!isConfigFile(document)) {
                return;
            }
            updateConfigDiagnostics(context, document, collection);
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (!isConfigFile(event.document) || !isProxyFile(event.document)) {
                collection.delete(event.document.uri);
                return;
            }
            if (isConfigFile(event.document)) {
                updateConfigDiagnostics(context, event.document, collection);
            }
            if (isProxyFile(event.document)) {
                updateDiagnostics(context, event.document, collection);
            }
        })
    );
};
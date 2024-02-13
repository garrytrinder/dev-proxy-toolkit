import * as vscode from 'vscode';
import { isConfigFile } from './helpers';
import { updateDiagnostics } from './diagnostics';

export const registerDocumentListeners = (context: vscode.ExtensionContext, collection: vscode.DiagnosticCollection) => {
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            if (!isConfigFile(document)) {
                return;
            }
            updateDiagnostics(document, collection);
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (!isConfigFile(event.document)) {
                collection.delete(event.document.uri);
                return;
            }
            updateDiagnostics(event.document, collection);
        })
    );
}


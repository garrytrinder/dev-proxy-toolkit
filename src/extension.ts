import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { detectDevProxyInstall } from './detect';
import { handleStartNotification, processNotification } from './notifications';
import { registerDocumentListeners } from './documents';
import { registerCodeLens } from './codelens';
import { createStatusBar, updateStatusBar } from './statusbar';

export const activate = async (context: vscode.ExtensionContext) => {
  const collection = vscode.languages.createDiagnosticCollection('Dev Proxy');
  let statusBar = createStatusBar(context);
  registerDocumentListeners(context, collection);
  registerCommands(context);
  registerCodeLens(context);

  const devProxyInstall = await detectDevProxyInstall();
  const notification = handleStartNotification(devProxyInstall);
  processNotification(notification);
  updateStatusBar(statusBar, devProxyInstall);
};

export const deactivate = () => { };

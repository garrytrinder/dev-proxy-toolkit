import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { handleStartNotification, processNotification } from './notifications';
import { registerDocumentListeners } from './documents';
import { registerCodeLens } from './codelens';
import { createStatusBar, statusBarLoop, updateStatusBar } from './statusbar';
import { registerCodeActions } from './codeactions';
import { updateGlobalState } from './state';

export const activate = async (context: vscode.ExtensionContext): Promise<vscode.ExtensionContext> => {
  const statusBar = createStatusBar(context);
  await updateGlobalState(context);

  const collection = vscode.languages.createDiagnosticCollection('Dev Proxy');

  registerDocumentListeners(context, collection);
  registerCodeActions(context);
  registerCodeLens(context);
  registerCommands(context);

  const notification = handleStartNotification(context);
  processNotification(notification);
  
  updateStatusBar(context, statusBar);

  setInterval(() => statusBarLoop(context, statusBar), 5000);

  return context;
};

export const deactivate = () => { };

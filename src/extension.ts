import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { handleStartNotification, processNotification } from './notifications';
import { registerDocumentListeners } from './documents';
import { registerCodeLens } from './codelens';
import { createStatusBar, statusBarLoop, updateStatusBar } from './statusbar';
import { registerCodeActions } from './codeactions';
import { updateGlobalState } from './state';
import { VersionPreference } from './enums';

export const activate = async (context: vscode.ExtensionContext): Promise<vscode.ExtensionContext> => {
  const configuration = vscode.workspace.getConfiguration('devproxytoolkit');
  const versionPreference = configuration.get('versionPreference') as VersionPreference;

  const statusBar = createStatusBar(context);
  await updateGlobalState(context, versionPreference);

  const collection = vscode.languages.createDiagnosticCollection('Dev Proxy');

  registerDocumentListeners(context, collection);
  registerCodeActions(context);
  registerCodeLens(context);
  registerCommands(context, configuration);

  const notification = handleStartNotification(context);
  processNotification(notification);

  updateStatusBar(context, statusBar);

  setInterval(() => statusBarLoop(context, statusBar, versionPreference), 5000);

  return context;
};

export const deactivate = () => { };

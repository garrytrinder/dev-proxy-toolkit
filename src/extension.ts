import * as vscode from 'vscode';
import os from 'os';
import parse, { LiteralNode } from "json-to-ast";

export const activate = (context: vscode.ExtensionContext) => {

	console.log('Congratulations, your extension "dev-proxy-vsc-ext" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('dev-proxy-vsc-ext.start', (filePath) => {
		vscode.window.createTerminal('Dev Proxy').sendText(`devproxy --config-file ${filePath}`);
		vscode.window.terminals.find(t => t.name === 'Dev Proxy')?.show();
	}));

	if (isMac && isLinux) {
		context.subscriptions.push(vscode.commands.registerCommand('dev-proxy-vsc-ext.stop', () => {
			vscode.window.createTerminal({ name: 'Dev Proxy Shutdown', hideFromUser: true }).sendText(`kill -SIGINT 26061`);
			vscode.window.terminals.find(t => t.name === 'Dev Proxy Shutdown')?.dispose();
			vscode.window.terminals.find(t => t.name === 'Dev Proxy')?.dispose();
		}));
	}

	context.subscriptions.push(vscode.languages.registerHoverProvider('json', {
		provideHover(document, position, token) {
			const wordRange = document.getText(document.getWordRangeAtPosition(position));

			const hoverContent: HoverContent = {
				"rate": [
					"Sets the chance which a request will be failed",
				]
			};

			return {
				contents: hoverContent[wordRange] || []
			};
		},
	}));

	context.subscriptions.push(vscode.languages.registerCodeLensProvider('json', {
		provideCodeLenses(document, token) {
			return [
				new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), { title: '▶️ Start Dev Proxy', command: 'dev-proxy-vsc-ext.start', tooltip: 'Start Dev Proxy', arguments: [document.fileName] }),
				new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), { title: '🛑 Stop Dev Proxy', command: 'dev-proxy-vsc-ext.stop', tooltip: 'Stop Dev Proxy', arguments: [] })
			];
		},
	}));

	const collection = vscode.languages.createDiagnosticCollection('Dev Proxy');
	context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(document => {
		collection.clear();
		updateDiagnostics(document, collection);
	}));

	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
		updateDiagnostics(event.document, collection);
	}));
};

type HoverContent = {
	[key: string]: string[];
};

const isMac = os.platform() === 'darwin';
const isWindows = os.platform() === 'win32';
const isLinux = os.platform() === 'linux';

const updateDiagnostics = (document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void => {
	let diagnostics: vscode.Diagnostic[] = [];

	const fileContents = parse(document.getText()) as parse.ObjectNode;
	const urlsToWatch = getIdentifier(fileContents.children, 'urlsToWatch');
	const plugins = getIdentifier(fileContents.children, 'plugins');

	if (typeof urlsToWatch !== "undefined" && (urlsToWatch.value as parse.ArrayNode).children.length === 0) {
		diagnostics.push(new vscode.Diagnostic(
			getIdentifierRange(urlsToWatch),
			'Add at least one url to watch',
			vscode.DiagnosticSeverity.Error
		));
	};

	if (typeof plugins !== "undefined" && (plugins.value as parse.ArrayNode).children.length === 0) {
		diagnostics.push(new vscode.Diagnostic(
			getIdentifierRange(plugins),
			'Add at least one plugin',
			vscode.DiagnosticSeverity.Information
		));
	};

	if (typeof plugins !== "undefined" && (plugins.value as parse.ArrayNode).children.length !== 0) {
		const pluginsArray = (plugins.value as parse.ArrayNode).children as parse.ObjectNode[];
		const configSections = pluginsArray.map(plugin => {
			const node = plugin.children.find(child => child.key.type === 'Identifier' && child.key.value === 'configSection') as parse.PropertyNode;
			if (typeof node !== 'undefined') { return node; }
		});
		configSections.forEach(section => {
			if (typeof section === 'undefined') { return; }
			const identifier = getIdentifier(fileContents.children, (section.value as parse.LiteralNode).value as string);
			if (typeof identifier === 'undefined') {
				diagnostics.push(new vscode.Diagnostic(
					getIdentifierRange(section.value as parse.LiteralNode),
					'Create a config section for this plugin',
					vscode.DiagnosticSeverity.Error
				));
			}
		});
	};

	collection.set(document.uri, diagnostics);
};

const getIdentifier = (children: parse.PropertyNode[], nameValue: string) => {
	return children.find(child => child.key.type === 'Identifier' && child.key.value === nameValue);
};

const getIdentifierRange = (node: parse.PropertyNode|parse.LiteralNode) => {
	const startLine = node?.loc?.start.line || 0;
	const endLine = node?.loc?.end.line || 0;
	const startColumn = node?.loc?.start.column || 0;
	const endColumn = node?.loc?.end.column || 0;

	return new vscode.Range(
		new vscode.Position(startLine - 1, startColumn),
		new vscode.Position(endLine - 1, endColumn)
	);
};

export const deactivate = () => { };

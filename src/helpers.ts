import * as vscode from 'vscode';
import parse from 'json-to-ast';
import { exec, ExecOptions } from 'child_process';

export const getASTNode = (
  children: parse.PropertyNode[],
  type: string,
  keyValue: string
) => {
  return children.find(
    child => child.key.type === type && child.key.value === keyValue
  );
};

export const getRangeFromASTNode = (
  node:
    | parse.PropertyNode
    | parse.LiteralNode
    | parse.ObjectNode
    | parse.ValueNode
) => {
  const startLine = node?.loc?.start.line || 0;
  const endLine = node?.loc?.end.line || 0;
  const startColumn = node?.loc?.start.column || 0;
  const endColumn = node?.loc?.end.column || 0;

  // we remove 1 from the line numbers because vscode uses 0 based line numbers
  return new vscode.Range(
    new vscode.Position(startLine - 1, startColumn),
    new vscode.Position(endLine - 1, endColumn)
  );
};

export const getStartPositionFromASTNode = (
  node:
    | parse.PropertyNode
    | parse.LiteralNode
    | parse.ObjectNode
    | parse.ValueNode
) => {
  const startLine = node?.loc?.start.line || 0;
  const startColumn = node?.loc?.start.column || 0;

  return new vscode.Position(startLine - 1, startColumn);
};

export const isConfigFile = (document: vscode.TextDocument) => {
  let isConfigFile = false;

  const documentNode = parse(document.getText()) as parse.ObjectNode;

  // we know that its a config file if
  // 1. the file name is devproxy.config.json
  if (document.fileName.endsWith('devproxyrc.json')) {
    isConfigFile = true;
  }

  // 2. the file contains a $schema property that contains dev-proxy and ends with rc.schema.json
  const schemaNode = getASTNode(documentNode.children, 'Identifier', '$schema');
  if (schemaNode) {
    const schema = (schemaNode?.value as parse.LiteralNode).value as string;
    if (schema.includes('dev-proxy') && schema.endsWith('rc.schema.json')) {
      isConfigFile = true;
    }
  }

  // 3. the file contains plugins array, as $schema is optional
  const pluginsNode = getASTNode(
    documentNode.children,
    'Identifier',
    'plugins'
  );

  if (pluginsNode && pluginsNode.value.type === 'Array') {
    isConfigFile = true;
  }

  return isConfigFile;
};

export const isProxyFile = (document: vscode.TextDocument) => {
  let isProxyFile = false;
  const documentNode = parse(document.getText()) as parse.ObjectNode;

  const schemaNode = getASTNode(documentNode.children, 'Identifier', '$schema');
  if (schemaNode) {
    const schema = (schemaNode?.value as parse.LiteralNode).value as string;
    if (schema.includes('dev-proxy') && schema.endsWith('.schema.json')) {
      isProxyFile = true;
    }
  }
  return isProxyFile;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export const executeCommand = async (cmd: string, options: ExecOptions = {}): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        reject(`exec error: ${error}`);
      } else if (stderr) {
        reject(`stderr: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

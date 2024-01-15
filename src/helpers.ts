import * as vscode from "vscode";
import parse from "json-to-ast";

export const getASTNode = (
  children: parse.PropertyNode[],
  type: string,
  keyValue: string
) => {
  return children.find(
    (child) => child.key.type === type && child.key.value === keyValue
  );
};

export const getRangeFromASTNode = (
  node: parse.PropertyNode | parse.LiteralNode | parse.ObjectNode | parse.ValueNode
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

import * as vscode from "vscode";
import os from "os";
import parse from "json-to-ast";

const pluginsWithConfigSections = [
  "CachingGuidancePlugin",
  "CrudApiPlugin",
  "DevToolsPlugin",
  "ExecutionSummaryPlugin",
  "GenericRandomErrorPlugin",
  "LatencyPlugin",
  "MockResponsePlugin",
  "RateLimitingPlugin",
  "GraphRandomErrorPlugin",
  "MinimalPermissionsGuidancePlugin",
  "MinimalPermissionsPlugin",
];

const hoverContent: HoverContent = {
  rate: [
    "Sets the chance which a request will be failed",
    new vscode.MarkdownString(`[Dev Proxy](https://aka.ms/devproxy)`).value,
  ],
};

// create output channel for logging
const output = vscode.window.createOutputChannel("Dev Proxy", { log: true });

export const activate = (context: vscode.ExtensionContext) => {
  output.appendLine("Dev Proxy extension activated");

  // register start command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "dev-proxy-vsc-ext.start",
      async (document: vscode.TextDocument) => {
        const saved = await document.save();
        if (saved) {
          const terminal = vscode.window.createTerminal("Dev Proxy");
          terminal.sendText(`devproxy --config-file ${document.fileName}`);
          output.appendLine(`Dev Proxy started with ${document.fileName}`);
          terminal.show();
        } else {
          output.appendLine(`Failed to save config file: ${document.fileName}`);
        }
      }
    )
  );

  // register stop command
  context.subscriptions.push(
    vscode.commands.registerCommand("dev-proxy-vsc-ext.stop", () => {
      if (isMac && isLinux) {
        const terminal = vscode.window.createTerminal({
          name: "Dev Proxy Shutdown",
          hideFromUser: true,
        });
        terminal.sendText(`kill -SIGINT 26061`);
        terminal.dispose();
        vscode.window.terminals.find((t) => t.name === "Dev Proxy")?.dispose();
      }
      if (isWindows) {
        // TODO: implement windows stop command
      }
    })
  );

  // register hover provider
  context.subscriptions.push(
    vscode.languages.registerHoverProvider("json", {
      provideHover(document, position, token) {
        // TODO: refactor this to use the json-to-ast library
        const fileContents = parse(document.getText()) as parse.ObjectNode;

        const wordRange = document.getText(
          document.getWordRangeAtPosition(position)
        );

        return {
          contents: hoverContent[wordRange] || [],
        };
      },
    })
  );

  // register code lens provider
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider("json", {
      provideCodeLenses(document) {
        return [
          new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
            title: "▶️ Start Dev Proxy",
            command: "dev-proxy-vsc-ext.start",
            tooltip: "Start Dev Proxy",
            arguments: [document],
          }),
          new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
            title: "🛑 Stop Dev Proxy",
            command: "dev-proxy-vsc-ext.stop",
            tooltip: "Stop Dev Proxy",
            arguments: [],
          }),
        ];
      },
    })
  );

  // create diagnostic collection
  const collection = vscode.languages.createDiagnosticCollection("Dev Proxy");

  // update diagnostics when document is opened
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      collection.clear();
      updateDiagnostics(document, collection);
    })
  );

  // update diagnostics when document is changed
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      updateDiagnostics(event.document, collection);
    })
  );
};

type HoverContent = {
  [key: string]: string[];
};

const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";

const updateDiagnostics = (
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
): void => {
  let diagnostics: vscode.Diagnostic[] = [];

  const fileContents = parse(document.getText()) as parse.ObjectNode;
  const urlsToWatch = getASTNode(
    fileContents.children,
    "Identifier",
    "urlsToWatch"
  );
  const plugins = getASTNode(fileContents.children, "Identifier", "plugins");

  // check for urlsToWatch
  if (
    typeof urlsToWatch !== "undefined" &&
    (urlsToWatch.value as parse.ArrayNode).children.length === 0
  ) {
    diagnostics.push(
      new vscode.Diagnostic(
        getRangeFromASTNode(urlsToWatch),
        "Add at least one url to watch",
        vscode.DiagnosticSeverity.Error
      )
    );
  }

  // check for plugins
  if (
    typeof plugins !== "undefined" &&
    (plugins.value as parse.ArrayNode).children.length === 0
  ) {
    diagnostics.push(
      new vscode.Diagnostic(
        getRangeFromASTNode(plugins),
        "Add at least one plugin",
        vscode.DiagnosticSeverity.Error
      )
    );
  }

  // check validity of plugins
  if (
    typeof plugins !== "undefined" &&
    (plugins.value as parse.ArrayNode).children.length !== 0
  ) {
    const pluginsArray = (plugins.value as parse.ArrayNode)
      .children as parse.ObjectNode[];

    // check for plugins with declared but missing config sections
    const configSections = pluginsArray.map((plugin) => {
      const node = plugin.children.find(
        (child) =>
          child.key.type === "Identifier" && child.key.value === "configSection"
      ) as parse.PropertyNode;
      if (typeof node !== "undefined") {
        return node;
      }
    });

    configSections.forEach((section) => {
      if (typeof section === "undefined") {
        return;
      }
      const identifier = getASTNode(
        fileContents.children,
        "Identifier",
        (section.value as parse.LiteralNode).value as string
      );
      if (typeof identifier === "undefined") {
        diagnostics.push(
          new vscode.Diagnostic(
            getRangeFromASTNode(section.value as parse.LiteralNode),
            "Create a config section for this plugin",
            vscode.DiagnosticSeverity.Error
          )
        );
      }
    });

    // check for plugins with no config sections that require them
    pluginsArray.forEach((plugin: parse.ObjectNode) => {
      // return if plugin has a config section
      const configSection = getASTNode(
        plugin.children,
        "Identifier",
        "configSection"
      );
      // if plugin has no config section, check if it requires one
      if (typeof configSection === "undefined") {
        const pluginName = getASTNode(plugin.children, "Identifier", "name");
        // if plugin requires a config section, add a diagnostic
        if (
          pluginsWithConfigSections.includes(
            (pluginName?.value as parse.LiteralNode).value as string
          )
        ) {
          diagnostics.push(
            new vscode.Diagnostic(
              getRangeFromASTNode(plugin),
              "Add a configSection for this plugin",
              vscode.DiagnosticSeverity.Error
            )
          );
        }
      }
    });
  }

  collection.set(document.uri, diagnostics);
};

const getASTNode = (
  children: parse.PropertyNode[],
  type: string,
  keyValue: string
) => {
  return children.find(
    (child) => child.key.type === type && child.key.value === keyValue
  );
};

const getRangeFromASTNode = (
  node: parse.PropertyNode | parse.LiteralNode | parse.ObjectNode
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

export const deactivate = () => {};

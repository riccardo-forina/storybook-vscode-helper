import * as vscode from "vscode";
import * as path from "path";
import { parse, PropItem } from "react-docgen-typescript";

function defaultOrPlaceholder(
  defaultValue: null | { value: any },
  placeholder: any
) {
  return defaultValue && defaultValue.value ? defaultValue.value : placeholder;
}

function typeToPlaceholder(
  type: any,
  defaultValue: null | { value: any },
  idx: number
) {
  switch (true) {
    case typeof type === "string" && type.includes("|"):
      return type.split("|")[0].trim();
    case type === "number":
      return defaultOrPlaceholder(defaultValue, 123);
    case type === "Date":
      return defaultOrPlaceholder(defaultValue, `new Date()`);
    case type === "string":
      return `'${defaultOrPlaceholder(defaultValue, type)}'`;
    default:
      return `'${type.replace("}", "\\}")}' as unknown as any`;
  }
}

function propInfoToString(key: string, idx: number, info: PropItem): string {
  return `${key}: \${${idx + 3}:${typeToPlaceholder(
    info.type.name,
    info.defaultValue,
    idx
  )}}`;
}

export async function createStory(componentUri: vscode.Uri) {
  const dirname = path.dirname(componentUri.fsPath);
  const basename = path.basename(componentUri.fsPath);
  const ext = path.extname(componentUri.fsPath);
  const isJs = ext.startsWith(".js");
  const storyname = basename.replace(/.(t|j)sx?/, ".stories.$1sx");

  const newFile = vscode.Uri.parse(path.join(dirname, storyname));

  try {
    await vscode.workspace.fs.stat(newFile);
    const document = await vscode.workspace.openTextDocument(newFile);
    await vscode.window.showTextDocument(document);

    const answer = await vscode.window.showInformationMessage(
      "Found an existing stories file for this component. Do you want to replace it with a new one?",
      "Yes",
      "No"
    );
    if (answer === "No") {
      return;
    }
    const invalidRange = new vscode.Range(
      0,
      0,
      document.lineCount /*intentionally missing the '-1' */,
      0
    );
    const fullRange = document.validateRange(invalidRange);
    vscode.window.activeTextEditor?.edit((e) => e.replace(fullRange, ""));
  } catch (e) {
    const document = await vscode.workspace.openTextDocument(
      newFile.with({ scheme: "untitled" })
    );
    await vscode.window.showTextDocument(document);
    vscode.workspace.onDidOpenTextDocument(async (doc) => {
      if (doc === document) {
        await vscode.languages.setTextDocumentLanguage(
          document,
          isJs ? "javascriptreact" : "typescriptreact"
        );
      }
    });
  }

  const [compDoc] = parse(componentUri.fsPath);
  if (compDoc) {
    const args = Object.entries(compDoc.props).reduce<string[]>(
      (args, [key, info], idx) => [...args, propInfoToString(key, idx, info)],
      []
    );
    const tmpl = `import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { ${compDoc.displayName} } from './${path.parse(basename).name}';

export default {
  title: '\${1:Components}/\${2:${compDoc.displayName}}',
  component: ${compDoc.displayName},
  args: {
${args.map((a) => `    ${a}`).join(",\n")}
  },
} as ComponentMeta<typeof ${compDoc.displayName}>;

const Template: ComponentStory<typeof ${compDoc.displayName}> = (args) => (
  <${compDoc.displayName} {...args} />
);

export const \${${3 + args.length}:Story} = Template.bind({});
$${3 + args.length}.args = {};
`;
    console.log(tmpl);
    const snippet = new vscode.SnippetString(tmpl);
    vscode.window.activeTextEditor?.insertSnippet(snippet);
  } else {
    await vscode.commands.executeCommand("editor.action.insertSnippet", {
      name: isJs
        ? "Create a Storybook story (js)"
        : "Create a Storybook story (ts)",
    });
  }
}

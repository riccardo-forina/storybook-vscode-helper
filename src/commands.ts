import * as vscode from "vscode";
import * as path from "path";
import {
  withDefaultConfig,
  PropItem,
  PropItemType,
  ComponentDoc,
} from "react-docgen-typescript";

function defaultOrPlaceholder(
  defaultValue: null | { value: any },
  placeholder: string | number
) {
  return defaultValue && defaultValue.value ? defaultValue.value : placeholder;
}

function typeValue(
  type: PropItemType,
  defaultValue: null | { value: any }
): string | any[] {
  switch (type.name) {
    case "enum":
      if (Array.isArray(type.value)) {
        return type.value.map((v) => v.value);
      }
    case "number":
      return defaultOrPlaceholder(defaultValue, 123);
    case "Date":
      return defaultOrPlaceholder(defaultValue, `new Date()`);
    case "string":
      return `'${defaultOrPlaceholder(defaultValue, type.name)}'`;
    default:
      return `'${type.name.replace("}", "\\}")}' as unknown as any`;
  }
}

function propItemToStoryArg(key: string, idx: number, info: PropItem): string {
  const placeholder = typeValue(info.type, info.defaultValue);
  return `${key}: \${${idx + 3}${Array.isArray(placeholder)
    ? `|${placeholder.join(",")}|`
    : `:${placeholder}`
    }}`;
}

export async function createStory(componentUri: vscode.Uri) {
  const dirname = path.dirname(componentUri.fsPath);
  const basename = path.basename(componentUri.fsPath);
  const storyname = basename.replace(/.(t|j)sx?/, ".stories.$1sx");
  const storyUri = vscode.Uri.parse(path.join(dirname, storyname));

  const isJs = path.extname(componentUri.fsPath).startsWith(".js");
  (await isJs)
    ? createStoryFromJs(storyUri)
    : createStoryFromTs(
      componentUri.fsPath,
      storyUri,
      path.parse(basename).name
    );
}

export async function createStoryFromJs(storyUri: vscode.Uri) {
  await checkExistingStory(storyUri, "javascriptreact");
  await vscode.commands.executeCommand("editor.action.insertSnippet", {
    name: "Create a Storybook story (js)",
  });
}

export async function createStoryFromTs(
  componentFsPath: string,
  storyUri: vscode.Uri,
  importName: string
) {
  const parseResult = withDefaultConfig({
    shouldExtractLiteralValuesFromEnum: true,
  }).parse(componentFsPath);

  const components = parseResult;
  let component: ComponentDoc | undefined;

  switch (components.length) {
    case 0:
      vscode.window.showErrorMessage("No exported components found");
      return;
    case 1:
      component = components[0];
      break;
    default:
      const items = components.map((c) => c.displayName);
      const selection = await vscode.window.showQuickPick(items, {
        canPickMany: false,
        placeHolder:
          "There are many components exported, which one do you want to use for the story?",
      });
      component = components.find((c) => c.displayName === selection)!;
  }

  await checkExistingStory(storyUri, "typescriptreact");

  const args = Object.entries(component.props).reduce<string[]>(
    (args, [key, info], idx) => [...args, propItemToStoryArg(key, idx, info)],
    []
  );
  const tmpl = `import React from 'react';
import type { StoryObj, Meta } from '@storybook/react';

import { ${component.displayName} } from './${importName}';

const meta = {
  title: '\${1:Components}/\${2:${component.displayName}}',
  component: ${component.displayName},
  args: {
    ${args.map((a) => `    ${a}`).join(",\n")}
  },
} satisfies Meta<typeof ${component.displayName}>;
export default meta;

type Story = StoryObj<typeof meta>;

export const \${${3 + args.length}:Default}: Story = {
  args: {},
  render: (props) => <${component.displayName} {...props}/>
}
`;
  const snippet = new vscode.SnippetString(tmpl);
  vscode.window.activeTextEditor?.insertSnippet(snippet);
}

async function checkExistingStory(storyUri: vscode.Uri, languageId: string) {
  try {
    await vscode.workspace.fs.stat(storyUri);
    const document = await vscode.workspace.openTextDocument(storyUri);
    await vscode.window.showTextDocument(document);

    const answer = await await vscode.window.showQuickPick(["Yes", "No"], {
      canPickMany: false,
      placeHolder:
        "Found an existing stories file, do you want to replace it with a new one?",
    });
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
      storyUri.with({ scheme: "untitled" })
    );
    await vscode.window.showTextDocument(document);
    vscode.workspace.onDidOpenTextDocument(async (doc) => {
      if (doc === document) {
        await vscode.languages.setTextDocumentLanguage(document, languageId);
      }
    });
  }
}

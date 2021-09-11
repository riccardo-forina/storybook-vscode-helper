import * as vscode from "vscode";
import * as path from "path";

export async function createStory(componentUri: vscode.Uri) {
  const dirname = path.dirname(componentUri.fsPath);
  const basename = path.basename(componentUri.fsPath);
  const isJs = path.extname(componentUri.fsPath).startsWith(".js");
  const storyname = basename.replace(/.(t|j)sx?/, ".stories.$1sx");

  const newFile = vscode.Uri.parse("untitled:" + path.join(dirname, storyname));

  const document = await vscode.workspace.openTextDocument(newFile);

  await vscode.window.showTextDocument(document);
  await vscode.commands.executeCommand("editor.action.insertSnippet", {
    name: isJs
      ? "Create a Storybook story (js)"
      : "Create a Storybook story (ts)",
  });
}

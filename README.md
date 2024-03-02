# storybook-vscode-helper README

A Visual Studio Code helper to create Storybook stories from your components real quick.

## Features


### `Create a Storybook story` command

Open the tsx or jsx file that contains the component for which you want to create a story, then from the command palette run "Create a Storybook story". 

A new _unsaved_ file will be created with the basics of a Storybook story in the Component Story Format (CSF) filled out for you. Move between the placeholders with TAB, customize the names as you want and you are done.

![Create a Storybook story command demo](command-demo.gif)

If your component is written with Typescript, the extension will try to understand the properties it takes filling them out for you with some placeholders, or a default value if available.

![Typescript demo](command-demo-typescript.gif)

### `story` snippet

In alternative, you can create a Storybook file in the common format `{Component Name}.stories.jsx|tsx`, type `story` and hit tab to expand the snippet. You will get a basic story in the Component Story Format (CSF) filled out for you. 

## Roadmap

- ☑️ Javascript snippet
- ☑️ Typescript snippet
- ☑️ Command palette command to automate the file creation
- ☑️ Make the command unrestand the props taken by the component to automatically fill the arguments with some defaults

## Known Issues

None yet!

## Release Notes

### 1.0.0

Initial release of storybook-vscode-helper
### 1.1.0

Compile the extension with `esbuild` to remove the dependency with Typescript.
Automatic args placeholders for Typescript components.

### 1.1.1

Updated README.md

### 1.2.0

For Typescript files, detect if multiple components are exported and prompt the user to select the one to use.

### 2.0.0

Add the new CSF3.0 snippets under `story` and in the story generation using the command palette, update types and keep the CSF2.0 snippets under `story2`
# storybook-vscode-helper README

A Visual Studio Code helper to create Storybook stories from your components real quick.

## Features


### `Create a storybook Story` command

Open the tsx or jsx file that contains the component for which you want to create a story, then from the command palette run "Create a storybook Story". 

A new _unsaved_ file will be created with the basics of a Storybook story in the Component Story Format (CSF) filled out for you. Move between the placeholders with TAB, customize the names as you want and you are done.

![Create a Storybook story command demo](command-demo.gif)

### `story` snippet

In alternative, you can create a Storybook file in the common format `{Component Name}.stories.jsx|tsx`, type `story` and hit tab to expand the snippet. You will get a basic story in the Component Story Format (CSF) filled out for you. 

## Roadmap

- ☑️ Javascript snippet
- ☑️ Typescript snippet
- ☑️ Command palette command to automate the file creation
- ☐ Make the command unrestand the props taken by the component to automatically fill the arguments with some defaults

## Known Issues

None yet!

## Release Notes

### 1.0.0

Initial release of storybook-vscode-helper

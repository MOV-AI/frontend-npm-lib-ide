# MOV.AI Base IDE

![Movai](https://files.readme.io/d69ebeb-Flow-Logo_trans.png)

This library is created to share a base IDE app ready to use. This is the base for the MOV.AI Flow™.

**main branch:**

[![Deploy - On branch main/release Push](https://github.com/MOV-AI/frontend-npm-ide-ce/actions/workflows/DeployOnMergeMain.yml/badge.svg?branch=dev)](https://github.com/MOV-AI/frontend-npm-ide-ce/actions/workflows/DeployOnMergeMain.yml)

## Development

Open the project in VS Code and then choose to reopen in container.
TODO: Storybook

# Plugin Architecture

This IDE is an App composed of a set of host plugins and a set of view plugins using Remix plugin architecture. All editors in the IDE are view plugins providing custom actions to all editors that enables features such as key binding, loaders, alerts, menu handlers and more.

## Host plugins

A host plugin is any class that extends [HostReactPlugin](./ReactPlugin/HostReactPlugin.js). This means that a HostReactPlugin is able to receive multiple ViewPlugins. A way to transform any React class into a view plugin receiver is to use `withHostReactPlugin: ReactComponent -> ReactComponent`.

## View plugin

A view plugin is any class that extends [ViewReactPlugin](./ReactPlugin/ViewReactPlugin.js). A view plugin is able to be rendered in host plugins. A way to transform any React Component into a view plugin is to use `withPlugin: ReactComponent -> ReactComponent`.

## Invalid hook

When running the lib-react locally from IDE or another app, you might have an issue with invalid hooks with the following message: "Error: Invalid hook call. Hooks can only be called inside of the body of a function component".

To fix it, stop the development server of IDE (or the other app), stop the buildDev of lib-react and run the following command in lib-react repository root:

`sudo npm link ../frontend-npm-ide/node_modules/react`

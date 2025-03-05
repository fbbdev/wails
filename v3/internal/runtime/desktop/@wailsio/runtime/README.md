# @wailsio/runtime

## Development

When developing wails, you can create templates with a direct link back to this package, enabling you to make changes here and see the impact in a real project.  

First, to enable this mode:

1. `cd` to the wails `v3` directory
2. `wails3 task install`

Then, when you initialize a new project using `wails3 init`, the development version of wails will be used, and a link will be created in the `package.json` back to this directory.

Before running `wails3 dev` in that new project, you'll need to build the output of this package:

1. Install project dependencies with `npm i`
2. Build the project using `npm run build:code`
  - Or `npm run build:code:watch` to automatically recompile when you make changes

To revert a project back to the npm-published version of `@wailsio/runtime`, simply change the reference in `package.json` back to `"latest"`.

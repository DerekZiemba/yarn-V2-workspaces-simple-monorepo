# Forked from https://github.com/HugoDF/yarn-workspaces-simple-monorepo
Was assessing if it'd be worthwhile to use yarn over npm.  
I ran into a dealbreaker with yarn classic, then tried upgrading to V2.   
Now I'm at another dealbreaker and am posting this repo for help.   

## Upgrade process
It's not immediately obvious there is a V2, and it can only be used per project.  
https://github.com/yarnpkg/berry/issues/1443#issuecomment-681167701  

The migration was super painful and way more complicated than expected.  Especially for such a simple sample repo.  
https://yarnpkg.com/getting-started/install  

1. First need to install the classic yarn as a global node module `npm install -g yarn`
1. Then from the project root, run:  
   `yarn set version berry && yarn set version latest && yarn install`
1. Read about migrating version 2 here: https://yarnpkg.com/advanced/migration
   1. Run the doctor to see if it offers up anything helpful  
      `yarn dlx @yarnpkg/doctor .`
   2. Install webpack plugin (not useful in this repo, but I'll need it later)  
      `yarn add -D pnp-webpack-plugin`
2. Install some plugins https://yarnpkg.com/api/modules/plugin_typescript.html  
   Many of the documented commands come from these, and IMO it's easy to miss that these are addons 

    ```bash
      yarn plugin import typescript           # I guess it's not batteries included like V1
      yarn plugin import workspace-tools      # Adds `yarn workspace foreach` https://yarnpkg.com/cli/workspaces/foreach
      yarn plugin import exec                 #                               https://yarnpkg.com/cli/exec
      # adds `yarn upgrade-interactive`.  Needed because `yarn upgrade --latest` is broken for workspaces. 
      # Might be fixed in V2, but I haven't had the chance to check and better safe than sorry
      # https://github.com/yarnpkg/yarn/issues/4442#issuecomment-559117268
      yarn plugin import interactive-tools
      yarn plugin import constraints          # Seems like it could be useful   https://yarnpkg.com/features/constraints
      yarn plugin import version              # also seems like could be useful https://yarnpkg.com/features/release-workflow
    ```

**Yarn Classic Scratchpad**:  
  ```bash
  yarn workspaces info
  yarn workspaces run test
  yarn workspace @test/server run build

  # fails because not every workspace has a build command
  yarn workspaces run build
  # Incorrectly thought this command was in Yarn Classic. None of this works
  https://next.yarnpkg.com/cli/workspaces/foreach
  yarn workspaces foreach -pitvA run test
  yarn workspaces foreach -ptv run build
  yarn workspaces foreach -pitvA run build

  https://github.com/yarnpkg/yarn/issues/4442
  yarn upgrade-interactive --latest

  $ yarn add tslib -W
  yarn add v1.22.4
  error Running this command will add the dependency to the workspace root rather than the workspace itself, which might not be what you want - if you really meant it, make
  it explicit by running this command again with the -W flag (or --ignore-workspace-root-check).
  info Visit https://yarnpkg.com/en/docs/cli/add for documentation about this command.
  ```

**Yarn V2 Scratchpad**:  
I think I was better off on V1.  V1 way simplier and pretty much worked out of the box. 
  ```bash
  $ yarn workspaces list --json -v
{"location":".","name":"yarn-workspaces-simple-monorepo","workspaceDependencies":[],"mismatchedWorkspaceDependencies":[]}
{"location":"examples/example-1","name":"example-1","workspaceDependencies":[],"mismatchedWorkspaceDependencies":[]}
{"location":"examples/example-2","name":"example-2","workspaceDependencies":["examples/example-1"],"mismatchedWorkspaceDependencies":[]}
{"location":"other-example","name":"other-example","workspaceDependencies":["examples/example-1","examples/example-2"],"mismatchedWorkspaceDependencies":[]}
{"location":"packages/common","name":"@test/common","workspaceDependencies":["examples/example-1"],"mismatchedWorkspaceDependencies":[]}
{"location":"packages/server","name":"@test/server","workspaceDependencies":["packages/common","examples/example-1","examples/example-2","other-example"],"mismatchedWorkspaceDependencies":[]}

$ yarn workspaces foreach -t run build
(node:3408) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 uncaughtException listeners added to [process]. Use emitter.setMaxListeners() to increase limit
➤ YN0000: src/common.ts:2:22 - error TS2307: Cannot find module 'example-1' or its corresponding type declarations.
➤ YN0000:
➤ YN0000: 2 import { echo } from 'example-1';
➤ YN0000:                        ~~~~~~~~~~~
➤ YN0000:
➤ YN0000:
➤ YN0000: Found 1 error.
➤ YN0000:
➤ YN0000: The command failed for workspaces that are depended upon by other workspaces; can't satisfy the dependency graph
➤ YN0000: Failed with errors in 1.55s

  ```



# Yarn Workspaces basic monorepo management without Lerna (for coding examples)

Yarn workspaces give reasonable primitives to work with non-package (library/module) code (eg. application monorepo, coding examples monorepo).

## Requirements

- Node 10+
- Yarn 1.x

## Setup

1. Clone the repository
2. Run `yarn` to install all required dependencies.

## npm scripts

- `yarn test` will run `test` script for each of the packages in the monorepo
- `yarn lint` will lint all of the files with [xo](https://github.com/xojs/xo)
- `yarn format` will run lint with `--fix` option on all the examples files (and tests).

## Guide

Pros of using workspaces: Yarn Workspaces are part of the standard Yarn toolchain (not downloading an extra dependency). It's very limited in scope, and de-dupes your installs (ie. makes them faster). This is perfect for managing code examples or a monorepo of applications.

Cons of workspaces: If you're dealing with a monorepo of _packages_ (npm modules, libraries), Lerna provides tooling around publishing/testing only changed files.

Note: Lerna and Yarn Workspaces are _in fact_ designed to work together, just use `"npmClient": "yarn"` in your `lerna.json`.

### Set up Yarn workspaces

```json
{
  "private": true,
  "workspaces": [ "examples/*", "other-example"]
}
```

**Note**: each of the workspaces (packages) need to have a package.json with a unique `name` and a valid `version`. The root package.json doesn't need to, it just needs to have `"private": true` and `"workspaces": []`.

### Bootstrapping the monorepo

Equivalent with Lerna would include a `lerna bootstrap`, which run `npm install` in all the packages.

With workspaces since the dependencies are locked from root, you just need to do a `yarn` at the top-level.

For workspaces to work, your "workspace" folders need to have a package.json that contain a `name` and `version`.

### Managing your monorepo with `yarn workspace` and `yarn workspaces` commands

#### Run commands in a single package

To run commands in a single package in your monorepo, use the following syntax:

```sh
yarn workspace <package-name> <yarn-command>
```

For example:

```sh
$ yarn workspace example-1 run test

yarn workspace v1.x.x
yarn run v1.x.x
$ node test.js
test from example 1
✨  Done in 0.23s.
✨  Done in 0.86s.
```

or

```sh
$ yarn workspace example-2 remove lodash.omit

yarn workspace v1.x.x
yarn remove v1.x.x
[1/2] 🗑  Removing module lodash.omit...
[2/2] 🔨  Regenerating lockfile and installing missing dependencies...
success Uninstalled packages.
✨  Done in 2.83s.
✨  Done in 3.58s.
```


"package-name" should be the value of found in the package.json under the `name` key.

#### Run commands in all packages

To run commands in every package in your monorepo, use the following syntax:

```sh
yarn workspaces <yarn-command>
```

For example:

```sh
$ yarn workspaces run test

yarn workspaces v1.x.x
yarn run v1.x.x
$ node test.js
test from example 1
✨  Done in 0.22s.
yarn run v1.x.x
$ node test.js
{ public: 'data' } 'Should not display "secret"'
✨  Done in 0.23s.
yarn run v1.x.x
$ echo "Other Example"
Other Example
✨  Done in 0.11s.
✨  Done in 2.15s.
```

or

```sh
$ yarn workspaces run add lodash.omit@latest

yarn workspaces v1.x.x
yarn add v1.x.x
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
success Saved 1 new dependency.
info Direct dependencies
info All dependencies
└─ lodash.omit@4.5.0
✨  Done in 3.31s.
yarn add v1.x.x
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
success Saved 1 new dependency.
info Direct dependencies
info All dependencies
└─ lodash.omit@4.5.0
✨  Done in 2.76s.
yarn add v1.x.x
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
success Saved 1 new dependency.
info Direct dependencies
info All dependencies
└─ lodash.omit@4.5.0
✨  Done in 2.63s.
✨  Done in 10.82s.

```

## LICENSE

Code is licensed under the [MIT License](./LICENSE).


**This is forked from: https://github.com/HugoDF/yarn-workspaces-simple-monorepo  
With typescript mixed in from: https://github.com/benawad/typescript-yarn-workspace-example  
Then I made the workspaces reference/import one another - something that was otherwise lacking in the examples.**  

Was assessing if it'd be worthwhile to use yarn over npm.  
I ran into a dealbreaker with yarn classic, then tried upgrading to V2.   
Now I'm at another dealbreaker and am posting this repo for help.   

# Upgrade Process Notes
It's not immediately obvious there is a V2, and it can only be used per project.  
https://github.com/yarnpkg/berry/issues/1443#issuecomment-681167701  

The migration was super painful and way more complicated than expected.  Especially for such a simple sample repo.  
https://yarnpkg.com/getting-started/install  

1. Delete all existing build files and yarn specific files: `./.dist/` & `./node_modules/` & `./yarn.lock`
1. Install classic yarn as a global node module, even if yarn is installed globally via the yarn windows installer exe   
   `npm install -g yarn`
   * Ignore the fact that it says `v1.22.4` or similar
2. From the project root, run:  
   `yarn set version berry && yarn set version latest && yarn install`
3. Read about migrating version 2 here: https://yarnpkg.com/advanced/migration
   1. Run the doctor to see if it offers up anything helpful  
      `yarn dlx @yarnpkg/doctor .`
   2. Install webpack plugin (not useful in this repo, but I'll need it later)  
      `yarn add -D pnp-webpack-plugin`
4. Install some plugins https://yarnpkg.com/api/modules/plugin_typescript.html  
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
## **V1** Yarn Classic 
|   |   |   |
|---|---|---|
| Check workspace setup                                               | `yarn workspaces info` | ![](https://i.imgur.com/7Am1zGb.png)  |
| Run script command defined in package.json for a specific workspace | `yarn workspace @test/server run build`  |  |
| Run test script defined in all workspace package.json's             | `yarn workspaces run test` | ![](https://i.imgur.com/aPinbE0.png)  |
| Run build script defined in package.json's. **(There's a gotcha)**<br> * **There's no way to run a command for all workspaces if not defined in all package.jsons**<br>&nbsp;  [yarn workspaces foreach run build](https://next.yarnpkg.com/cli/workspaces/foreach) has not been implemented for Yarn Classic.<br>&nbsp; Not all workspaces require building, so some of the package.json do not have a build script.<br>&nbsp; The only reason this command works for packages that don't require building<br>&nbsp;&nbsp; is because I added a no-op command for those packages `"build": "cd ."`<br>&nbsp; Without the no-op command, yarn throws a `error Command "build" not found.`         | `yarn workspaces run build` |
| Upgrade all packages to latest **(There's a gotcha)** <br> Can't use `yarn upgrade --latest` because it's been broken for monorepos since 2017,<br> &nbsp; see: https://github.com/yarnpkg/yarn/issues/4442            | `yarn upgrade-interactive --latest` |  |


## **V2** Yarn  
I think I was better off on Classic. Classic way simplier and pretty much worked out of the box.  
I cant build or run anything in V2:  
|   |   |   |
|---|---|---|
| Check workspace setup<br>* Note: It's not longer easily readable for humans  | `yarn workspaces list --json -v` | ![](https://i.imgur.com/hRVhKXi.png) |
| **(BROKEN)** Run script command defined in package.json for a specific workspace<br> There's no longer an easy built in way to do this.<br> Be sure to install plugin `workspace-tools` | `yarn workspaces foreach -t run test`  | ![](https://i.imgur.com/jaVeYeO.png)  |


**ORIGINAL README:**
=====
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


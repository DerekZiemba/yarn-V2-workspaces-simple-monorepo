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


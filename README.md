
**This is forked from: https://github.com/HugoDF/yarn-workspaces-simple-monorepo**  
**With typescript mixed in from: https://github.com/benawad/typescript-yarn-workspace-example**  

- [Exploring Monorepo Options](#exploring-monorepo-options)
  - [V1 Yarn Classic](#v1-yarn-classic)
    - [Setup](#setup)
      - [Automated](#automated)
      - [Manual](#manual)
    - [Samples of Commands](#samples-of-commands)
  - [V2 Yarn](#v2-yarn)
    - [Upgrade From Yarn Classic](#upgrade-from-yarn-classic)
    - [Samples of Commands](#samples-of-commands-1)
  - [Lerna with Yarn Classic (Actually Works!)](#lerna-with-yarn-classic-actually-works)
    - [Migrate from Yarn Classic](#migrate-from-yarn-classic)
    - [Setup](#setup-1)
      - [Automated](#automated-1)
      - [Manual](#manual-1)
    - [Samples of Commands](#samples-of-commands-2)


[**ORIGINAL README:** Yarn Workspaces basic monorepo management without Lerna (for coding examples)](./README.original.md)


# Exploring Monorepo Options 
The content below documents my struggle to investigate things such as:
1. How does `yarn` compare with `npm`
2. How to make Workspaces that reference/import one another
3. Investigate how typescript and javascript workspaces interact
4. How to run script commands on all workspaces at once, even if they some don't implement the script command in their workspace
5. How using a common set of node_modules and version management work
6. Evaluate how it works with webpack with special focus on chunking (todo) 
7. Evaluate how those webpack chunks work with Electron packaging. Can it reduce code duplication in `electron-main`, `electron-renderer`, & `electron-preload`? (won't be done in this repo) 

-------------------

## V1 Yarn Classic 
See git branch `classic`  

Disqualified because script commands cannot be run on all workspaces at once. 

### Setup
#### Automated
The automated way also flattens the node_modules hierarchy and installs basic global dependencies like `yarn` itself.
1. Run `node build/yarn-install-flat`.    
   * This script automates `yarn install --flat --check-files --no-progress --non-interactive --ignore-optional`   
     because yarn is buggy and the `--non-interactive` flag doesn't actually work.  
    * So buggy in fact, that `--ignore-optional` is also ignored.  Be sure to remove `fsevents` from `package.json/resolutions` after running.   
      If fsevents was there, you'll need to run the manual steps afterwards. 
   * Automatically chooses latest package to use for you.  If you were to manually choose, it would take you forever.  
  
#### Manual
1. Install Yarn https://classic.yarnpkg.com/en/docs/install/#windows-stable
1. Make sure target repo is laid out similar to this repo, then simply run `yarn` 

### Samples of Commands 
|   |   |   |
|---|---|---|
| Check workspace setup                                               | `yarn workspaces info` | ![](https://i.imgur.com/7Am1zGb.png)  |
| Run script command defined in package.json for a specific workspace | `yarn workspace @test/server run build`  |  |
| Run test script defined in all workspace package.json's             | `yarn workspaces run test` | ![](https://i.imgur.com/aPinbE0.png)  |
| Run build script defined in package.json's. **(There's a gotcha)**<br> * **There's no way to run a command for all workspaces if not defined in all package.jsons**<br>&nbsp;  [yarn workspaces foreach run build](https://next.yarnpkg.com/cli/workspaces/foreach) has not been implemented for Yarn Classic.<br>&nbsp; Not all workspaces require building, so some of the package.json do not have a build script.<br>&nbsp; The only reason this command works for packages that don't require building<br>&nbsp;&nbsp; is because I added a no-op command for those packages `"build": "cd ."`<br>&nbsp; Without the no-op command, yarn throws a `error Command "build" not found.`         | `yarn workspaces run build` |
| Upgrade all packages to latest **(There's a gotcha)** <br> Can't use `yarn upgrade --latest` because it's been broken for monorepos since 2017,<br> &nbsp; see: https://github.com/yarnpkg/yarn/issues/4442            | `yarn upgrade-interactive --latest` |  |

-------------------
-------------------

## V2 Yarn  
See git branch `yarn2`  

Disqualified because it's painful to use, buggy, lacking in features compared to yarn classic, and more difficult to integrate with webpack v4.  
Classic way simplier and pretty much worked out of the box.  

### Upgrade From Yarn Classic
It's not immediately obvious there is a V2. At least by googling "yarn for windows"  
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

### Samples of Commands
|   |   |   |
|---|---|---|
| Check workspace setup<br>* Note: It's no longer easily readable for humans  | `yarn workspaces list --json -v` | ![](https://i.imgur.com/hRVhKXi.png) |
| **(BROKEN)** Run script command defined in package.json for a specific workspace<br> There's no longer an easy built in way to do this.<br> Be sure to install plugin `workspace-tools` | `yarn workspaces foreach -t run test`  | ![](https://i.imgur.com/jaVeYeO.png)  |

-------------------
-------------------

## Lerna with Yarn Classic (Actually Works!)
See git branch `lerna`

Since `yarn v2` is straight up broken and `yarn classic` doesn't quite have everything I need, I've reluctantly added another dependeny. 

### Migrate from Yarn Classic
1. From a `yarn classic` setup, delete: `./dist/`, `./node_modules/`, `./yarn.lock`
2. Run `npm i -g lerna` 
3. Run `lerna init` then
  * In [./lerna.json](./lerna.json) add workspaces from [./package.json](./package.json) to the "packages" array.  Should look like:
    ```json
     "npmClient": "yarn",
     "useWorkspaces": true,
     "packages": [
       "examples/*",
       "other-example",
       "packages/*"
     ],
    ```
  * **(BUGGED?)** In every workspaces `package.json`, change dependencies to relative paths prefixed with `file:`.  
    * Example:  Change `"@test/common": "*"` to `"@test/common": "file:../common"`
    * Issue was closed and resolved in 2018 without actually fixing it, instead they performed this workaround  
      https://github.com/lerna/lerna/issues/1510#issuecomment-406833121
      * If not done, bootstrapping will throw `error Package "example-1" refers to a non-existing file '"A:\\code\\nodejs\\#EXAMPLES\\example-1"'.`   
        It doesn't make sense because `example-1` doesn't refer to any other workspaces.  

4. Run `lerna bootstrap --use-workspaces`
5. From each workspaces package.json, you can remove the "no-op" script command workaround needed for classic yarn, such as `"build": "cd ."`

### Setup
#### Automated
The automated way also flattens the node_modules hierarchy and installs basic global dependencies like `yarn` itself.
1. Run `node build/yarn-install-flat`.    
   * This script automates `yarn install --flat --check-files --no-progress --non-interactive --ignore-optional`   
     because yarn is buggy and the `--non-interactive` flag doesn't actually work.  
    * So buggy in fact, that `--ignore-optional` is also ignored.  Be sure to remove `fsevents` from `package.json/resolutions` after running.   
      If fsevents was there, you'll need to run the manual steps afterwards. 
   * Automatically chooses latest package to use for you.  If you were to manually choose, it would take you forever.  
  
#### Manual
1. Install Yarn https://classic.yarnpkg.com/en/docs/install/#windows-stable
1. Make sure target repo is laid out similar to this repo, then simply run `lerna bootstrap` or `yarn`

### Samples of Commands
|   |   |   |
|---|---|---|
| Check workspace setup                                               | `yarn workspaces info` | 
| Run script command defined in package.json for a specific workspace | `yarn workspace @test/server run build`  |  
| Run build script defined in some package.json's                     | `lerna run build` |  
| Run test script defined in all workspace package.json's             | `lerna run test` |  
| Upgrade all packages to latest <br> Can't use `yarn upgrade --latest` because it's been broken for monorepos since 2017,<br> &nbsp; see: https://github.com/yarnpkg/yarn/issues/4442  | `yarn upgrade-interactive --latest` |  


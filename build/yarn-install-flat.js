#!/usr/bin/env node

// run:  node build/yarn-install-flat

// override require and add ability to install missing modules
require = ((require) => {
  const Path = require('path');
  const NODE_DIR = Path.dirname(process.execPath);
  const GLOBAL_NODE_MODULES = Path.join(NODE_DIR, 'node_modules');
  if (!require.main.paths.includes(GLOBAL_NODE_MODULES)) { require.main.paths.push(GLOBAL_NODE_MODULES); }
  if (!require.main.paths.includes(NODE_DIR)) { require.main.paths.push(NODE_DIR); }

  const joinDelimitedPaths = (...args) => Array.from(new Set(args.flatMap(x => x && x.split(';')).filter(x => x).map(x => Path.resolve(x)))).join(Path.delimiter);
  process.env.NODE_PATH = joinDelimitedPaths(process.env.NODE_PATH, NODE_DIR, GLOBAL_NODE_MODULES);
  process.env.Path = joinDelimitedPaths(process.env.NODE_PATH, process.env.Path);

  function loadNew(module) {
    console.info(`Attempting to require("${module}")...`)
    try {
      let mod = require(module);
      console.info(`Successfully loaded '${module}'`)
      return mod;
    } catch (ex) {
      console.error("Failed to load: " + module);
      console.log(" If the module has native components (did it call node-gyp?), it likely installed just fine but node needs to be restarted.")
      console.error("RERUN THIS SCRIPT!")
      process.exit(500)
    }
  }

  const loadModule = (module) => loadModule.moduleExists(module) ? require(module) : loadNew(loadModule.installGModule(module));
  loadModule.moduleExists = (module) => { try { require.resolve(module); return true; } catch (e) { return false; } }
  loadModule.installGModule = (module) => { require('child_process').execSync("npm install -g " + module, { stdio: 'inherit' }); return module; }
  Object.assign(loadModule, require); // add standard functionality expected of require

  return loadModule;
})(require);


const yarnInstallFlatAsync = (() => {
  const sanitize = (() => {
    const rgxExcessiveWhitespace = /[^\S\r\n]+(?=[^\S\r\n])/g;
    const rgxExcessiveNewlines = /\n\n+/g;
    const rgxNotAscii = /[^\x20-\x7E\n]+/g;
    const rgxColors = /(\[\?.+?(?=\s|$|[A-Z]))|(\[[0-9A-Z;]+(?=\[?))/g;
    const rgxControl = /(^info\[m(?=\s))|(^\s[1-9]m)|(^\][0-9]\;)/gm;
    return (str) => {
      const str1 = str.replace((rgxNotAscii.lastIndex = 0, rgxNotAscii), '');
      const str2 = str1.replace((rgxExcessiveWhitespace.lastIndex = 0, rgxExcessiveWhitespace), '');
      const str3 = str2.replace((rgxExcessiveNewlines.lastIndex = 0, rgxExcessiveNewlines), '\n');
      const str4 = str3.replace((rgxColors.lastIndex = 0, rgxColors), '')
      const str5 = str4.replace((rgxControl.lastIndex = 0, rgxControl), '')
      return str5;
    };
  })();
  const testOptionsAvailable = (str) => {
    return str.indexOf("Answer?:") >= 0 && str.indexOf("suitable version for") >= 0 && str.indexOf("which resolved to \"") >= 0;
  };
  const rgxLineEnding = /\r?\n/g;
  const rgxMatchVersion = /which resolved to "(.+)"/;
  const lineHasOption = (line) => line.includes("which resolved to \"");
  const parseOption = (option, idx) => {
    return {
      raw: option,
      num: (idx + 1).toString(),
      version: option.match(rgxMatchVersion)[1]
    };
  };
  return async () => {
    // --no-progress and --non-interactive don't actually work
    // if they did, this script wouldn't be needed, but a man can dream... a man can dream...
    const cmdArgs = ["install", "--flat", "--check-files", "--no-progress", "--non-interactive", "--ignore-optional"];
    console.log(["yarn", ...cmdArgs].join(" "));

    // So this code can be standalone without loadModuleAsync
    if (require.moduleExists && !require.moduleExists('yarn')) { require.installGModule('yarn'); }

    const Semver = require('semver');
    const NodePty = require('node-pty');

    let resolve, reject;
    const prom = new Promise((res, rej) => { resolve = res; reject = rej; });

    const proc = NodePty.spawn(`${process.env.NVM_SYMLINK}/yarn.cmd`, cmdArgs, {
      cwd: process.cwd(),
      name: "xterm-color",
      cols: 2048,
      rows: 4096
    });
    proc.onExit(resolve);
    proc.on("error", (...args) => {
      console.error(...args);
      reject(args);
    });

    let prev = "";
    let buff = "";
    let timer = 0;

    const byVersionDescending = (a, b) => Semver.compareBuild(b.version, a.version, true);
    const doSelectOption = () => {
      const lines = buff.split(rgxLineEnding).filter(lineHasOption);
      debugger;
      if (lines.length < 2) { return; }

      buff = "";
      const options = lines.map(parseOption).sort(byVersionDescending);

      let choice = options[0];
      if (Semver.eq(choice.version, options[1].version)) {
        console.warn("Tierbreaker Needed! Choosing the shorter definition: ");
        let ties = options.filter(x => Semver.eq(choice.version, x.version));
        for (let len = ties.length, i = 0; i < len; ++i) {
          if (ties[i].raw.length < choice.raw.length) { choice = ties[i]; }
        }
      } else {
        console.warn("Choosing: ");
      }
      console.warn(choice.raw);
      console.log('---------------');
      proc.write(choice.num + "\r\n");
    };

    proc.onData((data) => {
      let sanitized = sanitize(data);
      buff += sanitized;

      if (sanitized.trim().length > 1) {
        const msg = sanitized.trimEnd();
        if (!prev.endsWith(msg)) {
          console.log((prev = msg));
        }
      }

      if (testOptionsAvailable(buff)) {
        clearTimeout(timer);
        timer = setTimeout(doSelectOption, 10); // All options may not yet be printed
      }
    });

    return await prom;
  };
})();


// const getDirsRecursive = (() => {
//   const Path = require('path');
//   const fsAsync = require('fs').promises;
//   const getDirsRecursive = async (dir, match, depth) => {
//     if (depth === undefined) { depth = 100; }
//     let dircontents = await fsAsync.readdir(dir);
//     let files = [];
//     let promises = [];
//     for (let len = dircontents.length, i = 0; i < len; i++) {
//       let filepath = Path.join(dir, dircontents[i]);
//       let info = await fsAsync.stat(filepath);
//       if (info.isDirectory()) {
//         if (match.test(filepath)) {
//           files.push(filepath);
//         } else if (depth > 0) {
//           promises.push(getDirsRecursive(filepath, match, depth - 1));
//         }
//       }
//     }
//     if (promises.length > 0) {
//       let subresults = await Promise.all(promises);
//       for (let len = subresults.length, i = 0; i < len; i++) { files.push(...subresults[i]); }
//     }
//     return files;
//   };
//   return getDirsRecursive;
// })();


(async () => {
  try {
    // if (process.argv.includes('--clean')) {
    //   const remove = require('util').promisify(require('fs').unlink);
    //   const p1 = remove('./yarn.lock').catch(x=>x);
    //   const p2 = getDirsRecursive('./', /\bnode_modules\b/).then(x => x.map(remove)).catch(x=>x);
    //   await p1;
    //   await p2;
    // }
    console.log(await yarnInstallFlatAsync(process.argv.slice(2)));
    process.exit(0);
  } catch (e) {
    console.error(e);
    debugger;
    process.exit(1);
  }
})();

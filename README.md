# Readme

[![Build Status](https://github.com/avh4/binwrap/workflows/CI/badge.svg)](https://github.com/avh4/binwrap/actions?query=workflow%3ACI)
[![npm](https://img.shields.io/npm/v/binwrap.svg)](https://www.npmjs.com/package/binwrap)
[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

This package helps with distributing binaries via npm.

## Usage

First, create your compiled binaries and make them available via HTTPS.

Now create your npm installer: Make a `package.json` that looks like this:

```json
{
  "name": "myApp",
  "version": "1.0.0",
  "description": "Install myApp",
  "preferGlobal": true,
  "main": "index.js",
  "scripts": {
    "install": "binwrap-install",
    "prepare": "binwrap-prepare",
    "test": "binwrap-test",
    "prepublish": "npm test"
  },
  "license": "BSD-3-Clause",
  "files": [
    "index.js",
    "bin"
  ],
  "bin": {
    "myapp-cli": "bin/myapp-cli"
  },
  "dependencies": {
    "binwrap": "^0.2.3"
  }
}
```

Then create your `index.js` file like this:

```javascript
var binwrap = require("binwrap");
var path = require("path");

var packageInfo = require(path.join(__dirname, "package.json"));
var version = packageInfo.version;
var root = "https://dl.bintray.com/me/myApp/" + version;

module.exports = binwrap({
  dirname: __dirname,
  binaries: [
    "myapp-cli"
  ],
  urls: {
    "darwin-x64": root + "/mac-x64.tgz",
    "linux-x64": root + "/linux-x64.tgz",
    "win32-x64": root + "/win-i386.zip",
    "win32-ia32": root + "/win-i386.zip"
  }
});
```

Then run `npm test` to verify that your packages are published correctly.

Finally, run `npm publish` when you are ready to publish your installer.


## Javascript API

Javascript code can get the absolute path to a binary from a package that uses binwrap
as follows (in this example, "my-package" is a published npm package that uses binwrap,
and has a `my-package-cli` binary):

```js
const cliPath = require('my-package').paths['my-package-cli'];
```

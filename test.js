'use strict'
var fetch = require('node-fetch')

// https://nodejs.org/api/os.html#os_os_platform
var validPlatforms = {
  "aix": true,
  "darwin": true,
  "freebsd": true,
  "linux": true,
  "openbsd": true,
  "sunos": true,
  "win32": true,
  "android": true
};

// https://nodejs.org/api/os.html#os_os_arch
var validArchs = {
  "arm": true,
  "arm64": true,
  "ia32": true,
  "mips": true,
  "mipsel": true,
  "ppc": true,
  "ppc64": true,
  "s390": true,
  "s390x": true,
  "x32": true,
  "x64": true
};

module.exports = function test(config) {
  var errors = [];

  var chain = Object.keys(config.urls).reduce(
    function(p, buildId) {
      var url = config.urls[buildId];
      var displayUrl = "[" + buildId + "] " + url;

      var target = buildId.split("-");
      if (!validPlatforms[target[0]]) {
        console.log("ERROR: A URL is provided for an unknown nodejs platform: " + target[0]);
        process.exit(1);
      }
      if (!validArchs[target[1]]) {
        console.log("ERROR: A URL is provided for an unknown nodejs arch: " + target[1]);
        process.exit(1);
      }

      if (url.slice(0,5) === "http:") {
        console.log("WARNING: Binary is published at an insecure URL (using https is recommended): " + displayUrl)
      }

      return p.then(function() {
        return fetch(url)
        .then(
          function () {
            console.log("OKAY: " + displayUrl);
            return
          },
          function (err) {
            console.error("  - Failed to fetch " + url + ": " + err.message);
            errors.push(displayUrl);
            return
          }
        )
      });
    },
    Promise.resolve()
  );
  return chain.then(function() {
    if (errors.length > 0) {
      console.log("There were errors when validating your published packages.");
      console.log("ERROR: The following URLs (specified in your binwrap config) could not be downloaded (see details above):");
      errors.forEach(function(e) {
        console.log("  - " + e);
      });
      process.exit(1);
    }
  });
};

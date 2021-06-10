const fs = require('fs')
const path = require('path')
const binstall = require(path.join(__dirname, 'binstall'))

module.exports = function install (config, unpackedBinPath, os, arch) {
  if (!fs.existsSync('bin')) {
    fs.mkdirSync('bin')
  }

  let binExt = ''
  if (os === 'win32') {
    binExt = '.exe'
  }

  const buildId = os + '-' + arch
  const url = config.urls[buildId]
  if (!url) {
    throw new Error('No binaries are available for your platform: ' + buildId)
  }
  return binstall(url, unpackedBinPath).then(function () {
    config.binaries.forEach(function (bin) {
      fs.chmodSync(path.join(unpackedBinPath, bin + binExt), '755')
    })
  })
}

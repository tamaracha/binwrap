const path = require('path')
const install = require(path.join(__dirname, 'install'))
const prepare = require(path.join(__dirname, 'prepare'))
const test = require(path.join(__dirname, 'test'))

module.exports = function (config) {
  const paths = {}
  config.binaries.forEach(function (binary) {
    paths[binary] = path.resolve(path.join(config.dirname, 'bin', binary))
  })
  return {
    paths: paths,
    install: function (unpackedBinPath, os, arch) {
      return install(config, unpackedBinPath, os, arch)
    },
    prepare: function () {
      return prepare(config)
    },
    test: function () {
      return test(config)
    }
  }
}

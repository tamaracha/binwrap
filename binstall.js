'use strict'
const fs = require('fs')
const fetch = require('node-fetch')
const tar = require('tar')
const zlib = require('zlib')
const unzip = require('unzip-stream')

function binstall (url, path, options) {
  if (url.endsWith('.zip')) {
    return unzipUrl(url, path, options)
  } else {
    return untgz(url, path, options)
  }
}

function untgz (url, path, options) {
  options = options || {}

  const verbose = options.verbose
  const verify = options.verify

  return new Promise(function (resolve, reject) {
    const untar = tar
      .x({ cwd: path })
      .on('error', function (error) {
        reject(new Error('Error extracting ' + url + ' - ' + error))
      })
      .on('end', function () {
        const successMessage = 'Successfully downloaded and processed ' + url

        if (verify) {
          verifyContents(verify)
            .then(function () {
              resolve(successMessage)
            })
            .catch(reject)
        } else {
          resolve(successMessage)
        }
      })

    const gunzip = zlib.createGunzip().on('error', function (error) {
      reject(new Error('Error decompressing ' + url + ' ' + error))
    })

    try {
      fs.mkdirSync(path)
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
    }

    if (verbose) {
      console.log('Downloading binaries from ' + url)
    }
    return fetch(url).then(function (response) {
      response.body.pipe(gunzip).pipe(untar)
    })
  })
}

function unzipUrl (url, path, options) {
  options = options || {}

  const verbose = options.verbose
  const verify = options.verify

  return new Promise(function (resolve, reject) {
    const writeStream = unzip
      .Extract({ path: path })
      .on('error', function (error) {
        reject(new Error('Error extracting ' + url + ' - ' + error))
      })
      .on('entry', function (entry) {
        console.log('Entry: ' + entry.path)
      })
      .on('close', function () {
        const successMessage = 'Successfully downloaded and processed ' + url

        if (verify) {
          verifyContents(verify)
            .then(function () {
              resolve(successMessage)
            })
            .catch(reject)
        } else {
          resolve(successMessage)
        }
      })

    if (verbose) {
      console.log('Downloading binaries from ' + url)
    }
    return fetch(url).then(function (response) {
      response.body.pipe(writeStream)
    })
  })
}

function verifyContents (files) {
  return Promise.all(
    files.map(function (filePath) {
      return new Promise(function (resolve, reject) {
        fs.stat(filePath, function (err, stats) {
          if (err) {
            reject(new Error(filePath + ' was not found.'))
          } else if (!stats.isFile()) {
            reject(new Error(filePath + ' was not a file.'))
          } else {
            resolve()
          }
        })
      })
    })
  )
}

module.exports = binstall

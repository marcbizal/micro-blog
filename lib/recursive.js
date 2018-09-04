const fsp = require('fs').promises
const path = require('path')
const flatten = require('lodash/flatten')

/**
 * recursive async/await implementation of readdir
 * @param {string} dir - the directory to recursively read
 * @returns {array} - all the items found in the directory and it's subdirectories
 */

async function recursive(dir) {
  const items = await fsp.readdir(dir)
  return flatten(
    await Promise.all(
      items.map(item => path.resolve(dir, item)).map(async item => {
        const stat = await fsp.stat(item)
        if (stat && stat.isDirectory()) {
          return await recursive(item)
        }
        return item
      })
    )
  )
}

module.exports = recursive

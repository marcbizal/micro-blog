const mdx = require('@mdx-js/mdx')
const babel = require('@babel/core')
const path = require('path')
const fsp = require('fs').promises
const zip = require('lodash/zip')
const recursive = require('../lib/recursive')
const requireFromString = require('require-from-string')

const Module = module.constructor
const pages = `${__dirname}/pages`

async function transformMdx(src) {
  const jsx = await mdx(src)
  const babelOptions = babel.loadOptions({
    babelrc: false,
    presets: ['@babel/preset-react'],
    plugins: [
      '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-proposal-object-rest-spread'
    ]
  })
  const { code } = await babel.transform(jsx, babelOptions)
  return code
}

async function getMdxModule(filename) {
  const mdxSrc = await fsp.readFile(filename, { encoding: 'utf-8' })
  const jsxSrc = await transformMdx(mdxSrc)
  return requireFromString(jsxSrc, filename)
}

async function getMdxModules(files) {
  return Promise.all(files.map(async file => getMdxModule(file)))
}

function stripExt(filename) {
  return filename.substring(0, filename.lastIndexOf('.')) || filename
}

async function getPosts() {
  // Recursively get a list of posts in the `/pages` directory
  const files = await recursive(pages)

  // Filter any files that start with _, these are for nextjs configuration.
  const filteredFiles = files.filter(
    file => !path.basename(file).startsWith('_')
  )
  const relativeFiles = filteredFiles.map(file => file.replace(pages, ''))
  const urls = relativeFiles.map(stripExt)

  // Get a module for each file
  const modules = await getMdxModules(filteredFiles)

  // Pair each module with it's filename
  const pairs = zip(urls, modules)

  // Add the filename to the post meta
  const meta = pairs.map(([url, mod]) => ({ url, ...mod.meta }))

  console.log(meta)

  return meta
}

module.exports = getPosts

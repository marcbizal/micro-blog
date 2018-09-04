const { router, get } = require('microrouter')
const next = require('next')

const UrlPattern = require('url-pattern')

const { dev } = require('../config')
const conf = require('./next.config')

const app = next({ dev, conf, dir: './blog' })
const handle = app.getRequestHandler()

const removeEndSlash = require('../lib/removeEndSlash')
const setAssetPrefixByHost = require('../lib/setAssetPrefixByHost')(app)

const { writeFile } = require('fs').promises
const getPosts = require('./getPosts')

const postPattern = new UrlPattern('/blog/:post')

const compress = require('micro-compress')

async function main(req, res, parsedUrl) {
  if (parsedUrl.pathname === '/blog/api') {
  }

  if (parsedUrl.pathname === '/blog') {
    return app.render(req, res, '/index')
  }

  const urlParams = postPattern.match(parsedUrl.pathname)
  if (urlParams && urlParams.post) {
    return app.render(req, res, `/${urlParams.post}`)
  }

  return handle(req, res, parsedUrl)
}

async function setup(handler) {
  // Export posts meta to `./posts`
  const posts = await getPosts()
  await writeFile(
    `${__dirname}/posts.js`,
    `module.exports = ${JSON.stringify(posts)}`
  )

  await app.prepare()
  return compress(setAssetPrefixByHost(removeEndSlash(handler)))
}

module.exports = setup(main)

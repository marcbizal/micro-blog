function setAssetPrefixByHost(app) {
  return fn => (req, res, parsedUrl) => {
    if (/localhost/.test(req.headers.host)) {
      // Set the assetPrefix for localhost
      // It needs to be the http version
      app.setAssetPrefix(`http://${req.headers.host}`)
    } else {
      // Set the assetPrefix for now
      // It needs to be the https version, since now is always HTTPS
      app.setAssetPrefix(`https://${req.headers.host}`)
    }

    return fn(req, res, parsedUrl)
  }
}

module.exports = setAssetPrefixByHost

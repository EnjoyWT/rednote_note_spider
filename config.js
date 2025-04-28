const config = function config(env) {
  if (env === 'test') {
    return {
      GLOBAL_API_URL: 'https://test-smartvoiceapi.shuhengio.com/'
    }
  } else {
    return {
      GLOBAL_API_URL: 'https://smartvoiceapi.shauetech.com/'
    }
  }
}

module.exports = {
  config
}

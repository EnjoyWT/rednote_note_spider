const { chromium } = require('playwright')

/**
 * 创建一个浏览器实例
 * @param {Object} options - 浏览器配置选项
 * @returns {Promise<Browser>} - 返回浏览器实例
 */
async function createBrowser(options = {}) {
  const defaultOptions = {
    headless: false,
    executablePath:
      process.env.CHROME_PATH ||
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // 如果设置了环境变量，使用系统Chrome
  }

  // 合并选项
  const mergedOptions = { ...defaultOptions, ...options }

  // 启动浏览器
  return await chromium.launch({
    headless: mergedOptions.headless,
    executablePath: mergedOptions.executablePath
  })
}

module.exports = {
  createBrowser
}

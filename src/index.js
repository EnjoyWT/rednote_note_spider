// src/index.js
const { redNoteWebsite } = require('./rednote_scraper')
const { createBrowser } = require('./tools/sh_browser')

/**
 * 主函数 - 执行网站爬取
 * @param {string} url - 目标网站URL，如果未提供则使用默认URL
 * @param {Object} options - 爬取选项
 * @returns {Promise<Object>} - 爬取结果
 */
async function main(url = 'https://example.com', options = {}) {
  try {
    console.log('开始爬取任务...')
    const browser = await createBrowser()
    const result = await redNoteWebsite(browser, url, options)
    browser.close()
    // 处理结果
    console.log('\n爬取结果摘要:')
    console.log(`页面标题: ${result.pageTitle}`)
    console.log(`笔记类型: ${result.pageType}`)
    console.log(`照片数量: ${result.pagePhotos.length}`)
    console.log(`视频数量: ${result.videoUrls.length}`)

    return result
  } catch (error) {
    console.error('爬取任务失败:', error)
    throw error
  }
}

// 导出函数
module.exports = {
  redNoteWebsite,
  main
}

// 直接运行时执行爬取
if (require.main === module) {
  // 从命令行获取URL参数（如果有）
  const targetUrl = process.argv[2] || 'http://xhslink.com/a/oblUnHi131Nab'
  // const targetUrl = process.argv[2] || 'http://xhslink.com/a/L50sxNO7mSNab'

  main(targetUrl)
    .then((result) => {
      console.log('\n完整爬取结果:')
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error('程序执行失败:', error)
      process.exit(1)
    })
}

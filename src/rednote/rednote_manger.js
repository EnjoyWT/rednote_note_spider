const { redNoteWebsite } = require('./rednote_scraper.js')
const { createBrowser } = require('../tools/sh_browser.js')
const { addRpaResult } = require('../api/chat/chat.js')
const logger = require('../tools/logger.js')
const XLSX = require('xlsx')
const path = require('path')

// 读取变量
console.log('API 地址:', process.env.GLOBAL_API_URL)

/**
 * 主函数 - 执行网站爬取
 * @param {string} url - 目标网站URL，如果未提供则使用默认URL
 * @param {Object} options - 爬取选项
 * @returns {Promise<Object>} - 爬取结果
 */
function redNoteTasks(urls = [], options = {}) {
  if (!urls || urls.length === 0) {
    throw new Error('未提供URL列表')
  }
  let ttUrl = urls[0]
  return new Promise(async (resolve, reject) => {
    try {
      logger.info('开始爬取任务...')

      const browser = await createBrowser()

      for (let i = 0; i < urls.length; i++) {
        const tUrl = urls[i]
        ttUrl = tUrl
        logger.info(`开始爬取第${i + 1}个URL: ${tUrl}`)
        const result = await redNoteWebsite(browser, tUrl, options)

        var dataJson = { McpTaskId: tUrl, rpaResult: JSON.stringify(result) }

        logger.info('爬取结果1:', dataJson)

        // const data = await addRpaResult(dataJson)

        // logger.info('Response111:', JSON.stringify(data.data))
        // 处理结果
        logger.info('\n爬取结果摘要:')
        logger.info(`笔记类型: ${result.type}`)
        logger.info(`照片数量: ${result.photoUrls.length}`)
        logger.info(`视频数量: ${result.videoUrls.length}`)
      }
      await browser.close()

      resolve(dataJson)
    } catch (error) {
      logger.error(`任务${ttUrl}爬取任务失败:`, error)
      reject(error)
    }
  })
}

function redNoteSingleTask(url = null, options = {}) {
  if (!url || url.length === 0) {
    throw new Error('未提供URL列表')
  }
  return new Promise(async (resolve, reject) => {
    try {
      logger.info('开始爬取任务...')

      const browser = await createBrowser()

      const result = await redNoteWebsite(browser, url, options)

      var dataJson = result

      logger.info('爬取结果1:', dataJson)

      // const data = await addRpaResult(dataJson);

      // logger.info('服务器返回结果:', JSON.stringify(data.data));

      // 处理结果
      logger.info('\n爬取结果摘要:')
      logger.info(`笔记类型: ${result.type}`)
      logger.info(`照片数量: ${result.photoUrls.length}`)
      logger.info(`视频数量: ${result.videoUrls.length}`)
      await browser.close()

      resolve(dataJson)
    } catch (error) {
      console.error(`任务${url}爬取任务失败:`, error)
      reject(error)
    }
  })
}

function main() {
  const workbook = XLSX.readFile('/Users/sh/Desktop/work/red_note/data.xlsx')
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  let firstColumnData = []
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
  firstColumnData = data.slice(0).map((row) => row[0])

  firstColumnData = ['http://xhslink.com/a/PhHV7wwuixibb']
  redNoteTasks(firstColumnData)
    .then((result) => {
      console.log('\n完整爬取结果:')
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error('程序执行失败:', error)
      process.exit(1)
    })
}

if (require.main === module) {
  main()
}

module.exports = {
  redNoteTasks,
  redNoteSingleTask
}

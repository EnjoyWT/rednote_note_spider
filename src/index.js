// src/index.js
import './tools/env.js' // 一定要最顶上！优先加载
import { redNoteWebsite } from './rednote_scraper.js'
import { createBrowser } from './tools/sh_browser.js'
import { redNoteShare } from './api/chat/chat.js'

import XLSX from 'xlsx'
import path from 'path'

// 读取变量
console.log('API 地址:', process.env.GLOBAL_API_URL)
/**
 * 主函数 - 执行网站爬取
 * @param {string} url - 目标网站URL，如果未提供则使用默认URL
 * @param {Object} options - 爬取选项
 * @returns {Promise<Object>} - 爬取结果
 */
async function main(urls = [], options = {}) {
  if (!urls || urls.length === 0) {
    throw new Error('未提供URL列表')
  }
  let ttUrl = urls[0]
  try {
    console.log('开始爬取任务...')

    const browser = await createBrowser()

    for (let i = 0; i < urls.length; i++) {
      const tUrl = urls[i]
      ttUrl = tUrl
      console.log(`开始爬取第${i + 1}个URL: ${tUrl}`)
      const result = await redNoteWebsite(browser, tUrl, options)

      var dataJson = { McpTaskId: tUrl, rpaResult: JSON.stringify(result) }

      console.log('爬取结果1:', dataJson)

      const data = await redNoteShare(dataJson)

      console.log('Response111:', JSON.stringify(data.data))

      // 处理结果
      console.log('\n爬取结果摘要:')
      console.log(`笔记类型: ${result.type}`)
      console.log(`照片数量: ${result.photoUrls.length}`)
      console.log(`视频数量: ${result.videoUrls.length}`)
    }
    browser.close()

    return 'success33'
  } catch (error) {
    console.error(`任务${ttUrl}爬取任务失败:`, error)
    throw error
  }
}

async function singleTask(url = 'https://example.com', options = {}) {
  try {
    // console.log(firstColumnData.length)
    console.log('开始爬取任务...')

    const browser = await createBrowser()

    const result = await redNoteWebsite(browser, url, options)

    var dataJson = { McpTaskId: url, rpaResult: JSON.stringify(result) }

    console.log('爬取结果1:', dataJson)

    const data = await redNoteShare(dataJson)

    console.log('Response111:', JSON.stringify(data.data))

    // 处理结果
    console.log('\n爬取结果摘要:')
    console.log(`笔记类型: ${result.type}`)
    console.log(`照片数量: ${result.photoUrls.length}`)
    console.log(`视频数量: ${result.videoUrls.length}`)
    browser.close()

    return 'success33'
  } catch (error) {
    console.error(`任务${url}爬取任务失败:`, error)
    throw error
  }
}

// 从命令行获取URL参数（如果有）
// const targetUrl = 'http://xhslink.com/a/rBq2ANAalpQab'
// const targetUrl = process.argv[2] || 'http://xhslink.com/a/L50sxNO7mSNab'

const workbook = XLSX.readFile('/Users/sh/Desktop/work/red_note/data.xlsx')
const worksheet = workbook.Sheets[workbook.SheetNames[0]]
let firstColumnData = []
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
firstColumnData = data.slice(0).map((row) => row[0])

// for (let cellAddress in worksheet) {
//   if (cellAddress[0] === 'A' && cellAddress !== 'A1') {
//     firstColumnData.push(worksheet[cellAddress].v)
//   }
// }
// console.log(firstColumnData[0])

firstColumnData = [
  'http://xhslink.com/a/xVeeNX6IskQab',
  'http://xhslink.com/a/4Hjpg65dwkQab',
  'http://xhslink.com/a/AejrS0yaDkQab',
  'http://xhslink.com/a/XiNzofeQIkQab'
]
main(firstColumnData)
  .then((result) => {
    console.log('\n完整爬取结果:')
    console.log(JSON.stringify(result, null, 2))
  })
  .catch((error) => {
    console.error('程序执行失败:', error)
    process.exit(1)
  })
// singleTask(targetUrl)

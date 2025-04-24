// const { chromium } = require('playwright')
import { chromium } from 'playwright'
/**
 * 爬取单个网站的数据，使用已存在的浏览器实例
 * @param {Browser} browser - Playwright浏览器实例
 * @param {string} url - 要爬取的网页URL
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} - 返回爬取结果对象
 */

export const redNoteWebsite = async function redNoteWebsite(
  browser,
  url,
  options = {}
) {
  const defaultOptions = {
    timeout: 30000,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36'
  }

  // 合并选项
  const mergedOptions = { ...defaultOptions, ...options }

  console.log(`开始爬取URL: ${url}`)

  try {
    // 创建新的浏览器上下文
    const context = await browser.newContext({
      userAgent: mergedOptions.userAgent,
      viewport: { width: 1280, height: 800 }
    })

    const page = await context.newPage()

    // 设置超时
    page.setDefaultTimeout(mergedOptions.timeout)

    // 用于存储捕获的视频 URL
    const videoUrls = new Set()

    // 监听所有网络请求
    page.on('request', (request) => {
      const url = request.url()
      // console.log(`捕获到请求: ${url}`)
      // 筛选可能的视频文件请求（根据后缀或 URL 关键字）
      if (
        url.endsWith('.mp4') ||
        url.endsWith('.m3u8') ||
        url.includes('.mp4') ||
        url.includes('.m3u8')
      ) {
        videoUrls.add(url)
        console.log(`捕获到可能的视频请求: ${url}`)
      }
    })
    // 导航到目标URL
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    // await page.waitForLoadState('networkidle')
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 }) // 最多等 60 秒
    } catch (e) {
      console.warn(
        '⚠️ 页面长时间处于活跃状态，跳过 networkidle 检查，继续处理。'
      )
    }
    // 定义要爬取的数据结构
    const result = {
      url,
      title: null,
      content: null,
      editorTimeCity: null,
      photoUrls: [],
      type: 0,
      videoUrls: [],
      timestamp: new Date().toISOString()
    }

    let isVideo = false

    try {
      // 定位目标元素（例如某个选择器）
      const elementLocator = page.locator(
        '#noteContainer > div.video-player-media.media-container > div > div > xg-start > div.xgplayer-icon-play'
      )
      const elementCount = await elementLocator.count()

      if (elementCount > 0) {
        console.log(`当前笔记是==视频类型`)
        isVideo = true
        result.type = 1
      } else {
        console.log(' 当前笔记是-图文类型 ')
      }
    } catch (error) {
      console.error('❌ 检查元素是否存在时出错:', error.message)
    }

    // 提取页面标题
    try {
      // const titleElement = await page.$('//*[@id="detail-title"]')
      const titleElement = page.locator('#detail-title') // 使用 CSS 选择器，更简洁
      if (titleElement) {
        result.title = await titleElement.textContent()
        console.log(`✅ 成功提取页面标题: ${result.title}`)
      }
    } catch (error) {
      console.error('❌ 提取页面标题时出错:', error.message)
    }
    try {
      const contentLocator = page.locator('#detail-desc') // 使用 CSS 选择器，更简洁
      if (contentLocator) {
        result.content = await contentLocator.textContent()
        console.log(`✅ 成功提取页面内容: ${result.content}`)
      }
    } catch (error) {
      console.error('❌ 提取页面内容时出错:', error.message)
    }

    try {
      const editorTimeLocator = page.locator(
        '#noteContainer > div.interaction-container > div.note-scroller > div.note-content > div.bottom-container > span.date'
      )
      if (editorTimeLocator) {
        result.editorTimeCity = await editorTimeLocator.textContent()
        console.log(`✅ 成功提取页面编辑时间: ${result.editorTimeCity}`)
      }
    } catch (error) {
      console.error('❌ 提取页面编辑时间时出错:', error.message)
    }

    if (isVideo) {
      try {
        // 等待一段时间以确保视频资源请求被捕获
        await page.waitForTimeout(5000) // 等待 10 秒，可以根据实际情况调整

        // 检查是否捕获到视频 URL
        if (videoUrls.size > 0) {
          console.log(`✅ 捕获到 ${videoUrls.size} 个可能的视频地址`)
          Array.from(videoUrls).forEach((url, index) => {
            console.log(`视频 ${index + 1}: ${url}`)
          })
          result.videoUrls = [...videoUrls]
        } else {
          console.log(
            '❌ 没有捕获到视频地址，可能需要更长时间等待或模拟用户行为'
          )

          // 如果没有捕获到，尝试播放视频或切换轮播
          const videoLocator = page.locator('video[src^="blob:"]')
          if ((await videoLocator.count()) > 0) {
            console.log('找到 Blob URL 视频，尝试触发播放')
            await videoLocator.evaluate((video) => video.play())
            await page.waitForTimeout(5000) // 等待播放后的请求

            if (videoUrls.size > 0) {
              console.log(`✅ 播放后捕获到 ${videoUrls.size} 个可能的视频地址`)
              Array.from(videoUrls).forEach((url, index) => {
                console.log(`视频 ${index + 1}: ${url}`)
              })
              result.videoUrls = [...videoUrls]
            } else {
              console.log('❌ 播放后仍未捕获到视频地址')
            }
          }
        }
      } catch (error) {
        console.error('❌ 捕获视频地址时出错:', error.message)
      }
    } else {
      try {
        // 定位轮播图中的所有图片元素
        // const imageLocator = page.locator(
        //   "#noteContainer > div.media-container > div > div > div.swiper.swiper-initialized.swiper-horizontal.swiper-pointer-events.swiper-watch-progress.note-slider.swiper-backface-hidden > div > div.swiper-slide .img-container img"
        // );
        const imageLocator = page.locator('div.swiper-slide .img-container img')
        const imageCount = await imageLocator.count()

        if (imageCount > 0) {
          console.log(`✅ 找到 ${imageCount} 张轮播图图片`)

          // 提取所有图片的 src 属性
          const imageUrls = await imageLocator.evaluateAll((elements) =>
            elements.map((el) => el.getAttribute('src'))
          )

          // 输出图片链接
          // imageUrls.forEach((url, index) => {
          //   console.log(`图片 ${index + 1}: ${url}`)
          // })
          result.photoUrls = imageUrls
        } else {
          console.log('❌ 没有找到轮播图中的图片')
        }
      } catch (error) {
        console.error('❌ 获取轮播图图片链接时出错:', error.message)
      }
    }

    // 关闭上下文
    await context.close()
    console.log(`🏁 ${url} 爬取完成`)

    // 返回结果
    return result
  } catch (error) {
    console.error(`❌ 爬取 ${url} 失败:`, error)
    throw error
  }
}

// module.exports = {
//   redNoteWebsite
// }

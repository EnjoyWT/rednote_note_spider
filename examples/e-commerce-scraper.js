// examples/e-commerce-scraper.js
const { chromium } = require('playwright')

/**
 * 爬取电商网站的商品详情
 * @param {string} url - 商品详情页URL
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} - 返回商品详情数据
 */
async function scrapeProductDetails(url, options = {}) {
  const defaultOptions = {
    headless: true,
    timeout: 30000,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36'
  }

  const mergedOptions = { ...defaultOptions, ...options }

  console.log(`开始爬取商品信息，URL: ${url}`)

  const browser = await chromium.launch({
    headless: mergedOptions.headless,
    executablePath: process.env.CHROME_PATH || undefined
  })

  try {
    const context = await browser.newContext({
      userAgent: mergedOptions.userAgent,
      viewport: { width: 1280, height: 800 }
    })

    const page = await context.newPage()
    page.setDefaultTimeout(mergedOptions.timeout)

    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    // 商品信息结构
    const productInfo = {
      title: null,
      price: null,
      originalPrice: null,
      discount: null,
      rating: null,
      reviewCount: null,
      availability: null,
      images: [],
      description: null,
      specifications: {},
      timestamp: new Date().toISOString()
    }

    // 提取商品标题
    try {
      const titleElement = await page.$(
        '//h1[@class="product-title"] | //div[contains(@class, "product-name")]//h1'
      )
      if (titleElement) {
        productInfo.title = await titleElement.textContent()
        productInfo.title = productInfo.title.trim()
        console.log(`✅ 成功提取商品标题: ${productInfo.title}`)
      }
    } catch (error) {
      console.error('❌ 提取商品标题时出错:', error.message)
    }

    // 提取商品当前价格
    try {
      const priceElement = await page.$(
        '//span[contains(@class, "current-price")] | //span[contains(@class, "price-current")]'
      )
      if (priceElement) {
        let priceText = await priceElement.textContent()
        priceText = priceText.replace(/[^\d.,]/g, '').trim()
        productInfo.price = parseFloat(priceText)
        console.log(`✅ 成功提取商品价格: ${productInfo.price}`)
      }
    } catch (error) {
      console.error('❌ 提取商品价格时出错:', error.message)
    }

    // 提取商品原价（如果有）
    try {
      const originalPriceElement = await page.$(
        '//span[contains(@class, "original-price")] | //span[contains(@class, "price-original")]'
      )
      if (originalPriceElement) {
        let priceText = await originalPriceElement.textContent()
        priceText = priceText.replace(/[^\d.,]/g, '').trim()
        productInfo.originalPrice = parseFloat(priceText)

        // 计算折扣
        if (productInfo.price && productInfo.originalPrice) {
          productInfo.discount = Math.round(
            (1 - productInfo.price / productInfo.originalPrice) * 100
          )
          console.log(`✅ 成功计算商品折扣: ${productInfo.discount}%`)
        }

        console.log(`✅ 成功提取商品原价: ${productInfo.originalPrice}`)
      }
    } catch (error) {
      console.error('❌ 提取商品原价时出错:', error.message)
    }

    // 提取商品评分
    try {
      const ratingElement = await page.$(
        '//div[contains(@class, "rating")]//span[contains(@class, "score")] | //div[contains(@class, "stars")]'
      )
      if (ratingElement) {
        const ratingText = await ratingElement.textContent()
        const ratingMatch = ratingText.match(/[\d.]+/)
        if (ratingMatch) {
          productInfo.rating = parseFloat(ratingMatch[0])
          console.log(`✅ 成功提取商品评分: ${productInfo.rating}`)
        }
      }
    } catch (error) {
      console.error('❌ 提取商品评分时出错:', error.message)
    }

    // 提取评论数量
    try {
      const reviewCountElement = await page.$(
        '//a[contains(@class, "review-count")] | //span[contains(@class, "review-count")]'
      )
      if (reviewCountElement) {
        const countText = await reviewCountElement.textContent()
        const countMatch = countText.match(/\d+/)
        if (countMatch) {
          productInfo.reviewCount = parseInt(countMatch[0])
          console.log(`✅ 成功提取评论数量: ${productInfo.reviewCount}`)
        }
      }
    } catch (error) {
      console.error('❌ 提取评论数量时出错:', error.message)
    }

    // 提取商品库存状态
    try {
      const availabilityElement = await page.$(
        '//div[contains(@class, "availability")] | //span[contains(@class, "stock")]'
      )
      if (availabilityElement) {
        productInfo.availability = await availabilityElement.textContent()
        productInfo.availability = productInfo.availability.trim()
        console.log(`✅ 成功提取库存状态: ${productInfo.availability}`)
      }
    } catch (error) {
      console.error('❌ 提取库存状态时出错:', error.message)
    }

    // 提取商品图片URL
    try {
      const imageElements = await page.$$(
        '//div[contains(@class, "product-image")]//img | //div[contains(@class, "gallery")]//img'
      )
      for (const imgElement of imageElements) {
        const imgSrc = await imgElement.getAttribute('src')
        if (
          imgSrc &&
          !imgSrc.includes('placeholder') &&
          !productInfo.images.includes(imgSrc)
        ) {
          productInfo.images.push(imgSrc)
        }
      }
      console.log(`✅ 成功提取 ${productInfo.images.length} 张商品图片`)
    } catch (error) {
      console.error('❌ 提取商品图片时出错:', error.message)
    }

    // 提取商品描述
    try {
      const descriptionElement = await page.$(
        '//div[contains(@class, "product-description")] | //div[contains(@class, "description")]'
      )
      if (descriptionElement) {
        productInfo.description = await descriptionElement.textContent()
        productInfo.description = productInfo.description.trim()
        console.log(`✅ 成功提取商品描述`)
      }
    } catch (error) {
      console.error('❌ 提取商品描述时出错:', error.message)
    }

    // 提取商品规格
    try {
      const specRows = await page.$$(
        '//table[contains(@class, "specifications")]//tr | //div[contains(@class, "product-specs")]//div[contains(@class, "row")]'
      )
      for (const row of specRows) {
        const keyElement = await row.$('./th | ./div[1]')
        const valueElement = await row.$('./td | ./div[2]')

        if (keyElement && valueElement) {
          const key = await keyElement.textContent()
          const value = await valueElement.textContent()
          productInfo.specifications[key.trim()] = value.trim()
        }
      }
      console.log(
        `✅ 成功提取 ${
          Object.keys(productInfo.specifications).length
        } 项商品规格`
      )
    } catch (error) {
      console.error('❌ 提取商品规格时出错:', error.message)
    }

    return productInfo
  } catch (error) {
    console.error(`❌ 爬取商品信息失败:`, error)
    throw error
  } finally {
    await browser.close()
    console.log(`🏁 商品信息爬取完成`)
  }
}

// 直接运行脚本时使用
if (require.main === module) {
  // 示例商品URL - 这里需要替换为实际的电商网站商品URL
  const productUrl = process.argv[2] || 'https://example.com/product/123'

  scrapeProductDetails(productUrl)
    .then((result) => {
      console.log('\n商品详情:')
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error('爬取失败:', error)
    })
}

module.exports = { scrapeProductDetails }

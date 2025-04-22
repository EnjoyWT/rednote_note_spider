// examples/example.js
const { scrapeWebsite } = require('../src')

async function runExample() {
  try {
    // 示例1: 使用默认选项爬取网站
    console.log('示例1: 爬取默认网站')
    const result = await scrapeWebsite('https://example.com')
    console.log('\n爬取结果:')
    console.log(JSON.stringify(result, null, 2))

    // 示例2: 使用自定义选项爬取网站
    console.log('\n示例2: 使用自定义选项爬取网站')
    const customResult = await scrapeWebsite('https://example.com', {
      headless: false, // 可见浏览器
      timeout: 60000 // 更长的超时时间
    })
    console.log('\n爬取结果:')
    console.log(JSON.stringify(customResult, null, 2))
  } catch (error) {
    console.error('示例运行失败:', error)
  }
}

// 运行示例
runExample()
  .then(() => console.log('示例执行完成'))
  .catch(console.error)

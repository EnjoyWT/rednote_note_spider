// env.js
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const args = process.argv.slice(2)
const modeIndex = args.indexOf('--mode')
const mode = modeIndex !== -1 ? args[modeIndex + 1] : 'test'

const envPath = resolve(__dirname, `../../.env.${mode}`)
console.log(`✅ 加载环境变量: ${envPath}`)

dotenv.config({ path: envPath })

//从进程中获取参数
// 提取 --url 参数
const getArgValue = (argName) => {
  const index = args.indexOf(argName)
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null
}

const urlFromArg = getArgValue('--url')
// 如果命令行提供了 --url，直接覆盖 process.env.GLOBAL_API_URL
if (urlFromArg) {
  process.env.GLOBAL_API_URL = urlFromArg
  console.log(`🔄 GLOBAL_API_URL 已更新为: ${urlFromArg}`)
}

const tokenFromArg = getArgValue('--token')
// 如果命令行提供了 --token，直接覆盖 process.env.shToken
if (tokenFromArg) {
  process.env.shToken = tokenFromArg
  console.log(`🔄 shToken 已更新为: ${tokenFromArg}`)
}

const chromeFromArg = getArgValue('--chromePath')
// 如果命令行提供了 --chrome，直接覆盖 process.env.CHROME_PATH
if (chromeFromArg) {
  process.env.CHROME_PATH = chromeFromArg
  console.log(`🔄 CHROME_PATH 已更新为: ${chromeFromArg}`)
}

const dotenv = require('dotenv')
const path = require('path')
const minimist = require('minimist')
const { config } = require('../../config.js')

const rawArgs = process.argv.slice(2)
const parsedArgs = minimist(rawArgs)

const mode = parsedArgs.mode || 'test'

const { GLOBAL_API_URL } = config(mode)

if (GLOBAL_API_URL) {
  process.env.GLOBAL_API_URL = GLOBAL_API_URL
  console.log(`🔄 GLOBAL_API_URL 已更新为: ${GLOBAL_API_URL}`)
}

// 从已解析的 parsedArgs 中取值
const getArgValue = (argName) => parsedArgs[argName]

const urlFromArg = getArgValue('url')
if (urlFromArg) {
  process.env.GLOBAL_API_URL = urlFromArg
  console.log(`🔄 GLOBAL_API_URL 已更新为: ${urlFromArg}`)
}

const tokenFromArg = getArgValue('token')
if (tokenFromArg) {
  process.env.shToken = tokenFromArg
  console.log(`🔄 shToken 已更新为: ${tokenFromArg}`)
}

const chromeFromArg = getArgValue('chromepath')
if (chromeFromArg) {
  process.env.CHROME_PATH = chromeFromArg
  console.log(`🔄 CHROME_PATH 已更新为: ${chromeFromArg}`)
}

const logFromArg = getArgValue('logpath')
if (logFromArg) {
  process.env.LOG_DIR = logFromArg
  console.log(`🔄 LOG_DIR 已更新为: ${logFromArg}`)
}

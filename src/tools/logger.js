import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

// 获取 __dirname 在 ESM 模块中
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 日志目录
const logDir = path.join(__dirname, '../../logs')

class Logger {
  #logger

  constructor() {
    // 确保日志目录存在
    this.#initLogDir()
    // 初始化 winston 日志
    this.#logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${message}`
        })
      ),
      transports: [
        // 控制台输出
        new winston.transports.Console(),
        // 按日期分割的日志文件
        new DailyRotateFile({
          dirname: logDir,
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '7d', // 保留 7 天的日志
          zippedArchive: false // 不压缩旧日志
        })
      ]
    })
  }

  // 初始化日志目录
  async #initLogDir() {
    try {
      await fs.mkdir(logDir, { recursive: true })
    } catch (err) {
      console.error('创建日志目录失败:', err)
    }
  }

  // 记录 info 级别日志
  info(message) {
    this.#logger.info(message)
  }

  // 记录 error 级别日志
  error(message) {
    this.#logger.error(message)
  }
  // 记录 warn 级别日志
  warn(message) {
    this.#logger.warn(message)
  }
}

// 导出单例实例
export const logger = new Logger()

const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const path = require('path')
const fs = require('fs').promises

const logDir = process.env.LOG_DIR || path.join(__dirname, 'logs')

class Logger {
  #logger

  constructor() {
    this.#initLogDir()
      .then(() => {
        this.#logger = winston.createLogger({
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }), // Include stack traces for errors
            winston.format.printf(({ timestamp, level, message, stack }) => {
              return `[${timestamp}] ${level.toUpperCase()}: ${message}${
                stack ? `\n${stack}` : ''
              }`
            })
          ),
          transports: [
            new winston.transports.Console(),
            new DailyRotateFile({
              dirname: logDir,
              filename: '%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              maxFiles: '7d',
              zippedArchive: false
            })
          ]
        })
      })
      .catch((err) => {
        console.error('Failed to initialize logger:', err)
        throw err // Ensure the application knows logger initialization failed
      })
  }

  async #initLogDir() {
    try {
      await fs.mkdir(logDir, { recursive: true })
    } catch (err) {
      console.error('Failed to create log directory:', err)
      throw err
    }
  }

  info(message) {
    if (this.#logger) this.#logger.info(message)
    else console.log('Logger not initialized:', message)
  }

  error(message) {
    if (this.#logger) this.#logger.error(message)
    else console.error('Logger not initialized:', message)
  }

  warn(message) {
    if (this.#logger) this.#logger.warn(message)
    else console.warn('Logger not initialized:', message)
  }
}

module.exports = new Logger()

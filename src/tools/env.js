// env.js
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const args = process.argv.slice(2)
const modeIndex = args.indexOf('--mode')
const mode = modeIndex !== -1 ? args[modeIndex + 1] : 'development'

dotenv.config({ path: resolve(__dirname, `../../.env.${mode}`) })

console.log(`✅ Loaded .env.${mode}`)

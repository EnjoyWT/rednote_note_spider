import { POST } from '../api.js'

/**
 * API集
 */
const API = {
  addMcpClient: '/monitor/clientInfoService/addMcpClient',
  heartbeat: '/monitor/clientInfoService/mcpReport',
  addRpaResult: '/monitor/rpaResultService/addResult'
}
export const addMcpClient = (data = {}) => POST(API.addMcpClient, data)

export const addRpaResult = (data = {}) => POST(API.addRpaResult, data)

export const heartbeat = (data = {}) => POST(API.heartbeat, data)

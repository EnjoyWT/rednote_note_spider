const { POST } = require('../api.js')

/**
 * API集
 */
const API = {
  addMcpClient: '/monitor/clientInfoService/addMcpClient',
  heartbeat: '/monitor/clientInfoService/mcpReport',
  addRpaResult: '/monitor/rpaResultService/addResult'
}
const addMcpClient = (data = {}) => POST(API.addMcpClient, data)

const addRpaResult = (data = {}) => POST(API.addRpaResult, data)

const heartbeat = (data = {}) => POST(API.heartbeat, data)

module.exports = {
  addMcpClient,
  addRpaResult,
  heartbeat
}

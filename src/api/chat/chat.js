import { POST } from '../api.js'

/**
 * API集
 */
const API = {
  sendChatRecordRequest: 'ipap/clientImChat/importChatRecord',
  syncChatTaskRequest: 'ipap/clientImTask/syncChatTask',
  asynImportChatRecord: 'ipap/clientImChat/asynImportChatRecord',
  pollingChatAnswer: 'ipap/clientImChat/pollingChatAnswer',
  redNoteShare: '/monitor/rpaResultService/addRpaResult'
}
export const sendChatRecordRequest = (data = {}) =>
  POST(API.sendChatRecordRequest, data)

export const syncChatTaskRequest = (data = {}) =>
  POST(API.syncChatTaskRequest, data)

export const asynImportChatRecord = (data = {}) =>
  POST(API.asynImportChatRecord, data)

export const pollingChatAnswer = (data = {}) =>
  POST(API.pollingChatAnswer, data)

export const redNoteShare = (data = {}) => POST(API.redNoteShare, data)

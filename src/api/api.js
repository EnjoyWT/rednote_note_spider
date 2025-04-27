// services/api.js
import axios from 'axios'
import { logger } from '../tools/logger.js'

console.log('API 地址:', process.env.GLOBAL_API_URL)
const api = axios.create({
  baseURL: process.env.GLOBAL_API_URL,
  timeout: 30000
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // const authStore = useAuthStore()
    // // 在发送请求前注入 token 和自定义 header
    // config.headers.Authorization = `rpa good`
    // config.headers = authStore.getAuthHeaders
    // console.log(
    //   'config',
    //   authStore.shAppId,
    //   authStore.shTenantId,
    //   authStore.shAuthorization,
    // )
    // const fullUrl = `${config.baseURL}${config.url}`;
    // console.log('config',fullUrl,authStore.shAppId,authStore.shTenantId,authStore.shAuthorization)

    if (process.env.shToken) {
      config.headers['SH-Authorization'] = process.env.shToken
    } else {
      config.headers['SH-Authorization'] =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlvbklkIjo1Mzc1LCJ1c2VyTmFtZSI6IlVfMjI1MTM2MTA4IiwibW9iaWxlIjoiMTM4MTY5NDgxMjAiLCJleElkIjoiIiwicGhvdG9VcmwiOiIiLCJhcHBJZCI6InNoYXVldGVjaC13ZWIiLCJmcm9tIjoicGMtdGVzdCIsInVuaXF1ZUlkIjoxNTg5OTE5NTQ5MDIxNjMwNTExLCJpZCI6MTU4OTkxOTU0OTAyMTYzMDUxMSwiaWF0IjoxNzIyODM1Mzk0LCJleHAiOjE4MDkyMzUzOTR9.h6E8vcDDquu_G9sUy2UUGP9JMWBzoM0x0s_LhhoTiW0'
    }
    config.headers['skip-auth'] = 1

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // console.log('API Response:', response.data)
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

/**
 * @description GET
 * @returns
 */
export const GET = (url, params) => {
  const { onDownloadProgress } = params || {}
  return api.get(url, { params }, { onDownloadProgress })
}

/**
 * @description POST
 * @returns
 */
export const POST = (url, params) => {
  const { onDownloadProgress } = params || {}
  return api.post(url, params, { onDownloadProgress })
}
export default api

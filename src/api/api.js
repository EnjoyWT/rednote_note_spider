// services/api.js
import axios from 'axios'

console.log('API 地址:', process.env.GLOBAL_API_URL)
const api = axios.create({
  baseURL: process.env.GLOBAL_API_URL,
  timeout: 30000
})

// 请求拦截器
// api.interceptors.request.use(
//   config => {
//     // const authStore = useAuthStore()
//     // // 在发送请求前注入 token 和自定义 header
//     // config.headers.Authorization = `rpa good`
//     // config.headers = authStore.getAuthHeaders
//     // console.log(
//     //   'config',
//     //   authStore.shAppId,
//     //   authStore.shTenantId,
//     //   authStore.shAuthorization,
//     // )
//     // const fullUrl = `${config.baseURL}${config.url}`;
//     // console.log('config',fullUrl,authStore.shAppId,authStore.shTenantId,authStore.shAuthorization)
//     // config.headers['SH-Authorization'] = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MTU4OTkxOTU0OTAyMTYzMTEzOCwibW9iaWxlIjoiMTc2MDEzNDU0ODUiLCJmcm9tIjoicXVua29uZyIsIm5hbWUiOiLlvpDnlJ_npo8iLCJ0b2tlbiI6bnVsbCwicmZUb2tlbiI6bnVsbCwiYXBwTmFtZSI6bnVsbCwicFRlbmFudElkIjpudWxsLCJwVGVuYW50TmFtZSI6bnVsbCwidW5pcXVlSWQiOjE1ODk5MTk1NDkwMjE2MzExMzgsImRlZmF1bHRUZW5hbnQiOm51bGwsImF2YXRhciI6bnVsbCwiZXhwIjoxNzM1ODk4Mjg5fQ.B44rCuKQdEzKMqWWLKL-ZwQk-Pl-ACW86G3kt9AmD7k';
//     // config.headers['Sh-Tenant-Id'] = '10000';
//     // config.headers['Sh-App-Id'] = '17';
//     return config
//   },
//   error => {
//     return Promise.reject(error)
//   },
// )

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

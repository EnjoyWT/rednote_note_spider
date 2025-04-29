require('./tools/env.js') // 一定要最顶上！优先加载
const logger = require('./tools/logger.js')
const { getStableMacAddress } = require('./tools/device.js')

const { addMcpClient, heartbeat, addRpaResult } = require('./api/chat/chat.js')

const { redNoteSingleTask } = require('./rednote/rednote_manger.js')

// 当前任务状态
const taskState = {
  user_rpa_id: '',
  currentTask_id: null, // 当前任务 ID
  currentMcp_task_id: null, // 当前任务 ID

  isRunning: false, // 是否有任务在执行
  uuid: '',
  client_type: 'rpa',
  action: 'rednoteshare2',
  message: '',
  task: {}
}

// 模拟任务处理函数
async function processTask(url) {
  try {
    const result = await redNoteSingleTask(url)
    return result
  } catch (err) {
    logger.error(`任务 ${url} 失败: ${err.message}`)
    throw err
  }
}

// 发送心跳请求
async function sendHeartbeat() {
  const payload = {
    action: taskState.action,
    client_id: taskState.client_id,
    client_type: taskState.client_type,
    uuid: taskState.uuid,
    message: taskState.message
  }
  const tD = getCurrentTaskStatus()
  if (tD.task_id != null || tD.mcp_task_id != null) {
    payload.rpa = { task: [tD] }
  }
  if (taskState?.user_rpa_id && payload.rpa) {
    payload.rpa.user_rpa_id = taskState.user_rpa_id
  }

  console.log('发送心跳请求:', payload)
  try {
    const response = await heartbeat(payload)
    if (!response?.data) {
      logger.error(`心跳请求失败: 响应数据为空`)
      return null
    }
    console.log('心跳返回:', response.data)
    if (response.data.code !== 200) {
      logger.error(`心跳请求失败: ${JSON.stringify(response.data)}`)
      return null
    }
    if (
      taskState.task.operation_status != null &&
      taskState.task.operation_status === 2
    ) {
      resetTaskStatus()
    }
    return response.data.data
  } catch (error) {
    logger.error(`心跳请求失败: ${error.message}`)
    return null
  }
}

function getCurrentTaskStatus() {
  const res = { ...(taskState?.task ?? {}) }
  console.log('当前任务状态:', res)
  return res
}
function resetTaskStatus() {
  taskState.task = {}
}
async function updateTaskStatus(status, msg) {
  taskState.task.operation_status = status
  taskState.message = msg
}
async function reportTaskSuccess(params) {
  try {
    console.log('上传任务结果-传参:', JSON.stringify(params))

    const response = await addRpaResult(params)
    if (response.data.code !== 200) {
      logger.error(
        `上传任务状态任务 ${params.mcp_task_id} 失败: ${JSON.stringify(
          response.data
        )}`
      )
      return
    }
    logger.info(
      `上传任务状态任务 ${params.mcp_task_id} 成功: ${JSON.stringify(
        response.data
      )}`
    )
  } catch (error) {
    logger.error(`任务 ${params.mcp_task_id} 失败: ${error.message}`)
  }
}

function formatDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
}

// 处理心跳返回的任务
async function handleHeartbeatResponse(task) {
  if (
    !task.task ||
    task.task.length === 0 ||
    task.task == null ||
    task.task === undefined
  ) {
    logger.warn('心跳返回空任务，跳过')
    return
  }

  //task 第一层
  /**
   * [{
	"user_rpa_id": 137812,
	"task": [{
		"task_id": 137999,
		"mcp_task_id": "100074",
		"command": {
			"url": "http://xhslink.com/a/XiNzofeQIkQab"
		},
		"message": "",
		"operation_time": "",
		"operation_status": 0,
		"next_action": ""
	}]
}]
  */

  // 只获取元素第一个任务
  const { user_rpa_id, task: innerTask } = task
  console.log('心跳返回任务user_rpa_id:', user_rpa_id)
  taskState.user_rpa_id = user_rpa_id
  // 只获取内部任务第一个任务
  if (!innerTask || innerTask.length === 0) {
    logger.warn('心跳返回innerTask 内部任务为空，跳过')
    return
  }

  const { task_id, mcp_task_id, command } = innerTask[0]

  if (!mcp_task_id) {
    logger.warn('心跳返回任务ID为空，跳过')
    return
  }
  if (!task_id) {
    logger.warn('心跳返回用户ID为空，跳过')
    return
  }
  if (!command) {
    logger.warn('获取任务数据为空，跳过')
    return
  }
  //判断 command 是否有 url
  if (!command.url) {
    logger.warn('获取command 中url 数据为空，跳过')
    return
  }

  if (taskState.isRunning && taskState.currentMcp_task_id === mcp_task_id) {
    logger.warn(`任务 ${mcp_task_id} 已在执行，丢弃重复任务`)
    return
  }

  if (!taskState.isRunning) {
    taskState.isRunning = true
    taskState.currentMcp_task_id = mcp_task_id
    taskState.currentTask_id = task_id

    //存储状态字段
    taskState.task.task_id = task_id
    taskState.task.mcp_task_id = mcp_task_id
    taskState.task.operation_status = 1
    taskState.task.operation_time = formatDateTime()

    try {
      const result = await processTask(command.url)
      if (result !== null && result !== undefined && result !== '') {
        const data = {
          mcp_task_id: mcp_task_id,
          rpa_result: result,
          status: 2,
          task_id: task_id,
          message: '小红书内容抓取成功'
        }
        updateTaskStatus(2, '小红书内容抓取成功')

        reportTaskSuccess(data)
      } else {
        updateTaskStatus(3, '小红书内容抓取失败')
      }
    } catch (err) {
      //
      logger.error(`任务 ${mcp_task_id} 失败: ${err.message}`)
      updateTaskStatus(4, err.message)
    } finally {
      taskState.isRunning = false
      taskState.currentMcp_task_id = null
    }
  } else {
    logger.warn(`本地有任务运行，暂不执行新任务 ${mcp_task_id}`)
  }
}

// 心跳循环
function startHeartbeat() {
  let isProcessing = false
  setInterval(async () => {
    if (isProcessing) {
      logger.warn('上一次心跳仍在处理，跳过')
      return
    }
    isProcessing = true
    try {
      logger.info('发送心跳')
      const task = await sendHeartbeat()
      console.log('心跳返回任务:', JSON.stringify(task))
      await handleHeartbeatResponse(task)
    } catch (error) {
      logger.error(`心跳请求失败: ${error.message}`)
    } finally {
      isProcessing = false
    }
  }, 5000)
}

// 捕获未处理的异常
process.on('uncaughtException', async (err) => {
  await logger.error(`未捕获的异常: ${err.stack}`)
})

process.on('unhandledRejection', async (reason, promise) => {
  await logger.error(`未处理的 Promise 拒绝: ${reason}`)
})

const SUCCESS_CODE = 200

async function registerDevice() {
  try {
    const macAddress = getStableMacAddress()

    const payload = {
      action: ['rednoteshare2'],
      client_id: macAddress,
      client_type: 'rpa'
    }

    const response = await addMcpClient(payload)

    // 记录注册结果
    logger.info(`设备注册结果: ${JSON.stringify(response.data)}`)

    // 检查响应数据是否有效
    if (!response?.data) {
      logger.error(`设备注册失败: 响应数据为空`)
      throw new Error('设备注册失败: 响应数据为空')
    }

    // 检查状态码
    if (response.data.code !== 200) {
      logger.error(`设备注册失败: ${JSON.stringify(response.data)}`)
      throw new Error(`设备注册失败: 状态码 ${response.data.code}`)
    }
    // 返回 uuid 和 client_id
    return { uuid: response.data.data.uuid, client_id: macAddress }
  } catch (error) {
    logger.error(`设备注册失败: ${error.message}`)
    throw error // 保留原始错误堆栈
  }
}
// 启动服务
async function main() {
  logger.info('服务启动')
  await registerDevice()
    .then(({ uuid, client_id }) => {
      console.log('设备注册成功:', { uuid, client_id })
      taskState.uuid = uuid
      taskState.client_id = client_id
    })
    .catch((error) => {
      logger.error(`设备注册失败: ${error.message}`)
      throw error
    })

  startHeartbeat()
}

main()

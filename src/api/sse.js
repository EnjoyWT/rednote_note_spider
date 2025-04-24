// services/sse.js

/**
 * 连接到 Server-Sent Events (SSE) 并提取 delta
 * 使用 Promise 来模拟同步获取结果
 * @param {string} url - SSE 服务器的 URL
 * @param {function} [onError] - 可选，当发生错误时的回调函数
 * @returns {Promise} - 返回一个 Promise 对象，解析为 delta 数据
 */
export const getSSEDataSync = (url, onError) => {
    return new Promise((resolve, reject) => {
      if (!url) {
        reject(new Error('SSE URL is required'));
      }
  
      const eventSource = new EventSource(url);
  
      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
  
          // 检查是否有 delta
          if (data.delta) {
            resolve(data.delta); // 解析并返回 delta
            eventSource.close(); // 数据接收完毕后关闭连接
          } else {
            reject(new Error('Delta field is missing in message'));
            eventSource.close();
          }
        } catch (error) {
          reject(new Error('Error parsing SSE message: ' + error));
          eventSource.close();
        }
      });
  
      // 错误处理
      eventSource.addEventListener('error', (error) => {
        console.error('SSE connection error:', error);
        if (onError) {
          onError(error);
        }
        reject(new Error('SSE connection error'));
        eventSource.close();
      });
    });
  };
  
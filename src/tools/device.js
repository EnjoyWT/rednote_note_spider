const os = require('os')

/**
 * 获取较稳定的真实 MAC 地址（排除虚拟网卡、回环地址、IPv6）
 * @returns {string | null}
 */
const getStableMacAddress = function getStableMacAddress() {
  const interfaces = os.networkInterfaces()

  const isRealInterface = (name) => {
    // 排除常见的虚拟接口名称（如 VPN、Docker、VMware、Loopback 等）
    return !/^(lo|vmnet|vnic|docker|utun|wg|tun|tap|br-|npf)/i.test(name)
  }

  for (const [name, ifaceList] of Object.entries(interfaces)) {
    if (!isRealInterface(name)) continue

    for (const iface of ifaceList) {
      if (
        iface.family === 'IPv4' &&
        !iface.internal &&
        iface.mac !== '00:00:00:00:00:00'
      ) {
        return iface.mac
      }
    }
  }

  return null
}
module.exports = {
  getStableMacAddress
}

"use client"

import type React from "react"

import { useState, useEffect, useCallback, createContext, useContext } from "react"

interface DeviceInfo {
  model?: string
  serial?: string
  androidVersion?: string
}

interface AdbDeviceContextType {
  device: USBDevice | null
  deviceInfo: DeviceInfo | null
  connect: () => Promise<void>
  disconnect: () => void
  executeCommand: (command: string) => Promise<string>
  isSupported: boolean
}

const AdbDeviceContext = createContext<AdbDeviceContextType | undefined>(undefined)

// ADB constants
const ADB_CLASS = 0xff
const ADB_SUBCLASS = 0x42
const ADB_PROTOCOL = 0x01
const ADB_CONNECT_TIMEOUT = 10000 // 10 seconds

// ADB message constants
const A_SYNC = 0x434e5953
const A_CNXN = 0x4e584e43
const A_OPEN = 0x4e45504f
const A_OKAY = 0x59414b4f
const A_CLSE = 0x45534c43
const A_WRTE = 0x45545257
const A_AUTH = 0x48545541

// ADB protocol version
const ADB_VERSION = 0x01000000
const ADB_VERSION_NO_CHECKSUM = 0x01000001

export function AdbDeviceProvider({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<USBDevice | null>(null)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  // Check if WebUSB is supported
  useEffect(() => {
    setIsSupported(!!navigator.usb)
  }, [])

  // Helper function to create ADB message
  const createAdbMessage = (command: number, arg0: number, arg1: number, data: ArrayBuffer | null = null) => {
    const dataView = data ? new Uint8Array(data) : new Uint8Array(0)
    const buffer = new ArrayBuffer(24 + dataView.byteLength)
    const view = new DataView(buffer)

    view.setUint32(0, command, true)
    view.setUint32(4, arg0, true)
    view.setUint32(8, arg1, true)
    view.setUint32(12, dataView.byteLength, true)
    view.setUint32(16, dataView.byteLength ^ 0xffffffff, true)
    view.setUint32(20, 0, true) // checksum, not used in newer versions

    if (data) {
      new Uint8Array(buffer, 24).set(dataView)
    }

    return buffer
  }

  // Connect to device
  const connect = useCallback(async () => {
    if (!navigator.usb) {
      throw new Error("WebUSB is not supported in this browser")
    }

    try {
      // Request a device with the ADB filter
      const selectedDevice = await navigator.usb.requestDevice({
        filters: [{ classCode: ADB_CLASS, subclassCode: ADB_SUBCLASS, protocolCode: ADB_PROTOCOL }],
      })

      await selectedDevice.open()

      // Find the right interface and endpoint
      let interfaceNumber = 0
      let endpointIn = 0
      let endpointOut = 0

      for (const iface of selectedDevice.configurations[0].interfaces) {
        for (const alternate of iface.alternates) {
          if (
            alternate.interfaceClass === ADB_CLASS &&
            alternate.interfaceSubclass === ADB_SUBCLASS &&
            alternate.interfaceProtocol === ADB_PROTOCOL
          ) {
            interfaceNumber = iface.interfaceNumber

            for (const endpoint of alternate.endpoints) {
              if (endpoint.direction === "in") {
                endpointIn = endpoint.endpointNumber
              } else {
                endpointOut = endpoint.endpointNumber
              }
            }
          }
        }
      }

      if (endpointIn === 0 || endpointOut === 0) {
        throw new Error("Could not find ADB interface")
      }

      // Claim interface
      await selectedDevice.claimInterface(interfaceNumber)

      // Send connection message
      const hostName = "web-adb-client"
      const hostNameBuffer = new TextEncoder().encode(hostName + "\0")
      const connectMessage = createAdbMessage(A_CNXN, ADB_VERSION_NO_CHECKSUM, 0x1000000, hostNameBuffer)

      await selectedDevice.transferOut(endpointOut, connectMessage)

      // Wait for response (simplified)
      const response = await selectedDevice.transferIn(endpointIn, 24)

      if (response.data && new DataView(response.data.buffer).getUint32(0, true) === A_CNXN) {
        setDevice(selectedDevice)

        // Get device info
        const info: DeviceInfo = {
          serial: selectedDevice.serialNumber || "Unknown",
        }

        setDeviceInfo(info)
        return
      }

      throw new Error("Failed to establish ADB connection")
    } catch (error) {
      console.error("Error connecting to device:", error)
      throw new Error("Failed to connect to device. Make sure USB debugging is enabled.")
    }
  }, [])

  const disconnect = useCallback(async () => {
    if (device) {
      try {
        await device.close()
      } catch (error) {
        console.error("Error disconnecting device:", error)
      }
      setDevice(null)
      setDeviceInfo(null)
    }
  }, [device])

  const executeCommand = useCallback(
    async (command: string): Promise<string> => {
      if (!device) {
        throw new Error("No device connected")
      }

      // In a real implementation, we would:
      // 1. Open a shell stream
      // 2. Send the command
      // 3. Read the response
      // 4. Close the stream

      // For this demo, we'll simulate responses
      if (command === "devices") {
        return `List of devices attached\n${device.serialNumber || "unknown"}\tdevice`
      } else if (command.startsWith("shell ")) {
        const shellCommand = command.substring(6)

        // Simulate some shell commands
        if (shellCommand === "pm list packages") {
          return "package:com.android.settings\npackage:com.google.android.gms\npackage:com.android.chrome\npackage:com.android.vending"
        } else if (shellCommand === "getprop ro.build.version.release") {
          return "12"
        } else if (shellCommand === "dumpsys battery") {
          return "Current Battery Service state:\n  AC powered: true\n  USB powered: false\n  Wireless powered: false\n  Max charging current: 500000\n  Max charging voltage: 5000000\n  Charge counter: 3200000\n  status: 2\n  health: 2\n  present: true\n  level: 85\n  scale: 100\n  temperature: 280\n  technology: Li-ion"
        } else if (shellCommand === "settings list global") {
          return "global_setting1=value1\nglobal_setting2=value2\nadb_enabled=1"
        } else if (shellCommand === "id") {
          return "uid=2000(shell) gid=2000(shell) groups=2000(shell),1004(input),1007(log),1011(adb),1015(sdcard_rw),1028(sdcard_r),3001(net_bt_admin),3002(net_bt),3003(inet),3006(net_bw_stats),3009(readproc),3011(uhid) context=u:r:shell:s0"
        } else if (shellCommand.startsWith("ls ")) {
          return "system\nvendor\ndata\ncache\nsdcard\n"
        }

        return `Command executed: ${shellCommand}\nNo output available in demo mode.`
      }

      return `Command not implemented in this demo: ${command}`
    },
    [device],
  )

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (device) {
        device.close().catch(console.error)
      }
    }
  }, [device])

  const value = {
    device,
    deviceInfo,
    connect,
    disconnect,
    executeCommand,
    isSupported,
  }

  return <AdbDeviceContext.Provider value={value}>{children}</AdbDeviceContext.Provider>
}

export function useAdbDevice() {
  const context = useContext(AdbDeviceContext)
  if (context === undefined) {
    throw new Error("useAdbDevice must be used within an AdbDeviceProvider")
  }
  return context
}

"use client"

import type React from "react"

// Update the imports to include buffer handling utilities
import { useState, useEffect, useCallback, createContext, useContext } from "react"

// Device connection types
export type DeviceMode = "adb" | "fastboot" | "recovery" | "sideload" | "unknown"

// Add proper ADB protocol constants
const ADB_CLASS = 0xff
const ADB_SUBCLASS = 0x42
const ADB_PROTOCOL = 0x01

// ADB message constants
const A_SYNC = 0x434e5953
const A_CNXN = 0x4e584e43
const A_OPEN = 0x4e45504f
const A_OKAY = 0x59414b4f
const A_CLSE = 0x45534c43
const A_WRTE = 0x45545257
const A_AUTH = 0x48545541
const A_STLS = 0x534c5453

// ADB protocol version
const ADB_VERSION = 0x01000000
const ADB_VERSION_NO_CHECKSUM = 0x01000001
const ADB_MAX_PAYLOAD = 256 * 1024

// Fastboot constants
const FB_COMMAND = 0x666173 // "fas"
const FB_OKAY = 0x4f4b4159 // "OKAY"
const FB_FAIL = 0x4641494c // "FAIL"
const FB_DATA = 0x44415441 // "DATA"
const FB_INFO = 0x494e464f // "INFO"
const FB_MAX_PAYLOAD = 64 * 1024 * 1024 // 64MB max for firmware flashing

// Add proper timeout handling
const CONNECTION_TIMEOUT = 10000 // 10 seconds
const COMMAND_TIMEOUT = 30000 // 30 seconds
const FLASH_TIMEOUT = 300000 // 5 minutes for flashing operations
const PERMISSION_CHECK_INTERVAL = 2000 // 2 seconds between permission checks
const MAX_PERMISSION_CHECKS = 15 // Maximum number of permission checks (30 seconds total)
const MAX_CONNECTION_RETRIES = 3 // Maximum number of automatic connection retries

// Update the DeviceInfo interface to include more device details
interface DeviceInfo {
  model?: string
  serial?: string
  androidVersion?: string
  mode: DeviceMode
  product?: string
  variant?: string
  bootloader?: string
  secure?: boolean
  unlocked?: boolean
  batteryLevel?: number
  cpuArch?: string
  supportedFeatures?: string[]
  kernelVersion?: string
  buildFingerprint?: string
}

// Add proper connection state tracking
type ConnectionState =
  | "disconnected"
  | "connecting"
  | "authenticating"
  | "connected"
  | "error"
  | "waiting_permission"
  | "permission_denied"
  | "connection_lost"
  | "timeout"

// Update the context type to include more functionality
interface DeviceConnectionContextType {
  device: USBDevice | null
  deviceInfo: DeviceInfo | null
  connect: () => Promise<void>
  disconnect: () => void
  executeCommand: (command: string) => Promise<string>
  isSupported: boolean
  deviceMode: DeviceMode
  connectionState: ConnectionState
  errorMessage: string | null
  errorDetails: string | null
  pushFile: (localPath: string, remotePath: string) => Promise<void>
  pullFile: (remotePath: string) => Promise<ArrayBuffer>
  flashPartition: (partition: string, image: ArrayBuffer) => Promise<string>
  rebootTo: (target: "system" | "bootloader" | "recovery" | "fastboot" | "sideload") => Promise<void>
  resetConnection: () => Promise<void>
  retryConnection: () => Promise<void>
  isWaitingForPermission: boolean
  connectionAttempts: number
  lastConnectionAttempt: number
  clearConnectionError: () => void
  getConnectionDiagnostics: () => Promise<ConnectionDiagnostics>
}

// Add a type for connection diagnostics
interface ConnectionDiagnostics {
  webUsbSupported: boolean
  secureContext: boolean
  permissionsPolicyBlocked: boolean
  usbDevicesAccessible: boolean
  previousDevicesFound: number
  androidDeviceFound: boolean
  permissionGranted: boolean
  connectionEstablished: boolean
  lastError: string | null
  browserInfo: string
  suggestedFixes: string[]
}

const DeviceConnectionContext = createContext<DeviceConnectionContextType | undefined>(undefined)

// Implement proper ADB message handling with checksums
const createAdbMessage = (command: number, arg0: number, arg1: number, data: ArrayBuffer | null = null) => {
  const dataView = data ? new Uint8Array(data) : new Uint8Array(0)
  const buffer = new ArrayBuffer(24 + dataView.byteLength)
  const view = new DataView(buffer)
  const checksum = calculateChecksum(dataView)

  view.setUint32(0, command, true)
  view.setUint32(4, arg0, true)
  view.setUint32(8, arg1, true)
  view.setUint32(12, dataView.byteLength, true)
  view.setUint32(16, dataView.byteLength ^ 0xffffffff, true)
  view.setUint32(20, checksum, true)

  if (data) {
    new Uint8Array(buffer, 24).set(dataView)
  }

  return buffer
}

// Add proper checksum calculation
const calculateChecksum = (data: Uint8Array): number => {
  let checksum = 0
  for (let i = 0; i < data.length; i++) {
    checksum += data[i]
  }
  return checksum & 0xffffffff
}

// Add proper ADB authentication handling with key generation
const generateAdbKeyPair = async (): Promise<CryptoKeyPair> => {
  return window.crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: "SHA-1" },
    },
    true,
    ["sign", "verify"],
  )
}

// Add proper ADB authentication token signing
const signAdbToken = async (privateKey: CryptoKey, token: ArrayBuffer): Promise<ArrayBuffer> => {
  return window.crypto.subtle.sign({ name: "RSASSA-PKCS1-v1_5" }, privateKey, token)
}

// Helper function to create Fastboot message
const createFastbootMessage = (command: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(command)
  return data.buffer
}

// Update the provider implementation with proper error handling and real device communication
export function DeviceConnectionProvider({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<USBDevice | null>(null)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("unknown")
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [interfaceNumber, setInterfaceNumber] = useState<number>(0)
  const [endpointIn, setEndpointIn] = useState<number>(0)
  const [endpointOut, setEndpointOut] = useState<number>(0)
  const [adbKeys, setAdbKeys] = useState<CryptoKeyPair | null>(null)
  const [localId, setLocalId] = useState<number>(0)
  const [remoteId, setRemoteId] = useState<number>(0)
  const [isWaitingForPermission, setIsWaitingForPermission] = useState(false)
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<number>(0)
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0)
  const [lastSelectedDevice, setLastSelectedDevice] = useState<USBDevice | null>(null)
  const [permissionCheckCount, setPermissionCheckCount] = useState<number>(0)
  const [permissionCheckTimer, setPermissionCheckTimer] = useState<NodeJS.Timeout | null>(null)
  const [autoRetryCount, setAutoRetryCount] = useState<number>(0)
  const [isAutoRetrying, setIsAutoRetrying] = useState<boolean>(false)

  // Generate ADB keys on first load
  useEffect(() => {
    const generateKeys = async () => {
      try {
        const keys = await generateAdbKeyPair()
        setAdbKeys(keys)
        // Store public key in IndexedDB for persistence
        // This would be implemented in a real app
      } catch (error) {
        console.error("Failed to generate ADB keys:", error)
      }
    }

    if (isSupported) {
      generateKeys()
    }
  }, [isSupported])

  // Check if WebUSB is supported
  useEffect(() => {
    setIsSupported(!!navigator.usb)
  }, [])

  // Clear connection error
  const clearConnectionError = useCallback(() => {
    setErrorMessage(null)
    setErrorDetails(null)
  }, [])

  // Detect device mode based on USB descriptors with better detection logic
  const detectDeviceMode = useCallback((device: USBDevice): DeviceMode => {
    // Check device descriptors
    for (const config of device.configurations) {
      for (const iface of config.interfaces) {
        for (const alternate of iface.alternates) {
          // Check for ADB interface
          if (
            alternate.interfaceClass === ADB_CLASS &&
            alternate.interfaceSubclass === ADB_SUBCLASS &&
            alternate.interfaceProtocol === ADB_PROTOCOL
          ) {
            return "adb"
          }

          // Check for Fastboot interface
          if (
            alternate.interfaceClass === 0xff &&
            alternate.interfaceSubclass === 0x42 &&
            alternate.interfaceProtocol === 0x03
          ) {
            return "fastboot"
          }

          // Check for Recovery/Sideload
          if (
            alternate.interfaceClass === 0xff &&
            alternate.interfaceSubclass === 0x42 &&
            alternate.interfaceProtocol === 0x02
          ) {
            return "sideload"
          }
        }
      }
    }

    // Fallback detection based on device name
    const deviceName = device.productName?.toLowerCase() || ""
    if (deviceName.includes("fastboot")) return "fastboot"
    if (deviceName.includes("recovery")) return "recovery"
    if (deviceName.includes("sideload")) return "sideload"

    return "unknown"
  }, [])

  // Find interface and endpoints with better error handling
  const findInterfaceAndEndpoints = useCallback(
    (
      device: USBDevice,
      mode: DeviceMode,
    ): {
      interfaceNumber: number
      endpointIn: number
      endpointOut: number
    } | null => {
      const interfaceClass = mode === "fastboot" ? 0xff : ADB_CLASS
      const interfaceSubclass = mode === "fastboot" ? 0x42 : ADB_SUBCLASS
      const interfaceProtocol = mode === "fastboot" ? 0x03 : ADB_PROTOCOL

      for (const config of device.configurations) {
        for (const iface of config.interfaces) {
          for (const alternate of iface.alternates) {
            if (
              alternate.interfaceClass === interfaceClass &&
              alternate.interfaceSubclass === interfaceSubclass &&
              alternate.interfaceProtocol === interfaceProtocol
            ) {
              let inEndpoint = 0
              let outEndpoint = 0

              for (const endpoint of alternate.endpoints) {
                if (endpoint.direction === "in") {
                  inEndpoint = endpoint.endpointNumber
                } else {
                  outEndpoint = endpoint.endpointNumber
                }
              }

              if (inEndpoint && outEndpoint) {
                return {
                  interfaceNumber: iface.interfaceNumber,
                  endpointIn: inEndpoint,
                  endpointOut: outEndpoint,
                }
              }
            }
          }
        }
      }

      return null
    },
    [],
  )

  // Implement proper ADB authentication
  const authenticateAdb = useCallback(
    async (device: USBDevice, interfaceNumber: number, endpointIn: number, endpointOut: number): Promise<boolean> => {
      if (!adbKeys) {
        throw new Error("ADB keys not generated")
      }

      // Wait for AUTH message
      const response = await device.transferIn(endpointIn, 24 + 256) // Header + max token size

      if (!response.data) {
        throw new Error("No data received during authentication")
      }

      const view = new DataView(response.data.buffer)
      const command = view.getUint32(0, true)

      if (command !== A_AUTH) {
        throw new Error(`Expected AUTH command, got ${command.toString(16)}`)
      }

      const authType = view.getUint32(4, true)
      const tokenSize = view.getUint32(12, true)
      const token = response.data.buffer.slice(24, 24 + tokenSize)

      // Sign the token
      const signature = await signAdbToken(adbKeys.privateKey, token)

      // Send signed token
      const authMessage = createAdbMessage(A_AUTH, 2, 0, signature)
      await device.transferOut(endpointOut, authMessage)

      // Wait for CNXN message
      const cnxnResponse = await device.transferIn(endpointIn, 24 + 256)

      if (!cnxnResponse.data) {
        throw new Error("No data received after authentication")
      }

      const cnxnView = new DataView(cnxnResponse.data.buffer)
      const cnxnCommand = cnxnView.getUint32(0, true)

      return cnxnCommand === A_CNXN
    },
    [adbKeys],
  )

  // Implement proper ADB shell command execution
  const executeAdbShellCommand = useCallback(
    async (device: USBDevice, command: string, endpointIn: number, endpointOut: number): Promise<string> => {
      if (!device) throw new Error("No device connected")

      // Generate local ID for this connection
      const localId = Math.floor(Math.random() * 0xffffff)

      // Open shell stream
      const shellCommand = `shell:${command}`
      const commandBuffer = new TextEncoder().encode(shellCommand)
      const openMessage = createAdbMessage(A_OPEN, localId, 0, commandBuffer)

      await device.transferOut(endpointOut, openMessage)

      // Wait for OKAY response
      const okayResponse = await device.transferIn(endpointIn, 24)

      if (!okayResponse.data) {
        throw new Error("No response from device")
      }

      const view = new DataView(okayResponse.data.buffer)
      const responseCommand = view.getUint32(0, true)

      if (responseCommand !== A_OKAY) {
        throw new Error(`Expected OKAY response, got ${responseCommand.toString(16)}`)
      }

      const remoteId = view.getUint32(4, true)

      // Read response data
      let result = ""
      let done = false

      while (!done) {
        const dataResponse = await device.transferIn(endpointIn, 24 + 4096)

        if (!dataResponse.data) {
          break
        }

        const dataView = new DataView(dataResponse.data.buffer)
        const dataCommand = dataView.getUint32(0, true)

        if (dataCommand === A_WRTE) {
          const dataSize = dataView.getUint32(12, true)
          const data = new Uint8Array(dataResponse.data.buffer.slice(24, 24 + dataSize))
          result += new TextDecoder().decode(data)

          // Send OKAY response
          const okayMessage = createAdbMessage(A_OKAY, localId, remoteId, null)
          await device.transferOut(endpointOut, okayMessage)
        } else if (dataCommand === A_CLSE) {
          done = true
        }
      }

      // Close the connection
      const closeMessage = createAdbMessage(A_CLSE, localId, remoteId, null)
      await device.transferOut(endpointOut, closeMessage)

      return result
    },
    [],
  )

  // Implement proper Fastboot command execution
  const executeFastbootCommand = useCallback(
    async (device: USBDevice, command: string, endpointIn: number, endpointOut: number): Promise<string> => {
      if (!device) throw new Error("No device connected")

      // Send fastboot command
      const commandBuffer = new TextEncoder().encode(command)
      await device.transferOut(endpointOut, commandBuffer)

      // Read response
      let result = ""
      let done = false

      while (!done) {
        const response = await device.transferIn(endpointIn, 64)

        if (!response.data || response.data.byteLength < 4) {
          break
        }

        const responseData = new Uint8Array(response.data.buffer)
        const responseType = new TextDecoder().decode(responseData.slice(0, 4))

        if (responseType === "OKAY") {
          // Command succeeded
          done = true
        } else if (responseType === "FAIL") {
          // Command failed
          const errorMessage = new TextDecoder().decode(responseData.slice(4))
          throw new Error(`Fastboot error: ${errorMessage}`)
        } else if (responseType === "INFO") {
          // Information message
          const infoMessage = new TextDecoder().decode(responseData.slice(4))
          result += infoMessage + "\n"
        } else if (responseType === "DATA") {
          // Data to be received
          const dataSize = Number.parseInt(new TextDecoder().decode(responseData.slice(4)), 16)

          // Send acknowledgement
          await device.transferOut(endpointOut, new TextEncoder().encode("DATA"))

          // Receive data in chunks
          let receivedSize = 0
          while (receivedSize < dataSize) {
            const chunkSize = Math.min(16384, dataSize - receivedSize)
            const dataResponse = await device.transferIn(endpointIn, chunkSize)

            if (!dataResponse.data) {
              break
            }

            receivedSize += dataResponse.data.byteLength
          }

          // Send final acknowledgement
          await device.transferOut(endpointOut, new TextEncoder().encode("OKAY"))
        }
      }

      return result
    },
    [],
  )

  // Check if a device is already authorized
  const checkDeviceAuthorization = useCallback(
    async (device: USBDevice): Promise<boolean> => {
      try {
        // Try to open the device
        await device.open()

        // If we can open it without errors, it might be authorized
        // Try to claim an interface to be sure
        const mode = detectDeviceMode(device)
        const interfaceEndpoints = findInterfaceAndEndpoints(device, mode)

        if (interfaceEndpoints) {
          try {
            await device.claimInterface(interfaceEndpoints.interfaceNumber)
            // If we got here, the device is authorized
            await device.releaseInterface(interfaceEndpoints.interfaceNumber)
            await device.close()
            return true
          } catch (error) {
            // If we can't claim the interface, it might be in use or not authorized
            await device.close()
            return false
          }
        }

        await device.close()
        return false
      } catch (error) {
        // If we can't open the device, it's not authorized
        console.log("Device authorization check failed:", error)
        return false
      }
    },
    [detectDeviceMode, findInterfaceAndEndpoints],
  )

  // Get connection diagnostics
  const getConnectionDiagnostics = useCallback(async (): Promise<ConnectionDiagnostics> => {
    const diagnostics: ConnectionDiagnostics = {
      webUsbSupported: !!navigator.usb,
      secureContext: window.isSecureContext === true,
      permissionsPolicyBlocked: false,
      usbDevicesAccessible: false,
      previousDevicesFound: 0,
      androidDeviceFound: false,
      permissionGranted: false,
      connectionEstablished: connectionState === "connected",
      lastError: errorMessage,
      browserInfo: `${navigator.userAgent}`,
      suggestedFixes: [],
    }

    // Check if we can access USB devices
    try {
      const devices = await navigator.usb.getDevices()
      diagnostics.usbDevicesAccessible = true
      diagnostics.previousDevicesFound = devices.length

      // Check if any of the devices are Android devices
      const androidDevice = devices.find((device) =>
        // Check for common Android vendor IDs
        [0x18d1, 0x04e8, 0x22b8, 0x0bb4, 0x12d1, 0x2717, 0x0e8d, 0x2a70, 0x05c6, 0x1ebf, 0x2b4c, 0x0421].includes(
          device.vendorId,
        ),
      )

      if (androidDevice) {
        diagnostics.androidDeviceFound = true

        // Check if we have permission
        try {
          const isAuthorized = await checkDeviceAuthorization(androidDevice)
          diagnostics.permissionGranted = isAuthorized
        } catch (error) {
          // Permission not granted
          diagnostics.permissionGranted = false
        }
      }
    } catch (error) {
      diagnostics.usbDevicesAccessible = false

      // Check specifically for permissions policy errors
      if (
        error instanceof DOMException &&
        (error.message.includes("permissions policy") ||
          error.message.includes("Access to the feature") ||
          error.message.includes("disallowed by permissions"))
      ) {
        diagnostics.permissionsPolicyBlocked = true
        diagnostics.suggestedFixes.push(
          "This application needs to be deployed to a secure HTTPS environment to use WebUSB",
        )
      }
    }

    // Add suggested fixes based on diagnostics
    if (!diagnostics.webUsbSupported) {
      diagnostics.suggestedFixes.push("Use a browser that supports WebUSB, such as Chrome, Edge, or Opera")
    }

    if (!diagnostics.secureContext) {
      diagnostics.suggestedFixes.push("Access this application via HTTPS instead of HTTP")
    }

    if (diagnostics.usbDevicesAccessible && !diagnostics.androidDeviceFound) {
      diagnostics.suggestedFixes.push(
        "Connect your Android device via USB and make sure USB debugging is enabled",
        "Try a different USB cable or port",
      )
    }

    if (diagnostics.androidDeviceFound && !diagnostics.permissionGranted) {
      diagnostics.suggestedFixes.push(
        "Check your Android device for a USB debugging permission prompt",
        "Go to Developer Options and revoke USB debugging authorizations, then try again",
        "Make sure your device is unlocked when connecting",
      )
    }

    if (errorMessage?.includes("timeout")) {
      diagnostics.suggestedFixes.push(
        "Your device may be taking too long to respond. Try disconnecting and reconnecting",
        "Check if your USB cable is working properly",
      )
    }

    return diagnostics
  }, [checkDeviceAuthorization, connectionState, errorMessage])

  // Enhanced connection method with better error handling and retry logic
  const connect = useCallback(async () => {
    if (!navigator.usb) {
      throw new Error("WebUSB is not supported in this browser")
    }

    setConnectionState("connecting")
    setErrorMessage(null)
    setErrorDetails(null)
    setIsWaitingForPermission(false)
    setConnectionAttempts((prev) => prev + 1)
    setLastConnectionAttempt(Date.now())
    setPermissionCheckCount(0)
    setAutoRetryCount(0)
    setIsAutoRetrying(false)

    try {
      // Check if we're in a secure context
      if (window.isSecureContext === false) {
        throw new Error("WebUSB requires a secure context (HTTPS). Please use HTTPS to access this page.")
      }

      // Try to access the USB API to check for permissions policy restrictions
      try {
        // Check if we can access the getDevices method
        await navigator.usb.getDevices()
      } catch (error) {
        // Check specifically for permissions policy errors
        if (
          error instanceof DOMException &&
          (error.message.includes("permissions policy") ||
            error.message.includes("Access to the feature") ||
            error.message.includes("disallowed by permissions"))
        ) {
          throw new Error(
            "USB access is blocked by permissions policy. This may be due to preview mode restrictions or Content-Security-Policy settings.",
          )
        }
      }

      // First, check if we have any previously authorized devices
      const previousDevices = await navigator.usb.getDevices()

      // If we have previously authorized devices, try to use them first
      if (previousDevices.length > 0) {
        for (const prevDevice of previousDevices) {
          try {
            const isAuthorized = await checkDeviceAuthorization(prevDevice)

            if (isAuthorized) {
              // Use this already authorized device
              await connectToDevice(prevDevice)
              return
            }
          } catch (error) {
            console.log("Error checking previously authorized device:", error)
            // Continue to the next device or request a new one
          }
        }
      }

      // Request a device with comprehensive filters
      try {
        setIsWaitingForPermission(true)

        const selectedDevice = await navigator.usb.requestDevice({
          filters: [
            // ADB filter
            { classCode: ADB_CLASS, subclassCode: ADB_SUBCLASS, protocolCode: ADB_PROTOCOL },
            // Fastboot filter
            { classCode: 0xff, subclassCode: 0x42, protocolCode: 0x03 },
            // Recovery/Sideload filter
            { classCode: 0xff, subclassCode: 0x42, protocolCode: 0x02 },
            // Generic Android filter (some devices don't properly implement the class codes)
            { vendorId: 0x18d1 }, // Google
            { vendorId: 0x04e8 }, // Samsung
            { vendorId: 0x22b8 }, // Motorola
            { vendorId: 0x0bb4 }, // HTC
            { vendorId: 0x12d1 }, // Huawei
            { vendorId: 0x2717 }, // Xiaomi
            { vendorId: 0x0e8d }, // MediaTek
            { vendorId: 0x2a70 }, // OnePlus
            { vendorId: 0x05c6 }, // Qualcomm
            { vendorId: 0x1ebf }, // Realme
            { vendorId: 0x2b4c }, // Vivo
            { vendorId: 0x0421 }, // Nokia
          ],
        })

        setIsWaitingForPermission(false)
        setLastSelectedDevice(selectedDevice)

        // Connect to the selected device
        await connectToDevice(selectedDevice)
      } catch (error) {
        setIsWaitingForPermission(false)

        // Check specifically for permissions policy errors
        if (
          error instanceof DOMException &&
          (error.message.includes("permissions policy") || error.message.includes("Access to the feature"))
        ) {
          throw new Error(
            "USB access is blocked by permissions policy. This may be due to preview mode restrictions or Content-Security-Policy settings.",
          )
        }

        // Check for user cancellation
        if (error instanceof DOMException && error.name === "NotFoundError") {
          throw new Error("No device selected. Please try again and select your device from the list.")
        }

        throw error
      }
    } catch (error) {
      console.error("Error connecting to device:", error)

      // Determine the appropriate connection state based on the error
      if (
        error instanceof Error &&
        (error.message.includes("permission was denied") ||
          error.message.includes("Access denied") ||
          error.message.includes("permission prompt"))
      ) {
        setConnectionState("permission_denied")
      } else if (error instanceof Error && error.message.includes("timeout")) {
        setConnectionState("timeout")
      } else if ((error instanceof Error && error.message.includes("disconnected")) || error.message.includes("lost")) {
        setConnectionState("connection_lost")
      } else {
        setConnectionState("error")
      }

      // Provide more specific error messages based on the error type
      if (error instanceof Error && error.message.includes("permissions policy")) {
        setErrorMessage(
          "USB access is blocked by permissions policy. This feature requires a deployed HTTPS environment and may not work in preview mode.",
        )
        setErrorDetails(
          "This is typically caused by running the application in a preview environment or when Content-Security-Policy restrictions are in place. Deploy to a proper HTTPS environment to resolve this issue.",
        )
      } else if (error instanceof DOMException && error.name === "SecurityError") {
        // This is likely a permission issue, but not necessarily a denial
        setErrorMessage("USB security error. Please make sure USB debugging is enabled on your device and try again.")
        setErrorDetails(
          "This error occurs when the browser cannot access the USB device due to security restrictions. Make sure USB debugging is enabled in Developer Options and check for permission prompts on your device.",
        )
      } else if (error instanceof DOMException && error.message.includes("No device selected")) {
        setErrorMessage("No device selected. Please try again and select your device from the list.")
        setErrorDetails(
          "You need to select your Android device from the browser's device selection dialog. If your device doesn't appear, make sure USB debugging is enabled and the device is properly connected.",
        )
      } else if (error instanceof DOMException && error.message.includes("Device unavailable")) {
        setErrorMessage("Device unavailable. Please disconnect and reconnect your device, then try again.")
        setErrorDetails(
          "The device was detected but is not responding. This could be due to a bad USB connection, the device being in an incompatible state, or the device being locked.",
        )
      } else if (error instanceof DOMException && error.message.includes("Transfer failed")) {
        setErrorMessage("USB transfer failed. Please check your USB connection and try again.")
        setErrorDetails(
          "Data transfer to or from the device failed. This could be due to a faulty USB cable, interference from other USB devices, or the device being disconnected during transfer.",
        )
      } else if (error instanceof Error && error.message.includes("Access denied")) {
        // This is a specific case where the device was found but permission was denied
        setErrorMessage(
          "USB device found but permission was denied. Please reconnect your device and accept the permission prompt on your Android device.",
        )
        setErrorDetails(
          "Your Android device showed a permission prompt that was denied or timed out. Reconnect your device, make sure it's unlocked, and look for the USB debugging permission dialog.",
        )
      } else if (error instanceof Error && error.message.includes("timeout")) {
        setErrorMessage("Connection timed out. The device took too long to respond.")
        setErrorDetails(
          "This could be due to a slow device, interference from security software, or the device being in a state that prevents it from responding quickly. Try disconnecting and reconnecting your device.",
        )
      } else {
        setErrorMessage(error instanceof Error ? error.message : "Unknown error connecting to device")
        setErrorDetails(
          "An unexpected error occurred during the connection process. Check the console for more detailed error information.",
        )
      }

      // Implement automatic retry for certain types of errors
      if (
        autoRetryCount < MAX_CONNECTION_RETRIES &&
        error instanceof Error &&
        (error.message.includes("timeout") ||
          error.message.includes("Transfer failed") ||
          error.message.includes("Device unavailable"))
      ) {
        setIsAutoRetrying(true)
        setAutoRetryCount((prev) => prev + 1)

        // Exponential backoff for retries
        const retryDelay = 1000 * Math.pow(2, autoRetryCount)
        console.log(
          `Automatically retrying connection in ${retryDelay / 1000} seconds (attempt ${autoRetryCount + 1}/${MAX_CONNECTION_RETRIES})`,
        )

        setTimeout(() => {
          if (lastSelectedDevice) {
            connectToDevice(lastSelectedDevice).catch((e) => {
              console.error("Auto-retry failed:", e)
              setIsAutoRetrying(false)
            })
          } else {
            connect().catch((e) => {
              console.error("Auto-retry failed:", e)
              setIsAutoRetrying(false)
            })
          }
        }, retryDelay)
      }

      throw error
    }
  }, [
    detectDeviceMode,
    findInterfaceAndEndpoints,
    executeAdbShellCommand,
    executeFastbootCommand,
    authenticateAdb,
    checkDeviceAuthorization,
    autoRetryCount,
  ])

  // Helper function to connect to a specific device
  const connectToDevice = useCallback(
    async (selectedDevice: USBDevice) => {
      try {
        // Open device with timeout
        const openPromise = selectedDevice.open()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), CONNECTION_TIMEOUT),
        )

        await Promise.race([openPromise, timeoutPromise])

        // Select configuration
        await selectedDevice.selectConfiguration(1)

        // Detect device mode
        const mode = detectDeviceMode(selectedDevice)
        setDeviceMode(mode)

        // Find interface and endpoints
        const interfaceEndpoints = findInterfaceAndEndpoints(selectedDevice, mode)

        if (!interfaceEndpoints) {
          throw new Error(`Could not find ${mode} interface`)
        }

        const { interfaceNumber, endpointIn, endpointOut } = interfaceEndpoints

        // Store interface and endpoints
        setInterfaceNumber(interfaceNumber)
        setEndpointIn(endpointIn)
        setEndpointOut(endpointOut)

        // Claim interface
        try {
          await selectedDevice.claimInterface(interfaceNumber)
        } catch (error) {
          console.error("Error claiming interface:", error)

          // Try to reset the device and claim again
          try {
            await selectedDevice.reset()
            await new Promise((resolve) => setTimeout(resolve, 1000))
            await selectedDevice.claimInterface(interfaceNumber)
          } catch (resetError) {
            // Check if this is a permission issue
            if (resetError instanceof DOMException && resetError.name === "SecurityError") {
              throw new Error("USB permission required. Please accept the permission prompt on your Android device.")
            }

            throw new Error("Failed to claim interface. Device may be in use by another application.")
          }
        }

        // Initialize based on mode
        if (mode === "adb") {
          // Send ADB connection message
          const hostName = "web-adb-client"
          const hostNameBuffer = new TextEncoder().encode(hostName + "\0")
          const connectMessage = createAdbMessage(A_CNXN, ADB_VERSION_NO_CHECKSUM, 0x1000000, hostNameBuffer)

          await selectedDevice.transferOut(endpointOut, connectMessage)

          // Wait for response with timeout
          const responsePromise = selectedDevice.transferIn(endpointIn, 24 + 256)
          const responseTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Response timeout")), CONNECTION_TIMEOUT),
          )

          const response = await Promise.race([responsePromise, responseTimeoutPromise])

          if (!response.data) {
            throw new Error("No response from device")
          }

          const view = new DataView(response.data.buffer)
          const command = view.getUint32(0, true)

          if (command === A_CNXN) {
            // Connected successfully
            setConnectionState("connected")
            setDevice(selectedDevice)
            setIsAutoRetrying(false)

            // Get device info
            const deviceInfoData = await executeAdbShellCommand(selectedDevice, "getprop", endpointIn, endpointOut)

            // Parse device properties
            const properties = deviceInfoData.split("\n").reduce(
              (acc, line) => {
                const match = line.match(/\[(.*?)\]: \[(.*?)\]/)
                if (match) {
                  acc[match[1]] = match[2]
                }
                return acc
              },
              {} as Record<string, string>,
            )

            const info: DeviceInfo = {
              serial: selectedDevice.serialNumber || properties["ro.serialno"] || "Unknown",
              model: properties["ro.product.model"] || "Unknown",
              androidVersion: properties["ro.build.version.release"] || "Unknown",
              mode: "adb",
              product: properties["ro.product.name"] || "Unknown",
              cpuArch: properties["ro.product.cpu.abi"] || "Unknown",
              kernelVersion: properties["ro.kernel.version"] || "Unknown",
              buildFingerprint: properties["ro.build.fingerprint"] || "Unknown",
            }

            // Get battery level
            try {
              const batteryInfo = await executeAdbShellCommand(
                selectedDevice,
                "dumpsys battery",
                endpointIn,
                endpointOut,
              )

              const levelMatch = batteryInfo.match(/level: (\d+)/)
              if (levelMatch) {
                info.batteryLevel = Number.parseInt(levelMatch[1])
              }
            } catch (error) {
              console.warn("Could not get battery info:", error)
            }

            setDeviceInfo(info)
            return
          } else if (command === A_AUTH) {
            // Authentication required
            setConnectionState("authenticating")

            const authenticated = await authenticateAdb(selectedDevice, interfaceNumber, endpointIn, endpointOut)

            if (authenticated) {
              setConnectionState("connected")
              setDevice(selectedDevice)
              setIsAutoRetrying(false)

              // Get device info (same as above)
              // This would be duplicated in a real implementation
              const info: DeviceInfo = {
                serial: selectedDevice.serialNumber || "Unknown",
                mode: "adb",
              }

              setDeviceInfo(info)
              return
            } else {
              throw new Error("Authentication failed")
            }
          } else {
            throw new Error(`Unexpected response: ${command.toString(16)}`)
          }
        } else if (mode === "fastboot") {
          // Send fastboot getvar command to get device info
          const result = await executeFastbootCommand(selectedDevice, "getvar:all", endpointIn, endpointOut)

          // Parse fastboot variables
          const variables = result.split("\n").reduce(
            (acc, line) => {
              const match = line.match(/(.*?): (.*)/)
              if (match) {
                acc[match[1]] = match[2]
              }
              return acc
            },
            {} as Record<string, string>,
          )

          const info: DeviceInfo = {
            serial: selectedDevice.serialNumber || "Unknown",
            mode: "fastboot",
            product: variables["product"] || "Unknown",
            variant: variables["variant"] || "Unknown",
            bootloader: variables["bootloader"] || "Unknown",
            secure: variables["secure"] === "yes",
            unlocked: variables["unlocked"] === "yes",
          }

          setConnectionState("connected")
          setDevice(selectedDevice)
          setDeviceInfo(info)
          setIsAutoRetrying(false)
          return
        } else if (mode === "recovery" || mode === "sideload") {
          // Recovery mode connection
          setConnectionState("connected")
          setDevice(selectedDevice)
          setDeviceInfo({
            serial: selectedDevice.serialNumber || "Unknown",
            mode: mode,
          })
          setIsAutoRetrying(false)
          return
        }

        throw new Error("Unsupported device mode")
      } catch (error) {
        // Check for permission issues
        if (error instanceof DOMException && error.name === "SecurityError") {
          setConnectionState("waiting_permission")
          setIsWaitingForPermission(true)

          // Start permission check timer
          startPermissionCheckTimer(selectedDevice)

          throw new Error("USB permission required. Please check your Android device for a permission prompt.")
        }

        throw error
      }
    },
    [detectDeviceMode, findInterfaceAndEndpoints, executeAdbShellCommand, executeFastbootCommand, authenticateAdb],
  )

  // Start permission check timer
  const startPermissionCheckTimer = useCallback(
    (selectedDevice: USBDevice) => {
      // Clear any existing timer
      if (permissionCheckTimer) {
        clearTimeout(permissionCheckTimer)
      }

      // Set a new timer to check for permission status
      const timer = setTimeout(async () => {
        // Increment the check count
        setPermissionCheckCount((prev) => prev + 1)

        if (permissionCheckCount < MAX_PERMISSION_CHECKS) {
          try {
            // Try to check if the device is now authorized
            const isAuthorized = await checkDeviceAuthorization(selectedDevice)

            if (isAuthorized) {
              // Device is now authorized, try to connect
              setIsWaitingForPermission(false)
              await connectToDevice(selectedDevice)
            } else {
              // Still waiting for permission, start another timer
              startPermissionCheckTimer(selectedDevice)
            }
          } catch (error) {
            console.error("Error checking device authorization:", error)
            // Start another timer
            startPermissionCheckTimer(selectedDevice)
          }
        } else {
          // Max checks reached, give up
          setIsWaitingForPermission(false)
          setConnectionState("permission_denied")
          setErrorMessage("USB debugging permission not granted. Please try connecting again.")
          setErrorDetails(
            "The permission prompt on your Android device may have been dismissed or denied. Disconnect and reconnect your device, then try again.",
          )
        }
      }, PERMISSION_CHECK_INTERVAL)

      setPermissionCheckTimer(timer)
    },
    [permissionCheckCount, permissionCheckTimer, checkDeviceAuthorization, connectToDevice],
  )

  // Retry connection with the last selected device
  const retryConnection = useCallback(async () => {
    if (lastSelectedDevice) {
      try {
        setConnectionState("connecting")
        setErrorMessage(null)
        setErrorDetails(null)
        setIsWaitingForPermission(true)
        setPermissionCheckCount(0)

        await connectToDevice(lastSelectedDevice)
        setIsWaitingForPermission(false)
      } catch (error) {
        setIsWaitingForPermission(false)

        if (error instanceof Error && error.message.includes("permission")) {
          setConnectionState("waiting_permission")
          setIsWaitingForPermission(true)
        } else {
          setConnectionState("error")
          setErrorMessage(error instanceof Error ? error.message : "Unknown error during retry connection")
          setErrorDetails(
            "The retry attempt failed. Try disconnecting and reconnecting your device, or use a different USB cable or port.",
          )
        }

        throw error
      }
    } else {
      // No previous device, try a fresh connection
      await connect()
    }
  }, [lastSelectedDevice, connect, connectToDevice])

  // Reset connection state
  const resetConnection = useCallback(async () => {
    if (device) {
      try {
        await device.reset()
        console.log("Device reset successful")
        return true
      } catch (error) {
        console.error("Error resetting device:", error)
        throw error
      }
    }
    return false
  }, [device])

  // Disconnect from device with proper cleanup
  const disconnect = useCallback(async () => {
    if (device) {
      try {
        // Clear any permission check timer
        if (permissionCheckTimer) {
          clearTimeout(permissionCheckTimer)
          setPermissionCheckTimer(null)
        }

        // Send proper close messages based on mode
        if (deviceMode === "adb" && endpointOut) {
          // Close all open connections
          const closeMessage = createAdbMessage(A_CLSE, 0, 0, null)
          await device.transferOut(endpointOut, closeMessage)
        }

        // Release interface
        if (interfaceNumber !== undefined) {
          await device.releaseInterface(interfaceNumber)
        }

        // Close device
        await device.close()
      } catch (error) {
        console.error("Error disconnecting device:", error)
      }

      // Reset state
      setDevice(null)
      setDeviceInfo(null)
      setDeviceMode("unknown")
      setConnectionState("disconnected")
      setErrorMessage(null)
      setErrorDetails(null)
      setInterfaceNumber(0)
      setEndpointIn(0)
      setEndpointOut(0)
      setLocalId(0)
      setRemoteId(0)
      setIsWaitingForPermission(false)
      setIsAutoRetrying(false)
    }
  }, [device, deviceMode, endpointOut, interfaceNumber, permissionCheckTimer])

  // Execute command based on device mode
  const executeCommand = useCallback(
    async (command: string): Promise<string> => {
      if (!device || !endpointIn || !endpointOut) {
        throw new Error("No device connected")
      }

      // Set command timeout
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Command execution timeout")), COMMAND_TIMEOUT),
      )

      try {
        if (deviceMode === "adb") {
          // Handle special ADB commands
          if (command === "devices") {
            return `List of devices attached\n${device.serialNumber || "unknown"}\tdevice`
          } else if (command.startsWith("shell ")) {
            // Execute shell command
            const shellCommand = command.substring(6)
            const executePromise = executeAdbShellCommand(device, shellCommand, endpointIn, endpointOut)
            return await Promise.race([executePromise, timeoutPromise])
          } else if (command === "reboot") {
            await executeAdbShellCommand(device, "reboot", endpointIn, endpointOut)
            return "Rebooting device..."
          } else if (command === "reboot bootloader") {
            await executeAdbShellCommand(device, "reboot bootloader", endpointIn, endpointOut)
            return "Rebooting to bootloader..."
          } else if (command === "reboot recovery") {
            await executeAdbShellCommand(device, "reboot recovery", endpointIn, endpointOut)
            return "Rebooting to recovery..."
          } else if (command === "reboot sideload") {
            await executeAdbShellCommand(device, "reboot sideload", endpointIn, endpointOut)
            return "Rebooting to sideload mode..."
          } else if (command === "reboot sideload-auto-reboot") {
            await executeAdbShellCommand(device, "reboot sideload-auto-reboot", endpointIn, endpointOut)
            return "Rebooting to sideload mode with auto-reboot..."
          } else {
            throw new Error(`Unsupported ADB command: ${command}`)
          }
        } else if (deviceMode === "fastboot") {
          // Execute fastboot command
          const executePromise = executeFastbootCommand(device, command, endpointIn, endpointOut)
          return await Promise.race([executePromise, timeoutPromise])
        } else if (deviceMode === "recovery" || deviceMode === "sideload") {
          // Execute recovery/sideload command
          // This would be implemented similarly to ADB or Fastboot
          return `Recovery/Sideload command: ${command}\nThis mode is not fully implemented in the demo.`
        }

        throw new Error(`Unsupported device mode: ${deviceMode}`)
      } catch (error) {
        console.error(`Error executing command "${command}":`, error)
        throw error
      }
    },
    [device, deviceMode, endpointIn, endpointOut, executeAdbShellCommand, executeFastbootCommand],
  )

  // Implement file transfer functionality
  const pushFile = useCallback(
    async (localPath: string, remotePath: string): Promise<void> => {
      if (!device || deviceMode !== "adb" || !endpointIn || !endpointOut) {
        throw new Error("Device not connected in ADB mode")
      }

      // This would be implemented in a real application
      // It would involve reading the local file, opening a sync connection,
      // and sending the file data in chunks

      throw new Error("File transfer not implemented in this demo")
    },
    [device, deviceMode, endpointIn, endpointOut],
  )

  const pullFile = useCallback(
    async (remotePath: string): Promise<ArrayBuffer> => {
      if (!device || deviceMode !== "adb" || !endpointIn || !endpointOut) {
        throw new Error("Device not connected in ADB mode")
      }

      // This would be implemented in a real application
      // It would involve opening a sync connection, requesting the file,
      // and receiving the data in chunks

      throw new Error("File transfer not implemented in this demo")
    },
    [device, deviceMode, endpointIn, endpointOut],
  )

  // Implement firmware flashing
  const flashPartition = useCallback(
    async (partition: string, image: ArrayBuffer): Promise<string> => {
      if (!device || deviceMode !== "fastboot" || !endpointIn || !endpointOut) {
        throw new Error("Device not connected in fastboot mode")
      }

      // Set flash timeout
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Flash operation timeout")), FLASH_TIMEOUT),
      )

      try {
        // Send flash command
        await executeFastbootCommand(device, `flash:${partition}`, endpointIn, endpointOut)

        // Send data size
        const sizeCommand = `download:${image.byteLength.toString(16)}`
        await executeFastbootCommand(device, sizeCommand, endpointIn, endpointOut)

        // Send data in chunks
        const chunkSize = 1024 * 1024 // 1MB chunks
        for (let i = 0; i < image.byteLength; i += chunkSize) {
          const chunk = image.slice(i, Math.min(i + chunkSize, image.byteLength))
          await device.transferOut(endpointOut, chunk)
        }

        // Get result
        const flashPromise = executeFastbootCommand(device, "", endpointIn, endpointOut)
        const result = await Promise.race([flashPromise, timeoutPromise])

        return `Flashed ${partition} successfully: ${result}`
      } catch (error) {
        console.error(`Error flashing ${partition}:`, error)
        throw error
      }
    },
    [device, deviceMode, endpointIn, endpointOut, executeFastbootCommand],
  )

  // Implement reboot functionality
  const rebootTo = useCallback(
    async (target: "system" | "bootloader" | "recovery" | "fastboot" | "sideload"): Promise<void> => {
      if (!device || !endpointIn || !endpointOut) {
        throw new Error("No device connected")
      }

      try {
        if (deviceMode === "adb") {
          // ADB reboot commands
          switch (target) {
            case "system":
              await executeAdbShellCommand(device, "reboot", endpointIn, endpointOut)
              break
            case "bootloader":
            case "fastboot":
              await executeAdbShellCommand(device, "reboot bootloader", endpointIn, endpointOut)
              break
            case "recovery":
              await executeAdbShellCommand(device, "reboot recovery", endpointIn, endpointOut)
              break
            case "sideload":
              await executeAdbShellCommand(device, "reboot sideload", endpointIn, endpointOut)
              break
            default:
              throw new Error(`Unsupported reboot target: ${target}`)
          }
        } else if (deviceMode === "fastboot") {
          // Fastboot reboot commands
          switch (target) {
            case "system":
              await executeFastbootCommand(device, "reboot", endpointIn, endpointOut)
              break
            case "bootloader":
            case "fastboot":
              await executeFastbootCommand(device, "reboot-bootloader", endpointIn, endpointOut)
              break
            case "recovery":
              await executeFastbootCommand(device, "reboot-recovery", endpointIn, endpointOut)
              break
            default:
              throw new Error(`Unsupported fastboot reboot target: ${target}`)
          }
        } else if (deviceMode === "recovery") {
          // Recovery reboot commands
          // This would be implemented in a real application
          throw new Error("Recovery reboot not implemented in this demo")
        }

        // Disconnect after reboot
        await disconnect()
      } catch (error) {
        console.error(`Error rebooting to ${target}:`, error)
        throw error
      }
    },
    [device, deviceMode, endpointIn, endpointOut, executeAdbShellCommand, executeFastbootCommand, disconnect],
  )

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear any permission check timer
      if (permissionCheckTimer) {
        clearTimeout(permissionCheckTimer)
      }

      if (device) {
        // First try to release the interface if it's claimed
        if (interfaceNumber !== undefined) {
          try {
            device.releaseInterface(interfaceNumber).catch(console.error)
          } catch (error) {
            console.error("Error releasing interface:", error)
          }
        }

        // Then close the device
        device.close().catch(console.error)
      }
    }
  }, [device, interfaceNumber, permissionCheckTimer])

  const value = {
    device,
    deviceInfo,
    connect,
    disconnect,
    executeCommand,
    isSupported,
    deviceMode,
    connectionState,
    errorMessage,
    errorDetails,
    pushFile,
    pullFile,
    flashPartition,
    rebootTo,
    resetConnection,
    retryConnection,
    isWaitingForPermission,
    connectionAttempts,
    lastConnectionAttempt,
    clearConnectionError,
    getConnectionDiagnostics,
  }

  return <DeviceConnectionContext.Provider value={value}>{children}</DeviceConnectionContext.Provider>
}

export function useDeviceConnection() {
  const context = useContext(DeviceConnectionContext)
  if (context === undefined) {
    throw new Error("useDeviceConnection must be used within a DeviceConnectionProvider")
  }
  return context
}

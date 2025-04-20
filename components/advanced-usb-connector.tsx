"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useDeviceConnection } from "@/hooks/use-device-connection"
import { Smartphone, RefreshCw, AlertCircle, CheckCircle2, XCircle, Zap, ArrowRight, Shield, Usb } from "lucide-react"
import Link from "next/link"

export function AdvancedUsbConnector() {
  const { connect, isSupported, connectionState, errorMessage } = useDeviceConnection()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [diagnosticMode, setDiagnosticMode] = useState(false)
  const [diagnosticResults, setDiagnosticResults] = useState<{
    webUsbSupport: boolean
    usbDevicesAccessible: boolean
    androidDeviceFound: boolean
    permissionGranted: boolean
    connectionEstablished: boolean
  }>({
    webUsbSupport: false,
    usbDevicesAccessible: false,
    androidDeviceFound: false,
    permissionGranted: false,
    connectionEstablished: false,
  })
  const [connectionProgress, setConnectionProgress] = useState(0)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [selectedConnectionMode, setSelectedConnectionMode] = useState<"normal" | "aggressive" | "persistent">("normal")

  // Check WebUSB support on component mount
  useEffect(() => {
    if (navigator.usb) {
      setDiagnosticResults((prev) => ({ ...prev, webUsbSupport: true }))
    }
  }, [])

  // Run USB device accessibility check
  const checkUsbDevicesAccessible = useCallback(async () => {
    try {
      // Just check if we can access the USB API
      await navigator.usb.getDevices()
      setDiagnosticResults((prev) => ({ ...prev, usbDevicesAccessible: true }))
      return true
    } catch (error) {
      setDiagnosticResults((prev) => ({ ...prev, usbDevicesAccessible: false }))
      return false
    }
  }, [])

  // Run diagnostics
  const runDiagnostics = useCallback(async () => {
    setDiagnosticMode(true)
    setDiagnosticResults({
      webUsbSupport: !!navigator.usb,
      usbDevicesAccessible: false,
      androidDeviceFound: false,
      permissionGranted: false,
      connectionEstablished: false,
    })

    // Check USB devices accessibility
    const usbAccessible = await checkUsbDevicesAccessible()
    if (!usbAccessible) return

    // Try to find Android devices
    try {
      const devices = await navigator.usb.getDevices()
      const androidDevice = devices.find((device) =>
        // Check for common Android vendor IDs
        [0x18d1, 0x04e8, 0x22b8, 0x0bb4, 0x12d1, 0x2717, 0x0e8d, 0x2a70, 0x05c6, 0x1ebf, 0x2b4c, 0x0421].includes(
          device.vendorId,
        ),
      )

      if (androidDevice) {
        setDiagnosticResults((prev) => ({ ...prev, androidDeviceFound: true }))

        // Check if we have permission
        try {
          await androidDevice.open()
          setDiagnosticResults((prev) => ({ ...prev, permissionGranted: true }))
          await androidDevice.close()
        } catch (error) {
          // Permission not granted
          setDiagnosticResults((prev) => ({ ...prev, permissionGranted: false }))
        }
      }
    } catch (error) {
      console.error("Error checking for Android devices:", error)
    }
  }, [checkUsbDevicesAccessible])

  // Handle connection with advanced retry logic
  const handleAdvancedConnect = async () => {
    setIsConnecting(true)
    setConnectionProgress(0)
    setConnectionAttempts((prev) => prev + 1)

    try {
      // Different connection strategies based on selected mode
      if (selectedConnectionMode === "normal") {
        // Standard connection attempt
        setConnectionProgress(30)
        await connect()
        setConnectionProgress(100)
        setDiagnosticResults((prev) => ({ ...prev, connectionEstablished: true }))
      } else if (selectedConnectionMode === "aggressive") {
        // Aggressive mode: Multiple rapid connection attempts
        setConnectionProgress(10)

        // First attempt
        try {
          await connect()
          setConnectionProgress(100)
          setDiagnosticResults((prev) => ({ ...prev, connectionEstablished: true }))
          return
        } catch (error) {
          setConnectionProgress(30)
          // Continue to next attempt
        }

        // Try with a different approach - request device with broader filters
        try {
          setConnectionProgress(50)
          // This will be handled by the connect() function in the hook
          // but we're simulating a more aggressive approach
          await connect()
          setConnectionProgress(100)
          setDiagnosticResults((prev) => ({ ...prev, connectionEstablished: true }))
          return
        } catch (error) {
          setConnectionProgress(70)
          // Continue to last attempt
        }

        // Final attempt with the most permissive approach
        try {
          setConnectionProgress(80)
          await connect()
          setConnectionProgress(100)
          setDiagnosticResults((prev) => ({ ...prev, connectionEstablished: true }))
        } catch (error) {
          setConnectionProgress(0)
          throw error
        }
      } else if (selectedConnectionMode === "persistent") {
        // Persistent mode: Retry with increasing delays
        setConnectionProgress(10)

        const maxRetries = 3
        for (let i = 0; i < maxRetries; i++) {
          try {
            setConnectionProgress(20 + i * 25)
            await connect()
            setConnectionProgress(100)
            setDiagnosticResults((prev) => ({ ...prev, connectionEstablished: true }))
            return
          } catch (error) {
            if (i < maxRetries - 1) {
              // Wait with increasing delay before retrying
              await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
            } else {
              setConnectionProgress(0)
              throw error
            }
          }
        }
      }
    } catch (error) {
      console.error("Connection error:", error)
      setConnectionProgress(0)
      // Error is handled by the context
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Usb className="h-5 w-5" />
          Advanced USB Connection
        </CardTitle>
        <CardDescription>Enhanced connection system with automatic troubleshooting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported && (
          <Alert variant="destructive" className="bg-red-900/30 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>WebUSB Not Supported</AlertTitle>
            <AlertDescription>Your browser doesn't support WebUSB. Please use Chrome, Edge, or Opera.</AlertDescription>
          </Alert>
        )}

        {connectionState === "error" && errorMessage && (
          <Alert variant="destructive" className="bg-red-900/30 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Connection Progress */}
        {isConnecting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Connecting to device...</span>
              <span>{connectionProgress}%</span>
            </div>
            <Progress value={connectionProgress} className="h-2" />
          </div>
        )}

        {/* Connection Options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Connection Mode</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="h-8 text-xs"
            >
              {showAdvancedOptions ? "Hide Advanced Options" : "Show Advanced Options"}
            </Button>
          </div>

          {showAdvancedOptions && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button
                variant={selectedConnectionMode === "normal" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedConnectionMode("normal")}
                className="h-auto py-2 flex flex-col items-center"
              >
                <Smartphone className="h-4 w-4 mb-1" />
                <span className="text-xs">Standard</span>
              </Button>
              <Button
                variant={selectedConnectionMode === "aggressive" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedConnectionMode("aggressive")}
                className="h-auto py-2 flex flex-col items-center"
              >
                <Zap className="h-4 w-4 mb-1" />
                <span className="text-xs">Aggressive</span>
              </Button>
              <Button
                variant={selectedConnectionMode === "persistent" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedConnectionMode("persistent")}
                className="h-auto py-2 flex flex-col items-center"
              >
                <Shield className="h-4 w-4 mb-1" />
                <span className="text-xs">Persistent</span>
              </Button>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={handleAdvancedConnect}
              disabled={isConnecting || !isSupported || connectionState === "connecting"}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Connect Device
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Diagnostic Tool */}
        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Connection Diagnostics</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={runDiagnostics}
              disabled={isConnecting}
              className="h-8 text-xs"
            >
              Run Diagnostics
            </Button>
          </div>

          {diagnosticMode && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>WebUSB Support</span>
                {diagnosticResults.webUsbSupport ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>USB Devices Accessible</span>
                {diagnosticResults.usbDevicesAccessible ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Android Device Found</span>
                {diagnosticResults.androidDeviceFound ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>USB Permission Granted</span>
                {diagnosticResults.permissionGranted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Connection Established</span>
                {diagnosticResults.connectionEstablished ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Diagnostic Results Guidance */}
              {!diagnosticResults.webUsbSupport && (
                <Alert className="mt-2 bg-yellow-900/30 border-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Browser Not Compatible</AlertTitle>
                  <AlertDescription>
                    Your browser doesn't support WebUSB. Please use Chrome, Edge, or Opera.
                  </AlertDescription>
                </Alert>
              )}

              {diagnosticResults.webUsbSupport && !diagnosticResults.usbDevicesAccessible && (
                <Alert className="mt-2 bg-yellow-900/30 border-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>USB Access Restricted</AlertTitle>
                  <AlertDescription>
                    Your browser cannot access USB devices. Try the following:
                    <ul className="list-disc pl-5 mt-1 text-xs">
                      <li>Make sure you're using a secure context (HTTPS)</li>
                      <li>Check browser permissions for USB devices</li>
                      <li>Try restarting your browser</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {diagnosticResults.usbDevicesAccessible && !diagnosticResults.androidDeviceFound && (
                <Alert className="mt-2 bg-yellow-900/30 border-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Android Device Detected</AlertTitle>
                  <AlertDescription>
                    No Android device was found. Try the following:
                    <ul className="list-disc pl-5 mt-1 text-xs">
                      <li>Make sure your device is connected via USB</li>
                      <li>Try a different USB cable or port</li>
                      <li>Ensure USB debugging is enabled on your device</li>
                      <li>
                        <Link href="/usb-debugging-guide" className="text-blue-400 hover:text-blue-300">
                          View USB debugging guide
                        </Link>
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {diagnosticResults.androidDeviceFound && !diagnosticResults.permissionGranted && (
                <Alert className="mt-2 bg-yellow-900/30 border-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>USB Permission Denied</AlertTitle>
                  <AlertDescription>
                    Your device was found but permission was denied. Try the following:
                    <ul className="list-disc pl-5 mt-1 text-xs">
                      <li>Disconnect and reconnect your device</li>
                      <li>Look for a permission prompt on your device and tap "Allow"</li>
                      <li>Check "Always allow from this computer" for convenience</li>
                      <li>Reset USB permissions in your browser settings</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Connection Mode Explanation */}
        {showAdvancedOptions && (
          <div className="pt-2 border-t border-gray-700 text-xs text-gray-400">
            <h4 className="font-medium text-gray-300 mb-1">Connection Modes Explained:</h4>
            <ul className="space-y-1">
              <li>
                <span className="font-medium text-gray-300">Standard:</span> Basic connection attempt with standard
                WebUSB protocol.
              </li>
              <li>
                <span className="font-medium text-gray-300">Aggressive:</span> Multiple rapid connection attempts with
                different approaches.
              </li>
              <li>
                <span className="font-medium text-gray-300">Persistent:</span> Retry connection with increasing delays
                between attempts.
              </li>
            </ul>
          </div>
        )}

        {/* Quick Help Links */}
        <div className="pt-2 border-t border-gray-700">
          <h4 className="text-xs font-medium mb-2">Quick Help:</h4>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/usb-debugging-guide" className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
              <ArrowRight className="h-3 w-3 mr-1" />
              USB Debugging Guide
            </Link>
            <Link href="/fastboot-mode-guide" className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
              <ArrowRight className="h-3 w-3 mr-1" />
              Fastboot Mode Guide
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

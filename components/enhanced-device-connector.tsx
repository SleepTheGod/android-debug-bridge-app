"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useDeviceConnection } from "@/hooks/use-device-connection"
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
  Shield,
  Usb,
  Info,
  HelpCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function EnhancedDeviceConnector() {
  const {
    connect,
    isSupported,
    connectionState,
    errorMessage,
    errorDetails,
    device,
    deviceInfo,
    deviceMode,
    disconnect,
    retryConnection,
    resetConnection,
    isWaitingForPermission,
    getConnectionDiagnostics,
  } = useDeviceConnection()

  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionProgress, setConnectionProgress] = useState(0)
  const [diagnosticResults, setDiagnosticResults] = useState<{
    webUsbSupport: boolean
    secureContext: boolean
    permissionsPolicyBlocked: boolean
    usbDevicesAccessible: boolean
    previousDevicesFound: number
    androidDeviceFound: boolean
    permissionGranted: boolean
    connectionEstablished: boolean
    browserInfo: string
    suggestedFixes: string[]
  }>({
    webUsbSupport: false,
    secureContext: true,
    permissionsPolicyBlocked: false,
    usbDevicesAccessible: false,
    previousDevicesFound: 0,
    androidDeviceFound: false,
    permissionGranted: false,
    connectionEstablished: false,
    browserInfo: "",
    suggestedFixes: [],
  })
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"connect" | "diagnose" | "help">("connect")

  // Check WebUSB support on component mount
  useEffect(() => {
    if (navigator.usb) {
      setDiagnosticResults((prev) => ({ ...prev, webUsbSupport: true }))
    }

    // Check for secure context
    setDiagnosticResults((prev) => ({ ...prev, secureContext: window.isSecureContext === true }))
  }, [])

  // Update connection progress based on connection state
  useEffect(() => {
    if (connectionState === "connecting") {
      setConnectionProgress(30)
    } else if (connectionState === "authenticating") {
      setConnectionProgress(60)
    } else if (connectionState === "connected") {
      setConnectionProgress(100)
    } else if (connectionState === "waiting_permission") {
      setConnectionProgress(50)
    } else if (connectionState === "error" || connectionState === "permission_denied") {
      setConnectionProgress(0)
    }
  }, [connectionState])

  // Run diagnostics
  const runDiagnostics = useCallback(async () => {
    setIsRunningDiagnostics(true)
    try {
      const diagnostics = await getConnectionDiagnostics()
      setDiagnosticResults({
        webUsbSupport: diagnostics.webUsbSupported,
        secureContext: diagnostics.secureContext,
        permissionsPolicyBlocked: diagnostics.permissionsPolicyBlocked,
        usbDevicesAccessible: diagnostics.usbDevicesAccessible,
        previousDevicesFound: diagnostics.previousDevicesFound,
        androidDeviceFound: diagnostics.androidDeviceFound,
        permissionGranted: diagnostics.permissionGranted,
        connectionEstablished: diagnostics.connectionEstablished,
        browserInfo: diagnostics.browserInfo,
        suggestedFixes: diagnostics.suggestedFixes,
      })
      setShowDiagnostics(true)
    } catch (error) {
      console.error("Error running diagnostics:", error)
    } finally {
      setIsRunningDiagnostics(false)
    }
  }, [getConnectionDiagnostics])

  // Handle connection
  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionProgress(10)
    try {
      await connect()
    } catch (error) {
      console.error("Connection error:", error)
      // Error is handled by the context
    } finally {
      setIsConnecting(false)
    }
  }

  // Handle retry connection
  const handleRetryConnection = async () => {
    setIsConnecting(true)
    setConnectionProgress(10)
    try {
      await retryConnection()
    } catch (error) {
      console.error("Retry error:", error)
      // Error is handled by the context
    } finally {
      setIsConnecting(false)
    }
  }

  // Handle reset connection
  const handleResetConnection = async () => {
    try {
      await resetConnection()
      // Wait a moment after reset
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Try to reconnect
      await handleRetryConnection()
    } catch (error) {
      console.error("Reset error:", error)
    }
  }

  // Get connection status badge
  const getConnectionStatusBadge = () => {
    switch (connectionState) {
      case "connected":
        return <Badge className="bg-green-600">Connected</Badge>
      case "connecting":
        return <Badge className="bg-blue-600 animate-pulse">Connecting...</Badge>
      case "authenticating":
        return <Badge className="bg-yellow-600 animate-pulse">Authenticating...</Badge>
      case "waiting_permission":
        return <Badge className="bg-yellow-600 animate-pulse">Waiting for Permission...</Badge>
      case "permission_denied":
        return <Badge className="bg-red-600">Permission Denied</Badge>
      case "error":
        return <Badge className="bg-red-600">Connection Error</Badge>
      case "timeout":
        return <Badge className="bg-red-600">Connection Timeout</Badge>
      case "connection_lost":
        return <Badge className="bg-red-600">Connection Lost</Badge>
      default:
        return <Badge className="bg-gray-600">Disconnected</Badge>
    }
  }

  // Get mode badge
  const getModeBadge = () => {
    switch (deviceMode) {
      case "adb":
        return <Badge className="bg-green-600">ADB Mode</Badge>
      case "fastboot":
        return <Badge className="bg-blue-600">Fastboot Mode</Badge>
      case "recovery":
        return <Badge className="bg-yellow-600">Recovery Mode</Badge>
      case "sideload":
        return <Badge className="bg-purple-600">Sideload Mode</Badge>
      default:
        return <Badge className="bg-gray-600">Unknown Mode</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Usb className="h-5 w-5" />
          Enhanced USB Connection
        </CardTitle>
        <CardDescription>Improved connection system with advanced error handling</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="connect">Connect</TabsTrigger>
            <TabsTrigger value="diagnose">Diagnostics</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4 mt-4">
            {!isSupported && (
              <Alert variant="destructive" className="bg-red-900/30 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>WebUSB Not Supported</AlertTitle>
                <AlertDescription>
                  Your browser doesn't support WebUSB. Please use Chrome, Edge, or Opera.
                </AlertDescription>
              </Alert>
            )}

            {connectionState === "error" && errorMessage && (
              <Alert variant="destructive" className="bg-red-900/30 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                  {errorDetails && <div className="mt-2 text-xs text-gray-300">{errorDetails}</div>}
                </AlertDescription>
              </Alert>
            )}

            {connectionState === "permission_denied" && (
              <Alert variant="destructive" className="bg-red-900/30 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Permission Denied</AlertTitle>
                <AlertDescription>
                  USB debugging permission was denied on your device. Please reconnect and accept the permission prompt.
                  <div className="mt-2 flex justify-between items-center">
                    <Link
                      href="/permission-guide"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <HelpCircle className="h-3 w-3 mr-1" />
                      View permission guide
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleRetryConnection} className="h-7 text-xs">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {connectionState === "timeout" && (
              <Alert variant="destructive" className="bg-yellow-900/30 border-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Connection Timeout</AlertTitle>
                <AlertDescription>
                  The connection timed out. This could be due to a slow device or connection issues.
                  <div className="mt-2 flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={handleResetConnection} className="h-7 text-xs">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reset & Retry
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {isWaitingForPermission && (
              <Alert className="bg-blue-900/30 border-blue-800 animate-pulse">
                <Info className="h-4 w-4" />
                <AlertTitle>Waiting for Permission</AlertTitle>
                <AlertDescription>
                  Please check your Android device for a USB debugging permission prompt and tap "Allow".
                  <div className="mt-2 text-xs">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Make sure your device screen is unlocked</li>
                      <li>Look for a notification or popup on your device</li>
                      <li>Check "Always allow from this computer" for convenience</li>
                    </ul>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <Link
                      href="/permission-guide"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <HelpCircle className="h-3 w-3 mr-1" />
                      View device-specific permission guide
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Connection Progress */}
            {(isConnecting ||
              connectionState === "connecting" ||
              connectionState === "authenticating" ||
              connectionState === "waiting_permission") && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {connectionState === "connecting"
                      ? "Connecting to device..."
                      : connectionState === "authenticating"
                        ? "Authenticating..."
                        : connectionState === "waiting_permission"
                          ? "Waiting for permission..."
                          : "Connecting..."}
                  </span>
                  <span>{connectionProgress}%</span>
                </div>
                <Progress value={connectionProgress} className="h-2" />
              </div>
            )}

            {/* Device Info */}
            {device && deviceInfo && connectionState === "connected" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getConnectionStatusBadge()}
                    {getModeBadge()}
                  </div>
                </div>

                <div className="p-4 bg-green-900/20 border border-green-800 rounded-md space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="font-medium">Connected to device</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <span className="text-gray-400">Model:</span>
                    <span>{deviceInfo.model || device.productName || "Unknown"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <span className="text-gray-400">Serial:</span>
                    <span>{deviceInfo.serial || device.serialNumber || "Unknown"}</span>
                  </div>
                  {deviceInfo.androidVersion && (
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-gray-400">Android:</span>
                      <span>{deviceInfo.androidVersion}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <span className="text-gray-400">Mode:</span>
                    <span>{deviceInfo.mode.toUpperCase()}</span>
                  </div>
                </div>

                <Button variant="destructive" onClick={disconnect} className="w-full">
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting || !isSupported || connectionState === "connecting" || isWaitingForPermission}
                className="w-full"
              >
                {isConnecting || connectionState === "connecting" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : isWaitingForPermission ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Waiting for Permission...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Connect Device
                  </>
                )}
              </Button>
            )}

            {(connectionState === "error" ||
              connectionState === "permission_denied" ||
              connectionState === "timeout" ||
              connectionState === "connection_lost") && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRetryConnection} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </Button>
                <Button variant="outline" onClick={runDiagnostics} className="flex-1">
                  <Shield className="mr-2 h-4 w-4" />
                  Run Diagnostics
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="diagnose" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Connection Diagnostics</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={runDiagnostics}
                disabled={isRunningDiagnostics}
                className="h-8 text-xs"
              >
                {isRunningDiagnostics ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Run Diagnostics
                  </>
                )}
              </Button>
            </div>

            {showDiagnostics && (
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
                  <span>Secure Context (HTTPS)</span>
                  {diagnosticResults.secureContext ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Permissions Policy Blocked</span>
                  {!diagnosticResults.permissionsPolicyBlocked ? (
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
                  <span>Previously Authorized Devices</span>
                  <span>{diagnosticResults.previousDevicesFound}</span>
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

                {/* Browser Info */}
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <div className="text-xs text-gray-400">
                    <span className="font-medium">Browser Info:</span> {diagnosticResults.browserInfo}
                  </div>
                </div>

                {/* Suggested Fixes */}
                {diagnosticResults.suggestedFixes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <h4 className="font-medium mb-1">Suggested Fixes:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-gray-300">
                      {diagnosticResults.suggestedFixes.map((fix, index) => (
                        <li key={index}>{fix}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!showDiagnostics && !isRunningDiagnostics && (
              <div className="p-4 bg-gray-800 rounded-md text-center text-sm text-gray-400">
                Click "Run Diagnostics" to check your connection setup
              </div>
            )}

            {isRunningDiagnostics && (
              <div className="p-4 bg-gray-800 rounded-md text-center text-sm text-gray-400 flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <span>Running diagnostics...</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="help" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Troubleshooting Guide</h3>

              <div className="space-y-2">
                <h4 className="text-xs font-medium text-blue-400">Permission Issues</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-300">
                  <li>Make sure your device is unlocked when connecting</li>
                  <li>Check for a permission prompt on your device screen</li>
                  <li>Look in the notification area for USB debugging notifications</li>
                  <li>Try revoking USB debugging authorizations in Developer Options and reconnecting</li>
                  <li>Some devices require you to set USB mode to "File Transfer" first</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium text-blue-400">Connection Issues</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-300">
                  <li>Try a different USB cable (some cables are power-only)</li>
                  <li>Try a different USB port on your computer</li>
                  <li>Restart your device and browser</li>
                  <li>Make sure USB debugging is enabled in Developer Options</li>
                  <li>Check if your device has any security apps blocking USB connections</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium text-blue-400">Browser Issues</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-300">
                  <li>WebUSB requires Chrome, Edge, or Opera</li>
                  <li>Make sure you're using HTTPS (secure context)</li>
                  <li>Try clearing browser cache and cookies</li>
                  <li>Check chrome://settings/content/usbDevices to reset permissions</li>
                  <li>Try disabling browser extensions that might interfere</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-sm font-medium mb-2">Helpful Resources</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/usb-debugging-guide"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  USB Debugging Guide
                </Link>
                <Link href="/permission-guide" className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Permission Guide
                </Link>
                <Link
                  href="/fastboot-mode-guide"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Fastboot Mode Guide
                </Link>
                <Link href="/connection-tester" className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Connection Tester
                </Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

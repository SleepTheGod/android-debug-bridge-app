"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDeviceConnection } from "@/hooks/use-device-connection"
import {
  Smartphone,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Zap,
  Battery,
  Cpu,
  Shield,
  Lock,
  Unlock,
  HardDrive,
  Info,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DeviceSelector() {
  const {
    device,
    connect,
    disconnect,
    deviceInfo,
    isSupported,
    deviceMode,
    connectionState,
    errorMessage,
    errorDetails,
    rebootTo,
    retryConnection,
    isWaitingForPermission,
    resetConnection,
  } = useDeviceConnection()

  const [isConnecting, setIsConnecting] = useState(false)
  const [isPermissionsPolicyBlocked, setIsPermissionsPolicyBlocked] = useState(false)
  const [connectionProgress, setConnectionProgress] = useState(0)

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

  // Update the handleConnect function
  const handleConnect = async () => {
    setIsConnecting(true)
    setIsPermissionsPolicyBlocked(false)
    setConnectionProgress(10)
    try {
      await connect()
    } catch (err) {
      // Check if this is a permissions policy error
      if (
        err instanceof Error &&
        (err.message.includes("permissions policy") ||
          err.message.includes("Access to the feature") ||
          err.message.includes("disallowed by permissions"))
      ) {
        setIsPermissionsPolicyBlocked(true)
      }
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
    } catch (err) {
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

  const handleReboot = async (target: "system" | "bootloader" | "recovery" | "fastboot" | "sideload") => {
    try {
      await rebootTo(target)
    } catch (err) {
      // Error is handled by the context
    }
  }

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Device Connection
        </CardTitle>
        <CardDescription>Connect to your Android device in any boot mode</CardDescription>
      </CardHeader>
      <CardContent>
        {!isSupported && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-md flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            <span>WebUSB is not supported in this browser. Please use Chrome or Edge.</span>
          </div>
        )}

        {isPermissionsPolicyBlocked && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-medium">WebUSB Access Blocked</p>
              <p className="mt-1">USB access is blocked by permissions policy. This feature:</p>
              <ul className="list-disc pl-5 mt-1 text-xs text-gray-300">
                <li>Requires a secure context (HTTPS)</li>
                <li>May not work in preview environments</li>
                <li>Needs to be deployed to a proper HTTPS domain</li>
                <li>Cannot run in iframes without specific permissions</li>
              </ul>
              <p className="mt-2 text-xs">
                To use this feature, please deploy the application to a secure HTTPS environment.
              </p>
            </div>
          </div>
        )}

        {isWaitingForPermission && (
          <Alert className="mb-4 bg-blue-900/30 border-blue-800 animate-pulse">
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
                <Link href="/permission-guide" className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  View device-specific permission guide
                </Link>
                <Button variant="outline" size="sm" onClick={handleRetryConnection} className="h-7 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {connectionState === "permission_denied" && (
          <Alert className="mb-4 bg-red-900/30 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permission Denied</AlertTitle>
            <AlertDescription>
              USB debugging permission was denied on your device. Please reconnect and accept the permission prompt.
              <div className="mt-2 flex justify-between items-center">
                <Link href="/permission-guide" className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
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
          <Alert className="mb-4 bg-yellow-900/30 border-yellow-800">
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

        {isPermissionsPolicyBlocked && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://developer.android.com/studio/command-line/adb", "_blank")}
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Learn About Native ADB
            </Button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Native ADB provides full functionality and is not restricted by browser limitations.
            </p>
          </div>
        )}

        {connectionState === "error" && errorMessage && !isWaitingForPermission && (
          <div className="mb-4 space-y-2">
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-md flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>

            {errorDetails && <div className="p-3 bg-gray-800 rounded-md text-sm text-gray-300">{errorDetails}</div>}

            <div className="p-3 bg-gray-800 rounded-md text-sm">
              <h4 className="font-medium mb-2">Troubleshooting steps:</h4>
              <ol className="list-decimal pl-5 space-y-1 text-gray-300">
                <li>Disconnect and reconnect your USB cable</li>
                <li>Make sure USB debugging is enabled in Developer Options</li>
                <li>Check for a permission prompt on your device and tap "Allow"</li>
                <li>Try a different USB port or cable</li>
                <li>Restart your device and browser</li>
              </ol>

              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <Link
                  href="/usb-debugging-guide"
                  className="text-blue-400 hover:text-blue-300 flex items-center justify-center text-xs"
                >
                  <Info className="h-3 w-3 mr-1" />
                  USB debugging guide
                </Link>
                <Link
                  href="/permission-guide"
                  className="text-blue-400 hover:text-blue-300 flex items-center justify-center text-xs"
                >
                  <Info className="h-3 w-3 mr-1" />
                  Permission guide
                </Link>
              </div>

              <div className="flex gap-2 mt-3">
                <Button onClick={handleRetryConnection} className="flex-1" disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Connection
                    </>
                  )}
                </Button>
                <Button onClick={handleResetConnection} variant="outline" className="flex-1" disabled={isConnecting}>
                  <Shield className="mr-2 h-4 w-4" />
                  Reset & Retry
                </Button>
              </div>
            </div>
          </div>
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

        {device ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Connected to device</span>
              </div>
              {getModeBadge()}
            </div>

            {deviceInfo && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-gray-400">Serial:</span>
                  <span className="truncate">{deviceInfo.serial || "Unknown"}</span>
                </div>

                {deviceMode === "adb" && (
                  <>
                    {deviceInfo.model && (
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-gray-400">Model:</span>
                        <span>{deviceInfo.model}</span>
                      </div>
                    )}
                    {deviceInfo.androidVersion && (
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-gray-400">Android:</span>
                        <span>{deviceInfo.androidVersion}</span>
                      </div>
                    )}
                    {deviceInfo.cpuArch && (
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Cpu className="h-3 w-3" /> CPU:
                        </span>
                        <span>{deviceInfo.cpuArch}</span>
                      </div>
                    )}
                    {deviceInfo.batteryLevel !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center gap-1">
                            <Battery className="h-3 w-3" /> Battery:
                          </span>
                          <span>{deviceInfo.batteryLevel}%</span>
                        </div>
                        <Progress value={deviceInfo.batteryLevel} className="h-1" />
                      </div>
                    )}
                    {deviceInfo.kernelVersion && (
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-gray-400">Kernel:</span>
                        <span className="truncate">{deviceInfo.kernelVersion}</span>
                      </div>
                    )}
                  </>
                )}

                {deviceMode === "fastboot" && (
                  <>
                    {deviceInfo.product && (
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-gray-400 flex items-center gap-1">
                          <HardDrive className="h-3 w-3" /> Product:
                        </span>
                        <span>{deviceInfo.product}</span>
                      </div>
                    )}
                    {deviceInfo.bootloader && (
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-gray-400">Bootloader:</span>
                        <span>{deviceInfo.bootloader}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-1">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Secure:
                      </span>
                      <span>{deviceInfo.secure ? "Yes" : "No"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <span className="text-gray-400 flex items-center gap-1">
                        {deviceInfo.unlocked ? (
                          <Unlock className="h-3 w-3 text-yellow-400" />
                        ) : (
                          <Lock className="h-3 w-3 text-green-400" />
                        )}
                        Bootloader:
                      </span>
                      <span>{deviceInfo.unlocked ? "Unlocked" : "Locked"}</span>
                    </div>
                  </>
                )}

                {/* Reboot options based on current mode */}
                {deviceMode === "adb" && (
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleReboot("bootloader")} className="text-xs">
                      Reboot to Bootloader
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleReboot("recovery")} className="text-xs">
                      Reboot to Recovery
                    </Button>
                  </div>
                )}

                {deviceMode === "fastboot" && (
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleReboot("system")} className="text-xs">
                      Reboot to System
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleReboot("recovery")} className="text-xs">
                      Reboot to Recovery
                    </Button>
                  </div>
                )}

                {deviceMode === "recovery" && (
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleReboot("system")} className="text-xs">
                      Reboot to System
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleReboot("bootloader")} className="text-xs">
                      Reboot to Bootloader
                    </Button>
                  </div>
                )}
              </div>
            )}

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

        {/* Enhanced connection link */}
        <div className="mt-4 text-center">
          <Link
            href="/enhanced-connection"
            className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center"
          >
            <Shield className="h-3 w-3 mr-1" />
            Try our enhanced connection tool with advanced diagnostics
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

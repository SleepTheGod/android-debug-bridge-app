"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export function DeviceSelector() {
  const { device, connect, disconnect, deviceInfo, isSupported, deviceMode, connectionState, errorMessage, rebootTo } =
    useDeviceConnection()
  const [isConnecting, setIsConnecting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  // Add a new state to track permissions policy errors
  const [isPermissionsPolicyBlocked, setIsPermissionsPolicyBlocked] = useState(false)

  // Update the handleConnect function
  const handleConnect = async () => {
    setIsConnecting(true)
    setIsPermissionsPolicyBlocked(false)
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
      setRetryCount((prev) => prev + 1)
    } finally {
      setIsConnecting(false)
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

        {connectionState === "error" && errorMessage && (
          <div className="mb-4 space-y-2">
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-md flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>

            <div className="p-3 bg-gray-800 rounded-md text-sm">
              <h4 className="font-medium mb-2">Troubleshooting steps:</h4>
              <ol className="list-decimal pl-5 space-y-1 text-gray-300">
                <li>Disconnect and reconnect your USB cable</li>
                <li>Make sure USB debugging is enabled in Developer Options</li>
                <li>Check for a permission prompt on your device and tap "Allow"</li>
                <li>Try a different USB port or cable</li>
                <li>Restart your device and browser</li>
              </ol>

              <Link
                href="/usb-debugging-guide"
                className="text-blue-400 hover:text-blue-300 flex items-center justify-center mt-3 text-xs"
              >
                <Info className="h-3 w-3 mr-1" />
                View detailed USB debugging setup guide
              </Link>

              <Button onClick={handleConnect} className="w-full mt-3" disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Connection
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {device ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <Link className="h-4 w-4" />
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
            disabled={isConnecting || !isSupported || connectionState === "connecting"}
            className="w-full"
          >
            {isConnecting || connectionState === "connecting" ? (
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
        )}
      </CardContent>
    </Card>
  )
}

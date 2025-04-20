"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdbDevice } from "@/hooks/use-adb-device"
import { Smartphone, RefreshCw, Link, AlertCircle, AlertTriangle } from "lucide-react"

export function DeviceSelector() {
  const { device, connect, disconnect, deviceInfo, isSupported } = useAdbDevice()
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)
    try {
      await connect()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to device")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Device Connection
        </CardTitle>
        <CardDescription>Connect to your Android device using WebUSB</CardDescription>
      </CardHeader>
      <CardContent>
        {!isSupported && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-md flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            <span>WebUSB is not supported in this browser. Please use Chrome or Edge.</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {device ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Link className="h-4 w-4" />
              <span>Connected to device</span>
            </div>

            {deviceInfo && (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-gray-400">Model:</span>
                  <span>{deviceInfo.model || "Unknown"}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-gray-400">Serial:</span>
                  <span>{deviceInfo.serial || "Unknown"}</span>
                </div>
                {deviceInfo.androidVersion && (
                  <div className="grid grid-cols-2 gap-1">
                    <span className="text-gray-400">Android:</span>
                    <span>{deviceInfo.androidVersion}</span>
                  </div>
                )}
              </div>
            )}

            <Button variant="destructive" onClick={disconnect} className="w-full">
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={handleConnect} disabled={isConnecting || !isSupported} className="w-full">
            {isConnecting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Device"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}


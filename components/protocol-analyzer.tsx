"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDeviceConnection } from "@/hooks/use-device-connection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Activity, FileDown, Layers, RotateCw, Search, Shield, Code, Eye } from "lucide-react"

// ADB protocol constants for display
const ADB_CONSTANTS = {
  A_SYNC: { value: 0x434e5953, name: "A_SYNC", description: "Synchronization packet" },
  A_CNXN: { value: 0x4e584e43, name: "A_CNXN", description: "Connection packet" },
  A_OPEN: { value: 0x4e45504f, name: "A_OPEN", description: "Open stream packet" },
  A_OKAY: { value: 0x59414b4f, name: "A_OKAY", description: "Acknowledgment packet" },
  A_CLSE: { value: 0x45534c43, name: "A_CLSE", description: "Close stream packet" },
  A_WRTE: { value: 0x45545257, name: "A_WRTE", description: "Write data packet" },
  A_AUTH: { value: 0x48545541, name: "A_AUTH", description: "Authentication packet" },
  A_STLS: { value: 0x534c5453, name: "A_STLS", description: "TLS setup packet" },
}

// Packet types for the analyzer
type PacketType = "command" | "response" | "data" | "error" | "auth" | "info"

interface Packet {
  timestamp: number
  direction: "in" | "out"
  type: PacketType
  command?: string
  data: string
  hexData: string
  size: number
  description: string
}

export function ProtocolAnalyzer() {
  const { device, deviceMode, connectionState, executeCommand } = useDeviceConnection()
  const [packets, setPackets] = useState<Packet[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [filter, setFilter] = useState<string>("")
  const [selectedTab, setSelectedTab] = useState<string>("live")
  const [showHex, setShowHex] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const packetListRef = useRef<HTMLDivElement>(null)

  // Simulate packet capture
  useEffect(() => {
    if (!isCapturing || !device) return

    const captureInterval = setInterval(() => {
      // This is a simulation - in a real implementation, we would capture actual USB traffic
      const packetTypes: PacketType[] = ["command", "response", "data", "auth", "info"]
      const commands = ["shell", "getprop", "pm list packages", "dumpsys battery", "settings list global"]
      const directions: ("in" | "out")[] = ["in", "out"]

      const randomPacket: Packet = {
        timestamp: Date.now(),
        direction: directions[Math.floor(Math.random() * directions.length)],
        type: packetTypes[Math.floor(Math.random() * packetTypes.length)],
        command: commands[Math.floor(Math.random() * commands.length)],
        data: generateRandomData(),
        hexData: generateRandomHexData(),
        size: Math.floor(Math.random() * 1024) + 64,
        description: "Simulated packet for demonstration",
      }

      setPackets((prev) => [...prev, randomPacket])
    }, 2000)

    return () => clearInterval(captureInterval)
  }, [isCapturing, device])

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && packetListRef.current) {
      packetListRef.current.scrollTop = packetListRef.current.scrollHeight
    }
  }, [packets, autoScroll])

  // Generate random data for simulation
  const generateRandomData = () => {
    const responses = [
      "Device response: OK",
      "Error: Permission denied",
      "Success: Command executed",
      "Data transfer complete",
      "Authentication required",
      "Device info: Android 12",
      "Battery level: 85%",
      "Package list retrieved",
      "Settings updated",
      "Reboot initiated",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Generate random hex data for simulation
  const generateRandomHexData = () => {
    let result = ""
    const hexChars = "0123456789ABCDEF"
    for (let i = 0; i < 32; i++) {
      result += hexChars[Math.floor(Math.random() * 16)]
      if (i % 2 === 1 && i < 31) result += " "
      if (i % 8 === 7 && i < 31) result += " "
    }
    return result
  }

  // Toggle packet capture
  const toggleCapture = () => {
    if (!isCapturing && device) {
      // Add initial connection packet
      const initialPacket: Packet = {
        timestamp: Date.now(),
        direction: "out",
        type: "command",
        command: "connect",
        data: `Connecting to ${device.productName || "Android device"}`,
        hexData: "43 4E 58 4E 01 00 00 00 00 10 00 00 00 00 00 00",
        size: 24,
        description: "Initial connection packet",
      }
      setPackets([initialPacket])
    }
    setIsCapturing(!isCapturing)
  }

  // Clear captured packets
  const clearPackets = () => {
    setPackets([])
  }

  // Export packets as JSON
  const exportPackets = () => {
    const dataStr = JSON.stringify(packets, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `adb-packets-${new Date().toISOString()}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Filter packets
  const filteredPackets = packets.filter(
    (packet) =>
      filter === "" ||
      packet.type.includes(filter.toLowerCase()) ||
      packet.data.toLowerCase().includes(filter.toLowerCase()) ||
      (packet.command && packet.command.toLowerCase().includes(filter.toLowerCase())),
  )

  // Get packet type badge
  const getPacketTypeBadge = (type: PacketType) => {
    switch (type) {
      case "command":
        return <Badge className="bg-blue-600">Command</Badge>
      case "response":
        return <Badge className="bg-green-600">Response</Badge>
      case "data":
        return <Badge className="bg-purple-600">Data</Badge>
      case "error":
        return <Badge className="bg-red-600">Error</Badge>
      case "auth":
        return <Badge className="bg-yellow-600">Auth</Badge>
      case "info":
        return <Badge className="bg-gray-600">Info</Badge>
    }
  }

  // Get direction badge
  const getDirectionBadge = (direction: "in" | "out") => {
    return (
      <Badge variant="outline" className={direction === "in" ? "border-green-500" : "border-blue-500"}>
        {direction === "in" ? "← IN" : "OUT →"}
      </Badge>
    )
  }

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString() + "." + date.getMilliseconds().toString().padStart(3, "0")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          ADB Protocol Analyzer
        </CardTitle>
        <CardDescription>Capture and analyze ADB protocol communication</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleCapture}
              variant={isCapturing ? "destructive" : "default"}
              disabled={!device || connectionState !== "connected"}
              size="sm"
            >
              {isCapturing ? "Stop Capture" : "Start Capture"}
            </Button>
            <Button onClick={clearPackets} variant="outline" size="sm" disabled={packets.length === 0}>
              <RotateCw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter packets..."
                className="pl-8 h-8 bg-gray-800 border border-gray-700 rounded-md text-xs w-40"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <Button onClick={exportPackets} variant="outline" size="sm" disabled={packets.length === 0}>
              <FileDown className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="live">Live Capture</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="reference">Protocol Reference</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={isCapturing ? "animate-pulse border-green-500" : ""}>
                  {isCapturing ? "Capturing" : "Idle"}
                </Badge>
                <span className="text-xs text-gray-400">
                  {filteredPackets.length} packet{filteredPackets.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowHex(!showHex)}>
                  <Code className="h-3 w-3 mr-1" />
                  {showHex ? "Show Text" : "Show Hex"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 text-xs ${autoScroll ? "text-blue-400" : ""}`}
                  onClick={() => setAutoScroll(!autoScroll)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Auto-scroll
                </Button>
              </div>
            </div>

            <div
              ref={packetListRef}
              className="h-[400px] overflow-y-auto border border-gray-800 rounded-md bg-black p-2 font-mono text-xs"
            >
              {filteredPackets.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  {device && connectionState === "connected"
                    ? "Click 'Start Capture' to begin monitoring packets"
                    : "Connect a device to start capturing packets"}
                </div>
              ) : (
                filteredPackets.map((packet, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded ${
                      packet.type === "error"
                        ? "bg-red-900/20 border border-red-800"
                        : packet.direction === "in"
                          ? "bg-green-900/10 border border-green-900/30"
                          : "bg-blue-900/10 border border-blue-900/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{formatTimestamp(packet.timestamp)}</span>
                        {getPacketTypeBadge(packet.type)}
                        {getDirectionBadge(packet.direction)}
                      </div>
                      <span className="text-gray-400">{packet.size} bytes</span>
                    </div>
                    {packet.command && (
                      <div className="mb-1">
                        <span className="text-gray-400">Command: </span>
                        <span className="text-blue-400">{packet.command}</span>
                      </div>
                    )}
                    <div className="mt-1 font-mono whitespace-pre-wrap break-all">
                      {showHex ? packet.hexData : packet.data}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Packet Statistics</h3>
                <div className="bg-gray-900 rounded-md p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Packets:</span>
                    <span className="text-sm font-medium">{packets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Commands:</span>
                    <span className="text-sm font-medium">{packets.filter((p) => p.type === "command").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Responses:</span>
                    <span className="text-sm font-medium">{packets.filter((p) => p.type === "response").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Data Packets:</span>
                    <span className="text-sm font-medium">{packets.filter((p) => p.type === "data").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Auth Packets:</span>
                    <span className="text-sm font-medium">{packets.filter((p) => p.type === "auth").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Errors:</span>
                    <span className="text-sm font-medium">{packets.filter((p) => p.type === "error").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Data Size:</span>
                    <span className="text-sm font-medium">
                      {packets.reduce((sum, p) => sum + p.size, 0).toLocaleString()} bytes
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Traffic Flow</h3>
                <div className="bg-gray-900 rounded-md p-4 h-[200px] flex items-center justify-center">
                  <div className="text-center text-gray-400 text-sm">
                    <Layers className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                    Traffic visualization would be displayed here
                    <p className="text-xs mt-2">
                      (In a real implementation, this would show a graph of packet flow over time)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Security Analysis</h3>
              <div className="bg-gray-900 rounded-md p-4">
                <div className="flex items-start gap-4">
                  <Shield className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">ADB Security Model</h4>
                    <p className="text-sm text-gray-300 mb-2">
                      The Android Debug Bridge uses RSA key pairs for authentication. When a computer connects to an
                      Android device for the first time, the device displays a prompt asking the user to authorize the
                      connection and verify the RSA key fingerprint.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div className="space-y-1">
                        <h5 className="font-medium text-blue-400">Security Features</h5>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300">
                          <li>RSA public key authentication</li>
                          <li>User confirmation required for new connections</li>
                          <li>USB debugging must be explicitly enabled</li>
                          <li>Secure device pairing with key verification</li>
                          <li>Authorization persists for trusted computers</li>
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-medium text-yellow-400">Security Considerations</h5>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300">
                          <li>Physical access to unlocked device required</li>
                          <li>User must explicitly grant permission</li>
                          <li>WebUSB requires secure context (HTTPS)</li>
                          <li>Browser security model adds additional protection</li>
                          <li>Permission can be revoked in developer options</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reference" className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">ADB Protocol Reference</h3>
              <div className="bg-gray-900 rounded-md p-4">
                <p className="text-sm text-gray-300 mb-4">
                  The Android Debug Bridge protocol is a client-server protocol that allows communication between a host
                  computer and an Android device. Below are the key message types used in the protocol.
                </p>

                <div className="space-y-3">
                  {Object.entries(ADB_CONSTANTS).map(([key, value]) => (
                    <div key={key} className="p-2 border border-gray-800 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {value.name}
                          </Badge>
                          <span className="text-xs text-gray-400 font-mono">
                            0x{value.value.toString(16).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{value.description}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="font-medium mb-2">ADB Message Format</h4>
                  <div className="font-mono text-xs bg-black p-3 rounded-md">
                    <div className="grid grid-cols-8 gap-1 text-center mb-1">
                      <div className="bg-blue-900/30 p-1 rounded">Command</div>
                      <div className="bg-green-900/30 p-1 rounded">Arg0</div>
                      <div className="bg-green-900/30 p-1 rounded">Arg1</div>
                      <div className="bg-yellow-900/30 p-1 rounded">Length</div>
                      <div className="bg-yellow-900/30 p-1 rounded">~Length</div>
                      <div className="bg-red-900/30 p-1 rounded">Checksum</div>
                      <div className="col-span-2 bg-purple-900/30 p-1 rounded">Data (variable)</div>
                    </div>
                    <div className="grid grid-cols-8 gap-1 text-center text-gray-400">
                      <div className="p-1">4 bytes</div>
                      <div className="p-1">4 bytes</div>
                      <div className="p-1">4 bytes</div>
                      <div className="p-1">4 bytes</div>
                      <div className="p-1">4 bytes</div>
                      <div className="p-1">4 bytes</div>
                      <div className="col-span-2 p-1">Length bytes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

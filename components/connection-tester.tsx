"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDeviceConnection } from "@/hooks/use-device-connection"
import {
  Smartphone,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
  Loader2,
  FileDown,
  RotateCw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define device profiles for testing
const deviceProfiles = [
  {
    id: "pixel",
    name: "Google Pixel",
    androidVersion: "13",
    usbVendorId: 0x18d1,
    permissionBehavior: "prompt",
    connectionDelay: 1000,
  },
  {
    id: "samsung",
    name: "Samsung Galaxy",
    androidVersion: "12",
    usbVendorId: 0x04e8,
    permissionBehavior: "prompt-with-delay",
    connectionDelay: 2000,
  },
  {
    id: "xiaomi",
    name: "Xiaomi Mi",
    androidVersion: "11",
    usbVendorId: 0x2717,
    permissionBehavior: "multiple-prompts",
    connectionDelay: 1500,
  },
  {
    id: "oneplus",
    name: "OnePlus",
    androidVersion: "12",
    usbVendorId: 0x2a70,
    permissionBehavior: "auto-deny-first",
    connectionDelay: 1200,
  },
  {
    id: "motorola",
    name: "Motorola",
    androidVersion: "10",
    usbVendorId: 0x22b8,
    permissionBehavior: "auto-allow",
    connectionDelay: 800,
  },
]

// Define connection scenarios
const connectionScenarios = [
  {
    id: "normal",
    name: "Normal Connection",
    description: "Device connects normally with permission prompt",
    steps: ["select_device", "permission_prompt", "grant_permission", "connect_success"],
  },
  {
    id: "permission-denied",
    name: "Permission Denied",
    description: "User denies the USB debugging permission",
    steps: ["select_device", "permission_prompt", "deny_permission", "connection_error"],
  },
  {
    id: "delayed-permission",
    name: "Delayed Permission",
    description: "User takes time before granting permission",
    steps: ["select_device", "permission_prompt", "wait", "grant_permission", "connect_success"],
  },
  {
    id: "multiple-prompts",
    name: "Multiple Prompts",
    description: "Device shows multiple permission prompts",
    steps: [
      "select_device",
      "permission_prompt",
      "grant_permission",
      "second_permission_prompt",
      "grant_permission",
      "connect_success",
    ],
  },
  {
    id: "connection-lost",
    name: "Connection Lost",
    description: "Device disconnects during the process",
    steps: ["select_device", "permission_prompt", "grant_permission", "partial_connection", "connection_lost"],
  },
]

// Connection step component
const ConnectionStep = ({
  step,
  status,
  currentStep,
}: {
  step: string
  status: "pending" | "active" | "completed" | "error"
  currentStep: string
}) => {
  // Format step name for display
  const formatStepName = (step: string) => {
    return step
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-md ${
        status === "active"
          ? "bg-blue-900/30 border border-blue-800"
          : status === "completed"
            ? "bg-green-900/30 border border-green-800"
            : status === "error"
              ? "bg-red-900/30 border border-red-800"
              : "bg-gray-800"
      }`}
    >
      {status === "pending" && <Clock className="h-4 w-4 text-gray-400" />}
      {status === "active" && <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />}
      {status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-400" />}
      {status === "error" && <XCircle className="h-4 w-4 text-red-400" />}
      <span>{formatStepName(step)}</span>
      {step === currentStep && status === "active" && (
        <Badge variant="outline" className="ml-auto animate-pulse">
          Current
        </Badge>
      )}
    </div>
  )
}

export function ConnectionTester() {
  const { connect, disconnect, connectionState, errorMessage, device, deviceInfo } = useDeviceConnection()
  const [selectedProfile, setSelectedProfile] = useState(deviceProfiles[0])
  const [selectedScenario, setSelectedScenario] = useState(connectionScenarios[0])
  const [isTesting, setIsTesting] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [testLogs, setTestLogs] = useState<string[]>([])
  const [testResult, setTestResult] = useState<"success" | "failure" | "pending" | null>(null)
  const [isRealDeviceMode, setIsRealDeviceMode] = useState(true)

  // Add log entry
  const addLog = useCallback((message: string, type: "info" | "success" | "error" | "warning" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setTestLogs((prev) => [...prev, `[${timestamp}] [${type.toUpperCase()}] ${message}`])
  }, [])

  // Reset test state
  const resetTest = useCallback(() => {
    setIsTesting(false)
    setTestProgress(0)
    setCurrentStep("")
    setTestLogs([])
    setTestResult(null)
    if (device) {
      disconnect()
    }
  }, [device, disconnect])

  // Run the test with real device
  const runRealDeviceTest = useCallback(async () => {
    resetTest()
    setIsTesting(true)
    setTestResult("pending")

    addLog(`Starting real device connection test`, "info")
    addLog(`Make sure your device is connected via USB and has USB debugging enabled`, "info")
    addLog(`Waiting for device selection...`, "info")

    try {
      // Attempt to connect to a real device
      await connect()

      // Check connection state
      if (connectionState === "connected" && device) {
        addLog(`Successfully connected to device: ${deviceInfo?.model || device.productName || "Unknown"}`, "success")
        setTestResult("success")
      } else if (connectionState === "error") {
        addLog(`Connection error: ${errorMessage || "Unknown error"}`, "error")
        setTestResult("failure")
      } else {
        addLog(`Unexpected connection state: ${connectionState}`, "warning")
        setTestResult("failure")
      }
    } catch (error) {
      addLog(`Connection error: ${error instanceof Error ? error.message : String(error)}`, "error")
      setTestResult("failure")
    } finally {
      setIsTesting(false)
    }
  }, [connect, connectionState, device, deviceInfo, errorMessage, addLog, resetTest])

  // Simulate the test with mock device
  const runSimulatedTest = useCallback(async () => {
    resetTest()
    setIsTesting(true)
    setTestResult("pending")

    addLog(`Starting simulated test with ${selectedProfile.name} (Android ${selectedProfile.androidVersion})`, "info")
    addLog(`Test scenario: ${selectedScenario.name}`, "info")
    addLog(`Behavior: ${selectedProfile.permissionBehavior}`, "info")

    // Simulate each step in the scenario
    for (let i = 0; i < selectedScenario.steps.length; i++) {
      const step = selectedScenario.steps[i]
      setCurrentStep(step)
      setTestProgress(Math.floor((i / selectedScenario.steps.length) * 100))

      // Log the current step
      addLog(`Step ${i + 1}: ${step.split("_").join(" ")}`, "info")

      // Simulate step delay
      await new Promise((resolve) => setTimeout(resolve, selectedProfile.connectionDelay))

      // Handle step logic
      switch (step) {
        case "select_device":
          addLog(`Device selected: ${selectedProfile.name}`, "info")
          break
        case "permission_prompt":
          addLog(`USB debugging permission prompt shown on device`, "info")
          break
        case "grant_permission":
          addLog(`User granted USB debugging permission`, "success")
          break
        case "deny_permission":
          addLog(`User denied USB debugging permission`, "error")
          break
        case "wait":
          addLog(`Waiting for user response...`, "info")
          await new Promise((resolve) => setTimeout(resolve, 3000))
          break
        case "second_permission_prompt":
          addLog(`Additional permission prompt shown on device`, "info")
          break
        case "partial_connection":
          addLog(`Device partially connected`, "info")
          break
        case "connection_lost":
          addLog(`Connection to device was lost`, "error")
          break
        case "connect_success":
          addLog(`Successfully connected to ${selectedProfile.name}`, "success")
          break
        case "connection_error":
          addLog(`Failed to connect to device: Permission denied`, "error")
          break
      }
    }

    // Set final progress
    setTestProgress(100)

    // Determine test result
    const finalStep = selectedScenario.steps[selectedScenario.steps.length - 1]
    if (finalStep === "connect_success") {
      setTestResult("success")
      addLog(`Test completed successfully`, "success")
    } else if (finalStep === "connection_error" || finalStep === "connection_lost") {
      setTestResult("failure")
      addLog(`Test failed as expected for this scenario`, "warning")
    } else {
      setTestResult("pending")
      addLog(`Test completed with indeterminate result`, "warning")
    }

    setIsTesting(false)
  }, [selectedProfile, selectedScenario, addLog, resetTest])

  // Run the appropriate test based on mode
  const runTest = useCallback(() => {
    if (isRealDeviceMode) {
      runRealDeviceTest()
    } else {
      runSimulatedTest()
    }
  }, [isRealDeviceMode, runRealDeviceTest, runSimulatedTest])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (device) {
        disconnect()
      }
    }
  }, [device, disconnect])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Connection Flow Tester
        </CardTitle>
        <CardDescription>Test USB connection flow with various Android devices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={isRealDeviceMode ? "real" : "simulated"} onValueChange={(v) => setIsRealDeviceMode(v === "real")}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="real">Real Device</TabsTrigger>
            <TabsTrigger value="simulated">Simulated</TabsTrigger>
          </TabsList>

          <TabsContent value="real" className="space-y-4 mt-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Real Device Testing</AlertTitle>
              <AlertDescription>
                Connect your Android device via USB and make sure USB debugging is enabled. This will attempt a real
                connection to your device.
              </AlertDescription>
            </Alert>

            <Button
              onClick={runRealDeviceTest}
              disabled={isTesting}
              className="w-full"
              variant={device ? "outline" : "default"}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : device ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reconnect Device
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Test Real Device Connection
                </>
              )}
            </Button>

            {device && deviceInfo && (
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
            )}
          </TabsContent>

          <TabsContent value="simulated" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Device Profile</h3>
                <div className="grid grid-cols-2 gap-2">
                  {deviceProfiles.map((profile) => (
                    <Button
                      key={profile.id}
                      variant={selectedProfile.id === profile.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedProfile(profile)}
                      className="h-auto py-2 justify-start"
                    >
                      <div className="text-left">
                        <div className="font-medium">{profile.name}</div>
                        <div className="text-xs opacity-70">Android {profile.androidVersion}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Test Scenario</h3>
                <div className="grid grid-cols-1 gap-2">
                  {connectionScenarios.map((scenario) => (
                    <Button
                      key={scenario.id}
                      variant={selectedScenario.id === scenario.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedScenario(scenario)}
                      className="h-auto py-2 justify-start"
                    >
                      <div className="text-left">
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-xs opacity-70">{scenario.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={runSimulatedTest} disabled={isTesting} className="w-full">
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>

            {isTesting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Simulation progress</span>
                  <span>{testProgress}%</span>
                </div>
                <Progress value={testProgress} className="h-2" />
              </div>
            )}

            {selectedScenario && (currentStep || testResult) && (
              <div className="space-y-2 p-4 bg-gray-900 rounded-md">
                <h3 className="text-sm font-medium mb-2">Connection Steps</h3>
                <div className="space-y-2">
                  {selectedScenario.steps.map((step, index) => {
                    let status: "pending" | "active" | "completed" | "error" = "pending"

                    if (testResult === "success") {
                      status = "completed"
                    } else if (
                      testResult === "failure" &&
                      step === selectedScenario.steps[selectedScenario.steps.length - 1]
                    ) {
                      status = "error"
                    } else if (step === currentStep) {
                      status = "active"
                    } else if (selectedScenario.steps.indexOf(step) < selectedScenario.steps.indexOf(currentStep)) {
                      status = "completed"
                    }

                    return <ConnectionStep key={index} step={step} status={status} currentStep={currentStep} />
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Test logs */}
        {testLogs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Test Logs</h3>
              <Button variant="outline" size="sm" onClick={() => setTestLogs([])} className="h-8">
                <RotateCw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
            <div className="h-48 overflow-y-auto bg-black rounded-md p-2 font-mono text-xs">
              {testLogs.map((log, index) => {
                let className = "text-gray-300"
                if (log.includes("[SUCCESS]")) className = "text-green-400"
                if (log.includes("[ERROR]")) className = "text-red-400"
                if (log.includes("[WARNING]")) className = "text-yellow-400"

                return (
                  <div key={index} className={className}>
                    {log}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Test result */}
        {testResult && (
          <div
            className={`p-4 rounded-md ${
              testResult === "success"
                ? "bg-green-900/20 border border-green-800"
                : testResult === "failure"
                  ? "bg-red-900/20 border border-red-800"
                  : "bg-yellow-900/20 border border-yellow-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult === "success" && <CheckCircle2 className="h-5 w-5 text-green-400" />}
              {testResult === "failure" && <XCircle className="h-5 w-5 text-red-400" />}
              {testResult === "pending" && <Clock className="h-5 w-5 text-yellow-400" />}
              <span className="font-medium">
                {testResult === "success"
                  ? "Test Passed"
                  : testResult === "failure"
                    ? "Test Failed"
                    : "Test Incomplete"}
              </span>
            </div>
            <p className="text-sm mt-2">
              {testResult === "success"
                ? "The connection flow completed successfully. Permission handling is working correctly."
                : testResult === "failure"
                  ? isRealDeviceMode
                    ? "The connection failed. Check the logs for details on what went wrong."
                    : "The test failed as expected for this scenario."
                  : "The test is still in progress or ended in an indeterminate state."}
            </p>
          </div>
        )}

        {/* Export logs button */}
        {testLogs.length > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              const logText = testLogs.join("\n")
              const blob = new Blob([logText], { type: "text/plain" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `connection-test-${new Date().toISOString().split("T")[0]}.log`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }}
            className="w-full"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Test Logs
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

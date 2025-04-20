"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDeviceConnection } from "@/hooks/use-device-connection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, AlertTriangle, CheckCircle2, XCircle, Loader2, Zap, Info, FileDown, Terminal } from "lucide-react"

interface SecurityCheck {
  id: string
  name: string
  description: string
  status: "checking" | "passed" | "warning" | "failed" | "info" | "not_checked"
  details: string
  recommendation?: string
}

interface VulnerabilityInfo {
  id: string
  name: string
  severity: "critical" | "high" | "medium" | "low" | "info"
  description: string
  affected: string
  mitigation: string
  references: string[]
}

export function SecurityAnalyzer() {
  const { device, deviceInfo, deviceMode, connectionState, executeCommand } = useDeviceConnection()
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedTab, setSelectedTab] = useState<string>("checks")
  const [deviceProps, setDeviceProps] = useState<Record<string, string>>({})
  const [knownVulnerabilities, setKnownVulnerabilities] = useState<VulnerabilityInfo[]>([])

  // Initialize security checks
  useEffect(() => {
    setSecurityChecks([
      {
        id: "usb_debugging",
        name: "USB Debugging",
        description: "Checks if USB debugging is enabled",
        status: "not_checked",
        details: "USB debugging is currently enabled on this device",
      },
      {
        id: "adb_root",
        name: "ADB Root Access",
        description: "Checks if ADB has root access",
        status: "not_checked",
        details: "ADB does not have root access",
      },
      {
        id: "bootloader_status",
        name: "Bootloader Status",
        description: "Checks if the bootloader is locked or unlocked",
        status: "not_checked",
        details: "Bootloader status unknown",
      },
      {
        id: "selinux_status",
        name: "SELinux Status",
        description: "Checks SELinux enforcement status",
        status: "not_checked",
        details: "SELinux status unknown",
      },
      {
        id: "system_verification",
        name: "System Verification",
        description: "Checks if system verification is enabled",
        status: "not_checked",
        details: "System verification status unknown",
      },
      {
        id: "security_patch",
        name: "Security Patch Level",
        description: "Checks the security patch level",
        status: "not_checked",
        details: "Security patch level unknown",
      },
      {
        id: "encryption_status",
        name: "Encryption Status",
        description: "Checks if device encryption is enabled",
        status: "not_checked",
        details: "Encryption status unknown",
      },
      {
        id: "developer_options",
        name: "Developer Options",
        description: "Checks if developer options are enabled",
        status: "not_checked",
        details: "Developer options status unknown",
      },
    ])
  }, [])

  // Run security analysis
  const runAnalysis = async () => {
    if (!device || connectionState !== "connected" || deviceMode !== "adb") {
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Reset checks to "checking" status
    setSecurityChecks((prev) =>
      prev.map((check) => ({
        ...check,
        status: "checking",
      })),
    )

    try {
      // Get device properties
      const propsResult = await executeCommand("shell getprop")
      const propsMap: Record<string, string> = {}

      propsResult.split("\n").forEach((line) => {
        const match = line.match(/\[(.*?)\]: \[(.*?)\]/)
        if (match) {
          propsMap[match[1]] = match[2]
        }
      })

      setDeviceProps(propsMap)
      setAnalysisProgress(20)

      // Update security checks based on device properties
      const updatedChecks = [...securityChecks]

      // 1. USB Debugging (already enabled since we're connected)
      updateCheck(updatedChecks, "usb_debugging", {
        status: "warning",
        details: "USB debugging is enabled on this device",
        recommendation: "Disable USB debugging when not needed for development",
      })
      setAnalysisProgress(30)

      // 2. ADB Root Access
      try {
        const rootResult = await executeCommand("shell su -c id")
        const hasRoot = rootResult.includes("uid=0")
        updateCheck(updatedChecks, "adb_root", {
          status: hasRoot ? "failed" : "passed",
          details: hasRoot ? "ADB has root access on this device" : "ADB does not have root access",
          recommendation: hasRoot ? "Revoke root access when not needed" : undefined,
        })
      } catch (error) {
        updateCheck(updatedChecks, "adb_root", {
          status: "passed",
          details: "ADB does not have root access",
        })
      }
      setAnalysisProgress(40)

      // 3. Bootloader Status
      const bootloaderUnlocked = propsMap["ro.boot.flash.locked"] === "0" || propsMap["ro.bootloader.unlocked"] === "1"
      updateCheck(updatedChecks, "bootloader_status", {
        status: bootloaderUnlocked ? "warning" : "passed",
        details: bootloaderUnlocked ? "Bootloader is unlocked" : "Bootloader is locked",
        recommendation: bootloaderUnlocked
          ? "An unlocked bootloader allows flashing custom firmware which may compromise security"
          : undefined,
      })
      setAnalysisProgress(50)

      // 4. SELinux Status
      try {
        const selinuxResult = await executeCommand("shell getenforce")
        const selinuxEnforcing = selinuxResult.trim() === "Enforcing"
        updateCheck(updatedChecks, "selinux_status", {
          status: selinuxEnforcing ? "passed" : "failed",
          details: `SELinux is in ${selinuxResult.trim()} mode`,
          recommendation: !selinuxEnforcing ? "SELinux should be set to Enforcing for proper security" : undefined,
        })
      } catch (error) {
        updateCheck(updatedChecks, "selinux_status", {
          status: "info",
          details: "Could not determine SELinux status",
        })
      }
      setAnalysisProgress(60)

      // 5. System Verification
      const verificationEnabled = propsMap["ro.boot.verifiedboot"] === "1" || propsMap["ro.boot.flash.locked"] === "1"
      updateCheck(updatedChecks, "system_verification", {
        status: verificationEnabled ? "passed" : "warning",
        details: verificationEnabled
          ? "System verification is enabled"
          : "System verification is disabled or not supported",
        recommendation: !verificationEnabled
          ? "System verification helps ensure only trusted software runs on the device"
          : undefined,
      })
      setAnalysisProgress(70)

      // 6. Security Patch Level
      const securityPatch = propsMap["ro.build.version.security_patch"] || "Unknown"
      const patchDate = new Date(securityPatch)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const isRecent = !isNaN(patchDate.getTime()) && patchDate > sixMonthsAgo

      updateCheck(updatedChecks, "security_patch", {
        status: isRecent ? "passed" : "warning",
        details: `Security patch level: ${securityPatch}`,
        recommendation: !isRecent ? "Device has not received security updates in over 6 months" : undefined,
      })
      setAnalysisProgress(80)

      // 7. Encryption Status
      try {
        const encryptionResult = await executeCommand("shell getprop ro.crypto.state")
        const isEncrypted = encryptionResult.trim() === "encrypted"
        updateCheck(updatedChecks, "encryption_status", {
          status: isEncrypted ? "passed" : "failed",
          details: isEncrypted ? "Device storage is encrypted" : "Device storage is not encrypted",
          recommendation: !isEncrypted ? "Enable device encryption to protect your data" : undefined,
        })
      } catch (error) {
        updateCheck(updatedChecks, "encryption_status", {
          status: "info",
          details: "Could not determine encryption status",
        })
      }
      setAnalysisProgress(90)

      // 8. Developer Options
      try {
        const developerResult = await executeCommand("shell settings get global development_settings_enabled")
        const developerEnabled = developerResult.trim() === "1"
        updateCheck(updatedChecks, "developer_options", {
          status: developerEnabled ? "warning" : "passed",
          details: developerEnabled ? "Developer options are enabled" : "Developer options are disabled",
          recommendation: developerEnabled ? "Disable developer options when not needed for development" : undefined,
        })
      } catch (error) {
        updateCheck(updatedChecks, "developer_options", {
          status: "info",
          details: "Could not determine developer options status",
        })
      }
      setAnalysisProgress(100)

      // Check for known vulnerabilities based on device info
      checkKnownVulnerabilities(propsMap)

      // Update all checks
      setSecurityChecks(updatedChecks)
    } catch (error) {
      console.error("Error during security analysis:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Helper function to update a specific check
  const updateCheck = (checks: SecurityCheck[], id: string, updates: Partial<SecurityCheck>) => {
    const index = checks.findIndex((check) => check.id === id)
    if (index !== -1) {
      checks[index] = { ...checks[index], ...updates }
    }
  }

  // Check for known vulnerabilities based on device info
  const checkKnownVulnerabilities = (props: Record<string, string>) => {
    const androidVersion = props["ro.build.version.release"] || ""
    const securityPatch = props["ro.build.version.security_patch"] || ""
    const manufacturer = props["ro.product.manufacturer"] || ""
    const model = props["ro.product.model"] || ""

    // This is a simplified example - in a real implementation, you would check against a database of known vulnerabilities
    const vulnerabilities: VulnerabilityInfo[] = []

    // Example vulnerability checks (for demonstration purposes)
    if (androidVersion && Number.parseInt(androidVersion.split(".")[0]) < 10) {
      vulnerabilities.push({
        id: "CVE-2019-2215",
        name: "Binder Use-After-Free Vulnerability",
        severity: "high",
        description:
          "A use-after-free vulnerability in the Android Binder component that can lead to local privilege escalation",
        affected: "Android 9 and below with security patches before October 2019",
        mitigation: "Update to Android 10 or install the latest security patches",
        references: ["https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-2215"],
      })
    }

    if (securityPatch && new Date(securityPatch) < new Date("2020-01-01")) {
      vulnerabilities.push({
        id: "CVE-2020-0022",
        name: "BlueFrag Bluetooth Vulnerability",
        severity: "high",
        description:
          "A vulnerability in the Android Bluetooth implementation that allows remote code execution without user interaction",
        affected: "Android 8.0 to 9.0 with security patches before February 2020",
        mitigation: "Install the latest security patches or disable Bluetooth when not in use",
        references: ["https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-0022"],
      })
    }

    // Add more vulnerability checks as needed

    setKnownVulnerabilities(vulnerabilities)
  }

  // Export security report as JSON
  const exportReport = () => {
    const report = {
      device: {
        manufacturer: deviceInfo?.model || device?.manufacturerName || "Unknown",
        model: deviceInfo?.model || device?.productName || "Unknown",
        serial: deviceInfo?.serial || device?.serialNumber || "Unknown",
        androidVersion: deviceProps["ro.build.version.release"] || "Unknown",
        securityPatch: deviceProps["ro.build.version.security_patch"] || "Unknown",
      },
      securityChecks,
      vulnerabilities: knownVulnerabilities,
      analysisDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(report, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `security-report-${new Date().toISOString()}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Get status icon for security check
  const getStatusIcon = (status: SecurityCheck["status"]) => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
      case "passed":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "info":
        return <Info className="h-4 w-4 text-blue-400" />
      default:
        return <Shield className="h-4 w-4 text-gray-400" />
    }
  }

  // Get severity badge for vulnerability
  const getSeverityBadge = (severity: VulnerabilityInfo["severity"]) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-600">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-600">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-600">Medium</Badge>
      case "low":
        return <Badge className="bg-blue-600">Low</Badge>
      case "info":
        return <Badge className="bg-gray-600">Info</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Android Security Analyzer
        </CardTitle>
        <CardDescription>Analyze device security settings and vulnerabilities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!device || connectionState !== "connected" ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Device Not Connected</AlertTitle>
            <AlertDescription>Connect an Android device in ADB mode to perform security analysis.</AlertDescription>
          </Alert>
        ) : deviceMode !== "adb" ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Incompatible Mode</AlertTitle>
            <AlertDescription>
              Security analysis requires the device to be in ADB mode. Current mode: {deviceMode.toUpperCase()}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Button onClick={runAnalysis} disabled={isAnalyzing} className="flex items-center gap-2">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Run Security Analysis
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={exportReport}
                disabled={isAnalyzing || securityChecks.every((check) => check.status === "not_checked")}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analysis progress</span>
                  <span>{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            )}

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="checks">Security Checks</TabsTrigger>
                <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                <TabsTrigger value="device">Device Info</TabsTrigger>
              </TabsList>

              <TabsContent value="checks" className="space-y-4 mt-4">
                <div className="space-y-2">
                  {securityChecks.map((check) => (
                    <div
                      key={check.id}
                      className={`p-3 rounded-md border ${
                        check.status === "passed"
                          ? "bg-green-900/10 border-green-800"
                          : check.status === "warning"
                            ? "bg-yellow-900/10 border-yellow-800"
                            : check.status === "failed"
                              ? "bg-red-900/10 border-red-800"
                              : check.status === "info"
                                ? "bg-blue-900/10 border-blue-800"
                                : "bg-gray-800 border-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(check.status)}
                          <span className="font-medium">{check.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            check.status === "passed"
                              ? "border-green-500"
                              : check.status === "warning"
                                ? "border-yellow-500"
                                : check.status === "failed"
                                  ? "border-red-500"
                                  : "border-gray-500"
                          }
                        >
                          {check.status === "checking"
                            ? "Checking..."
                            : check.status === "not_checked"
                              ? "Not Checked"
                              : check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{check.description}</p>
                      {check.status !== "not_checked" && check.status !== "checking" && (
                        <div className="mt-2 text-sm">
                          <p>{check.details}</p>
                          {check.recommendation && (
                            <p className="mt-1 text-yellow-400">
                              <span className="font-medium">Recommendation:</span> {check.recommendation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="vulnerabilities" className="space-y-4 mt-4">
                {knownVulnerabilities.length === 0 ? (
                  <div className="p-4 bg-gray-800 rounded-md text-center">
                    {securityChecks.every((check) => check.status === "not_checked") ? (
                      <p className="text-gray-400">Run a security analysis to check for vulnerabilities</p>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-8 w-8 text-green-400" />
                        <p className="text-green-400 font-medium">No known vulnerabilities detected</p>
                        <p className="text-sm text-gray-400">
                          Based on the device information, no known vulnerabilities were found
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert variant="destructive" className="bg-red-900/30 border-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Vulnerabilities Detected</AlertTitle>
                      <AlertDescription>
                        {knownVulnerabilities.length} potential{" "}
                        {knownVulnerabilities.length === 1 ? "vulnerability" : "vulnerabilities"} found on this device
                      </AlertDescription>
                    </Alert>

                    {knownVulnerabilities.map((vuln) => (
                      <div key={vuln.id} className="p-4 bg-red-900/10 border border-red-800 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <span className="font-medium">{vuln.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getSeverityBadge(vuln.severity)}
                            <Badge variant="outline" className="font-mono text-xs">
                              {vuln.id}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm mb-2">{vuln.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400">
                              <span className="font-medium">Affected:</span> {vuln.affected}
                            </p>
                          </div>
                          <div>
                            <p className="text-yellow-400">
                              <span className="font-medium">Mitigation:</span> {vuln.mitigation}
                            </p>
                          </div>
                        </div>
                        {vuln.references.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-red-800/50 text-xs">
                            <p className="font-medium mb-1">References:</p>
                            <ul className="list-disc pl-5 space-y-1 text-blue-400">
                              {vuln.references.map((ref, index) => (
                                <li key={index}>
                                  <a href={ref} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {ref}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="device" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Device Information</h3>
                    <div className="bg-gray-900 rounded-md p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Manufacturer:</span>
                        <span className="text-sm">{deviceInfo?.model || device?.manufacturerName || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Model:</span>
                        <span className="text-sm">{deviceInfo?.model || device?.productName || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Serial:</span>
                        <span className="text-sm">{deviceInfo?.serial || device?.serialNumber || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Android Version:</span>
                        <span className="text-sm">{deviceProps["ro.build.version.release"] || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Security Patch:</span>
                        <span className="text-sm">{deviceProps["ro.build.version.security_patch"] || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Build Fingerprint:</span>
                        <span className="text-sm truncate">{deviceProps["ro.build.fingerprint"] || "Unknown"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Hardware Information</h3>
                    <div className="bg-gray-900 rounded-md p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">CPU Architecture:</span>
                        <span className="text-sm">{deviceProps["ro.product.cpu.abi"] || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Board:</span>
                        <span className="text-sm">{deviceProps["ro.product.board"] || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Kernel Version:</span>
                        <span className="text-sm truncate">{deviceProps["ro.kernel.version"] || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Bootloader:</span>
                        <span className="text-sm">{deviceProps["ro.bootloader"] || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Build Type:</span>
                        <span className="text-sm">{deviceProps["ro.build.type"] || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Build Tags:</span>
                        <span className="text-sm">{deviceProps["ro.build.tags"] || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Run Custom Property Query
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter property name (e.g., ro.secure)"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm"
                      id="property-query"
                    />
                    <Button
                      onClick={async () => {
                        const input = document.getElementById("property-query") as HTMLInputElement
                        if (input.value && device && connectionState === "connected") {
                          try {
                            const result = await executeCommand(`shell getprop ${input.value}`)
                            alert(`${input.value} = ${result.trim()}`)
                          } catch (error) {
                            alert(`Error: ${error}`)
                          }
                        }
                      }}
                    >
                      Query
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}

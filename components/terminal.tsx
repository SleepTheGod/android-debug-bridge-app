"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useDeviceConnection } from "@/hooks/use-device-connection"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, RotateCw, AlertCircle, TerminalIcon, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function Terminal() {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([
    "Welcome to Android Web Debugger Terminal",
    "Connect a device to get started...",
    "",
  ])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const {
    device,
    executeCommand,
    isSupported,
    deviceMode,
    connectionState,
    errorMessage,
    resetConnection,
    bypassPermissionCheck,
    retryConnection,
    isWaitingForPermission,
  } = useDeviceConnection()
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  // Update terminal when device mode or connection state changes
  useEffect(() => {
    // Check if we're in a preview environment or non-secure context
    const checkPreviewMode = async () => {
      const isSecureContext = window.isSecureContext !== false

      if (!isSecureContext) {
        setHistory((prev) => [
          ...prev,
          "WARNING: This application is running in a non-secure context.",
          "WebUSB requires HTTPS to function properly.",
          "Please deploy this application to a secure HTTPS environment for full functionality.",
          "",
        ])
        return
      }

      if (!navigator.usb) return

      try {
        await navigator.usb.getDevices()
      } catch (error) {
        if (
          error instanceof DOMException &&
          (error.message.includes("permissions policy") ||
            error.message.includes("Access to the feature") ||
            error.message.includes("disallowed by permissions"))
        ) {
          setHistory((prev) => [
            ...prev,
            "WARNING: WebUSB access is blocked by permissions policy.",
            "This is common in preview environments or when Content-Security-Policy restrictions are in place.",
            "For full functionality, please deploy this application to a proper HTTPS environment.",
            "",
            "You can still explore the interface and documentation in preview mode.",
            "Type 'help' to see available commands.",
            "",
          ])
        }
      }
    }

    checkPreviewMode()

    if (device && deviceMode && connectionState === "connected") {
      setHistory((prev) => [
        ...prev,
        `Device connected in ${deviceMode.toUpperCase()} mode`,
        `Type 'help' for available commands`,
        "",
      ])
    } else if (connectionState === "error" && errorMessage) {
      setHistory((prev) => [
        ...prev,
        `Connection error: ${errorMessage}`,
        "Troubleshooting tips:",
        "1. Make sure USB debugging is enabled on your device",
        "2. Disconnect and reconnect your USB cable",
        "3. Check for permission prompts on your device",
        "4. Try using a different USB port or cable",
        "5. Restart your device and browser",
        "6. Type 'advanced-connection' to use our enhanced connection tool",
        "",
        "Need help enabling USB debugging? Type 'guide' or visit the USB debugging guide.",
        "",
      ])
    } else if (connectionState === "waiting_permission") {
      setHistory((prev) => [
        ...prev,
        "Waiting for USB debugging permission...",
        "Please check your Android device for a permission prompt and tap 'Allow'.",
        "Make sure your device is unlocked and the screen is on.",
        "You can check 'Always allow from this computer' for convenience.",
        "",
      ])
    }
  }, [device, deviceMode, connectionState, errorMessage])

  // Add command completion for common commands
  const completeCommand = (currentInput: string): string => {
    // ADB command completion
    if (deviceMode === "adb") {
      if (currentInput === "s") return "shell "
      if (currentInput === "sh") return "shell "
      if (currentInput === "she") return "shell "
      if (currentInput === "shel") return "shell "
      if (currentInput === "shell") return "shell "
      if (currentInput === "r") return "reboot "
      if (currentInput === "re") return "reboot "
      if (currentInput === "reb") return "reboot "
      if (currentInput === "rebo") return "reboot "
      if (currentInput === "reboo") return "reboot "
      if (currentInput === "reboot") return "reboot "
      if (currentInput === "reboot ") return "reboot bootloader"
      if (currentInput === "reboot b") return "reboot bootloader"
      if (currentInput === "reboot r") return "reboot recovery"
      if (currentInput === "reboot s") return "reboot sideload"
      if (currentInput === "shell g") return "shell getprop"
      if (currentInput === "shell p") return "shell pm list packages"
      if (currentInput === "shell d") return "shell dumpsys "
      if (currentInput === "shell s") return "shell settings "
    }

    // Fastboot command completion
    if (deviceMode === "fastboot") {
      if (currentInput === "g") return "getvar "
      if (currentInput === "ge") return "getvar "
      if (currentInput === "get") return "getvar "
      if (currentInput === "getv") return "getvar "
      if (currentInput === "getva") return "getvar "
      if (currentInput === "getvar") return "getvar "
      if (currentInput === "getvar ") return "getvar all"
      if (currentInput === "f") return "flash "
      if (currentInput === "fl") return "flash "
      if (currentInput === "fla") return "flash "
      if (currentInput === "flas") return "flash "
      if (currentInput === "flash") return "flash "
      if (currentInput === "r") return "reboot"
      if (currentInput === "re") return "reboot"
      if (currentInput === "reb") return "reboot"
      if (currentInput === "rebo") return "reboot"
      if (currentInput === "reboo") return "reboot"
      if (currentInput === "reboot") return "reboot"
      if (currentInput === "o") return "oem "
      if (currentInput === "oe") return "oem "
      if (currentInput === "oem") return "oem "
      if (currentInput === "oem ") return "oem device-info"
      if (currentInput === "oem d") return "oem device-info"
      if (currentInput === "oem u") return "oem unlock"
      if (currentInput === "oem l") return "oem lock"
    }

    return currentInput
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const trimmedInput = input.trim()

    // Add command to history
    setHistory((prev) => [...prev, `$ ${trimmedInput}`])

    // Add to command history for up/down navigation
    setCommandHistory((prev) => {
      const newHistory = [...prev]
      // Don't add duplicates in a row
      if (newHistory.length === 0 || newHistory[newHistory.length - 1] !== trimmedInput) {
        newHistory.push(trimmedInput)
      }
      return newHistory
    })
    setHistoryIndex(-1)
    setLastError(null)

    // Handle special commands that don't require a device
    if (trimmedInput === "guide") {
      setHistory((prev) => [
        ...prev,
        "Opening USB debugging guide...",
        "You can also access the guide at any time by clicking the link in the device selector.",
        "",
      ])
      // Open the guide in a new tab
      window.open("/usb-debugging-guide", "_blank")
      setInput("")
      return
    } else if (trimmedInput === "fastboot-guide") {
      setHistory((prev) => [
        ...prev,
        "Opening fastboot mode guide...",
        "Learn how to boot your device into fastboot mode with device-specific instructions.",
        "",
      ])
      // Open the fastboot guide in a new tab
      window.open("/fastboot-mode-guide", "_blank")
      setInput("")
      return
    } else if (trimmedInput === "advanced-connection") {
      setHistory((prev) => [
        ...prev,
        "Opening advanced connection tool...",
        "This tool provides enhanced connection capabilities with automatic troubleshooting.",
        "",
      ])
      // Open the advanced connection tool in a new tab
      window.open("/advanced-connection", "_blank")
      setInput("")
      return
    } else if (trimmedInput === "clear") {
      setHistory(["Terminal cleared", ""])
      setInput("")
      return
    } else if (trimmedInput === "reset-connection" && device) {
      setHistory((prev) => [...prev, "Resetting USB connection...", ""])
      try {
        await resetConnection()
        setHistory((prev) => [...prev, "USB connection reset successful. Try reconnecting your device.", ""])
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        setHistory((prev) => [...prev, `Error: ${errorMessage}`, ""])
        setLastError(errorMessage)
      }
      setInput("")
      return
    } else if (trimmedInput === "retry-connection") {
      setHistory((prev) => [...prev, "Retrying connection...", ""])
      try {
        await retryConnection()
        setHistory((prev) => [...prev, "Connection retry initiated.", ""])
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        setHistory((prev) => [...prev, `Error: ${errorMessage}`, ""])
        setLastError(errorMessage)
      }
      setInput("")
      return
    } else if (trimmedInput === "bypass-permission") {
      setHistory((prev) => [...prev, "Attempting to use previously authorized device...", ""])
      try {
        const result = await bypassPermissionCheck()
        if (result) {
          setHistory((prev) => [...prev, "Successfully connected to previously authorized device.", ""])
        } else {
          setHistory((prev) => [
            ...prev,
            "No previously authorized device found or connection failed.",
            "Please connect your device using the standard method.",
            "",
          ])
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        setHistory((prev) => [...prev, `Error: ${errorMessage}`, ""])
        setLastError(errorMessage)
      }
      setInput("")
      return
    }

    if (device) {
      setIsExecuting(true)

      // Set a timeout to prevent the UI from getting stuck if a command takes too long
      const timeoutId = setTimeout(() => {
        setIsExecuting(false)
        setLastError("Command execution timed out. The operation may still be running in the background.")
      }, 30000) // 30 second timeout

      try {
        // Handle special commands
        if (trimmedInput === "help") {
          if (deviceMode === "adb") {
            setHistory((prev) => [
              ...prev,
              "Available ADB commands:",
              "  devices - List connected devices",
              "  shell <command> - Run shell command on device",
              "  shell getprop - Get device properties",
              "  shell pm list packages - List installed packages",
              "  shell dumpsys battery - Get battery information",
              "  shell settings list global - List global settings",
              "  shell ls <path> - List directory contents",
              "  reboot - Reboot device to system",
              "  reboot bootloader - Reboot to bootloader",
              "  reboot recovery - Reboot to recovery",
              "  reboot sideload - Reboot to sideload mode",
              "  reset-connection - Reset USB connection if stuck",
              "  retry-connection - Retry connection if permission was denied",
              "  clear - Clear terminal",
              "",
              "Guides and Tools:",
              "  guide - Open USB debugging guide",
              "  fastboot-guide - Open fastboot mode guide",
              "  advanced-connection - Open advanced connection tool",
              "",
            ])
          } else if (deviceMode === "fastboot") {
            setHistory((prev) => [
              ...prev,
              "Available Fastboot commands:",
              "  devices - List connected devices",
              "  getvar <var> - Get device variable",
              "  getvar all - Get all device variables",
              "  flash <partition> - Flash partition (not fully implemented)",
              "  erase <partition> - Erase partition",
              "  reboot - Reboot device to system",
              "  reboot-bootloader - Reboot back to bootloader",
              "  continue - Continue boot process",
              "  oem device-info - Get device info",
              "  oem unlock - Unlock bootloader (if allowed)",
              "  oem lock - Lock bootloader",
              "  reset-connection - Reset USB connection if stuck",
              "  retry-connection - Retry connection if permission was denied",
              "  clear - Clear terminal",
              "",
              "Guides and Tools:",
              "  guide - Open USB debugging guide",
              "  fastboot-guide - Open fastboot mode guide",
              "  advanced-connection - Open advanced connection tool",
              "",
            ])
          } else if (deviceMode === "recovery") {
            setHistory((prev) => [
              ...prev,
              "Available Recovery commands:",
              "  devices - List connected devices",
              "  sideload <file> - Sideload OTA package (not fully implemented)",
              "  reboot - Reboot device to system",
              "  reboot bootloader - Reboot to bootloader",
              "  reset-connection - Reset USB connection if stuck",
              "  retry-connection - Retry connection if permission was denied",
              "  clear - Clear terminal",
              "",
              "Guides and Tools:",
              "  guide - Open USB debugging guide",
              "  fastboot-guide - Open fastboot mode guide",
              "  advanced-connection - Open advanced connection tool",
              "",
            ])
          } else {
            setHistory((prev) => [...prev, "Unknown device mode. Please reconnect.", ""])
          }
        } else {
          try {
            const result = await executeCommand(trimmedInput)
            setHistory((prev) => [...prev, result, ""])
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            setHistory((prev) => [...prev, `Error: ${errorMessage}`, ""])
            setLastError(errorMessage)
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        setHistory((prev) => [...prev, `Error: ${errorMessage}`, ""])
        setLastError(errorMessage)
      } finally {
        clearTimeout(timeoutId)
        setIsExecuting(false)
      }
    } else {
      setHistory((prev) => [
        ...prev,
        "No device connected. Please connect a device first.",
        "Type 'advanced-connection' to use our enhanced connection tool.",
        "",
      ])
    }

    setInput("")
  }

  // Handle up/down arrow for command history
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      // Command completion
      const completed = completeCommand(input)
      if (completed !== input) {
        setInput(completed)
      }
    }
  }

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  // Focus input when terminal is clicked
  const focusInput = () => {
    inputRef.current?.focus()
  }

  // Clear terminal
  const clearTerminal = () => {
    setHistory(["Terminal cleared", ""])
    setLastError(null)
  }

  // Format terminal output with colors
  const formatOutput = (line: string) => {
    // Color command lines
    if (line.startsWith("$ ")) {
      return <span className="text-green-400">{line}</span>
    }

    // Color errors
    if (line.startsWith("Error:")) {
      return <span className="text-red-400">{line}</span>
    }

    // Color warnings
    if (line.includes("WARNING") || line.includes("warning")) {
      return <span className="text-yellow-400">{line}</span>
    }

    // Color success messages
    if (line.includes("Success") || line.includes("success") || line.includes("OKAY") || line.includes("Finished")) {
      return <span className="text-green-400">{line}</span>
    }

    // Color device connection messages
    if (line.includes("Device connected")) {
      return <span className="text-blue-400">{line}</span>
    }

    // Color permission messages
    if (line.includes("permission") || line.includes("Permission")) {
      return <span className="text-yellow-400">{line}</span>
    }

    return line
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="bg-gray-800 px-4 py-2 text-sm font-mono border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4" />
          <span>Terminal {deviceMode !== "unknown" ? `(${deviceMode.toUpperCase()})` : ""}</span>
        </div>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearTerminal}>
                  <RotateCw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear terminal</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div ref={terminalRef} className="flex-1 p-4 font-mono text-sm overflow-y-auto bg-black" onClick={focusInput}>
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {formatOutput(line)}
          </div>
        ))}
        {isExecuting && <div className="text-yellow-400 animate-pulse">Executing command...</div>}
        {isWaitingForPermission && (
          <Alert className="mt-2 bg-blue-900/30 border-blue-800 animate-pulse">
            <Info className="h-4 w-4" />
            <AlertTitle>Waiting for Permission</AlertTitle>
            <AlertDescription>
              Please check your Android device for a USB debugging permission prompt and tap "Allow".
            </AlertDescription>
          </Alert>
        )}
      </div>
      {lastError && (
        <div className="bg-red-900/30 border-t border-red-800 px-4 py-2 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <span className="text-red-300">{lastError}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="border-t border-gray-700 p-2 flex">
        <span className="text-green-400 mr-2 font-mono">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none font-mono"
          placeholder={device ? `Enter ${deviceMode} command...` : "Connect a device first..."}
          disabled={isExecuting || isWaitingForPermission}
          autoComplete="off"
        />
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400"
            onClick={() => {
              if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1
                setHistoryIndex(newIndex)
                setInput(commandHistory[commandHistory.length - 1 - newIndex])
              }
            }}
            disabled={commandHistory.length === 0 || historyIndex >= commandHistory.length - 1}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400"
            onClick={() => {
              if (historyIndex > 0) {
                const newIndex = historyIndex - 1
                setHistoryIndex(newIndex)
                setInput(commandHistory[commandHistory.length - 1 - newIndex])
              } else if (historyIndex === 0) {
                setHistoryIndex(-1)
                setInput("")
              }
            }}
            disabled={historyIndex <= -1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

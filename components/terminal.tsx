"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAdbDevice } from "@/hooks/use-adb-device"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, RotateCw } from "lucide-react"

export function Terminal() {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([
    "Welcome to Android Web Debugger Terminal",
    "Connect a device to get started...",
    "",
  ])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const { device, executeCommand, isSupported } = useAdbDevice()
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add command to history
    setHistory((prev) => [...prev, `$ ${input}`])

    // Add to command history for up/down navigation
    setCommandHistory((prev) => {
      const newHistory = [...prev]
      // Don't add duplicates in a row
      if (newHistory[newHistory.length - 1] !== input) {
        newHistory.push(input)
      }
      return newHistory
    })
    setHistoryIndex(-1)

    if (device) {
      setIsExecuting(true)
      try {
        const result = await executeCommand(input)
        setHistory((prev) => [...prev, result, ""])
      } catch (error) {
        setHistory((prev) => [...prev, `Error: ${error instanceof Error ? error.message : String(error)}`, ""])
      } finally {
        setIsExecuting(false)
      }
    } else {
      setHistory((prev) => [...prev, "No device connected. Please connect a device first.", ""])
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
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="bg-gray-800 px-4 py-2 text-sm font-mono border-b border-gray-700 flex justify-between items-center">
        <span>Terminal</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearTerminal} title="Clear terminal">
            <RotateCw className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div ref={terminalRef} className="flex-1 p-4 font-mono text-sm overflow-y-auto bg-black" onClick={focusInput}>
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        {isExecuting && <div className="text-yellow-400 animate-pulse">Executing command...</div>}
      </div>
      <form onSubmit={handleSubmit} className="border-t border-gray-700 p-2 flex">
        <span className="text-green-400 mr-2 font-mono">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none font-mono"
          placeholder={device ? "Enter ADB command..." : "Connect a device first..."}
          disabled={!device || !isSupported}
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


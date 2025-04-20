"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDeviceConnection } from "@/hooks/use-device-connection"
import {
  FolderOpen,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  FileText,
  AlertCircle,
  HardDrive,
  FileUp,
  FileDown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function FileOperations() {
  const { device, deviceMode, executeCommand } = useDeviceConnection()
  const [currentPath, setCurrentPath] = useState("/sdcard")
  const [fileList, setFileList] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localFilePath, setLocalFilePath] = useState("")
  const [remoteFilePath, setRemoteFilePath] = useState("")

  // List files in current directory
  const listFiles = async () => {
    if (!device || deviceMode !== "adb") {
      setError("Device not connected in ADB mode")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const result = await executeCommand(`shell ls -la "${currentPath}"`)
      const files = result
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const parts = line.trim().split(/\s+/)
          return parts[parts.length - 1]
        })
      setFileList(files)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to list files")
    } finally {
      setIsLoading(false)
    }
  }

  // Navigate to a directory
  const navigateTo = async (path: string) => {
    setCurrentPath(path)
    await listFiles()
  }

  // Go up one directory
  const goUp = async () => {
    const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/"
    await navigateTo(parentPath)
  }

  // Pull file from device
  const pullFile = async () => {
    if (!device || deviceMode !== "adb" || !selectedFile) {
      setError("Device not connected in ADB mode or no file selected")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // In a real implementation, this would use the WebUSB API to transfer the file
      // For this demo, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert(`File would be downloaded: ${currentPath}/${selectedFile}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to pull file")
    } finally {
      setIsLoading(false)
    }
  }

  // Push file to device
  const pushFile = async () => {
    if (!device || deviceMode !== "adb") {
      setError("Device not connected in ADB mode")
      return
    }

    if (!localFilePath || !remoteFilePath) {
      setError("Please specify both local and remote file paths")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // In a real implementation, this would use the WebUSB API to transfer the file
      // For this demo, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert(`File would be uploaded from ${localFilePath} to ${remoteFilePath}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to push file")
    } finally {
      setIsLoading(false)
    }
  }

  // Delete file on device
  const deleteFile = async () => {
    if (!device || deviceMode !== "adb" || !selectedFile) {
      setError("Device not connected in ADB mode or no file selected")
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedFile}?`)) {
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      await executeCommand(`shell rm "${currentPath}/${selectedFile}"`)
      await listFiles()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete file")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file selection
  const selectFile = (file: string) => {
    setSelectedFile(file === selectedFile ? null : file)
  }

  // Initialize by listing files when component mounts or device changes
  React.useEffect(() => {
    if (device && deviceMode === "adb") {
      listFiles()
    }
  }, [device, deviceMode])

  return (
    <div className="h-[500px] flex flex-col">
      {!device || deviceMode !== "adb" ? (
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-400">Connect a device in ADB mode to use file operations</p>
        </div>
      ) : (
        <Tabs defaultValue="browse" className="w-full h-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="browse">Browse Files</TabsTrigger>
            <TabsTrigger value="transfer">File Transfer</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={goUp} disabled={isLoading}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Up
              </Button>
              <Input value={currentPath} onChange={(e) => setCurrentPath(e.target.value)} className="flex-1" />
              <Button variant="outline" size="sm" onClick={listFiles} disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto border border-gray-800 rounded-md bg-gray-950">
              {fileList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <HardDrive className="h-8 w-8 mb-2" />
                  <p>No files found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {fileList.map((file, index) => (
                    <div
                      key={index}
                      className={`p-2 flex items-center hover:bg-gray-800 cursor-pointer ${
                        selectedFile === file ? "bg-gray-800" : ""
                      }`}
                      onClick={() => selectFile(file)}
                    >
                      {file.endsWith("/") ? (
                        <FolderOpen className="h-4 w-4 mr-2 text-yellow-400" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2 text-blue-400" />
                      )}
                      <span className="truncate">{file}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedFile && navigateTo(`${currentPath}/${selectedFile}`)}
                disabled={!selectedFile || !selectedFile.endsWith("/") || isLoading}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Open
              </Button>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pullFile}
                  disabled={!selectedFile || selectedFile.endsWith("/") || isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Pull
                </Button>
                <Button variant="destructive" size="sm" onClick={deleteFile} disabled={!selectedFile || isLoading}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transfer" className="h-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File Transfer</CardTitle>
                <CardDescription>Transfer files between your computer and device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    Push File to Device
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-xs text-gray-400">Local File</label>
                      <div className="flex gap-2">
                        <Input
                          value={localFilePath}
                          onChange={(e) => setLocalFilePath(e.target.value)}
                          placeholder="Local file path"
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          Browse
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setLocalFilePath(e.target.files[0].name)
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Remote Path</label>
                      <Input
                        value={remoteFilePath}
                        onChange={(e) => setRemoteFilePath(e.target.value)}
                        placeholder="/sdcard/Download/file.txt"
                      />
                    </div>
                    <Button
                      onClick={pushFile}
                      disabled={!localFilePath || !remoteFilePath || isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Push to Device
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    Pull File from Device
                  </h3>
                  <p className="text-xs text-gray-400">
                    Use the file browser tab to select and pull files from your device.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

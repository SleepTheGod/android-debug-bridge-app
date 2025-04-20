import { Terminal } from "@/components/terminal"
import { DeviceSelector } from "@/components/device-selector"
import { AdbInfo } from "@/components/adb-info"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileOperations } from "@/components/file-operations"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 bg-gray-950 text-gray-100">
      <h1 className="text-2xl font-bold mb-6">Android Web Debugger</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <AdbInfo />
          <DeviceSelector />
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="terminal" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="terminal">Terminal</TabsTrigger>
              <TabsTrigger value="files">File Operations</TabsTrigger>
            </TabsList>
            <TabsContent value="terminal" className="bg-black rounded-lg border border-gray-800 overflow-hidden">
              <Terminal />
            </TabsContent>
            <TabsContent value="files" className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden p-4">
              <FileOperations />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-400">
        <p className="text-yellow-500 mb-2">
          Warning: Modifying device firmware can void warranty and brick your device. Use at your own risk.
        </p>
        <p>This tool requires a compatible browser with WebUSB support and appropriate permissions.</p>
        <p>For full ADB functionality, consider using the native Android Debug Bridge tool.</p>
        <p className="mt-2">
          <Link href="/usb-debugging-guide" className="text-blue-400 hover:text-blue-300">
            Having trouble connecting? View our USB debugging setup guide →
          </Link>
        </p>
      </div>
    </main>
  )
}

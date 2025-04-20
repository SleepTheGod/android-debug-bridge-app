import { Terminal } from "@/components/terminal"
import { DeviceSelector } from "@/components/device-selector"
import { AdbInfo } from "@/components/adb-info"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 bg-gray-950 text-gray-100">
      <h1 className="text-2xl font-bold mb-6">Android Web Debugger</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <AdbInfo />
          <DeviceSelector />
        </div>

        <div className="bg-black rounded-lg border border-gray-800 overflow-hidden">
          <Terminal />
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-400">
        <p>Note: This tool requires a compatible browser with WebUSB support and appropriate permissions.</p>
        <p>For full ADB functionality, consider using the native Android Debug Bridge tool.</p>
      </div>
    </main>
  )
}


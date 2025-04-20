import { Terminal } from "@/components/terminal"
import { DeviceSelector } from "@/components/device-selector"
import { AdbInfo } from "@/components/adb-info"
import { PreviewModeNotice } from "@/components/preview-mode-notice"
import Link from "next/link"
import { Shield, Zap, FileText, Smartphone, TerminalIcon, Activity } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 bg-gray-950 text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Android Web Debugger</h1>
        <p className="text-gray-400 mt-1">Connect to and debug Android devices directly from your browser</p>
      </div>

      <PreviewModeNotice />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <DeviceSelector />
        <Terminal />
        <AdbInfo />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link href="/usb-debugging-guide" className="group">
          <div className="bg-gray-900 hover:bg-gray-800 transition-colors rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-900/50 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold group-hover:text-blue-400 transition-colors">USB Debugging Guide</h2>
            </div>
            <p className="text-gray-400">Learn how to enable USB debugging on different Android devices</p>
          </div>
        </Link>

        <Link href="/fastboot-mode-guide" className="group">
          <div className="bg-gray-900 hover:bg-gray-800 transition-colors rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-900/50 p-3 rounded-full">
                <Smartphone className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-xl font-bold group-hover:text-green-400 transition-colors">Fastboot Mode Guide</h2>
            </div>
            <p className="text-gray-400">
              Learn how to boot your device into fastboot mode with device-specific instructions
            </p>
          </div>
        </Link>

        <Link href="/enhanced-connection" className="group">
          <div className="bg-gray-900 hover:bg-gray-800 transition-colors rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-900/50 p-3 rounded-full">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold group-hover:text-purple-400 transition-colors">Enhanced Connection</h2>
            </div>
            <p className="text-gray-400">
              Use our advanced connection tool with improved error handling and diagnostics
            </p>
          </div>
        </Link>

        <Link href="/connection-tester" className="group">
          <div className="bg-gray-900 hover:bg-gray-800 transition-colors rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-900/50 p-3 rounded-full">
                <TerminalIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold group-hover:text-yellow-400 transition-colors">Connection Tester</h2>
            </div>
            <p className="text-gray-400">Test USB connection flow with various Android devices and scenarios</p>
          </div>
        </Link>

        <Link href="/permission-guide" className="group">
          <div className="bg-gray-900 hover:bg-gray-800 transition-colors rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-900/50 p-3 rounded-full">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-xl font-bold group-hover:text-red-400 transition-colors">Permission Guide</h2>
            </div>
            <p className="text-gray-400">
              View device-specific USB debugging permission prompts and how to accept them
            </p>
          </div>
        </Link>

        <Link href="/advanced-security" className="group">
          <div className="bg-gray-900 hover:bg-gray-800 transition-colors rounded-lg border border-gray-800 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <div className="bg-blue-600 text-xs font-bold px-2 py-1 rounded-bl-md">NEW</div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-900/50 p-3 rounded-full">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold group-hover:text-blue-400 transition-colors">Advanced Security</h2>
            </div>
            <p className="text-gray-400">Analyze device security settings and monitor ADB protocol communication</p>
          </div>
        </Link>
      </div>

      <footer className="text-center text-gray-500 text-sm mt-auto pt-8">
        <p>Android Web Debugger - For educational and research purposes only</p>
        <p className="mt-1">
          This tool respects Android's security model and requires explicit user permission for all operations
        </p>
      </footer>
    </main>
  )
}

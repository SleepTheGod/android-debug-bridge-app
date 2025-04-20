import { ConnectionTester } from "@/components/connection-tester"
import { TestingGuide } from "@/app/connection-tester/testing-guide"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Smartphone, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConnectionTesterPage() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 bg-gray-950 text-gray-100">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Connection Flow Tester</h1>
        <p className="text-gray-400 mt-1">
          Test USB connection flow with various Android devices to ensure smooth permission handling
        </p>
      </div>

      <Alert variant="destructive" className="mb-6 bg-yellow-900/30 border-yellow-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Testing Tool</AlertTitle>
        <AlertDescription>
          This tool helps you test the connection flow with real or simulated Android devices. It's designed to verify
          that permission handling works correctly across different device types and Android versions.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="tester" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="tester">Connection Tester</TabsTrigger>
          <TabsTrigger value="guide">Testing Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="tester">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <ConnectionTester />
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                  Testing Instructions
                </h2>
                <div className="space-y-4 text-sm">
                  <p>
                    This testing tool allows you to verify the connection flow with both real and simulated Android
                    devices. Here's how to use it:
                  </p>

                  <div>
                    <h3 className="font-medium mb-2">Real Device Testing:</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Connect your Android device via USB</li>
                      <li>Make sure USB debugging is enabled in Developer Options</li>
                      <li>Click "Test Real Device Connection"</li>
                      <li>Watch for permission prompts on your device</li>
                      <li>Check the logs to see how the connection flow progresses</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Simulated Testing:</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Select a device profile that matches your target device</li>
                      <li>Choose a test scenario to simulate</li>
                      <li>Click "Run Simulation" to start the test</li>
                      <li>Watch the connection steps and logs</li>
                      <li>Review the test results to understand how the app handles different scenarios</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <h2 className="text-lg font-bold mb-3">Related Resources</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <Link href="/permission-guide" className="text-blue-400 hover:text-blue-300">
                      Device-Specific Permission Guide →
                    </Link>
                    <p className="text-gray-400 mt-1">
                      Learn what permission prompts look like on different Android devices
                    </p>
                  </div>

                  <div>
                    <Link href="/usb-debugging-guide" className="text-blue-400 hover:text-blue-300">
                      USB Debugging Setup Guide →
                    </Link>
                    <p className="text-gray-400 mt-1">
                      Step-by-step instructions for enabling USB debugging on various devices
                    </p>
                  </div>

                  <div>
                    <Link href="/advanced-connection" className="text-blue-400 hover:text-blue-300">
                      Advanced Connection Tool →
                    </Link>
                    <p className="text-gray-400 mt-1">
                      Enhanced connection tool with automatic troubleshooting and diagnostics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="guide">
          <TestingGuide />
        </TabsContent>
      </Tabs>
    </main>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

export function TestingGuide() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Connection Testing Guide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Testing with Real Devices</h3>
          <p className="text-sm text-gray-400">
            Testing with real Android devices is the most accurate way to verify the connection flow. Here's a
            step-by-step guide:
          </p>

          <div className="space-y-2 mt-4">
            <div className="flex items-start gap-2">
              <div className="bg-blue-900/50 text-blue-300 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-medium">Prepare Your Device</h4>
                <ul className="list-disc pl-5 text-sm text-gray-400 mt-1">
                  <li>Enable Developer Options (tap Build Number 7 times in About Phone)</li>
                  <li>Enable USB Debugging in Developer Options</li>
                  <li>Make sure your device is unlocked</li>
                  <li>Connect your device with a data-capable USB cable</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="bg-blue-900/50 text-blue-300 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-medium">Test Initial Connection</h4>
                <ul className="list-disc pl-5 text-sm text-gray-400 mt-1">
                  <li>Click "Test Real Device Connection" in the tester</li>
                  <li>Watch for the device selection dialog in your browser</li>
                  <li>Select your device from the list</li>
                  <li>Check your Android device for the permission prompt</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="bg-blue-900/50 text-blue-300 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-medium">Test Permission Handling</h4>
                <ul className="list-disc pl-5 text-sm text-gray-400 mt-1">
                  <li>Try accepting the permission prompt (check "Always allow" for convenience)</li>
                  <li>Try denying the permission prompt to see error handling</li>
                  <li>Try waiting a few seconds before responding to test timeout handling</li>
                  <li>Reset USB debugging authorizations and try again</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="bg-blue-900/50 text-blue-300 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="font-medium">Test Edge Cases</h4>
                <ul className="list-disc pl-5 text-sm text-gray-400 mt-1">
                  <li>Disconnect the USB cable during connection</li>
                  <li>Lock your device screen during connection</li>
                  <li>Try connecting in different boot modes (normal, recovery, fastboot)</li>
                  <li>Try with different USB ports and cables</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Device-Specific Behaviors</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Different Android devices handle USB debugging permissions differently:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <span className="font-medium">Google Pixel:</span> Clean, stock Android permission dialog
              </li>
              <li>
                <span className="font-medium">Samsung:</span> May show Knox security prompts and require additional
                steps
              </li>
              <li>
                <span className="font-medium">Xiaomi:</span> MIUI security app may intercept or block permissions
              </li>
              <li>
                <span className="font-medium">OnePlus:</span> Similar to stock but may require USB mode selection first
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Testing with Simulations</h3>
          <p className="text-sm text-gray-400">
            The simulation mode lets you test different scenarios without real devices. Use it to verify how the app
            handles various connection flows:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-800 p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <h4 className="font-medium">Normal Connection</h4>
              </div>
              <p className="text-sm text-gray-400">
                Tests the standard flow where the user grants permission immediately. Verifies that the app correctly
                handles successful connections.
              </p>
            </div>

            <div className="bg-gray-800 p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <h4 className="font-medium">Permission Denied</h4>
              </div>
              <p className="text-sm text-gray-400">
                Tests what happens when the user denies the permission prompt. Verifies error handling and recovery
                options.
              </p>
            </div>

            <div className="bg-gray-800 p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-blue-400" />
                <h4 className="font-medium">Delayed Permission</h4>
              </div>
              <p className="text-sm text-gray-400">
                Tests what happens when the user takes time before granting permission. Verifies timeout handling and
                retry logic.
              </p>
            </div>

            <div className="bg-gray-800 p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <h4 className="font-medium">Connection Lost</h4>
              </div>
              <p className="text-sm text-gray-400">
                Tests what happens when the connection is lost during the process. Verifies recovery mechanisms and
                error messages.
              </p>
            </div>
          </div>
        </div>

        <Alert variant="destructive" className="bg-yellow-900/30 border-yellow-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Testing Recommendations</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
              <li>Test with at least one device from each major manufacturer if possible</li>
              <li>Test with both older (Android 8-10) and newer (Android 11+) versions</li>
              <li>Test with devices that have custom ROMs or security enhancements</li>
              <li>Test in both normal and incognito/private browsing modes</li>
              <li>Test after browser updates, as WebUSB implementation may change</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

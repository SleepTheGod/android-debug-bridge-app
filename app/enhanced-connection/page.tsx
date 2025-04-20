import { EnhancedDeviceConnector } from "@/components/enhanced-device-connector"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EnhancedConnectionPage() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 bg-gray-950 text-gray-100">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Enhanced USB Connection</h1>
        <p className="text-gray-400 mt-1">Improved connection system with advanced error handling and diagnostics</p>
      </div>

      <Alert className="mb-6 bg-blue-900/30 border-blue-800">
        <Info className="h-4 w-4" />
        <AlertTitle>Educational & Debugging Tool</AlertTitle>
        <AlertDescription>
          This enhanced connection tool is designed for educational and debugging purposes. It provides better error
          handling, diagnostics, and user guidance to help you understand and troubleshoot USB connection issues.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <EnhancedDeviceConnector />
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              About This Tool
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                This enhanced connection tool provides a more robust and user-friendly experience when connecting to
                Android devices through WebUSB. It includes:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-medium">Improved Error Handling:</span> More detailed error messages and
                  troubleshooting guidance
                </li>
                <li>
                  <span className="font-medium">Connection Diagnostics:</span> Step-by-step analysis of the connection
                  process to identify issues
                </li>
                <li>
                  <span className="font-medium">Automatic Retry Logic:</span> Intelligent retry mechanisms for transient
                  errors
                </li>
                <li>
                  <span className="font-medium">Permission Check Timer:</span> Automatically checks for permission
                  status changes
                </li>
                <li>
                  <span className="font-medium">Device State Recovery:</span> Ability to reset and recover from
                  problematic device states
                </li>
              </ul>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="font-medium mb-2">Important Notes:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-400">
                  <li>
                    This tool still requires USB debugging to be enabled on your device and proper authorization through
                    the Android permission system
                  </li>
                  <li>All connections respect Android's security model and required permission flows</li>
                  <li>
                    For security reasons, WebUSB connections always require explicit user permission on the Android
                    device
                  </li>
                  <li>This tool is intended for legitimate debugging and development purposes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-400">
        <p>For technical questions or support, please refer to the documentation or contact the development team.</p>
        <div className="mt-2 space-y-1">
          <p>
            <Link href="/usb-debugging-guide" className="text-blue-400 hover:text-blue-300">
              Having trouble with USB debugging? View our detailed setup guide →
            </Link>
          </p>
          <p>
            <Link href="/permission-guide" className="text-blue-400 hover:text-blue-300">
              Need help with USB permissions? View our device-specific permission guide →
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

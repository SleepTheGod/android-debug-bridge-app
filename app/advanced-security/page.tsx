import { ProtocolAnalyzer } from "@/components/protocol-analyzer"
import { SecurityAnalyzer } from "@/components/security-analyzer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, AlertTriangle, Activity } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdvancedSecurityPage() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 bg-gray-950 text-gray-100">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Advanced Security Analysis</h1>
        <p className="text-gray-400 mt-1">Analyze device security settings and monitor ADB protocol communication</p>
      </div>

      <Alert className="mb-6 bg-yellow-900/30 border-yellow-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Educational Tool</AlertTitle>
        <AlertDescription>
          This tool is designed for educational and research purposes only. It helps security researchers understand
          Android's security model and communication protocols. All analysis is performed within the bounds of Android's
          security permissions system.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-8">
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              About This Tool
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                This advanced security analysis toolkit provides researchers and developers with powerful capabilities
                for understanding Android device security and ADB protocol communication:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-medium">Security Analysis:</span> Comprehensive assessment of device security
                  settings and configurations
                </li>
                <li>
                  <span className="font-medium">Vulnerability Detection:</span> Identification of known security
                  vulnerabilities based on device information
                </li>
                <li>
                  <span className="font-medium">Protocol Monitoring:</span> Real-time capture and analysis of ADB
                  protocol communication
                </li>
                <li>
                  <span className="font-medium">Detailed Device Information:</span> In-depth hardware and software
                  configuration details
                </li>
              </ul>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="font-medium mb-2">Important Notes:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-400">
                  <li>
                    All analysis is performed using the standard Android Debug Bridge (ADB) protocol and respects
                    Android's security model
                  </li>
                  <li>
                    USB debugging must be enabled on the device, and the user must explicitly grant permission for the
                    connection
                  </li>
                  <li>
                    This tool does not exploit vulnerabilities or bypass security measures - it only detects and reports
                    them
                  </li>
                  <li>
                    The protocol analyzer simulates packet capture for educational purposes - in a production
                    environment, it would capture actual USB traffic
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <SecurityAnalyzer />
        </div>

        <div className="space-y-6">
          <ProtocolAnalyzer />

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              Technical References
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                For those interested in learning more about Android security and the ADB protocol, the following
                resources provide valuable technical information:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-blue-400">
                <li>
                  <a
                    href="https://source.android.com/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Android Security Architecture
                  </a>
                </li>
                <li>
                  <a
                    href="https://developer.android.com/studio/command-line/adb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Android Debug Bridge Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://android.googlesource.com/platform/system/core/+/master/adb/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    ADB Source Code
                  </a>
                </li>
                <li>
                  <a
                    href="https://source.android.com/security/bulletin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Android Security Bulletins
                  </a>
                </li>
              </ul>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <h3 className="font-medium mb-2">Protocol Documentation:</h3>
                <p className="text-gray-400 mb-2">
                  The ADB protocol uses a simple message format with a 24-byte header followed by an optional data
                  payload:
                </p>
                <div className="font-mono text-xs bg-black p-3 rounded-md">
                  <div className="grid grid-cols-6 gap-1 text-center mb-1">
                    <div className="bg-blue-900/30 p-1 rounded">Command</div>
                    <div className="bg-green-900/30 p-1 rounded">Arg0</div>
                    <div className="bg-green-900/30 p-1 rounded">Arg1</div>
                    <div className="bg-yellow-900/30 p-1 rounded">Length</div>
                    <div className="bg-yellow-900/30 p-1 rounded">~Length</div>
                    <div className="bg-red-900/30 p-1 rounded">Checksum</div>
                  </div>
                  <div className="grid grid-cols-6 gap-1 text-center text-gray-400">
                    <div className="p-1">4 bytes</div>
                    <div className="p-1">4 bytes</div>
                    <div className="p-1">4 bytes</div>
                    <div className="p-1">4 bytes</div>
                    <div className="p-1">4 bytes</div>
                    <div className="p-1">4 bytes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        <p>
          This tool is provided for educational and research purposes only. Always obtain proper authorization before
          analyzing any device.
        </p>
      </div>
    </main>
  )
}

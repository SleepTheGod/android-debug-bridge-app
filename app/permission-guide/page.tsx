import { PermissionGuide } from "@/components/permission-guide"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PermissionGuidePage() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 bg-gray-950 text-gray-100">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">USB Debugging Permission Guide</h1>
        <p className="text-gray-400 mt-1">
          Learn what to expect when connecting different Android devices and how to handle permission prompts
        </p>
      </div>

      <PermissionGuide />

      <div className="mt-8 text-sm text-gray-400">
        <p>
          Note: The exact appearance of permission prompts may vary slightly depending on your device manufacturer and
          Android version. If you're still having trouble, consult your device's documentation or search for specific
          instructions for your device model.
        </p>
        <div className="mt-2 space-y-1">
          <p>
            <Link href="/usb-debugging-guide" className="text-blue-400 hover:text-blue-300">
              Need to enable USB debugging? View our USB debugging setup guide →
            </Link>
          </p>
          <p>
            <Link href="/connection-tester" className="text-blue-400 hover:text-blue-300">
              Want to test connection flows? Try our connection tester →
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

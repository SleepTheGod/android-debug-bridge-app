import { FastbootModeGuide } from "@/components/fastboot-mode-guide"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function FastbootModeGuidePage() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 bg-gray-950 text-gray-100">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Fastboot Mode Setup Guide</h1>
        <p className="text-gray-400 mt-1">
          Follow these step-by-step instructions to boot your Android device into fastboot mode
        </p>
      </div>

      <FastbootModeGuide />

      <div className="mt-8 text-sm text-gray-400">
        <p>
          Note: The exact steps may vary slightly depending on your device manufacturer and model. If you're still
          having trouble, consult your device's documentation or search for specific instructions for your device model.
        </p>
      </div>
    </main>
  )
}

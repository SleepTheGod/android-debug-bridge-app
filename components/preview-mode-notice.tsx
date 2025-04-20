"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, ExternalLink, Info } from "lucide-react"
import Link from "next/link"

export function PreviewModeNotice() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          Preview Mode Limitations
        </CardTitle>
        <CardDescription>Some features are restricted in preview environments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-yellow-900/30 border-yellow-800">
          <Info className="h-4 w-4" />
          <AlertTitle>WebUSB Access Restricted</AlertTitle>
          <AlertDescription>
            WebUSB functionality is restricted by browser security policies in preview environments. The error "Access
            to the feature 'usb' is disallowed by permissions policy" indicates that the current environment doesn't
            allow WebUSB access. To use the full features of this application, you need to deploy it to a secure HTTPS
            environment.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Requirements for WebUSB:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
            <li>Secure context (HTTPS)</li>
            <li>Proper deployment (not in preview mode)</li>
            <li>User-initiated actions</li>
            <li>Compatible browser (Chrome, Edge, Opera)</li>
            <li>Appropriate permissions policy</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">What you can still do:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
            <li>Explore the user interface</li>
            <li>View the documentation and guides</li>
            <li>Learn about ADB and Fastboot commands</li>
            <li>Check out the USB debugging and fastboot guides</li>
          </ul>
        </div>

        <div className="pt-2 border-t border-gray-700">
          <h3 className="text-sm font-medium mb-2">Learn More:</h3>
          <div className="space-y-2">
            <Link
              href="https://developer.mozilla.org/en-US/docs/Web/API/USB"
              target="_blank"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
            >
              WebUSB API Documentation
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="https://developer.chrome.com/articles/usb/"
              target="_blank"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
            >
              Chrome WebUSB Guide
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="https://caniuse.com/webusb"
              target="_blank"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
            >
              Browser Compatibility
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Smartphone, AlertTriangle } from "lucide-react"
import Image from "next/image"

export function PermissionGuide() {
  const [selectedDevice, setSelectedDevice] = useState("pixel")

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          USB Debugging Permission Guide
        </CardTitle>
        <CardDescription>Learn what to expect when connecting different Android devices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/30 border-blue-800">
          <Info className="h-4 w-4" />
          <AlertTitle>Permission Required</AlertTitle>
          <AlertDescription>
            When connecting to an Android device, you'll need to grant USB debugging permission on the device itself.
            This guide shows what to expect on different devices.
          </AlertDescription>
        </Alert>

        <Tabs value={selectedDevice} onValueChange={setSelectedDevice} className="w-full">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="pixel">Google</TabsTrigger>
            <TabsTrigger value="samsung">Samsung</TabsTrigger>
            <TabsTrigger value="xiaomi">Xiaomi</TabsTrigger>
            <TabsTrigger value="oneplus">OnePlus</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value="pixel" className="mt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full max-w-[300px] h-[500px] rounded-lg overflow-hidden border-2 border-gray-700 mx-auto">
                <Image
                  src="/permission-pixel.png"
                  alt="Google Pixel USB debugging permission dialog"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium">Google Pixel Devices</h3>
                <p>
                  On Google Pixel devices running stock Android, you'll see a simple permission dialog like the one
                  shown. Here's what to expect:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Dialog Location:</span> The permission prompt appears as a popup
                    dialog in the center of the screen
                  </li>
                  <li>
                    <span className="font-medium">Computer Identifier:</span> Shows the RSA key fingerprint of the
                    computer
                  </li>
                  <li>
                    <span className="font-medium">Always Allow Option:</span> Check "Always allow from this computer" to
                    avoid seeing this prompt again
                  </li>
                  <li>
                    <span className="font-medium">Response Time:</span> The dialog appears almost immediately after
                    connection
                  </li>
                </ul>
                <Alert variant="destructive" className="mt-4 bg-yellow-900/30 border-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important Note</AlertTitle>
                  <AlertDescription>
                    Make sure your device is unlocked when connecting. The permission dialog won't appear if your device
                    is locked with a PIN, pattern, or fingerprint.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="samsung" className="mt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full max-w-[300px] h-[500px] rounded-lg overflow-hidden border-2 border-gray-700 mx-auto">
                <Image
                  src="/permission-samsung.png"
                  alt="Samsung Galaxy USB debugging permission dialog"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium">Samsung Galaxy Devices</h3>
                <p>Samsung devices with One UI have a slightly different permission flow. Here's what to expect:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Dialog Location:</span> The permission appears as a notification at
                    the top of the screen, which expands to a full dialog
                  </li>
                  <li>
                    <span className="font-medium">Knox Security:</span> Samsung devices may show additional Knox
                    security prompts
                  </li>
                  <li>
                    <span className="font-medium">Multiple Prompts:</span> You might need to accept multiple prompts for
                    full access
                  </li>
                  <li>
                    <span className="font-medium">USB Mode:</span> Make sure your USB connection mode is set to "File
                    Transfer" (MTP) first
                  </li>
                </ul>
                <Alert variant="destructive" className="mt-4 bg-yellow-900/30 border-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Samsung-Specific Issues</AlertTitle>
                  <AlertDescription>
                    If you don't see the permission prompt, try going to Settings → Developer options → Revoke USB
                    debugging authorizations, then reconnect your device.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="xiaomi" className="mt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full max-w-[300px] h-[500px] rounded-lg overflow-hidden border-2 border-gray-700 mx-auto">
                <Image
                  src="/permission-xiaomi.png"
                  alt="Xiaomi MIUI USB debugging permission dialog"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium">Xiaomi Devices (MIUI)</h3>
                <p>Xiaomi devices running MIUI have additional security layers. Here's what to expect:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Dialog Location:</span> The permission appears as a floating dialog,
                    but may be hidden behind a notification
                  </li>
                  <li>
                    <span className="font-medium">Security App:</span> MIUI's security app may block the connection
                    initially
                  </li>
                  <li>
                    <span className="font-medium">Developer Options:</span> You may need to enable additional options in
                    Developer Settings
                  </li>
                  <li>
                    <span className="font-medium">USB Mode:</span> Try changing between different USB modes if the
                    prompt doesn't appear
                  </li>
                </ul>
                <Alert variant="destructive" className="mt-4 bg-yellow-900/30 border-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>MIUI Security</AlertTitle>
                  <AlertDescription>
                    MIUI has aggressive security features. If you don't see the prompt, check the notification shade for
                    security alerts or go to Security app → Permissions → USB debugging.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="oneplus" className="mt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full max-w-[300px] h-[500px] rounded-lg overflow-hidden border-2 border-gray-700 mx-auto">
                <Image
                  src="/permission-oneplus.png"
                  alt="OnePlus OxygenOS USB debugging permission dialog"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium">OnePlus Devices (OxygenOS)</h3>
                <p>
                  OnePlus devices with OxygenOS have a permission flow similar to stock Android but with some
                  differences:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Dialog Location:</span> The permission appears as a popup dialog
                    similar to stock Android
                  </li>
                  <li>
                    <span className="font-medium">Response Time:</span> The dialog may take a few seconds to appear
                    after connection
                  </li>
                  <li>
                    <span className="font-medium">USB Preferences:</span> You may need to tap the USB preferences
                    notification first
                  </li>
                  <li>
                    <span className="font-medium">OxygenOS Version:</span> Newer versions of OxygenOS (based on ColorOS)
                    may have different behavior
                  </li>
                </ul>
                <Alert className="mt-4 bg-blue-900/30 border-blue-800">
                  <Info className="h-4 w-4" />
                  <AlertTitle>OnePlus Tip</AlertTitle>
                  <AlertDescription>
                    OnePlus devices often have a "USB Configuration" option in the notification shade when connected.
                    Make sure to select "File Transfer" mode before attempting to connect.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="other" className="mt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full max-w-[300px] h-[500px] rounded-lg overflow-hidden border-2 border-gray-700 mx-auto">
                <Image
                  src="/permission-generic.png"
                  alt="Generic Android USB debugging permission dialog"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium">Other Android Devices</h3>
                <p>
                  Other Android devices and custom ROMs generally follow a similar pattern, but may have unique
                  behaviors:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Dialog Variations:</span> The permission dialog may look different
                    depending on the manufacturer's UI
                  </li>
                  <li>
                    <span className="font-medium">Custom ROMs:</span> Custom ROMs like LineageOS generally follow stock
                    Android behavior
                  </li>
                  <li>
                    <span className="font-medium">Manufacturer Additions:</span> Some manufacturers add extra security
                    layers or confirmations
                  </li>
                  <li>
                    <span className="font-medium">Notification Area:</span> Always check the notification area if you
                    don't see a prompt
                  </li>
                </ul>
                <Alert className="mt-4 bg-blue-900/30 border-blue-800">
                  <Info className="h-4 w-4" />
                  <AlertTitle>General Troubleshooting</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      <li>Make sure USB debugging is enabled in Developer Options</li>
                      <li>Try different USB cables and ports</li>
                      <li>Restart your device and browser</li>
                      <li>Reset USB debugging authorizations in Developer Options</li>
                      <li>Try changing USB connection mode (MTP, PTP, etc.)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-4 bg-gray-900 rounded-md">
          <h3 className="text-sm font-medium mb-2">Common Permission Issues</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-400">Permission Not Appearing:</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>Device is locked with PIN/pattern</li>
                <li>USB debugging not properly enabled</li>
                <li>USB cable is power-only (no data)</li>
                <li>Wrong USB connection mode selected</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-400">Permission Keeps Reappearing:</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>"Always allow" not checked</li>
                <li>RSA key mismatch (browser changed)</li>
                <li>USB debugging authorizations reset</li>
                <li>Different USB port used</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

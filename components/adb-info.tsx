"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoIcon, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function AdbInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InfoIcon className="h-5 w-5" />
          ADB Web Interface
        </CardTitle>
        <CardDescription>Debug your Android device through the browser</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p>This tool allows you to run a subset of ADB commands directly from your browser using WebUSB.</p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="setup">
            <AccordionTrigger className="text-sm font-medium py-2">Setup Instructions</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Enable Developer Options on your Android device:
                  <ul className="list-disc pl-5 mt-1 text-xs text-gray-400">
                    <li>Go to Settings → About Phone</li>
                    <li>Tap "Build Number" 7 times</li>
                  </ul>
                </li>
                <li>
                  Enable USB Debugging:
                  <ul className="list-disc pl-5 mt-1 text-xs text-gray-400">
                    <li>Go to Settings → Developer Options</li>
                    <li>Enable "USB Debugging"</li>
                  </ul>
                </li>
                <li>Connect your device via USB cable</li>
                <li>Click "Connect Device" and select your device</li>
                <li>Accept the USB debugging prompt on your device</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="commands">
            <AccordionTrigger className="text-sm font-medium py-2">Useful Commands</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div>
                  <p className="font-medium">Basic Commands:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <code>devices</code> - List connected devices
                    </li>
                    <li>
                      <code>shell pm list packages</code> - List installed packages
                    </li>
                    <li>
                      <code>shell getprop ro.build.version.release</code> - Get Android version
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium">System Information:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <code>shell dumpsys battery</code> - Battery information
                    </li>
                    <li>
                      <code>shell settings list global</code> - Global settings
                    </li>
                    <li>
                      <code>shell id</code> - Current user/group info
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium">File System:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <code>shell ls /sdcard</code> - List files on storage
                    </li>
                    <li>
                      <code>shell ls /system</code> - List system files
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="troubleshooting">
            <AccordionTrigger className="text-sm font-medium py-2">Troubleshooting</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="font-medium">Device not detected:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Make sure USB debugging is enabled</li>
                  <li>Try a different USB cable</li>
                  <li>Restart your device and browser</li>
                  <li>Check if your device appears in Chrome's device manager</li>
                </ul>

                <p className="font-medium">Connection issues:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Accept the USB debugging prompt on your device</li>
                  <li>Try disconnecting and reconnecting</li>
                  <li>Make sure you're using Chrome or Edge browser</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="https://developer.android.com/studio/command-line/adb"
            target="_blank"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
          >
            ADB Documentation
            <ExternalLink className="h-3 w-3" />
          </Link>

          <Link
            href="https://developer.android.com/studio/debug/dev-options"
            target="_blank"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
          >
            Developer Options Guide
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}


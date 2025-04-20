"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoIcon, ExternalLink, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AdbInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InfoIcon className="h-5 w-5" />
          Android Debug Bridge
        </CardTitle>
        <CardDescription>Debug and modify Android devices in any boot mode</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Alert variant="destructive" className="bg-red-900/30 border-red-800 text-red-100">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning: Firmware Modification</AlertTitle>
          <AlertDescription>
            Modifying device firmware can void warranty, brick your device, or cause data loss. Proceed at your own
            risk.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="adb" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="adb">ADB Mode</TabsTrigger>
            <TabsTrigger value="fastboot">Fastboot Mode</TabsTrigger>
            <TabsTrigger value="recovery">Recovery Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="adb" className="space-y-4 mt-2">
            <p>
              Android Debug Bridge (ADB) allows you to communicate with your device when it's booted into the normal
              Android system. Use it to access the shell, transfer files, and install apps.
            </p>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="adb-setup">
                <AccordionTrigger className="text-sm font-medium py-2">ADB Setup Instructions</AccordionTrigger>
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

              <AccordionItem value="webusb-permissions">
                <AccordionTrigger className="text-sm font-medium py-2">WebUSB Permissions Guide</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>
                      WebUSB requires explicit permission to access your device. Here's how to ensure proper access:
                    </p>

                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        When you click "Connect Device", your browser will show a device selection dialog
                        <ul className="list-disc pl-5 mt-1 text-xs text-gray-400">
                          <li>Select your device from the list</li>
                          <li>If your device doesn't appear, check USB debugging is enabled</li>
                        </ul>
                      </li>
                      <li>
                        After selecting your device, check your phone screen
                        <ul className="list-disc pl-5 mt-1 text-xs text-gray-400">
                          <li>A prompt asking "Allow USB debugging?" should appear</li>
                          <li>Check "Always allow from this computer" for convenience</li>
                          <li>Tap "Allow" to grant permission</li>
                        </ul>
                      </li>
                      <li>
                        If you get "Access denied" errors:
                        <ul className="list-disc pl-5 mt-1 text-xs text-gray-400">
                          <li>Disconnect and reconnect your device</li>
                          <li>Go to chrome://settings/content/usbDevices to reset permissions</li>
                          <li>Try a different USB cable or port</li>
                          <li>Restart your device and browser</li>
                        </ul>
                      </li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="adb-commands">
                <AccordionTrigger className="text-sm font-medium py-2">Useful ADB Commands</AccordionTrigger>
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
                          <code>shell getprop</code> - All system properties
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">App Management:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>shell pm uninstall -k --user 0 &lt;package&gt;</code> - Remove bloatware
                        </li>
                        <li>
                          <code>shell pm disable-user --user 0 &lt;package&gt;</code> - Disable app
                        </li>
                        <li>
                          <code>install -r &lt;apk&gt;</code> - Install/replace APK
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">Reboot Commands:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>reboot</code> - Reboot device
                        </li>
                        <li>
                          <code>reboot bootloader</code> - Reboot to bootloader/fastboot
                        </li>
                        <li>
                          <code>reboot recovery</code> - Reboot to recovery mode
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">Advanced Commands:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>shell su</code> - Get root access (if available)
                        </li>
                        <li>
                          <code>shell wm density &lt;dpi&gt;</code> - Change display density
                        </li>
                        <li>
                          <code>shell settings put global development_settings_enabled 1</code> - Enable developer
                          options
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="adb-firmware">
                <AccordionTrigger className="text-sm font-medium py-2">Firmware Modification</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p className="text-yellow-400 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      These commands can permanently damage your device if used incorrectly.
                    </p>

                    <div>
                      <p className="font-medium">System Partition Commands:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>shell mount -o rw,remount /system</code> - Remount system as writable
                        </li>
                        <li>
                          <code>shell mount -o ro,remount /system</code> - Remount system as read-only
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">Boot Image Commands:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>pull /dev/block/bootdevice/by-name/boot boot.img</code> - Backup boot image
                        </li>
                        <li>
                          <code>reboot bootloader</code> - Reboot to bootloader to flash modified boot image
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="fastboot" className="space-y-4 mt-2">
            <p>
              Fastboot mode allows you to modify the file system images from a computer over a USB connection. This mode
              is available on devices with an unlocked bootloader.
            </p>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="fastboot-setup">
                <AccordionTrigger className="text-sm font-medium py-2">Fastboot Setup Instructions</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Boot your device into fastboot mode:
                      <ul className="list-disc pl-5 mt-1 text-xs text-gray-400">
                        <li>Power off your device</li>
                        <li>Hold the volume down + power button (varies by device)</li>
                        <li>
                          Or use <code>adb reboot bootloader</code> if already in ADB mode
                        </li>
                      </ul>
                    </li>
                    <li>Connect your device via USB cable</li>
                    <li>Click "Connect Device" and select your device</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fastboot-commands">
                <AccordionTrigger className="text-sm font-medium py-2">Useful Fastboot Commands</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">Basic Commands:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>devices</code> - List connected devices
                        </li>
                        <li>
                          <code>getvar all</code> - Get all device variables
                        </li>
                        <li>
                          <code>getvar product</code> - Get product name
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">Boot Commands:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>reboot</code> - Reboot to system
                        </li>
                        <li>
                          <code>continue</code> - Continue boot process
                        </li>
                        <li>
                          <code>reboot-bootloader</code> - Reboot back to bootloader
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">Device Info:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>oem device-info</code> - Show device info
                        </li>
                        <li>
                          <code>oem unlock</code> - Unlock bootloader (if allowed)
                        </li>
                        <li>
                          <code>oem lock</code> - Lock bootloader
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fastboot-firmware">
                <AccordionTrigger className="text-sm font-medium py-2">Firmware Flashing</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p className="text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      These commands can permanently brick your device if used incorrectly.
                    </p>

                    <div>
                      <p className="font-medium">Partition Commands:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>flash &lt;partition&gt; &lt;filename&gt;</code> - Flash partition
                        </li>
                        <li>
                          <code>erase &lt;partition&gt;</code> - Erase partition
                        </li>
                        <li>
                          <code>flash:raw boot &lt;kernel&gt;</code> - Flash kernel directly
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">Common Partitions:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>boot</code> - Kernel and ramdisk
                        </li>
                        <li>
                          <code>system</code> - Main Android OS
                        </li>
                        <li>
                          <code>recovery</code> - Recovery partition
                        </li>
                        <li>
                          <code>vendor</code> - Vendor-specific files
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">Full ROM Flashing:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>update &lt;zip_file&gt;</code> - Flash full update package
                        </li>
                        <li>
                          <code>flash:raw &lt;bootloader&gt;</code> - Flash bootloader
                        </li>
                        <li>
                          <code>flash:raw radio &lt;radio_img&gt;</code> - Flash radio/modem
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="recovery" className="space-y-4 mt-2">
            <p>
              Recovery mode provides a minimal environment for performing system maintenance operations. It's used for
              installing system updates, factory resets, and custom ROMs.
            </p>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="recovery-setup">
                <AccordionTrigger className="text-sm font-medium py-2">Recovery Mode Instructions</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Boot your device into recovery mode:
                      <ul className="list-disc pl-5 mt-1 text-xs text-gray-400">
                        <li>Power off your device</li>
                        <li>Hold volume up + power button (varies by device)</li>
                        <li>
                          Or use <code>adb reboot recovery</code> if already in ADB mode
                        </li>
                      </ul>
                    </li>
                    <li>Connect your device via USB cable</li>
                    <li>Click "Connect Device" and select your device</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="recovery-commands">
                <AccordionTrigger className="text-sm font-medium py-2">Recovery Mode Operations</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">ADB Sideload:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>sideload &lt;update.zip&gt;</code> - Install OTA package
                        </li>
                        <li>
                          <code>sideload-auto-reboot &lt;update.zip&gt;</code> - Install and reboot
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">Custom Recovery (TWRP):</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <code>shell twrp backup</code> - Create backup
                        </li>
                        <li>
                          <code>shell twrp restore</code> - Restore backup
                        </li>
                        <li>
                          <code>shell twrp wipe factory</code> - Factory reset
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="custom-rom">
                <AccordionTrigger className="text-sm font-medium py-2">Custom ROM Installation</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p className="text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Installing custom ROMs will void your warranty and may cause data loss.
                    </p>

                    <div>
                      <p className="font-medium">Preparation:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Unlock bootloader (via fastboot)</li>
                        <li>Install custom recovery (TWRP)</li>
                        <li>Backup all data</li>
                        <li>Boot to recovery mode</li>
                      </ol>
                    </div>

                    <div>
                      <p className="font-medium">Installation Steps:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Wipe data/factory reset</li>
                        <li>Wipe system, cache, and dalvik</li>
                        <li>Sideload or install ROM zip</li>
                        <li>Install GApps (if needed)</li>
                        <li>Install Magisk (for root)</li>
                        <li>Reboot system</li>
                      </ol>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>

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
            href="https://android.gadgethacks.com/how-to/complete-guide-flashing-factory-images-android-using-fastboot-0175277/"
            target="_blank"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
          >
            Fastboot Guide
            <ExternalLink className="h-3 w-3" />
          </Link>

          <Link
            href="https://www.xda-developers.com/"
            target="_blank"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
          >
            XDA Developers Forum
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

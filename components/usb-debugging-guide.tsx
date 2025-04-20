"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Smartphone, Info } from "lucide-react"
import Image from "next/image"

interface StepProps {
  title: string
  description: string
  image: string
  imageAlt: string
}

const Step = ({ title, description, image, imageAlt }: StepProps) => (
  <div className="flex flex-col items-center">
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <div className="relative w-full max-w-[300px] h-[500px] mb-4 rounded-lg overflow-hidden border-2 border-gray-700">
      <Image
        src={image || "/placeholder.svg"}
        alt={imageAlt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 300px"
      />
    </div>
    <p className="text-sm text-gray-300">{description}</p>
  </div>
)

export function UsbDebuggingGuide() {
  const [currentStep, setCurrentStep] = useState(1)

  // Define steps for each Android version
  const android12Steps = [
    {
      title: "Step 1: Open Settings",
      description: "Open the Settings app on your Android device.",
      image: "/android-12-settings.png",
      imageAlt: "Android 12 Settings app",
    },
    {
      title: "Step 2: About Phone",
      description: "Scroll down and tap on 'About phone' or 'About device'.",
      image: "/android-12-about-phone.png",
      imageAlt: "Android 12 About Phone menu",
    },
    {
      title: "Step 3: Build Number",
      description:
        "Find 'Build number' and tap it 7 times to enable Developer options. You'll see a message saying 'You are now a developer!'",
      image: "/android-12-developer-mode.png",
      imageAlt: "Android 12 Build Number screen",
    },
    {
      title: "Step 4: Developer Options",
      description:
        "Go back to Settings main screen and tap on 'System' > 'Developer options'. On some devices, Developer options may appear directly in the main Settings menu.",
      image: "/android-12-developer-options.png",
      imageAlt: "Android 12 Developer Options menu",
    },
    {
      title: "Step 5: Enable USB Debugging",
      description: "Find 'USB debugging' option and toggle it on. Confirm by tapping 'OK' on the warning dialog.",
      image: "/android-12-usb-debugging-warning.png",
      imageAlt: "Android 12 USB Debugging toggle",
    },
    {
      title: "Step 6: Connect Device",
      description:
        "Connect your device to your computer with a USB cable. When prompted, tap 'Allow' on the 'Allow USB debugging?' dialog. Optionally check 'Always allow from this computer'.",
      image: "/placeholder.svg?height=500&width=300&query=Android%2012%20Allow%20USB%20debugging%20permission%20dialog",
      imageAlt: "Android 12 USB debugging permission dialog",
    },
  ]

  const android10Steps = [
    {
      title: "Step 1: Open Settings",
      description: "Open the Settings app on your Android device.",
      image: "/placeholder.svg?height=500&width=300&query=Android%2010%20Settings%20app%20screen",
      imageAlt: "Android 10 Settings app",
    },
    {
      title: "Step 2: About Phone",
      description: "Scroll down and tap on 'About phone'.",
      image: "/placeholder.svg?height=500&width=300&query=Android%2010%20Settings%20About%20Phone%20menu",
      imageAlt: "Android 10 About Phone menu",
    },
    {
      title: "Step 3: Build Number",
      description:
        "Find 'Build number' and tap it 7 times to enable Developer options. You'll see a message saying 'You are now a developer!'",
      image:
        "/placeholder.svg?height=500&width=300&query=Android%2010%20Build%20Number%20screen%20with%20tap%207%20times",
      imageAlt: "Android 10 Build Number screen",
    },
    {
      title: "Step 4: Developer Options",
      description: "Go back to Settings main screen and tap on 'System' > 'Advanced' > 'Developer options'.",
      image: "/placeholder.svg?height=500&width=300&query=Android%2010%20Developer%20Options%20menu",
      imageAlt: "Android 10 Developer Options menu",
    },
    {
      title: "Step 5: Enable USB Debugging",
      description: "Find 'USB debugging' option and toggle it on. Confirm by tapping 'OK' on the warning dialog.",
      image:
        "/placeholder.svg?height=500&width=300&query=Android%2010%20USB%20Debugging%20toggle%20with%20warning%20dialog",
      imageAlt: "Android 10 USB Debugging toggle",
    },
    {
      title: "Step 6: Connect Device",
      description:
        "Connect your device to your computer with a USB cable. When prompted, tap 'Allow' on the 'Allow USB debugging?' dialog. Optionally check 'Always allow from this computer'.",
      image: "/placeholder.svg?height=500&width=300&query=Android%2010%20Allow%20USB%20debugging%20permission%20dialog",
      imageAlt: "Android 10 USB debugging permission dialog",
    },
  ]

  const android8Steps = [
    {
      title: "Step 1: Open Settings",
      description: "Open the Settings app on your Android device.",
      image: "/placeholder.svg?height=500&width=300&query=Android%208%20Settings%20app%20screen",
      imageAlt: "Android 8 Settings app",
    },
    {
      title: "Step 2: System",
      description: "Scroll down and tap on 'System'.",
      image: "/placeholder.svg?height=500&width=300&query=Android%208%20Settings%20System%20menu",
      imageAlt: "Android 8 System menu",
    },
    {
      title: "Step 3: About Phone",
      description: "Tap on 'About phone'.",
      image: "/placeholder.svg?height=500&width=300&query=Android%208%20About%20Phone%20menu",
      imageAlt: "Android 8 About Phone menu",
    },
    {
      title: "Step 4: Build Number",
      description:
        "Find 'Build number' and tap it 7 times to enable Developer options. You'll see a message saying 'You are now a developer!'",
      image:
        "/placeholder.svg?height=500&width=300&query=Android%208%20Build%20Number%20screen%20with%20tap%207%20times",
      imageAlt: "Android 8 Build Number screen",
    },
    {
      title: "Step 5: Developer Options",
      description: "Go back to System settings and tap on 'Developer options'.",
      image: "/placeholder.svg?height=500&width=300&query=Android%208%20Developer%20Options%20menu",
      imageAlt: "Android 8 Developer Options menu",
    },
    {
      title: "Step 6: Enable USB Debugging",
      description: "Find 'USB debugging' option and toggle it on. Confirm by tapping 'OK' on the warning dialog.",
      image:
        "/placeholder.svg?height=500&width=300&query=Android%208%20USB%20Debugging%20toggle%20with%20warning%20dialog",
      imageAlt: "Android 8 USB Debugging toggle",
    },
    {
      title: "Step 7: Connect Device",
      description:
        "Connect your device to your computer with a USB cable. When prompted, tap 'Allow' on the 'Allow USB debugging?' dialog. Optionally check 'Always allow from this computer'.",
      image: "/placeholder.svg?height=500&width=300&query=Android%208%20Allow%20USB%20debugging%20permission%20dialog",
      imageAlt: "Android 8 USB debugging permission dialog",
    },
  ]

  const samsungSteps = [
    {
      title: "Step 1: Open Settings",
      description: "Open the Settings app on your Samsung device.",
      image: "/placeholder.svg?height=500&width=300&query=Samsung%20OneUI%20Settings%20app%20screen",
      imageAlt: "Samsung OneUI Settings app",
    },
    {
      title: "Step 2: About Phone",
      description: "Scroll down and tap on 'About phone'.",
      image: "/placeholder.svg?height=500&width=300&query=Samsung%20OneUI%20About%20Phone%20menu",
      imageAlt: "Samsung OneUI About Phone menu",
    },
    {
      title: "Step 3: Software Information",
      description: "Tap on 'Software information'.",
      image: "/placeholder.svg?height=500&width=300&query=Samsung%20OneUI%20Software%20Information%20screen",
      imageAlt: "Samsung OneUI Software Information screen",
    },
    {
      title: "Step 4: Build Number",
      description:
        "Find 'Build number' and tap it 7 times to enable Developer options. You'll see a message saying 'Developer mode has been enabled'.",
      image:
        "/placeholder.svg?height=500&width=300&query=Samsung%20OneUI%20Build%20Number%20screen%20with%20tap%207%20times",
      imageAlt: "Samsung OneUI Build Number screen",
    },
    {
      title: "Step 5: Developer Options",
      description:
        "Go back to Settings main screen and tap on 'Developer options' (it should now appear near the bottom of the Settings menu).",
      image: "/placeholder.svg?height=500&width=300&query=Samsung%20OneUI%20Developer%20Options%20menu",
      imageAlt: "Samsung OneUI Developer Options menu",
    },
    {
      title: "Step 6: Enable USB Debugging",
      description: "Find 'USB debugging' option and toggle it on. Confirm by tapping 'OK' on the warning dialog.",
      image:
        "/placeholder.svg?height=500&width=300&query=Samsung%20OneUI%20USB%20Debugging%20toggle%20with%20warning%20dialog",
      imageAlt: "Samsung OneUI USB Debugging toggle",
    },
    {
      title: "Step 7: Connect Device",
      description:
        "Connect your device to your computer with a USB cable. When prompted, tap 'Allow' on the 'Allow USB debugging?' dialog. Optionally check 'Always allow from this computer'.",
      image:
        "/placeholder.svg?height=500&width=300&query=Samsung%20OneUI%20Allow%20USB%20debugging%20permission%20dialog",
      imageAlt: "Samsung OneUI USB debugging permission dialog",
    },
  ]

  const xiaomiSteps = [
    {
      title: "Step 1: Open Settings",
      description: "Open the Settings app on your Xiaomi device.",
      image: "/placeholder.svg?height=500&width=300&query=Xiaomi%20MIUI%20Settings%20app%20screen",
      imageAlt: "Xiaomi MIUI Settings app",
    },
    {
      title: "Step 2: About Phone",
      description: "Scroll down and tap on 'About phone'.",
      image: "/placeholder.svg?height=500&width=300&query=Xiaomi%20MIUI%20About%20Phone%20menu",
      imageAlt: "Xiaomi MIUI About Phone menu",
    },
    {
      title: "Step 3: MIUI Version",
      description:
        "Find 'MIUI version' and tap it 7 times to enable Developer options. You'll see a message saying 'You are now a developer!'",
      image: "/placeholder.svg?height=500&width=300&query=Xiaomi%20MIUI%20Version%20screen%20with%20tap%207%20times",
      imageAlt: "Xiaomi MIUI Version screen",
    },
    {
      title: "Step 4: Additional Settings",
      description: "Go back to Settings main screen and tap on 'Additional settings'.",
      image: "/placeholder.svg?height=500&width=300&query=Xiaomi%20MIUI%20Additional%20Settings%20menu",
      imageAlt: "Xiaomi MIUI Additional Settings menu",
    },
    {
      title: "Step 5: Developer Options",
      description: "Tap on 'Developer options'.",
      image: "/placeholder.svg?height=500&width=300&query=Xiaomi%20MIUI%20Developer%20Options%20menu",
      imageAlt: "Xiaomi MIUI Developer Options menu",
    },
    {
      title: "Step 6: Enable USB Debugging",
      description: "Find 'USB debugging' option and toggle it on. Confirm by tapping 'OK' on the warning dialog.",
      image:
        "/placeholder.svg?height=500&width=300&query=Xiaomi%20MIUI%20USB%20Debugging%20toggle%20with%20warning%20dialog",
      imageAlt: "Xiaomi MIUI USB Debugging toggle",
    },
    {
      title: "Step 7: Connect Device",
      description:
        "Connect your device to your computer with a USB cable. When prompted, tap 'Allow' on the 'Allow USB debugging?' dialog. Optionally check 'Always allow from this computer'.",
      image:
        "/placeholder.svg?height=500&width=300&query=Xiaomi%20MIUI%20Allow%20USB%20debugging%20permission%20dialog",
      imageAlt: "Xiaomi MIUI USB debugging permission dialog",
    },
  ]

  // Get current steps based on selected Android version
  const getSteps = (version: string) => {
    switch (version) {
      case "android12":
        return android12Steps
      case "android10":
        return android10Steps
      case "android8":
        return android8Steps
      case "samsung":
        return samsungSteps
      case "xiaomi":
        return xiaomiSteps
      default:
        return android12Steps
    }
  }

  const [selectedVersion, setSelectedVersion] = useState("android12")
  const steps = getSteps(selectedVersion)

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          USB Debugging Setup Guide
        </CardTitle>
        <CardDescription>Learn how to enable USB debugging on different Android devices</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedVersion} onValueChange={setSelectedVersion} className="w-full">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="android12" onClick={() => setCurrentStep(1)}>
              Android 12+
            </TabsTrigger>
            <TabsTrigger value="android10" onClick={() => setCurrentStep(1)}>
              Android 10-11
            </TabsTrigger>
            <TabsTrigger value="android8" onClick={() => setCurrentStep(1)}>
              Android 8-9
            </TabsTrigger>
            <TabsTrigger value="samsung" onClick={() => setCurrentStep(1)}>
              Samsung
            </TabsTrigger>
            <TabsTrigger value="xiaomi" onClick={() => setCurrentStep(1)}>
              Xiaomi
            </TabsTrigger>
          </TabsList>

          {["android12", "android10", "android8", "samsung", "xiaomi"].map((version) => (
            <TabsContent key={version} value={version} className="mt-4">
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 1}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Step {currentStep} of {getSteps(version).length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextStep}
                      disabled={currentStep === getSteps(version).length}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  <Step {...getSteps(version)[currentStep - 1]} />

                  <div className="flex justify-center mt-6 space-x-1">
                    {getSteps(version).map((_, index) => (
                      <button
                        key={index}
                        className={`h-2 w-2 rounded-full ${currentStep === index + 1 ? "bg-blue-500" : "bg-gray-600"}`}
                        onClick={() => setCurrentStep(index + 1)}
                        aria-label={`Go to step ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-md">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-400 mb-1">Troubleshooting Tips</h4>
              <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                <li>If Developer options doesn't appear, try tapping the build number more times</li>
                <li>Some devices may require a different path to find the build number</li>
                <li>Make sure to use a high-quality USB cable that supports data transfer</li>
                <li>Try different USB ports on your computer</li>
                <li>If the USB debugging permission dialog doesn't appear, disconnect and reconnect the USB cable</li>
                <li>
                  Some devices may require you to change the USB connection mode to "File Transfer" or "MTP" first
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

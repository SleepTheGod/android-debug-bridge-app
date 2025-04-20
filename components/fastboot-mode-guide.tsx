"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Smartphone, Info, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

export function FastbootModeGuide() {
  const [currentStep, setCurrentStep] = useState(1)

  // Define steps for each device manufacturer
  const pixelSteps = [
    {
      title: "Step 1: Power Off Device",
      description:
        "First, completely power off your Pixel device by pressing and holding the power button, then selecting 'Power off'.",
      image: "/fastboot-pixel-power-off.png",
      imageAlt: "Pixel power off screen",
    },
    {
      title: "Step 2: Enter Bootloader",
      description:
        "Press and hold the Volume Down button, then press and hold the Power button at the same time until the device boots into bootloader mode.",
      image: "/fastboot-pixel-buttons.png",
      imageAlt: "Pixel button combination for bootloader",
    },
    {
      title: "Step 3: Bootloader Screen",
      description:
        "You'll see the bootloader screen with a large Android robot and text saying 'Start'. The device is now in bootloader mode.",
      image: "/fastboot-pixel-bootloader.png",
      imageAlt: "Pixel bootloader screen",
    },
    {
      title: "Step 4: Navigate to Fastboot",
      description: "Use the volume buttons to navigate to 'Fastboot Mode' and press the power button to select it.",
      image: "/fastboot-pixel-fastboot-option.png",
      imageAlt: "Pixel fastboot option selection",
    },
    {
      title: "Step 5: Fastboot Mode",
      description:
        "Your device is now in fastboot mode. You can connect it to your computer with a USB cable to use fastboot commands.",
      image: "/fastboot-pixel-fastboot-mode.png",
      imageAlt: "Pixel in fastboot mode",
    },
    {
      title: "Step 6: Connect to Computer",
      description:
        "Connect your device to your computer with a USB cable. Click 'Connect Device' in the Android Web Debugger to establish a connection.",
      image: "/pixel-fastboot-connection.png",
      imageAlt: "Pixel connected to computer in fastboot mode",
    },
  ]

  const samsungSteps = [
    {
      title: "Step 1: Power Off Device",
      description:
        "First, completely power off your Samsung device by pressing and holding the power button, then selecting 'Power off'.",
      image: "/samsung-power-off-screen.png",
      imageAlt: "Samsung power off screen",
    },
    {
      title: "Step 2: Enter Download Mode",
      description:
        "Samsung devices use 'Download Mode' instead of fastboot. Press and hold Volume Down + Volume Up + Power button simultaneously until the warning screen appears.",
      image: "/fastboot-samsung-buttons.png",
      imageAlt: "Samsung button combination for download mode",
    },
    {
      title: "Step 3: Warning Screen",
      description: "You'll see a warning screen. Press Volume Up to continue to Download Mode.",
      image: "/fastboot-samsung-warning.png",
      imageAlt: "Samsung download mode warning screen",
    },
    {
      title: "Step 4: Download Mode",
      description:
        "Your device is now in Download Mode (Samsung's equivalent to fastboot). You'll see a blue or green screen with text.",
      image: "/fastboot-samsung-download-mode.png",
      imageAlt: "Samsung in download mode",
    },
    {
      title: "Step 5: Connect to Computer",
      description:
        "Connect your device to your computer with a USB cable. Note that Samsung devices require specialized tools like Odin or Heimdall rather than standard fastboot commands.",
      image: "/samsung-download-screen.png",
      imageAlt: "Samsung connected to computer in download mode",
    },
    {
      title: "Step 6: Important Note",
      description:
        "Samsung's Download Mode is different from standard fastboot. Some operations in the Android Web Debugger may not work with Samsung devices in this mode.",
      image: "/samsung-download-warning.png",
      imageAlt: "Samsung download mode compatibility warning",
    },
  ]

  const xiaomiSteps = [
    {
      title: "Step 1: Power Off Device",
      description:
        "First, completely power off your Xiaomi device by pressing and holding the power button, then selecting 'Power off'.",
      image: "/xiaomi-power-off.png",
      imageAlt: "Xiaomi power off screen",
    },
    {
      title: "Step 2: Enter Fastboot",
      description:
        "Press and hold the Volume Down button and Power button simultaneously until the Mi Bunny logo appears.",
      image: "/fastboot-xiaomi-buttons.png",
      imageAlt: "Xiaomi button combination for fastboot",
    },
    {
      title: "Step 3: Fastboot Screen",
      description: "You'll see the fastboot screen with the Mi Bunny logo and text saying 'FASTBOOT'.",
      image: "/fastboot-xiaomi-fastboot-mode.png",
      imageAlt: "Xiaomi fastboot screen",
    },
    {
      title: "Step 4: Connect to Computer",
      description:
        "Connect your device to your computer with a USB cable. Click 'Connect Device' in the Android Web Debugger to establish a connection.",
      image:
        "/placeholder.svg?height=500&width=300&query=Xiaomi%20device%20connected%20to%20computer%20in%20fastboot%20mode",
      imageAlt: "Xiaomi connected to computer in fastboot mode",
    },
    {
      title: "Step 5: Verify Connection",
      description: "In the terminal, type 'devices' to verify that your device is properly connected in fastboot mode.",
      image:
        "/placeholder.svg?height=500&width=300&query=Terminal%20showing%20fastboot%20devices%20command%20with%20Xiaomi%20device",
      imageAlt: "Terminal showing fastboot devices command",
    },
  ]

  const motorolaSteps = [
    {
      title: "Step 1: Power Off Device",
      description:
        "First, completely power off your Motorola device by pressing and holding the power button, then selecting 'Power off'.",
      image: "/placeholder.svg?height=500&width=300&query=Motorola%20power%20off%20screen",
      imageAlt: "Motorola power off screen",
    },
    {
      title: "Step 2: Enter Bootloader",
      description:
        "Press and hold the Volume Down button, then press and hold the Power button at the same time until the device boots into bootloader mode.",
      image: "/fastboot-motorola-buttons.png",
      imageAlt: "Motorola button combination for bootloader",
    },
    {
      title: "Step 3: Bootloader Screen",
      description: "You'll see the bootloader screen with the Motorola logo and text options.",
      image: "/fastboot-motorola-bootloader.png",
      imageAlt: "Motorola bootloader screen",
    },
    {
      title: "Step 4: Navigate to Fastboot",
      description: "Use the volume buttons to navigate to 'Fastboot' and press the power button to select it.",
      image:
        "/placeholder.svg?height=500&width=300&query=Motorola%20bootloader%20with%20fastboot%20option%20highlighted",
      imageAlt: "Motorola fastboot option selection",
    },
    {
      title: "Step 5: Fastboot Mode",
      description:
        "Your device is now in fastboot mode. You can connect it to your computer with a USB cable to use fastboot commands.",
      image: "/placeholder.svg?height=500&width=300&query=Motorola%20in%20fastboot%20mode",
      imageAlt: "Motorola in fastboot mode",
    },
    {
      title: "Step 6: Connect to Computer",
      description:
        "Connect your device to your computer with a USB cable. Click 'Connect Device' in the Android Web Debugger to establish a connection.",
      image:
        "/placeholder.svg?height=500&width=300&query=Motorola%20device%20connected%20to%20computer%20in%20fastboot%20mode",
      imageAlt: "Motorola connected to computer in fastboot mode",
    },
  ]

  const oneplusSteps = [
    {
      title: "Step 1: Power Off Device",
      description:
        "First, completely power off your OnePlus device by pressing and holding the power button, then selecting 'Power off'.",
      image: "/placeholder.svg?height=500&width=300&query=OnePlus%20power%20off%20screen",
      imageAlt: "OnePlus power off screen",
    },
    {
      title: "Step 2: Enter Fastboot",
      description:
        "Press and hold the Volume Up button and Power button simultaneously until the OnePlus logo appears.",
      image: "/fastboot-oneplus-buttons.png",
      imageAlt: "OnePlus button combination for fastboot",
    },
    {
      title: "Step 3: Fastboot Screen",
      description: "You'll see the fastboot screen with the OnePlus logo and text saying 'FASTBOOT MODE'.",
      image: "/fastboot-oneplus-fastboot-mode.png",
      imageAlt: "OnePlus fastboot screen",
    },
    {
      title: "Step 4: Connect to Computer",
      description:
        "Connect your device to your computer with a USB cable. Click 'Connect Device' in the Android Web Debugger to establish a connection.",
      image:
        "/placeholder.svg?height=500&width=300&query=OnePlus%20device%20connected%20to%20computer%20in%20fastboot%20mode",
      imageAlt: "OnePlus connected to computer in fastboot mode",
    },
    {
      title: "Step 5: Verify Connection",
      description: "In the terminal, type 'devices' to verify that your device is properly connected in fastboot mode.",
      image:
        "/placeholder.svg?height=500&width=300&query=Terminal%20showing%20fastboot%20devices%20command%20with%20OnePlus%20device",
      imageAlt: "Terminal showing fastboot devices command",
    },
  ]

  const adbMethodSteps = [
    {
      title: "Step 1: Enable USB Debugging",
      description: "Make sure USB debugging is enabled on your device. If not, follow our USB debugging guide first.",
      image: "/placeholder.svg?height=500&width=300&query=Android%20USB%20debugging%20enabled",
      imageAlt: "Android USB debugging enabled",
    },
    {
      title: "Step 2: Connect to Computer",
      description: "Connect your device to your computer with a USB cable and make sure it's recognized in ADB mode.",
      image: "/placeholder.svg?height=500&width=300&query=Android%20device%20connected%20in%20ADB%20mode",
      imageAlt: "Android device connected in ADB mode",
    },
    {
      title: "Step 3: Open Terminal",
      description:
        "In the Android Web Debugger, make sure your device is connected in ADB mode and the terminal is open.",
      image: "/placeholder.svg?height=500&width=300&query=Android%20Web%20Debugger%20terminal",
      imageAlt: "Android Web Debugger terminal",
    },
    {
      title: "Step 4: Enter Reboot Command",
      description:
        "Type 'reboot bootloader' in the terminal and press Enter. This will reboot your device into bootloader/fastboot mode.",
      image: "/fastboot-adb-reboot-command.png",
      imageAlt: "Terminal with reboot bootloader command",
    },
    {
      title: "Step 5: Wait for Reboot",
      description:
        "Your device will reboot and enter bootloader/fastboot mode automatically. No button combinations needed.",
      image: "/placeholder.svg?height=500&width=300&query=Android%20device%20rebooting%20to%20bootloader",
      imageAlt: "Android device rebooting to bootloader",
    },
    {
      title: "Step 6: Reconnect in Fastboot Mode",
      description:
        "Once your device is in fastboot mode, click 'Connect Device' in the Android Web Debugger to establish a fastboot connection.",
      image:
        "/placeholder.svg?height=500&width=300&query=Android%20Web%20Debugger%20connect%20device%20in%20fastboot%20mode",
      imageAlt: "Android Web Debugger connect device in fastboot mode",
    },
  ]

  // Get current steps based on selected device manufacturer
  const getSteps = (manufacturer: string) => {
    switch (manufacturer) {
      case "pixel":
        return pixelSteps
      case "samsung":
        return samsungSteps
      case "xiaomi":
        return xiaomiSteps
      case "motorola":
        return motorolaSteps
      case "oneplus":
        return oneplusSteps
      case "adb":
        return adbMethodSteps
      default:
        return pixelSteps
    }
  }

  const [selectedManufacturer, setSelectedManufacturer] = useState("pixel")
  const steps = getSteps(selectedManufacturer)

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
          Fastboot Mode Setup Guide
        </CardTitle>
        <CardDescription>Learn how to boot your Android device into fastboot mode</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-4 bg-red-900/30 border-red-800 text-red-100">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning: Firmware Modification Risk</AlertTitle>
          <AlertDescription>
            Fastboot mode allows low-level access to your device. Incorrect commands can permanently brick your device
            or void your warranty. Proceed at your own risk.
          </AlertDescription>
        </Alert>

        <Tabs value={selectedManufacturer} onValueChange={setSelectedManufacturer} className="w-full">
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="pixel" onClick={() => setCurrentStep(1)}>
              Google Pixel
            </TabsTrigger>
            <TabsTrigger value="samsung" onClick={() => setCurrentStep(1)}>
              Samsung
            </TabsTrigger>
            <TabsTrigger value="xiaomi" onClick={() => setCurrentStep(1)}>
              Xiaomi
            </TabsTrigger>
          </TabsList>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="motorola" onClick={() => setCurrentStep(1)}>
              Motorola
            </TabsTrigger>
            <TabsTrigger value="oneplus" onClick={() => setCurrentStep(1)}>
              OnePlus
            </TabsTrigger>
            <TabsTrigger value="adb" onClick={() => setCurrentStep(1)}>
              ADB Method
            </TabsTrigger>
          </TabsList>

          {["pixel", "samsung", "xiaomi", "motorola", "oneplus", "adb"].map((manufacturer) => (
            <TabsContent key={manufacturer} value={manufacturer} className="mt-4">
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 1}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Step {currentStep} of {getSteps(manufacturer).length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextStep}
                      disabled={currentStep === getSteps(manufacturer).length}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  <Step {...getSteps(manufacturer)[currentStep - 1]} />

                  <div className="flex justify-center mt-6 space-x-1">
                    {getSteps(manufacturer).map((_, index) => (
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
              <h4 className="text-sm font-medium text-blue-400 mb-1">Important Notes</h4>
              <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                <li>Button combinations may vary slightly between device models and Android versions</li>
                <li>Samsung devices use Download Mode instead of Fastboot Mode</li>
                <li>Some devices may require the bootloader to be unlocked for certain fastboot commands</li>
                <li>If button combinations don't work, try the ADB method if your device has USB debugging enabled</li>
                <li>
                  Always make sure your device has sufficient battery (at least 50%) before entering fastboot mode
                </li>
                <li>
                  If you get stuck in fastboot mode, you can usually exit by selecting "Reboot" or "Start" using the
                  volume buttons to navigate and power button to select
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

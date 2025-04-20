import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AdbDeviceProvider } from "@/hooks/use-adb-device"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Android Web Debugger",
  description: "Debug Android devices through your browser",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdbDeviceProvider>{children}</AdbDeviceProvider>
      </body>
    </html>
  )
}


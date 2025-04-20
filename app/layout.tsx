import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DeviceConnectionProvider } from "@/hooks/use-device-connection"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Android Web Debugger",
  description: "Debug Android devices through your browser in any boot mode",
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
        <DeviceConnectionProvider>{children}</DeviceConnectionProvider>
      </body>
    </html>
  )
}

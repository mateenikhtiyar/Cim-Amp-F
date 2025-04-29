import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { DevToolsNotice } from "@/components/dev-tools-notice"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Company-Profile",
  description: "Company profile form for CIM Amplify",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
          <DevToolsNotice />
        </ThemeProvider>
      </body>
    </html>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DevToolsNotice() {
  const [showNotice, setShowNotice] = useState(false)
  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    // Only show in development mode
    if (process.env.NODE_ENV === "development") {
      setIsDev(true)

      // Check if the user has dismissed the notice before
      const dismissed = localStorage.getItem("devtools-notice-dismissed")
      if (!dismissed) {
        setShowNotice(true)
      }
    }
  }, [])

  const dismissNotice = () => {
    localStorage.setItem("devtools-notice-dismissed", "true")
    setShowNotice(false)
  }

  if (!isDev || !showNotice) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertTitle className="flex justify-between items-center">
          <span>React DevTools Recommended</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={dismissNotice}>
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Install React DevTools for a better debugging experience. It will help you inspect components, props, and
            state.
          </p>
          <a
            href="https://react.dev/learn/react-developer-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Learn more and install
          </a>
        </AlertDescription>
      </Alert>
    </div>
  )
}

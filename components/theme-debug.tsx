"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeDebug() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 left-4 p-4 bg-card border rounded-lg shadow-lg z-50 text-xs">
      <div>Current theme: {theme}</div>
      <div>System theme: {systemTheme}</div>
      <div>Mounted: {mounted.toString()}</div>
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="mt-2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
      >
        Toggle Theme
      </button>
    </div>
  )
}

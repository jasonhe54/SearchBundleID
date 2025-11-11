"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun, Github } from "lucide-react"
import { useSearch } from "@/context/SearchContext"
import { useCallback } from "react"
import GHIcon from "@/components/ui/GHIcon"

export default function Header() {
  const { isDarkMode, setIsDarkMode } = useSearch()

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode)
  }, [isDarkMode, setIsDarkMode])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl shrink-0">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
            BS
          </div>
          <div>
            <h1 className="text-base font-semibold">BundleSearch</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <a
            href="https://github.com/jasonhe54/SearchBundleID"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="GitHub Repository">
              <Github className="h-4 w-4" />
            </Button>
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="h-9 w-9"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}

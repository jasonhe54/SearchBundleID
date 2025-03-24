"use client"

import { SearchProvider, useSearch } from "@/context/SearchContext"
import UnifiedSearchView from "@/components/UnifiedSearchView"
import { memo } from "react"

const HomeContent = memo(function HomeContent() {
  const { isDarkMode } = useSearch()

  return (
    <div
      className={`flex items-center justify-center min-h-screen p-4 ${isDarkMode ? "dark bg-zinc-950" : "bg-gray-50"}`}
    >
      <div className="flex flex-col items-center justify-center gap-6 relative w-full mx-auto">
        <UnifiedSearchView />
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <SearchProvider>
      <HomeContent />
    </SearchProvider>
  )
}
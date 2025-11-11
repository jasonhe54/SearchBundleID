"use client"

import { SearchProvider } from "@/context/SearchContext"
import UnifiedSearchView from "@/components/UnifiedSearchView"
import Header from "@/components/Header"

export default function Home() {
  return (
    <SearchProvider>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Header />
        <UnifiedSearchView />
      </div>
    </SearchProvider>
  )
}
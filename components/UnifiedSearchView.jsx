"use client"

import Sidebar from "@/components/Sidebar"
import MainContent from "@/components/MainContent"

export default function UnifiedSearchView() {
  return (
    <>
      {/* Mobile: Stacked layout - Search always visible at top */}
      <div className="md:hidden flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
        <div className="flex-shrink-0 border-b border-border/40 bg-card">
          <Sidebar />
        </div>
        <main className="flex-1 bg-background min-w-0 overflow-y-auto">
          <MainContent />
        </main>
      </div>

      {/* Desktop: Side-by-side layout */}
      <div className="hidden md:flex md:flex-row h-[calc(100vh-3.5rem)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-background min-w-0 overflow-y-auto">
          <MainContent />
        </main>
      </div>
    </>
  )
}
